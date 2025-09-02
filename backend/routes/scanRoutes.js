const express = require("express");
const multer = require("multer");
const { authenticateToken, requireRole } = require("../middleware/auth");
const { uploadToCloudinary } = require("../config/cloudinary");
const db = require("../config/database");
const PDFDocument = require("pdfkit");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Upload scan (Technician only)
router.post(
  "/upload",
  authenticateToken,
  requireRole("technician"),
  upload.single("scanImage"),
  async (req, res) => {
    try {
      const { patientName, patientId, scanType, region } = req.body;

      console.log(patientName, patientId);

      if (!req.file) {
        return res.status(400).json({ error: "Scan image required" });
      }

      // Upload to Cloudinary
      const result = await uploadToCloudinary(req.file.buffer);

      // Save to database
      db.run(
        `INSERT INTO scans (patient_name, patient_id, scan_type, region, image_url, technician_id)
                 VALUES (?, ?, ?, ?, ?, ?)`,
        [
          patientName,
          patientId,
          scanType || "RGB",
          region,
          result.secure_url,
          req.user.id,
        ],
        function (err) {
          if (err) {
            return res.status(500).json({ error: "Database error" });
          }

          res.json({
            message: "Scan uploaded successfully",
            scanId: this.lastID,
          });
        }
      );
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ error: "Upload failed" });
    }
  }
);

// Get all scans (Dentist only)
router.get("/scans", authenticateToken, requireRole("dentist"), (req, res) => {
  db.all("SELECT * FROM scans ORDER BY upload_date DESC", (err, rows) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }
    res.json(rows);
  });
});

// Generate PDF report
router.get(
  "/report/:scanId",
  authenticateToken,
  requireRole("dentist"),
  async (req, res) => {
    const { scanId } = req.params;

    db.get("SELECT * FROM scans WHERE id = ?", [scanId], async (err, scan) => {
      if (err || !scan) {
        return res.status(404).json({ error: "Scan not found" });
      }

      const doc = new PDFDocument();
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="report-${scan.patient_id}.pdf"`
      );

      doc.pipe(res);

      // Add content to PDF
      doc
        .fontSize(20)
        .text("OralVis Healthcare - Scan Report", { align: "center" });
      doc.moveDown();

      doc.fontSize(12);
      doc.text(`Patient Name: ${scan.patient_name}`);
      doc.text(`Patient ID: ${scan.patient_id}`);
      doc.text(`Scan Type: ${scan.scan_type}`);
      doc.text(`Region: ${scan.region}`);
      doc.text(
        `Upload Date: ${new Date(scan.upload_date).toLocaleDateString()}`
      );

      doc.moveDown();
      doc.text("Scan Image:");
      doc.moveDown();

      // Note: For production, you might want to download the image and embed it
      // For demo purposes, we'll just show the URL
      doc.text(`Image URL: ${scan.image_url}`);
      doc.end();
    });
  }
);

module.exports = router;
