import { MailtrapClient } from "mailtrap";
import dotenv from "dotenv";
dotenv.config();

const TOKEN = "6182d64bb366e2418c45fd04fc4fd8df";
const ENDPOINT = "https://send.api.mailtrap.io/api/send"

const client = new MailtrapClient({
  endpoint: ENDPOINT,
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