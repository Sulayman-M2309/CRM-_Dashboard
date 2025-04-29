import { Employee } from "../models/EmployeeModel.js";
import { Department } from "../models/DepartmentModel.js";
import { Leave } from "../models/LeaveModel.js";
import { GenerateRequest } from "../models/GenerateRequestModel.js";
import { Balance } from "../models/BalanceModel.js";
import { Notice } from "../models/NoticeModel.js";

export const HandleHRDashboard = async (req, res) => {
  try {
    // Using Promise.all to fetch multiple data points concurrently for better performance
    const [
      employeesCount,
      departmentsCount,
      leavesCount,
      requestsCount,
      balance,
      notices,
    ] = await Promise.all([
      Employee.countDocuments({ organizationID: req.ORGID }),
      Department.countDocuments({ organizationID: req.ORGID }),
      Leave.countDocuments({ organizationID: req.ORGID }),
      GenerateRequest.countDocuments({ organizationID: req.ORGID }),
      Balance.find({ organizationID: req.ORGID }),
      Notice.find({ organizationID: req.ORGID })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate("createdby", "firstname lastname"),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        employees: employeesCount,
        departments: departmentsCount,
        leaves: leavesCount,
        requests: requestsCount,
        balance: balance,
        notices: notices,
      },
    });
  } catch (error) {
    console.error("Error fetching HR Dashboard data:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message || error,
    });
  }
};
