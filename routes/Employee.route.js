import express from "express";
import {
  HandleAllEmployees,
  HandleEmployeeUpdate,
  HandleEmployeeDelete,
  HandleEmployeeByHR,
  HandleEmployeeByEmployee,
  HandleAllEmployeesIDS,
} from "../controllers/Employee.controller.js";
import { VerifyhHRToken, VerifyEmployeeToken } from "../middlewares/Auth.middleware.js";
import { RoleAuthorization } from "../middlewares/RoleAuth.middleware.js";

const router = express.Router();

// HR-Admin: Get all employees
router.get(
  "/all",
  VerifyhHRToken,
  RoleAuthorization("HR-Admin"),
  HandleAllEmployees
);

// HR-Admin: Get all employees IDs (for dropdowns, etc.)
router.get(
  "/all-employees-ids",
  VerifyhHRToken,
  RoleAuthorization("HR-Admin"),
  HandleAllEmployeesIDS
);

// Employee: Update own profile
router.patch(
  "/update-employee",
  VerifyEmployeeToken,
  HandleEmployeeUpdate
);

//  HR-Admin: Delete an employee
router.delete(
  "/delete-employee/:employeeId",
  VerifyhHRToken,
  RoleAuthorization("HR-Admin"),
  HandleEmployeeDelete
);

//  HR-Admin: Get single employee by ID
router.get(
  "/by-HR/:employeeId",
  VerifyhHRToken,
  RoleAuthorization("HR-Admin"),
  HandleEmployeeByHR
);

//  Employee: Get own profile
router.get(
  "/by-employee",
  VerifyEmployeeToken,
  HandleEmployeeByEmployee
);

export default router;
