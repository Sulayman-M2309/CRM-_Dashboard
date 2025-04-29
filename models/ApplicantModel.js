import mongoose from "mongoose";
import { Schema } from "mongoose";

const ApplicantSchema = new Schema(
  {
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function (value) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        },
        message: "Invalid email address format",
      },
    },
    contactnumber: {
      type: String,
      required: true,
    },
    appliedrole: {
      type: String,
      required: true,
    },
    recruitmentstatus: {
      type: String,
      enum: [
        "Conduct-Interview",
        "Rejected",
        "Pending",
        "Interview Completed",
        "Not Specified",
      ],
      default: "Not Specified",
    },
    organizationID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
    },
  },
  { timestamps: true }
);

//  {
// "email":"solaymanh33@gmail.com",
// "firstname":"Sulayman",
// "lastname":"abir",
// "contactnumber":"01951918261",
// "appliedrole":"designer"
//
// }

export const Applicant = mongoose.model("Applicant", ApplicantSchema);
