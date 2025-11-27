import nodemailer from "nodemailer";
import {emailManager} from "../manager/email.manager";

export const emailService = {
    async sendRegistrationEmail(email: string, confirmationCode: string) {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "stariutest@gmail.com",
                pass: "ibqcsaitavpsrviv",
            },
        });

        const info = await transporter.sendMail({
            from: '"Stariu" <stariutest@gmail.com>',
            to: email,
            subject: "Email confirmation",
            html: emailManager.sendRegistrationEmail(confirmationCode),
        });

        console.log("Message sent:", info.messageId);
    }
}