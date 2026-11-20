"use strict";

// MIS 3371 - Team 20 - Patient Referral Management System
// Week 11: ONE Lambda handler for POST (save) and GET (retrieve).
// backend/backend.js is unchanged: it owns all validation and business rules.
// API Gateway HTTP API, payload format 2.0.
// Required Lambda environment variable: TABLE_NAME = MIS3371-Referrals
// DynamoDB partition key: referralId (String)
// Routes: POST /api/expenses and GET /api/expenses/{referralId}

// 1. Imports and configuration.
// The AWS SDK v3 is built into the Node.js Lambda runtime, so the ZIP
// still needs no node_modules folder.
const { processReferral } = require("./backend/backend");
const { randomUUID } = require("node:crypto");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  ScanCommand
} = require("@aws-sdk/lib-dynamodb");

const TABLE_NAME = process.env.TABLE_NAME;
// Created once, outside the handler, so Lambda can reuse it.
const dynamo = DynamoDBDocumentClient.from(new DynamoDBClient({}));

// Fictional sample referrals that were active before the database existed.
// They stay so the documented BR-3 test cases (PAT-88213, PAT-10452) still work.
const SAMPLE_ACTIVE_REFERRALS = [
  { referralId: "REF-2026-004821", patientId: "PAT-88213", requestedService: "cardiology" },
  { referralId: "REF-2026-004905", patientId: "PAT-10452", requestedService: "orthopedics" }
];

// 2. Helper: API Gateway HTTP API response format.
function reply(statusCode, result) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(result)
  };
}

// 3. Data for BR-3: saved referrals for this patient + service that are
// still active (not Rejected, Completed, or Cancelled). This only LOOKS UP
// data; backend.js still decides whether it is a duplicate.
async function findSavedActiveReferrals(patientId, requestedService) {
  const found = [];
  let startKey;
  do {
    const page = await dynamo.send(new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression:
        "patientId = :p AND requestedService = :s AND NOT (#st IN (:r, :c, :x))",
      ExpressionAttributeNames: { "#st": "status" },
      ExpressionAttributeValues: {
        ":p": patientId,
        ":s": requestedService,
        ":r": "Rejected",
        ":c": "Completed",
        ":x": "Cancelled"
      },
      ProjectionExpression: "referralId, patientId, requestedService",
      ExclusiveStartKey: startKey
    }));
    found.push(...(page.Items || []));
    startKey = page.LastEvaluatedKey;
  } while (startKey);
  return found;
}

// 4. Entry point: API Gateway calls this handler for POST and GET.
exports.handler = async (event = {}) => {
  const method = event.requestContext?.http?.method || event.httpMethod || "POST";

  if (!TABLE_NAME) {
    console.error("[LAMBDA] TABLE_NAME is missing.");
    return reply(500, {
      success: false,
      message: "Database configuration error.",
      persisted: false
    });
  }

  // 5. GET /api/expenses/{referralId}: retrieve one stored referral.
  if (method === "GET") {
    const params = event.pathParameters || {};
    const referralId = params.referralId || params.transactionId;

    if (typeof referralId !== "string" || !referralId.trim()) {
      return reply(400, {
        success: false,
        message: "A referral ID is required."
      });
    }

    try {
      const response = await dynamo.send(new GetCommand({
        TableName: TABLE_NAME,
        Key: { referralId: referralId.trim() }
      }));

      if (!response.Item) {
        return reply(404, {
          success: false,
          message: "Referral not found."
        });
      }

      return reply(200, {
        success: true,
        message: "Referral retrieved successfully.",
        referral: response.Item
      });
    } catch (error) {
      console.error("[LAMBDA] DynamoDB read failed:", error);
      return reply(500, {
        success: false,
        message: "Unable to retrieve the referral."
      });
    }
  }

  // 6. POST /api/expenses: validate the submitted JSON, then save.
  if (method !== "POST") {
    return reply(405, {
      success: false,
      message: "Use POST /api/expenses or GET /api/expenses/{referralId}.",
      persisted: false
    });
  }

  if (typeof event.body !== "string" || !event.body.trim()) {
    return reply(400, {
      success: false,
      message: "A JSON request body is required.",
      persisted: false
    });
  }

  let referral;
  try {
    const bodyText = event.isBase64Encoded
      ? Buffer.from(event.body, "base64").toString("utf8")
      : event.body;
    referral = JSON.parse(bodyText);
  } catch (error) {
    console.error("[LAMBDA] Invalid JSON request body.");
    return reply(400, {
      success: false,
      message: "Request body must contain valid JSON.",
      persisted: false
    });
  }

  // Look up saved active referrals for the duplicate rule (BR-3).
  let activeReferrals = SAMPLE_ACTIVE_REFERRALS;
  if (referral && typeof referral.patientId === "string" &&
      typeof referral.requestedService === "string") {
    try {
      const saved = await findSavedActiveReferrals(
        referral.patientId.trim(), referral.requestedService);
      activeReferrals = SAMPLE_ACTIVE_REFERRALS.concat(saved);
    } catch (error) {
      console.error("[LAMBDA] DynamoDB duplicate lookup failed:", error);
      return reply(500, {
        success: false,
        message: "Unable to check for existing referrals.",
        persisted: false
      });
    }
  }

  // backend.js is still the ONLY authority for validation and business rules.
  const result = processReferral(referral, activeReferrals);
  if (!result.success) {
    return reply(400, result); // Invalid referrals never reach DynamoDB.
  }

  // 7. Build the official referral record. Never trust a referralId,
  // status, or receivingDepartment sent by the browser.
  const now = new Date().toISOString();
  const record = {
    referralId: `REF-${randomUUID()}`,
    status: "Submitted",
    submittedAt: now,
    updatedAt: now,
    receivingDepartment: result.receivingDepartment,
    reviewWindowBusinessDays: result.reviewWindowBusinessDays,
    overdueFlag: false,
    ...result.referral
  };

  // 8. Save. persisted:true ONLY after DynamoDB confirms the write.
  try {
    await dynamo.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: record,
      ConditionExpression: "attribute_not_exists(referralId)"
    }));

    console.log("[LAMBDA] Saved referral:", record.referralId);
    return reply(200, {
      ...result,
      success: true,
      message: `Referral saved successfully. Your confirmation number is ${record.referralId}.`,
      referralId: record.referralId,
      status: record.status,
      submittedAt: record.submittedAt,
      persisted: true
    });
  } catch (error) {
    console.error("[LAMBDA] DynamoDB write failed:", error);
    return reply(500, {
      success: false,
      message: "Unable to save the referral.",
      persisted: false
    });
  }
};
