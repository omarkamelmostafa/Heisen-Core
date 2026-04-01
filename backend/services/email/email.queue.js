// backend/services/email/email.queue.js
import Queue from "bull";
import { EtherealProvider } from "./providers/mailtrap.provider.js";

export class EmailQueue {
  constructor() {
    this.queue = new Queue("email", {
      redis: {
        host: process.env.REDIS_HOST || "localhost",
        port: parseInt(process.env.REDIS_PORT, 10) || 6379,
      },
    });
    this.provider = new EtherealProvider();

    this.setupProcessor();
  }

  setupProcessor() {
    this.queue.process("send-email", 5, async (job) => {
      // 5 concurrent emails
      const { to, subject, html, category, metadata } = job.data;

      try {
        const result = await this.provider.send({
          to,
          subject,
          html,
          category,
          metadata,
        });

        return { success: true, result };
      } catch (error) {
        throw new Error(`Email queue processing failed: ${error.message}`);
      }
    });
  }

  async add(emailData) {
    return await this.queue.add("send-email", emailData, {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 1000,
      },
      removeOnComplete: 100,
      removeOnFail: 50,
    });
  }

  async close() {
    await this.queue.close();
  }
}
