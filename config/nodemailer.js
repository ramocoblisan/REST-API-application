const nodemailerConfig = {
  host: "smtp.office365.com",
  port: 587,
  secure: false,
  auth: {
    user: "ramonacoblisan@outlook.com",
    pass: process.env.PASSWORD,
  },
};

export default nodemailerConfig;