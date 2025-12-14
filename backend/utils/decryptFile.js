import CryptoJS from "crypto-js";

const decryptFile = (encryptedData) => {
  const bytes = CryptoJS.AES.decrypt(
    encryptedData,
    process.env.JWT_SECRET
  );

  return Buffer.from(bytes.toString(CryptoJS.enc.Utf8), "base64");
};

export default decryptFile;
