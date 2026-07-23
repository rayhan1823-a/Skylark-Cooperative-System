// ======================================
// Imports
// ======================================

const CryptoJS = require("crypto-js");

// ======================================
// Secret Key
// ======================================

const SECRET_KEY =
  process.env.BACKUP_SECRET ||
  "Skylark_Backup_Encryption_2026";

// ======================================
// Encrypt Backup
// ======================================

const encryptBackup = (data) => {
  try {
    const json = JSON.stringify(data);

    return CryptoJS.AES.encrypt(
      json,
      SECRET_KEY
    ).toString();
  } catch (error) {
    console.error("Encryption Error:", error);
    throw new Error("Backup Encryption Failed");
  }
};

// ======================================
// Decrypt Backup
// ======================================

const decryptBackup = (encryptedData) => {
  try {
    const bytes = CryptoJS.AES.decrypt(
      encryptedData,
      SECRET_KEY
    );

    const decrypted = bytes.toString(
      CryptoJS.enc.Utf8
    );

    if (!decrypted) {
      throw new Error("Invalid Backup File");
    }

    return JSON.parse(decrypted);

  } catch (error) {
    console.error("Decryption Error:", error);
    throw new Error("Backup Decryption Failed");
  }
};

// ======================================
// Check Backup
// ======================================

const isEncryptedBackup = (encryptedData) => {
  try {
    const bytes = CryptoJS.AES.decrypt(
      encryptedData,
      SECRET_KEY
    );

    const decrypted = bytes.toString(
      CryptoJS.enc.Utf8
    );

    return decrypted.length > 0;

  } catch (error) {
    return false;
  }
};

// ======================================
// Export
// ======================================

module.exports = {
  encryptBackup,
  decryptBackup,
  isEncryptedBackup,
};