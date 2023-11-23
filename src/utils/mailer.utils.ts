import nodemailer, { SendMailOptions } from "nodemailer";
import { mailer, logger } from "@config/index.config.js";

export async function sendEmail(payload: SendMailOptions) {
  mailer.sendMail(payload, (err, info) => {
    if (err) {
      logger.error(err, "Error sending email");
      return;
    }

    logger.info(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
  });
}
