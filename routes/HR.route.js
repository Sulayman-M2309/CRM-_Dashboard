import express from "express";
import {
  HandleAllHR,
  HandleDeleteHR,
  HandleHR,
  HandleUpdateHR,
} from "../controllers/HR.controller.js";
import { VerifyhHRToken } from "../middlewares/Auth.middleware.js";
import { RoleAuthorization } from "../middlewares/RoleAuth.middleware.js";

const router = express.Router();

// Get all HR records for the organization (restricted to HR-Admin)
router.get("/all", VerifyhHRToken, RoleAuthorization("HR-Admin"), HandleAllHR);

// Get a specific HR record by ID (restricted to HR-Admin)
router.get("/:HRID", VerifyhHRToken, RoleAuthorization("HR-Admin"), HandleHR);

// Update an HR record (restricted to HR-Admin)
router.patch(
  "/update-HR",
  VerifyhHRToken,
  RoleAuthorization("HR-Admin"),
  HandleUpdateHR
);

// Delete an HR record by HRID (restricted to HR-Admin)
router.delete(
  "/delete-HR/:HRID",
  VerifyhHRToken,
  RoleAuthorization("HR-Admin"),
  HandleDeleteHR
);

export default router;
