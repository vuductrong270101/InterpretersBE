const nodemailer = require("nodemailer");

const sendEmail = async (email, subject, message) => {
  try {
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com", // SMTP server address (usually mail.your-domain.com)
      port: 465, // Port for SMTP (usually 465)
      secure: true, // Usually true if connecting to port 465
      auth: {
        user: "hoangvanchien2206@gmail.com",
        pass: "kbzn lprs utow abil",
      },
    });
    let info = await transporter.sendMail({
      from: '"You" <hoangvanchien2206@gmail.com>',
      to: email,
      subject: "HINT- Đăng ký tài khoản thành công",
      html: `
      <h1>Chào mừng bạn đến với HINT</h1>
      <p>Xin chúc mừng bạn đã đăng ký thành công tài khoản.</p>
      <p>Bắt đầu trải nghiệm hấp dẫn cùng với cộng đồng người chơi của chúng tôi.</p>
      <p>Chúc bạn có những trải nghiệm tuyệt vời trên HINT!</p>
      <p>Thân ái,</p>
      <p>HINT Team</p>
      <p>Isn't HINTuseful?</p>
      `,
    });
    console.log("Email sent: " + info.response);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

module.exports = sendEmail;
