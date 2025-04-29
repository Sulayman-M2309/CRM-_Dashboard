import User from "./models/userModels.js";
import bcrypt from "bcrypt";
import dbConnect from "./config/db.js";
const userRegister = async () => {
    dbConnect();
      try {
        const haspassword = await bcrypt.hash("admin", 10);
        const newuser = new User({
            name: "Admin",
            email: "admin@gmail.com",
            password: haspassword,  
            role: "admin",
            // profileImage: "https://example.com/image.jpg",
            // createAt: new Date(),           
            // updatedAt: new Date(),
            // otp: "123456",
            // isverify: true,
        });
        await newuser.save();
        console.log("User created successfully");
    } catch (error) {
        
    }
}
userRegister();