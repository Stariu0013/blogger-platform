import {injectable} from "inversify";

@injectable()
export class EmailManager {
    sendRegistrationEmail(confirmationCode: string): string {
        return `
            <h1>Thank for your registration</h1>
             <p>To finish registration please follow the link below:
                 <a href='https://somesite.com/confirm-email?code=${confirmationCode}'>complete registration</a>
             </p>
        `
    }

    sendRecoveryPassword(recoveryCode: string): string {
        return `
            <h1>Password recovery</h1>
            <p>To finish password recovery please follow the link below:
                <a href='https://somesite.com/password-recovery?recoveryCode=your_recovery_code'>recovery password</a>
            </p>
        `
    }
}
