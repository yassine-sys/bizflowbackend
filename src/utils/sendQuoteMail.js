import nodemailer from "nodemailer";

export async function sendQuoteMail({ to, subject, text, pdfPath }) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
    attachments: [
      {
        filename: "Devis.pdf",
        path: pdfPath,
      },
    ],
  };

  await transporter.sendMail(mailOptions);
}
