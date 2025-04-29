import { Department } from "../models/DepartmentModel.js";
import { HumanResources } from "../models/HRModel.js";
import { Organization } from "../models/OrganizationModel.js";

// Handle all HR records in the organization
export const HandleAllHR = async (req, res) => {
  try {
    const HR = await HumanResources.find({
      organizationID: req.ORGID,
    }).populate("department");
    return res.status(200).json({
      success: true,
      message: "All Human Resources Found Successfully",
      data: HR,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error,
    });
  }
};

// Handle a specific HR record by ID
export const HandleHR = async (req, res) => {
  try {
    const { HRID } = req.params;
    const HR = await HumanResources.findOne({
      _id: HRID,
      organizationID: req.ORGID,
    });

    if (!HR) {
      return res.status(404).json({
        success: false,
        message: "HR Record Not Found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Human Resources Found Successfully",
      data: HR,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error,
    });
  }
};

// Handle HR record update
export const HandleUpdateHR = async (req, res) => {
  try {
    const { HRID, Updatedata } = req.body;

    if (!HRID || !Updatedata) {
      return res.status(400).json({
        success: false,
        message: "Missing HRID or Updatedata",
      });
    }

    const updatedHR = await HumanResources.findByIdAndUpdate(HRID, Updatedata, {
      new: true,
    });

    if (!updatedHR) {
      return res.status(404).json({
        success: false,
        message: "HR Record Not Found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Human Resources Updated Successfully",
      data: updatedHR,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error,
    });
  }
};

// Handle HR record deletion
export const HandleDeleteHR = async (req, res) => {
  try {
    const { HRID } = req.params;

    const HR = await HumanResources.findOne({
      _id: HRID,
      organizationID: req.ORGID,
    });

    if (!HR) {
      return res.status(404).json({
        success: false,
        message: "HR Record Not Found",
      });
    }

    // Remove HR from department's HR list if it exists
    if (HR.department) {
      const department = await Department.findById(HR.department);

      if (department && department.HumanResources.includes(HRID)) {
        const index = department.HumanResources.indexOf(HRID);
        department.HumanResources.splice(index, 1);
      }

      await department.save();
    }

    // Remove HR from organization's HR list
    const organization = await Organization.findById(req.ORGID);
    organization.HRs.splice(organization.HRs.indexOf(HRID), 1);

    await organization.save();
    await HR.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Human Resources Deleted Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error,
    });
  }
};
