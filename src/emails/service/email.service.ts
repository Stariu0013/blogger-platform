import nodemailer from "nodemailer";
import {EmailManager} from "../manager/email.manager";
import {injectable, inject} from "inversify";
import {TYPES} from "../../core/types/di-tokens";

@injectable()
export class EmailService {
    constructor(
        @inject(TYPES.EmailManager) private emailManager: EmailManager,
    ) {}

    async sendRegistrationEmail(email: string, confirmationCode: string): Promise<boolean> {
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
            html: this.emailManager.sendRegistrationEmail(confirmationCode),
        });

        console.log("Message sent:", info.messageId);

        return !!info;
    }
    async sendRecoveryPassword(email: string, confirmationCode: string): Promise<boolean> {
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
            subject: "Password recovery",
            html: this.emailManager.sendRecoveryPassword(confirmationCode),
        });

        console.log("Message sent:", info.messageId);

        return !!info;
    }
}
