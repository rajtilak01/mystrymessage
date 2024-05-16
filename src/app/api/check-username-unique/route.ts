import dbConnect from "@/lib/dbconnect";
import UserModel from "@/model/User";
import {z} from 'zod'
import { usernameValidation } from "@/schemas/signUpSchemas";


const UsernameQuerySchema = z.object(
    {
        username: usernameValidation
    }
)

export async function GET(request: Request){
    await dbConnect();

    try {
        const {searchParams} = new URL(request.url);
        const queryParam = {
            username: searchParams.get("username")
        }
        //validate with zod
        const result = UsernameQuerySchema.safeParse(queryParam);
        console.log("result coming from username query safe parsing", result);
        if(!result.success){
            const usernameErrors = result.error.format().username?._errors || [];
            return Response.json({
                success: false,
                message: usernameErrors?.length > 0 ? usernameErrors.join(', ') : 'Invalid query parameters'
            }, {status: 500});
        }

        const {username} = result.data;
        const existingVerifiedUser = await UserModel.findOne({username, isVerified: true});

        if(existingVerifiedUser){
            return Response.json({
                success: false,
                message: 'username is already taken'
            }, {status: 501});
        }

        return Response.json({
            success: true,
            message: 'username is available'
        }, {status: 200});

    } catch (error: any) {
        console.error("Error checking username unique", error)
        return Response.json({
            success: false,
            message: "Error checking username",
        },
        { status: 500})
    }
}