import { MailtrapProvider } from "./providers/mailtrap.provider.js";
import { EmailQueue } from "./email.queue.js";
import { TemplateEngine } from "./templates/template.engine.js";
import logger from "../../utilities/general/logger.js";

export class EmailService {
  constructor() {
    this.provider = new MailtrapProvider();
    this.queue = new EmailQueue();
    this.templateEngine = new TemplateEngine();
  }

  async sendVerificationEmail(user, verificationToken) {
    const templateData = {
      user: {
        name: `${user.firstname} ${user.lastname}`,
        firstName: user.firstname,
        email: user.email,
      },
      verificationCode: verificationToken,
      expiryMinutes: 15,
    };

    const emailData = {
      to: user.email,
      subject: "Verify your email",
      category: "Email Verification",
      metadata: {
        userId: user._id.toString(),
        emailType: "verification",
      },
    };

    return await this.sendEmail("auth/verification", templateData, emailData);
  }

  async sendWelcomeEmail(user) {
    // Using Mailtrap template system
    return await this.provider.sendWithTemplate({
      to: user.email,
      template_uuid: "e65925d1-a9d1-4a40-ae7c-d92b37d593df",
      template_variables: {
        company_info_name: "Fantasy Coach",
        name: `${user.firstname} ${user.lastname}`,
      },
    });
  }

  async sendPasswordResetEmail(user, resetURL) {
    const templateData = {
      user: {
        name: user.firstname,
        firstName: user.firstname,
        email: user.email,
      },
      resetURL: resetURL,
      expiryHours: 1,
    };

    const emailData = {
      to: user.email,
      subject: "Reset your password",
      category: "Password Reset",
      metadata: {
        userId: user._id.toString(),
        emailType: "password_reset",
      },
    };

    return await this.sendEmail("auth/password-reset", templateData, emailData);
  }

  async sendResetSuccessEmail(user) {
    const templateData = {
      user: {
        name: user.firstname,
        firstName: user.firstname,
        email: user.email,
      },
    };

    const emailData = {
      to: user.email,
      subject: "Password Reset Successful",
      category: "Password Reset",
      metadata: {
        userId: user._id.toString(),
        emailType: "password_reset_success",
      },
    };

    return await this.sendEmail("auth/reset-success", templateData, emailData);
  }

  async sendEmail(templateName, templateData, emailOptions) {
    try {
      const compiledHtml = await this.templateEngine.compile(
        templateName,
        templateData
      );

      const emailData = {
        ...emailOptions,
        html: compiledHtml,
      };

      // Use queue in production, direct send in development
      if (process.env.NODE_ENV === "production") {
        return await this.queue.add(emailData);
      } else {
        return await this.provider.send(emailData);
      }
    } catch (error) {
      logger.error({ err: error, template: templateName }, `Error sending ${templateName} email`);
      throw error;
    }
  }
}

// Export singleton instance
export default new EmailService();
