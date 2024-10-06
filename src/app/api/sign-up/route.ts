import { sendVerificationEmails } from "@/helpers/sendVerificationEmail";
import dbConnect from "@/lib/dbconnect";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username, email, password } = await request.json();
    const existingUserVerifiedByUsername = await UserModel.findOne({
      username,
      isVerified: true,
    });
    if (existingUserVerifiedByUsername) {
      return Response.json(
        {
          success: false,
          message: "username already taken",
        },
        { status: 400 }
      );
    }
    const existingUserByEmail = await UserModel.findOne({
      email,
    });
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    if (existingUserByEmail) {
        if(existingUserByEmail.isVerified){
            return Response.json({
                success: false,
                message: "User already exist with this email"
              }, {status: 400});
        } else {
            const hashedPassword = await bcrypt.hash(password, 10);
            existingUserByEmail.password = hashedPassword;
            existingUserByEmail.verifyCode = verifyCode;
            existingUserByEmail.expiryVerifyCode = new Date(Date.now() + 3600000);
            const savedExistingUserByEmail = await existingUserByEmail.save();
        }
     
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);
      const newUser = new UserModel({
        username: username,
        email: email,
        password: hashedPassword,
        verifyCode: verifyCode,
        expiryVerifyCode: expiryDate,
        isVerified: false,
        isAcceptingMessage: true,
        messages: [],
      });
      await newUser.save();
    }

    //send verification email
    const sentEmail = await sendVerificationEmails(email, username, verifyCode);
    console.log("respoonse from sending email", sentEmail);
    if (!sentEmail.success) {
      return Response.json(
        {
          success: false,
          message: sentEmail.message,
        },
        { status: 500 }
      );
    }

    return Response.json(
      {
        success: true,
        message: "User registered successfully. Please verify your email",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error in singup route", error);
    return Response.json({
      message: "Error in signup route",
      success: false,
      status: 500,
    });
  }
}
