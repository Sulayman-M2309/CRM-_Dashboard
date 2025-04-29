import { Department } from "../models/DepartmentModel.js";
import { Employee } from "../models/EmployeeModel.js";
import { Organization } from "../models/OrganizationModel.js";

// Get all employees (HR-Admin)
export const HandleAllEmployees = async (req, res) => {
    try {
        const employees = await Employee.find({ organizationID: req.ORGID })
            .populate("department", "name")
            .select("firstname lastname email contactnumber department attendance notice salary leaverequest generaterequest isverified");

        return res.status(200).json({
            success: true,
            data: employees,
            type: "AllEmployees",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error,
        });
    }
};

// Get all employees (only ID and name, for dropdowns etc.)
export const HandleAllEmployeesIDS = async (req, res) => {
    try {
        const employees = await Employee.find({ organizationID: req.ORGID })
            .populate("department", "name")
            .select("firstname lastname department");

        return res.status(200).json({
            success: true,
            data: employees,
            type: "AllEmployeesIDS",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error,
        });
    }
};

// Get specific employee (HR-Admin)
export const HandleEmployeeByHR = async (req, res) => {
    try {
        const { employeeId } = req.params;

        const employee = await Employee.findOne({
            _id: employeeId,
            organizationID: req.ORGID,
        }).select("firstname lastname email contactnumber department attendance notice salary leaverequest generaterequest");

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: employee,
            type: "GetEmployee",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error,
        });
    }
};

// Get employee's own data (Employee role)
export const HandleEmployeeByEmployee = async (req, res) => {
    try {
        const employee = await Employee.findOne({
            _id: req.EMid,
            organizationID: req.ORGID,
        }).select("firstname lastname email contactnumber department attendance notice salary leaverequest generaterequest");

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Employee data fetched successfully",
            data: employee,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error,
        });
    }
};

// Update employee
export const HandleEmployeeUpdate = async (req, res) => {
    try {
        const { employeeId, updatedEmployee } = req.body;

        const existingEmployee = await Employee.findById(employeeId);

        if (!existingEmployee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found",
            });
        }

        const employee = await Employee.findByIdAndUpdate(employeeId, updatedEmployee, {
            new: true,
        }).select("firstname lastname email contactnumber department");

        return res.status(200).json({
            success: true,
            message: "Employee updated successfully",
            data: employee,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error,
        });
    }
};

// Delete employee
export const HandleEmployeeDelete = async (req, res) => {
    try {
        const { employeeId } = req.params;

        const employee = await Employee.findById(employeeId);

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found",
            });
        }

        // Remove employee from Department if exists
        if (employee.department) {
            const department = await Department.findById(employee.department);
            if (department) {
                department.employees.pull(employee._id);
                await department.save();
            }
        }

        // Remove employee from Organization
        const organization = await Organization.findById(employee.organizationID);
        if (!organization) {
            return res.status(404).json({
                success: false,
                message: "Organization not found",
            });
        }

        organization.employees.pull(employee._id);
        await organization.save();

        // Finally delete the employee
        await employee.deleteOne();

        return res.status(200).json({
            success: true,
            message: "Employee deleted successfully",
            type: "EmployeeDelete",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error,
        });
    }
};
