import dotenv from "dotenv";
dotenv.config();
 


const { MailtrapClient } = require("mailtrap");

const TOKEN = process.env.MAILTRAP_TOKEN;
const end

const client = new MailtrapClient({
  endpoint: process.env.MAILTRAP_ENDPOINT,
  token: TOKEN,
});

const sender = {
  email: "hello@demomailtrap.co",
  name: "Walter White",
};
const recipients = [
  {
    email: "iomarkamel@gmail.com",
  }
];

client
  .send({
    from: sender,
    to: recipients,
    subject: "You are awesome!",
    text: "Congrats for sending test email with Mailtrap!",
    category: "Integration Test",
  })
  .then(console.log, console.error);