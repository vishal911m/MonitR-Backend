import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_FROM_EMAIL) {
  throw new Error('Missing SENDGRID_API_KEY or SENDGRID_FROM_EMAIL in .env');
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Send an email using SendGrid
 * @param {string} subject - Email subject
 * @param {string} send_to - Recipient's email
 * @param {string} reply_to - Reply-to email (must be valid email)
 * @param {string} template - Placeholder for template name
 * @param {string} name - Recipient's name
 * @param {string} link - Actionable link
 */
const sendEmail = async (
  subject,
  send_to,
  reply_to,
  template,
  name,
  link
) => {
  // Fallback reply_to to verified sender if not valid
  const validReplyTo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reply_to)
    ? reply_to
    : process.env.SENDGRID_FROM_EMAIL;

  const msg = {
    to: send_to,
    from: process.env.SENDGRID_FROM_EMAIL,
    replyTo: validReplyTo,
    subject,
    html: `
  <html>
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verify Your Email</title>
  <style>
    *{ text-decoration: none; } 
    .container{ margin: 0 auto; max-width: 500px; width: 100%; } 
    .btn-link{ display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff !important; text-decoration: none; border-radius: 5px; } 
    img{ width: 30px; border-radius: 50%;}
  </style>
</head>
<body>
  <div class="container">
    <img src="https://avatars.githubusercontent.com/u/19819005?v=4" alt="avatar" />
    <h2 class="color-primary">${subject}</h2>
    <hr />
    <p>Hello ${name},</p>
    <p>Please use the URL below to verify your account.<br />This link is valid for 24 hours.</p>
    <a href="${link}" class="btn-link">Verify Account</a>
    <p style="margin-bottom: 50px;">
      If you didn't create an account, you can ignore this email.
    </p>
    <hr />
    <p>Regards,</p>
    <p><b>AuthKit</b> Team</p>
    <div>
      <p style="font-size: 0.8rem;">
        If you’re having trouble clicking the "Verify Account" button, copy and paste the URL below into your web browser:
        <br />
        <a href="${link}">${link}</a>
      </p>
    </div>
  </div>
</body>
</html>
    `
  };

  try {
    console.log("✉️ Sending email with payload:", msg);
    const response = await sgMail.send(msg);
    console.log('✅ Email sent successfully');
    return response;
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    if (error.response?.body) {
      console.error('SendGrid error body:', error.response.body);
    }
    throw error;
  }
};

export default sendEmail;

// import nodeMailer from "nodemailer";
// import path from "path";
// import dotenv from "dotenv";
// import hbs from "nodemailer-express-handlebars";
// import { fileURLToPath } from "node:url";

// dotenv.config();

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const sendEmail = async (
//   subject,
//   send_to,
//   send_from,
//   reply_to,
//   template,
//   name,
//   link
// ) => {
//   const transporter = nodeMailer.createTransport({
//     host: "smtp.gmail.com",
//     port: 587,
//     secure: false,
//     auth: {
//       user: process.env.USER_EMAIL, // Outlook email
//       pass: process.env.EMAIL_PASS, // Outlook password
//     },
//   });

//   const handlebarsOptions = {
//     viewEngine: {
//       extName: ".handlebars",
//       partialsDir: path.resolve(__dirname, "../views"),
//       defaultLayout: false,
//     },
//     viewPath: path.resolve(__dirname, "../views"),
//     extName: ".handlebars",
//   };

//   transporter.use("compile", hbs(handlebarsOptions));

//   const mailOptions = {
//     from: send_from,
//     to: send_to,
//     replyTo: reply_to,
//     subject: subject,
//     template: template,
//     context: {
//       name,
//       link,
//     },
//   };

//   try {
//     const info = await transporter.sendMail(mailOptions);
//     console.log("Message sent: %s", info.messageId);
//     return info;
//   } catch (error) {
//     console.error("❌ Error sending email:", error);
//     throw error;
//   }
// };

// export default sendEmail;

// import nodeMailer from "nodemailer";
// import path from "path";
// import dotenv from "dotenv";
// import hbs from "nodemailer-express-handlebars";
// import { fileURLToPath } from "url";

// dotenv.config();

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const sendEmail = async (
//   subject,
//   send_to,
//   send_from,
//   reply_to,
//   template,
//   name,
//   link
// ) => {
//   const transporter = nodeMailer.createTransport({
//     host: "smtp.sendgrid.net",
//     port: 587,
//     auth: {
//       user: "apikey", // This is literally the username for SendGrid SMTP
//       pass: process.env.SENDGRID_API_KEY,
//     },
//   });

//   const handlebarsOptions = {
//     viewEngine: {
//       extName: ".handlebars",
//       partialsDir: path.resolve(__dirname, "../views"),
//       defaultLayout: false,
//     },
//     viewPath: path.resolve(__dirname, "../views"),
//     extName: ".handlebars",
//   };

//   transporter.use("compile", hbs(handlebarsOptions));

//   const mailOptions = {
//     from: send_from || process.env.SENDGRID_FROM_EMAIL || process.env.USER_EMAIL, // fallback safety
//     to: send_to,
//     replyTo: reply_to || process.env.SENDGRID_FROM_EMAIL,
//     subject: subject,
//     template: template,
//     context: {
//       name,
//       link,
//     },
//   };

//   try {
//     const info = await transporter.sendMail(mailOptions);
//     console.log("✅ Message sent:", info.messageId);
//     return info;
//   } catch (error) {
//     console.error("❌ Error sending email:", error);
//     throw error;
//   }
// };

// export default sendEmail;

//modified version with handlebars

// import fs from "fs";
// import path from "path";
// import handlebars from "handlebars";
// import sgMail from "@sendgrid/mail";
// import dotenv from "dotenv";
// import { fileURLToPath } from "url";

// dotenv.config();

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_FROM_EMAIL) {
//   throw new Error("Missing SENDGRID_API_KEY or SENDGRID_FROM_EMAIL in .env");
// }

// sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// /**
//  * Render handlebars template from file with given context data
//  * @param {string} templateName - filename without extension, e.g. "welcome"
//  * @param {object} context - template variables
//  * @returns {string} rendered HTML string
//  */
// function renderTemplate(templateName, context) {
//   const templatePath = path.resolve(__dirname, "../views", `${templateName}.handlebars`);
//   const source = fs.readFileSync(templatePath, "utf-8");
//   const compiledTemplate = handlebars.compile(source);
//   return compiledTemplate(context);
// }

// /**
//  * Send email using SendGrid with rendered Handlebars template HTML
//  * @param {string} subject - email subject
//  * @param {string} send_to - recipient email
//  * @param {string} reply_to - reply-to email (optional)
//  * @param {string} templateName - handlebars template file name without extension
//  * @param {object} context - template variables
//  */
// const sendEmail = async (
//   subject,
//   send_to,
//   reply_to = process.env.SENDGRID_FROM_EMAIL,
//   templateName,
//   context = {}
// ) => {
//   const htmlContent = renderTemplate(templateName, context);

//   const msg = {
//     to: send_to,
//     from: process.env.SENDGRID_FROM_EMAIL,
//     replyTo: reply_to,
//     subject,
//     html: htmlContent,
//   };

//   try {
//     console.log("✉️ Sending email...");
//     const response = await sgMail.send(msg);
//     console.log("✅ Email sent successfully");
//     return response;
//   } catch (error) {
//     console.error("❌ Error sending email:", error);
//     if (error.response?.body) {
//       console.error("SendGrid error body:", error.response.body);
//     }
//     throw error;
//   }
// };

// export default sendEmail;


