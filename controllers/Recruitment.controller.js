import { Recruitment } from "../models/RecruitmentModel.js";
import { Applicant } from "../models/ApplicantModel.js";

/**
 * Create a new recruitment
 */
export const HandleCreateRecruitment = async (req, res) => {
  try {
    const { jobtitle, description } = req.body;

    if (!jobtitle || !description) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const existingRecruitment = await Recruitment.findOne({
      jobtitle,
      organizationID: req.ORGID,
    });

    if (existingRecruitment) {
      return res.status(409).json({
        success: false,
        message: "Recruitment already exists for this job title",
      });
    }

    const newRecruitment = await Recruitment.create({
      jobtitle,
      description,
      organizationID: req.ORGID,
    });

    return res.status(201).json({
      success: true,
      message: "Recruitment created successfully",
      data: newRecruitment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get all recruitments
 */
export const HandleAllRecruitments = async (req, res) => {
  try {
    const recruitments = await Recruitment.find({
      organizationID: req.ORGID,
    }).populate("application");

    return res.status(200).json({
      success: true,
      message: "All recruitments retrieved successfully",
      data: recruitments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get a single recruitment by ID
 */
export const HandleRecruitment = async (req, res) => {
  try {
    const { recruitmentID } = req.params;

    if (!recruitmentID) {
      return res.status(400).json({
        success: false,
        message: "Recruitment ID is required",
      });
    }

    const recruitment = await Recruitment.findOne({
      _id: recruitmentID,
      organizationID: req.ORGID,
    }).populate("application");

    if (!recruitment) {
      return res.status(404).json({
        success: false,
        message: "Recruitment not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Recruitment retrieved successfully",
      data: recruitment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Update recruitment details or assign applicants
 */
export const HandleUpdateRecruitment = async (req, res) => {
  try {
    const {
      recruitmentID,
      jobtitle,
      description,
      departmentID,
      applicationIDArray,
    } = req.body;

    if (!recruitmentID || !jobtitle || !description || !departmentID) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const recruitment = await Recruitment.findOne({
      _id: recruitmentID,
      organizationID: req.ORGID,
    });

    if (!recruitment) {
      return res.status(404).json({
        success: false,
        message: "Recruitment not found",
      });
    }

    // If applicants are being assigned
    if (applicationIDArray && applicationIDArray.length > 0) {
      const existingApplicants = recruitment.application.map(app =>
        app.toString()
      );

      const selectedApplications = [];
      const rejectedApplications = [];

      applicationIDArray.forEach(appId => {
        if (existingApplicants.includes(appId)) {
          rejectedApplications.push(appId);
        } else {
          selectedApplications.push(appId);
        }
      });

      if (rejectedApplications.length > 0) {
        return res.status(409).json({
          success: false,
          message: `Some applicants are already assigned to ${recruitment.jobtitle}`,
          rejectedApplications,
        });
      }

      recruitment.application.push(...selectedApplications);
      await recruitment.save();

      return res.status(200).json({
        success: true,
        message: "Applicants added to recruitment successfully",
        data: recruitment,
      });
    }

    // Update job details only
    const updatedRecruitment = await Recruitment.findByIdAndUpdate(
      recruitmentID,
      { jobtitle, description, department: departmentID },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Recruitment updated successfully",
      data: updatedRecruitment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Delete a recruitment
 */
export const HandleDeleteRecruitment = async (req, res) => {
  try {
    const { recruitmentID } = req.params;

    const deleted = await Recruitment.findByIdAndDelete(recruitmentID);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Recruitment not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Recruitment deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
