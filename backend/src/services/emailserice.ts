import { otpEmail, welcomeEmail } from "../config/mails/emailTemps.js";
import { transporter } from "../config/mails/mailSetup.js";
import { SMTP_USER } from "../config/envs.js";

export const sendOtp = async (email: string, otp: string, name: string) => {
  await transporter.sendMail({
    from: `"SwiftInvoice" ${SMTP_USER}`,
    to: email,
    subject: "Verify Your Email",
    html: otpEmail(otp, name),
  });
};

export const sendRegisterMessage = async (email: string, name: string) => {
  await transporter.sendMail({
    from: `"SwiftInvoice" ${SMTP_USER}`,
    to: email,
    subject: "Welcome to SwiftInvoice",
    html: welcomeEmail(name),
  });
};

console.log("Otp Mail: ", sendOtp);
