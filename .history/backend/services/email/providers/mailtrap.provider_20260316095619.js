import axios from "axios";
import { EMAIL_CONFIG } from "../config/email.config.js";

export class MailtrapProvider {
  constructor() {
    /* 
    OLD CONFIG (Production):
    this.client = axios.create({
      baseURL: EMAIL_CONFIG.mailtrap.endpoint, // https://send.api.mailtrap.io
      headers: { Authorization: `Bearer ${EMAIL_CONFIG.mailtrap.token}` },
    });
    */

    // NEW CONFIG (Sandbox/Testing):
    this.client = axios.create({
      baseURL: "https://sandbox.api.mailtrap.io",
      headers: { 
        "Authorization": `Bearer ${EMAIL_CONFIG.mailtrap.token}`,
        "Content-Type": "application/json"
      },
    });
    
    this.sender = EMAIL_CONFIG.mailtrap.sender;
    // Your specific inbox ID from the Mailtrap snippet
    this.testInboxId = 4440644; 
  }

  async send(emailData) {
    const { to, subject, html, category } = emailData;

    try {
      /* 
      OLD PATH (Production):
      const response = await this.client.post("/send", { ... });
      */

      // NEW PATH (Sandbox):
      const response = await this.client.post(`/send/${this.testInboxId}`, {
        from: this.sender,
        to: [{ email: to }],
        subject,
        html,
        category,
      });

      console.log("Sandbox Email sent successfully", response.data);
      return response.data;
    } catch (error) {
      console.error(`Error sending sandbox email to ${to}:`, error.response?.data || error.message);
      throw new Error(`Email sending failed: ${error.message}`);
    }
  }

  async sendWithTemplate({ to, template_uuid, template_variables }) {
    try {
      // NEW PATH (Sandbox):
      const response = await this.client.post(`/send/${this.testInboxId}`, {
        from: this.sender,
        to: [{ email: to }],
        template_uuid,
        template_variables,
      });

      return response.data;
    } catch (error) {
      console.error(`Error sending template email to ${to}:`, error.response?.data || error.message);
      throw new Error(`Template email sending failed: ${error.message}`);
    }
  }
}

export default MailtrapProvider;
