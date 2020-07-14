import mailgun from "mailgun-js";
const DOMAIN = "sandboxaf07edd78ee44fbd8356671e8d0522b9.mailgun.org";
const mg = mailgun({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: DOMAIN,
});

export const sendWelcomeEmail = (email, name) => {
  const data = {
    from:
      "Mailgun Sandbox <postmaster@sandboxaf07edd78ee44fbd8356671e8d0522b9.mailgun.org>",
    to: email,
    subject: "Welcome to task manager",
    text: `Welcome to the team, ${name}!`,
  };
  mg.messages().send(data, function (error, body) {
    console.log(body);
  });
};

export const sendCancellationEmail = (to, name) => {
  const data = {
    from: "ceo@Task-manager.co",
    to,
    subject: "Sad to see you go",
    text: `Goodbye ${name}, you're gonna regret it bitch`,
  };
  mg.messages().send(data, function (error, body) {
    console.log(body);
  });
};

// You can see a record of this email in your logs: https://app.mailgun.com/app/logs.

// You can send up to 300 emails/day from this sandbox server.
// Next, you should add your own domain so you can send 10000 emails/month for free.
