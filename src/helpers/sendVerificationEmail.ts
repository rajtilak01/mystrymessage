import { resend } from "@/lib/resend";
import VerificationEmail from "../../emails/VerificationEmails";
import { ApiResponse } from "@/types/ApiResponse";

export async function sendVerificationEmails(
    email: string,
    username: string,
    verifyCode: string,
    ): Promise<ApiResponse> {
        try {
            const response = await resend.emails.send({
                from: 'Acme <onboarding@resend.dev>',
                to: email,
                subject: 'Mystry Message | Verfication Code',
                react: VerificationEmail({ username, otp: verifyCode}),
            })
            console.log("email sent to the user", response)
            return {
                success: true,
                message: "Success sending verification email",
            }
        } catch (error:any) {
            console.error("error sending verification email", error);
            return {
                success: false,
                message: "fialed sending verification email",
            }
            
        }
}

