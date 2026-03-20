// backend/services/email/providers/mailtrap.provider.js

import nodemailer from "nodemailer";
import { EMAIL_CONFIG } from "../config/email.config.js";
import logger from "../../../utilities/general/logger.js";

export class MailtrapProvider {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: EMAIL_CONFIG.mailtrap.host,
      port: EMAIL_CONFIG.mailtrap.port,
      auth: {
        user: EMAIL_CONFIG.mailtrap.auth.user,
        pass: EMAIL_CONFIG.mailtrap.auth.pass,
      },
    });

    this.sender = EMAIL_CONFIG.mailtrap.sender;
  }

  async send(emailData) {
    const { to, subject, html, category } = emailData;

    try {
      const info = await this.transporter.sendMail({
        from: `"${this.sender.name}" <${this.sender.email}>`,
        to,
        subject,
        html,
        headers: {
          "X-MT-Category": category,
        },
      });

      logger.info({ messageId: info.messageId, to }, "Sandbox Email sent successfully via SMTP");
      return { success: true, messageId: info.messageId };
    } catch (error) {
      logger.error({ err: error, to }, `Error sending sandbox email via SMTP`);
      throw error;
    }
  }

  async sendWithTemplate({ to, template_uuid, template_variables }) {
    try {
      const info = await this.transporter.sendMail({
        from: `"${this.sender.name}" <${this.sender.email}>`,
        to,
        // Mailtrap SMTP supports templates via custom headers
        headers: {
          "X-MT-Template-ID": template_uuid,
          "X-MT-Variables": JSON.stringify(template_variables),
        },
      });

      logger.info({ messageId: info.messageId, to }, "Template Email sent successfully via SMTP");
      return { success: true, messageId: info.messageId };
    } catch (error) {
      logger.error({ err: error, to }, `Error sending template email via SMTP`);
      throw error;
    }
  }
}

export default MailtrapProvider;
