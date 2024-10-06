import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbconnect";
import UserModel from "@/model/User";
import { User } from "next-auth";
import mongoose from "mongoose";

export async function GET(request: Request) {
    await dbConnect();
    const session = await getServerSession(authOptions);

    const user: User = session?.user as User;

    if (!session || !session.user) {
        return Response.json(
            {
                success: false,
                message: "Please login",
            },
            { status: 401 }
        );
    }

    const userId = new mongoose.Types.ObjectId(user._id);
    console.log("got the userID", userId);

    try {
        const user = await UserModel.aggregate([
            { $match: { _id: userId } },  // Fixed to match _id field
            { $unwind: '$messages' },
            { $sort: { 'messages.createdAt': -1 } },
            { $group: { _id: '$_id', messages: { $push: "$messages" } } }
        ]);

        if (!user || user.length === 0) {
            return Response.json({
                success: false,
                message: "User not found",  // Corrected the response
            }, { status: 401 });
        }

        return Response.json({
            success: true,
            messages: user[0].messages,  // This is now safe as we have validated the user exists
        }, { status: 201 });
    } catch (error) {
        console.log("Error coming from getting message route", error);
        return Response.json({
            success: false,
            message: "Error in getting messages",
            error: error
        }, { status: 500 });
    }
}
