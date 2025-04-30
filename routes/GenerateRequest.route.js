import express from 'express';
import {
  HandleAllGenerateRequest,
  HandleCreateGenerateRequest,
  HandleDeleteRequest,
  HandleGenerateRequest,
  HandleUpdateRequestByEmployee,
  HandleUpdateRequestByHR
} from '../controllers/GenerateRequest.controller.js';

import {
  VerifyEmployeeToken,
  VerifyhHRToken
} from '../middlewares/Auth.middleware.js';

import { RoleAuthorization } from '../middlewares/RoleAuth.middleware.js';

const router = express.Router();

// Employee creates a request
router.post(
  "/create-request",
  VerifyEmployeeToken,
  HandleCreateGenerateRequest
);

// HR gets all requests
router.get(
  "/all",
  VerifyhHRToken,
  RoleAuthorization("HR-Admin"),
  HandleAllGenerateRequest
);

// HR gets a specific request
router.get(
  "/:requestID",
  VerifyhHRToken,
  RoleAuthorization("HR-Admin"),
  HandleGenerateRequest
);

// Employee updates their own request content
router.patch(
  "/update-request-content",
  VerifyEmployeeToken,
  HandleUpdateRequestByEmployee
);

// HR updates request status
router.patch(
  "/update-request-status",
  VerifyhHRToken,
  RoleAuthorization("HR-Admin"),
  HandleUpdateRequestByHR
);

// HR deletes a request
router.delete(
  "/delete-request/:requestID",
  VerifyhHRToken,
  RoleAuthorization("HR-Admin"),
  HandleDeleteRequest
);

export default router;
