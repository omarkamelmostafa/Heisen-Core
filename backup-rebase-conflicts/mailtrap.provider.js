// backend/services/email/providers/mailtrap.provider.js
<<<<<<< HEAD
=======
// Provider: Ethereal Email (https://ethereal.email) — SMTP sandbox for development
>>>>>>> 0f9bd8b (fix(tests): configure MongoDB Memory Server for offline binary usage)

import nodemailer from "nodemailer";
import { EMAIL_CONFIG } from "../config/email.config.js";
import logger from "../../../utilities/general/logger.js";

<<<<<<< HEAD
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
=======
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
>>>>>>> 0f9bd8b (fix(tests): configure MongoDB Memory Server for offline binary usage)
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
<<<<<<< HEAD
          "X-MT-Category": category,
        },
      });

      logger.info({ messageId: info.messageId, to }, "Sandbox Email sent successfully via SMTP");
      return { success: true, messageId: info.messageId };
    } catch (error) {
      logger.error({ err: error, to }, `Error sending sandbox email via SMTP`);
=======
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
>>>>>>> 0f9bd8b (fix(tests): configure MongoDB Memory Server for offline binary usage)
      throw error;
    }
  }

  async sendWithTemplate({ to, template_uuid, template_variables }) {
    try {
      const info = await this.transporter.sendMail({
        from: `"${this.sender.name}" <${this.sender.email}>`,
        to,
<<<<<<< HEAD
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
=======
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
>>>>>>> 0f9bd8b (fix(tests): configure MongoDB Memory Server for offline binary usage)
      throw error;
    }
  }
}

<<<<<<< HEAD
export default MailtrapProvider;
=======
export default EtherealProvider;
>>>>>>> 0f9bd8b (fix(tests): configure MongoDB Memory Server for offline binary usage)
