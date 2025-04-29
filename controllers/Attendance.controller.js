import { Attendance } from "../models/AttendanceModel.js";
import { Employee } from "../models/EmployeeModel.js";

// Initialize Attendance Log for an Employee
export const HandleInitializeAttendance = async (req, res) => {
  try {
    const { employeeID } = req.body;

    if (!employeeID) {
      return res
        .status(400)
        .json({ success: false, message: "Employee ID is required." });
    }

    const employee = await Employee.findOne({
      _id: employeeID,
      organizationID: req.ORGID,
    });

    if (!employee) {
      return res
        .status(404)
        .json({ success: false, message: "Employee not found." });
    }

    if (employee.attendance) {
      return res.status(400).json({
        success: false,
        message: "Attendance log is already initialized for this employee.",
      });
    }

    const currentdate = new Date().toISOString().split("T")[0];

    // Create Attendance Log
    const newAttendance = await Attendance.create({
      employee: employeeID,
      status: "Not Specified",
      organizationID: req.ORGID,
      attendancelog: [{ logdate: currentdate, logstatus: "Not Specified" }],
    });

    employee.attendance = newAttendance._id;
    await employee.save();
    await newAttendance.save();

    return res.status(200).json({
      success: true,
      message: "Attendance Log Initialized Successfully",
      data: newAttendance,
    });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
  }
};

// Retrieve All Attendance Records
export const HandleAllAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find({
      organizationID: req.ORGID,
    }).populate("employee", "firstname lastname department");

    return res.status(200).json({
      success: true,
      message: "All attendance records retrieved successfully.",
      data: attendance,
    });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
  }
};

// Retrieve Specific Attendance Record
export const HandleAttendance = async (req, res) => {
  try {
    const { attendanceID } = req.params;

    if (!attendanceID) {
      return res
        .status(400)
        .json({ success: false, message: "Attendance ID is required." });
    }

    const attendance = await Attendance.findOne({
      _id: attendanceID,
      organizationID: req.ORGID,
    }).populate("employee", "firstname lastname department");

    if (!attendance) {
      return res
        .status(404)
        .json({ success: false, message: "Attendance record not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Attendance record retrieved successfully.",
      data: attendance,
    });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
  }
};

// Update Attendance Status
export const HandleUpdateAttendance = async (req, res) => {
  try {
    const { attendanceID, status, currentdate } = req.body;

    if (!attendanceID || !status || !currentdate) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });
    }

    const attendance = await Attendance.findOne({
      _id: attendanceID,
      organizationID: req.ORGID,
    });

    if (!attendance) {
      return res
        .status(404)
        .json({ success: false, message: "Attendance record not found." });
    }

    const existingLog = attendance.attendancelog.find(
      (log) => log.logdate === currentdate
    );

    if (!existingLog) {
      // Add new attendance log if not found for current date
      attendance.attendancelog.push({
        logdate: currentdate,
        logstatus: status,
      });
    } else {
      // Update existing attendance log
      existingLog.logstatus = status;
    }

    await attendance.save();

    return res.status(200).json({
      success: true,
      message: "Attendance status updated successfully.",
      data: attendance,
    });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
  }
};

// Delete Attendance Record
export const HandleDeleteAttendance = async (req, res) => {
  try {
    const { attendanceID } = req.params;

    const attendance = await Attendance.findOne({
      _id: attendanceID,
      organizationID: req.ORGID,
    });

    if (!attendance) {
      return res
        .status(404)
        .json({ success: false, message: "Attendance record not found." });
    }

    const employee = await Employee.findById(attendance.employee);
    if (employee.attendance?.toString() === attendance._id.toString()) {
      employee.attendance = null;
      await employee.save();
    }

    await attendance.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Attendance record deleted successfully.",
    });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
  }
};
