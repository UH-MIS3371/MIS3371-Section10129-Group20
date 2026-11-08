"use strict";

// MIS 3371 - Team 20 - Patient Referral Management System
// Week 10: AWS Lambda entry point (HTTP adapter only).
// API Gateway HTTP API, payload format 2.0. Route: POST /referrals
// Lambda handler setting: index.handler
//
// This file only translates HTTP <-> processReferral. Every validation and
// business rule (BR-1, BR-2, BR-3, BR-7, BR-9) stays in backend/backend.js.
// Nothing is saved in Week 10.

const { processReferral } = require("./backend/backend");

// Stand-in for the database until persistence is added. Same fictional
// sample data as backend/test-backend.js, used by the BR-3 duplicate check.
const ACTIVE_REFERRALS = [
  { referralId: "REF-2026-004821", patientId: "PAT-88213", requestedService: "cardiology" },
  { referralId: "REF-2026-004905", patientId: "PAT-10452", requestedService: "orthopedics" }
];

// Build an API Gateway response with a JSON body.
function jsonResponse(statusCode, payload) {
  return {
    statusCode: statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  };
}

// Adapter-level problems (not business rules) use the same failure shape
// as the backend, without a rule ID.
function adapterError(statusCode, message) {
  return jsonResponse(statusCode, { success: false, message: message, persisted: false });
}

exports.handler = async (event) => {
  const method = event && event.requestContext && event.requestContext.http
    ? event.requestContext.http.method
    : undefined;

  if (method !== "POST") {
    return adapterError(405, "Method not allowed. Use POST.");
  }

  if (!event.body) {
    return adapterError(400, "Request body is required.");
  }

  // HTTP API may base64-encode the body; decode it before parsing.
  const bodyText = event.isBase64Encoded
    ? Buffer.from(event.body, "base64").toString("utf8")
    : event.body;

  let referral;
  try {
    referral = JSON.parse(bodyText);
  } catch (error) {
    return adapterError(400, "Request body must be valid JSON.");
  }

  try {
    // Called exactly once. The backend decides accepted or rejected.
    const result = processReferral(referral, ACTIVE_REFERRALS);
    return jsonResponse(result.success ? 200 : 400, result);
  } catch (error) {
    console.error("processReferral failed:", error);
    return adapterError(500, "The referral could not be processed.");
  }
};
