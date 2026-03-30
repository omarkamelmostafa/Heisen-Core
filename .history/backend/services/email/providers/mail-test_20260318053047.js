import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../../../.env") });

const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST || "sandbox.smtp.mailtrap.io",
  port: parseInt(process.env.MAILTRAP_PORT) || 2525,
  auth: {
    user: 361d9b371c3875,
    pass: ,
  },
});

MAILTRAP_HOST = sandbox.smtp.mailtrap.io
MAILTRAP_PORT = 2525
MAILTRAP_USER = 
MAILTRAP_PASS = b4551f9bc8bd7c

const sender = {
  email: "hello@example.com",
  name: "Walter White",
};

const mailOptions = {
  from: `"${sender.name}" <${sender.email}>`,
  to: "iomarkamel@gmail.com",
  subject: "You are awesome!",
  text: "Congrats for sending test email with Mailtrap SMTP!",
  category: "Integration Test",
  headers: {
    "X-MT-Category": "Integration Test"
  }
};

transporter.sendMail(mailOptions)
  .then(info => {
    console.log("Email sent successfully!");
    console.log("Message ID:", info.messageId);
    console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
  })
  .catch(console.error);
