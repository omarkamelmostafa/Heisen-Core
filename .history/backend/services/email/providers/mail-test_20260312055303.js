const { MailtrapClient } = require("mailtrap");

const TOKEN = "<YOUR_API_TOKEN>";

const client = new MailtrapClient({
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