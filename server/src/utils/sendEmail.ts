// server/src/utils/sendEmail.ts
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" }); // Ensure .env variables are loaded for this utility

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  replyTo?: string; // Optional: for contact forms, allows recipient to reply directly to the sender
}

/**
 * Sends an email using Nodemailer and configured SMTP settings.
 *
 * Ensure the following environment variables are set in your .env file:
 * EMAIL_HOST (e.g., smtp.mailtrap.io or smtp.sendgrid.net)
 * EMAIL_PORT (e.g., 2525 for Mailtrap, 587 for TLS, 465 for SSL)
 * EMAIL_SECURE (true for 465, false for other ports like 587, 2525)
 * EMAIL_USERNAME (Your email account username)
 * EMAIL_PASSWORD (Your email account password or app-specific password)
 * EMAIL_FROM (e.g., "Your App Name <no-reply@yourdomain.com>")
 * ADMIN_EMAIL (e.g., your_admin_inbox@example.com - where submissions go)
 */
const sendEmail = async (options: EmailOptions) => {
  // Create a transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || "587"),
    secure: process.env.EMAIL_SECURE === "true", // Use 'true' for port 465 (SSL), 'false' for other ports (like 587, 2525 for TLS/STARTTLS)
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    // Optional: for development with self-signed certs or specific testing environments
    // tls: {
    //   rejectUnauthorized: false, // Set to true in production for security
    // },
  });

  // Define email options
  const mailOptions = {
    from: process.env.EMAIL_FROM || "No-reply <no-reply@example.com>",
    to: options.to,
    subject: options.subject,
    html: options.html,
    replyTo: options.replyTo, // If the user provided their email in the contact form
  };

  // Send the email
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Message sent: ${info.messageId}`);
    // console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info)); // Only for Ethereal email
  } catch (error: any) {
    console.error("Error sending email:", error);
    // In a production environment, you might log this error to a monitoring service
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

export default sendEmail;
