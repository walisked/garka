import CryptoJS from "crypto-js";

const encryptFile = (buffer) => {
  return CryptoJS.AES.encrypt(
    buffer.toString("base64"),
    process.env.JWT_SECRET
  ).toString();
};

export default encryptFile;
