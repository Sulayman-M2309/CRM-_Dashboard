import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import dbConnect from "./config/db.js";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.js";

import EmployeeAuthRouter from "./routes/EmployeeAuth.route.js";
import HRAuthrouter from "./routes/HRAuth.route.js";
import EmployeeRouter from "./routes/Employee.route.js";
import HRRouter from "./routes/HR.route.js";
import DashboardRouter from "./routes/Dashbaord.route.js";
import DepartmentRouter from "./routes/Department.route.js";
import SalaryRouter from "./routes/Salary.route.js";
import NoticeRouter from "./routes/Notice.route.js";
import LeaveRouter from "./routes/Leave.route.js";
import AttendanceRouter from "./routes/Attendance.route.js";
import RecruitmentRouter from "./routes/Recuritment.route.js";
import ApplicantRouter from "./routes/Applicant.route.js";
import InterviewRouter from "./routes/Interview.route.js";
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());
// app.use("/api/auth", authRouter);
app.use("/api/auth/employee", EmployeeAuthRouter);
app.use("/api/v1/employee", EmployeeRouter);
app.use("/api/auth/HR", HRAuthrouter);
app.use("/api/v1/applicant", ApplicantRouter);
app.use("/api/v1/HR", HRRouter);
app.use("/api/v1/dashboard", DashboardRouter);
app.use("/api/v1/department", DepartmentRouter);
app.use("/api/v1/salary", SalaryRouter);
app.use("/api/v1/notice", NoticeRouter);
app.use("/api/v1/leave", LeaveRouter);
app.use("/api/v1/attendance", AttendanceRouter);
app.use("/api/v1/recruitment", RecruitmentRouter);
app.use("/api/v1/applicant", ApplicantRouter);
app.use("/api/v1/interview", InterviewRouter);

dbConnect();
const PORT = process.env.PORT || 4040;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
