require("dotenv").config();

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");
const { formatList, createRequirementPdf } = require("./pdfBuilder");

const PORT = process.env.PORT || 3000;
const EMAIL_TO = process.env.EMAIL_TO || process.env.EMAIL_USER;

function generateReferenceNumber() {

    const counterFile = "./counter.json";

    let counter = { lastNumber: 0 };

    if (fs.existsSync(counterFile)) {
        counter = JSON.parse(fs.readFileSync(counterFile));
    }

    counter.lastNumber++;

    fs.writeFileSync(counterFile, JSON.stringify(counter, null, 4));

    const year = new Date().getFullYear();

    return `ITS-${year}-${String(counter.lastNumber).padStart(6, "0")}`;
}
const app = express();

app.use(cors());
app.use(express.json());

// Serve the front-end (public folder only, never the project root)
app.use(express.static(path.join(__dirname, "public")));
// ==========================
// Gmail Configuration
// ==========================

const transporter = nodemailer.createTransport({
    service: "gmail",

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

transporter.verify(function (error, success) {

    if (error) {
        console.log("SMTP Verify Failed");
        console.log(error);
    } else {
        console.log("SMTP Ready");
    }

});

// Receive Customer Submission
app.post("/submit", (req, res) => {

    console.log("=================================");
    console.log("NEW CUSTOMER SUBMISSION");
    console.log("=================================");

    console.log(req.body);
    const referenceNumber = generateReferenceNumber();

console.log("Reference:", referenceNumber);

    // ==========================
// Create Professional PDF
// ==========================
if (!fs.existsSync("generated")) {
    fs.mkdirSync("generated");
}
const pdfFile = `generated/${referenceNumber}.pdf`;
const logoPath = path.join(__dirname, "public", "images", "logo.png");

const { stream: pdfStream } = createRequirementPdf(
    req.body,
    referenceNumber,
    pdfFile,
    logoPath
);
console.log("PDF generation finished.");

// Wait until the PDF is completely written
console.log("Attempting to send email...");
pdfStream.on("finish", async () => {
console.log("Attempting to send email...");
    try {

    console.log("Connecting to Gmail...");

    await transporter.sendMail({

            from: process.env.EMAIL_USER,
            to: EMAIL_TO,

           subject: `New Customer Requirement - ${referenceNumber}`,
            text:
`A new customer has submitted a requirement.

Organisation: ${req.body.organisation}
Contact Person: ${req.body.contactPerson}
Email: ${req.body.email}
Phone: ${req.body.phone}
Selected Test: ${req.body.selectedTest}
Additional Nano Modules: ${formatList(req.body.nanoModules)}

The detailed requirement is attached as a PDF.`,
attachments: [
{
    filename: `${referenceNumber}.pdf`,
    path: pdfFile
}
]

        });

        console.log("✅ Email sent successfully.");
        console.log("Mail sent.");

        res.json({
            success: true,
            message: "Requirement submitted successfully.",
            referenceNumber: referenceNumber
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Email sending failed."
        });

    }

});
});
app.listen(PORT, () => {

    console.log(`Server running on http://localhost:${PORT}`);

});