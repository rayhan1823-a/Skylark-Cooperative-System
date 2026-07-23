// ======================================
// Imports
// ======================================

const fs = require("fs");
const path = require("path");
const archiver = require("archiver");

// ======================================
// Create ZIP Backup
// ======================================

const createZipBackup = async (backupData) => {
  return new Promise((resolve, reject) => {

    try {

      // ==================================
      // Date
      // ==================================

      const now = new Date();

      const year = now.getFullYear().toString();

      const month = String(
        now.getMonth() + 1
      ).padStart(2, "0");

      const day = String(
        now.getDate()
      ).padStart(2, "0");

      const hour = String(
        now.getHours()
      ).padStart(2, "0");

      const minute = String(
        now.getMinutes()
      ).padStart(2, "0");

      const second = String(
        now.getSeconds()
      ).padStart(2, "0");

      // ==================================
      // Backup Folder
      // ==================================

      const backupDir = path.join(
        __dirname,
        "..",
        "backups",
        year,
        month
      );

      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, {
          recursive: true,
        });
      }

      // ==================================
      // File Name
      // ==================================

      const fileName =
        `backup-${year}-${month}-${day}-${hour}-${minute}-${second}.zip`;

      const filePath = path.join(
        backupDir,
        fileName
      );

      // ==================================
      // ZIP
      // ==================================

      const output =
        fs.createWriteStream(filePath);

      const archive = archiver("zip", {
        zlib: {
          level: 9,
        },
      });

      output.on("close", () => {

        console.log(
          "======================================"
        );

        console.log(
          "✅ Backup Created Successfully"
        );

        console.log(
          "📦 File :",
          filePath
        );

        console.log(
          "📁 Size :",
          archive.pointer(),
          "bytes"
        );

        console.log(
          "======================================"
        );

        resolve(filePath);

      });

      archive.on("error", (err) => {
        reject(err);
      });

      archive.pipe(output);

      archive.append(
        JSON.stringify(
          backupData,
          null,
          2
        ),
        {
          name: "backup.json",
        }
      );

      archive.finalize();

    } catch (error) {

      reject(error);

    }

  });
};

// ======================================
// Export
// ======================================

module.exports = {
  createZipBackup,
};