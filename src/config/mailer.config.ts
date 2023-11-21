import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  secure: process.env.SMTP_SECURE,
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,

  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});
