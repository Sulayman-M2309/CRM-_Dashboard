import { Interviewinsight } from "../models/InterviewInsightsModel.js";

// Create Interview Record
export const HandleCreateInterview = async (req, res) => {
  try {
    const { applicantID, interviewerID } = req.body;

    if (!applicantID || !interviewerID) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const existingInterview = await Interviewinsight.findOne({
      applicant: applicantID,
      organizationID: req.ORGID,
    });

    if (existingInterview) {
      return res.status(409).json({
        success: false,
        message: "Interview record already exists for this applicant",
      });
    }

    const newInterview = await Interviewinsight.create({
      applicant: applicantID,
      interviewer: interviewerID,
      organizationID: req.ORGID,
    });

    return res.status(201).json({
      success: true,
      message: "Interview record created successfully",
      data: newInterview,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get All Interviews
export const HandleAllInterviews = async (req, res) => {
  try {
    const interviews = await Interviewinsight.find({
      organizationID: req.ORGID,
    }).populate("applicant interviewer", "firstname lastname email");

    return res.status(200).json({
      success: true,
      message: "All interview records retrieved successfully",
      data: interviews,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get Interview by ID
export const HandleInterview = async (req, res) => {
  try {
    const { interviewID } = req.params;

    const interview = await Interviewinsight.findOne({
      _id: interviewID,
      organizationID: req.ORGID,
    }).populate("applicant interviewer", "firstname lastname email");

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview record not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Interview record retrieved successfully",
      data: interview,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Update Interview
export const HandleUpdateInterview = async (req, res) => {
  try {
    const { interviewID, UpdatedData } = req.body;

    const updatedInterview = await Interviewinsight.findByIdAndUpdate(
      interviewID,
      UpdatedData,
      { new: true }
    );

    if (!updatedInterview) {
      return res.status(404).json({
        success: false,
        message: "Interview record not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Interview record updated successfully",
      data: updatedInterview,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Delete Interview
export const HandleDeleteInterview = async (req, res) => {
  try {
    const { interviewID } = req.params;

    const deletedInterview = await Interviewinsight.findByIdAndDelete(interviewID);

    if (!deletedInterview) {
      return res.status(404).json({
        success: false,
        message: "Interview record not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Interview record deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
