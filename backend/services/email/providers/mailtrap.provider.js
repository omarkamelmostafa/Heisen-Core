// backend/services/email/providers/mailtrap.provider.js
// Provider: Ethereal Email (https://ethereal.email) — SMTP sandbox for development

import nodemailer from "nodemailer";
import { EMAIL_CONFIG } from "../config/email.config.js";
import logger from "../../../utilities/general/logger.js";

export class EtherealProvider {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: EMAIL_CONFIG.ethereal.host,
      port: EMAIL_CONFIG.ethereal.port,
      auth: {
        user: EMAIL_CONFIG.ethereal.auth.user,
        pass: EMAIL_CONFIG.ethereal.auth.pass,
      },
    });

    this.sender = EMAIL_CONFIG.ethereal.sender;
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
          "X-Category": category,
        },
      });

      logger.info(
        { messageId: info.messageId, to, preview: nodemailer.getTestMessageUrl(info) },
        "Email sent via Ethereal SMTP"
      );
      return { success: true, messageId: info.messageId };
    } catch (error) {
      logger.error({ err: error, to }, "Error sending email via Ethereal SMTP");
      throw error;
    }
  }

  async sendWithTemplate({ to, template_uuid, template_variables }) {
    try {
      const info = await this.transporter.sendMail({
        from: `"${this.sender.name}" <${this.sender.email}>`,
        to,
        subject: template_variables?.subject || "Notification",
        html: `<p>Template: ${template_uuid}</p><pre>${JSON.stringify(template_variables, null, 2)}</pre>`,
      });

      logger.info(
        { messageId: info.messageId, to },
        "Template email sent via Ethereal SMTP"
      );
      return { success: true, messageId: info.messageId };
    } catch (error) {
      logger.error({ err: error, to }, "Error sending template email via Ethereal SMTP");
      throw error;
    }
  }
}

export default EtherealProvider;
