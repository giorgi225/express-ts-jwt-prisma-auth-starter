import emailConfig from "@config/email.config";
import nodemailer, { Transporter } from "nodemailer";
import Mail from "nodemailer/lib/mailer";

class EmailService {
    private transporter: Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: emailConfig.EMAIL_HOST,
            port: emailConfig.EMAIL_PORT,
            secure: emailConfig.EMAIL_SECURE,
            auth: {
                user: emailConfig.EMAIL_USER,
                pass: emailConfig.EMAIL_PASS
            },
        })        
    }

    // Generic email sending method
    public async sendEmail({ to, subject, text, html }: Mail.Options): Promise<{ ok: boolean }> {
        try {
            await this.transporter.sendMail({
                from: emailConfig.EMAIL_USER,
                to,
                subject,
                text,
                html
            })
            
            return { ok: true };
        } catch (error) {
            console.error(`Failed to send email: ${error}`);
            return { ok: false };
        }
    }

    // Send email verification
    public async sendEmailVerification({ code, to }: { code: number, to: string }): Promise<{ ok: boolean }> {
        try {
            const emailRes = await this.sendEmail({
                to,
                subject: "Email verification",
                text: "",
                html: `
                    Email verification code is ${code}
                    Verification code will expire in ${emailConfig.EMAIL_VERIFICATION_EXPIRATION}
                `
            });
            return emailRes;
        } catch (error) {
            console.error(`Failed to send email verification: ${error}`);
            return { ok: false };
        }
    }
}

export default EmailService;