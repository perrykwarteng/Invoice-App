import nodemailer from "nodemailer";
import {
  SMTP_HOST,
  SMTP_PASS,
  SMTP_PORT,
  SMTP_SERVICE,
  SMTP_USER,
} from "../envs.js";

export const transporter = nodemailer.createTransport({
  service: SMTP_SERVICE,
  host: SMTP_HOST,
  port: Number(SMTP_PORT),
  secure: false,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

transporter.verify((err, success) => {
  if (err) {
    console.log(err);
  } else {
    console.log("Ready to send emails");
  }
});
