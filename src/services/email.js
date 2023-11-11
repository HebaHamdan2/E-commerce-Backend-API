import nodemailer from "nodemailer";
export async function sendEmail(to,subject,html){
    const transporter = nodemailer.createTransport({
        service:'gmail',
        auth: {
          user: "hebahamdan296@gmail.com",
          pass: "whrk isem rkpn xocc",
        },
      });

  const info = await transporter.sendMail({
    from: '"Heba 👻" <hebahamdan296@gmail.com>', 
    to, 
    subject, // Subject line
    html,
  });

  return info;
}