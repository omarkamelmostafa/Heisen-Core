import axios from "axios";
import { EMAIL_CONFIG } from "../config/email.config.js";

export class MailtrapProvider {
  // constructor() {
  //   this.client = axios.create({
  //     baseURL: EMAIL_CONFIG.mailtrap.endpoint,
  //     headers: { Authorization: `Bearer ${EMAIL_CONFIG.mailtrap.token}` },
  //   });
  //   this.sender = EMAIL_CONFIG.mailtrap.sender;
  // }

  async send(emailData) {
    const { to, subject, html, category, metadata } = emailData;

    try {
      const response = await this.client.post("/send", {
        from: this.sender,
        to: [{ email: to }],
        subject,
        html,
        category,
      });

      console.log("Email sent successfully", response.data);
      return response.data;
    } catch (error) {
      console.error(`Error sending email to ${to}:`, error);
      throw new Error(`Email sending failed: ${error.message}`);
    }
  }

  async sendWithTemplate({ to, template_uuid, template_variables }) {
    try {
      const response = await this.client.post("/send", {
        from: this.sender,
        to: [{ email: to }],
        template_uuid,
        template_variables,
      });

      return response.data;
    } catch (error) {
      console.error(`Error sending template email to ${to}:`, error);
      throw new Error(`Template email sending failed: ${error.message}`);
    }
  }
}

export default MailtrapProvider;
