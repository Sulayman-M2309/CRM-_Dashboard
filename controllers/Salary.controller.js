import { Employee } from "../models/EmployeeModel.js";
import { Salary } from "../models/SalaryModel.js";

/** Helper function to calculate salary components */
const calculateSalary = (basicpay, bonusePT, deductionPT) => {
  const bonuses = (basicpay * bonusePT) / 100;
  const deductions = (basicpay * deductionPT) / 100;
  const netpay = basicpay + bonuses - deductions;
  return { bonuses, deductions, netpay };
};

/** Create Salary */
export const HandleCreateSalary = async (req, res) => {
  try {
    const { employeeID, basicpay, bonusePT, deductionPT, duedate, currency } =
      req.body;

    if (
      !employeeID ||
      !basicpay ||
      bonusePT === undefined ||
      deductionPT === undefined ||
      !duedate ||
      !currency
    ) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const employee = await Employee.findById(employeeID);
    if (!employee) {
      return res
        .status(404)
        .json({ success: false, message: "Employee not found" });
    }

    const { bonuses, deductions, netpay } = calculateSalary(
      basicpay,
      bonusePT,
      deductionPT
    );

    const existingSalary = await Salary.findOne({
      employee: employeeID,
      basicpay,
      bonuses,
      deductions,
      netpay,
      currency,
      duedate: new Date(duedate),
    });

    if (existingSalary) {
      return res.status(400).json({
        success: false,
        message: "Salary record already exists for this employee",
      });
    }

    const salary = await Salary.create({
      employee: employeeID,
      basicpay,
      bonuses,
      deductions,
      netpay,
      currency,
      duedate: new Date(duedate),
      organizationID: req.ORGID,
    });

    employee.salary.push(salary._id);
    await employee.save();

    return res.status(201).json({
      success: true,
      message: "Salary created successfully",
      data: salary,
    });
  } catch (error) {
    console.error("Error in HandleCreateSalary:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

/** Get All Salaries */
export const HandleAllSalary = async (req, res) => {
  try {
    const salaries = await Salary.find({ organizationID: req.ORGID }).populate(
      "employee",
      "firstname lastname department"
    );

    return res.status(200).json({
      success: true,
      message: "All salary records retrieved successfully",
      data: salaries,
    });
  } catch (error) {
    console.error("Error in HandleAllSalary:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

/** Get Specific Salary */
export const HandleSalary = async (req, res) => {
  try {
    const { salaryID } = req.params;
    const salary = await Salary.findOne({
      _id: salaryID,
      organizationID: req.ORGID,
    }).populate("employee", "firstname lastname department");

    if (!salary) {
      return res
        .status(404)
        .json({ success: false, message: "Salary record not found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Salary found", data: salary });
  } catch (error) {
    console.error("Error in HandleSalary:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

/** Update Salary */
export const HandleUpdateSalary = async (req, res) => {
  try {
    const {
      salaryID,
      basicpay,
      bonusePT,
      deductionPT,
      duedate,
      currency,
      status,
    } = req.body;

    if (
      !salaryID ||
      !basicpay ||
      bonusePT === undefined ||
      deductionPT === undefined ||
      !duedate ||
      !currency
    ) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const { bonuses, deductions, netpay } = calculateSalary(
      basicpay,
      bonusePT,
      deductionPT
    );

    const updatedSalary = await Salary.findByIdAndUpdate(
      salaryID,
      {
        basicpay,
        bonuses,
        deductions,
        netpay,
        currency,
        duedate: new Date(duedate),
        status,
      },
      { new: true }
    );

    if (!updatedSalary) {
      return res
        .status(404)
        .json({ success: false, message: "Salary record not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Salary updated successfully",
      data: updatedSalary,
    });
  } catch (error) {
    console.error("Error in HandleUpdateSalary:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

/** Delete Salary */
export const HandleDeleteSalary = async (req, res) => {
  try {
    const { salaryID } = req.params;

    const salary = await Salary.findOne({
      _id: salaryID,
      organizationID: req.ORGID,
    });
    if (!salary) {
      return res
        .status(404)
        .json({ success: false, message: "Salary record not found" });
    }

    const employee = await Employee.findById(salary.employee);
    if (employee) {
      const index = employee.salary.indexOf(salary._id);
      if (index > -1) {
        employee.salary.splice(index, 1);
        await employee.save();
      }
    }

    await salary.deleteOne();

    return res
      .status(200)
      .json({ success: true, message: "Salary deleted successfully" });
  } catch (error) {
    console.error("Error in HandleDeleteSalary:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};
