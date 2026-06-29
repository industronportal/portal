const path = require("path");
const fs = require("fs");
const nodemailer = require("nodemailer");
const { formatList, createRequirementPdfBuffer } = require("../../pdfBuilder");

const EMAIL_TO = process.env.EMAIL_TO || process.env.EMAIL_USER;

// Serverless has no shared counter file, so build a unique, time-based
// reference number. Format: ITS-<year>-<MMDD><4 random chars>.
function generateReferenceNumber() {
    const now = new Date();
    const year = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `ITS-${year}-${mm}${dd}${rand}`;
}

function findLogo() {
    const candidates = [
        path.join(process.cwd(), "public", "images", "logo.png"),
        path.join(__dirname, "..", "..", "public", "images", "logo.png")
    ];
    for (const candidate of candidates) {
        if (fs.existsSync(candidate)) {
            return candidate;
        }
    }
    return null;
}

exports.handler = async (event) => {

    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: JSON.stringify({ success: false, message: "Method not allowed." })
        };
    }

    let data = {};
    try {
        data = event.body ? JSON.parse(event.body) : {};
    } catch (e) {
        data = {};
    }

    const referenceNumber = generateReferenceNumber();

    try {

        const pdfBuffer = await createRequirementPdfBuffer(
            data,
            referenceNumber,
            findLogo()
        );

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: EMAIL_TO,
            subject: `New Customer Requirement - ${referenceNumber}`,
            text:
`A new customer has submitted a requirement.

Organisation: ${data.organisation || "-"}
Contact Person: ${data.contactPerson || "-"}
Email: ${data.email || "-"}
Phone: ${data.phone || "-"}
Selected Test: ${data.selectedTest || "-"}
Additional Nano Modules: ${formatList(data.nanoModules)}

The detailed requirement is attached as a PDF.`,
            attachments: [
                {
                    filename: `${referenceNumber}.pdf`,
                    content: pdfBuffer
                }
            ]
        });

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                success: true,
                message: "Requirement submitted successfully.",
                referenceNumber: referenceNumber
            })
        };

    } catch (error) {

        console.error(error);

        return {
            statusCode: 500,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                success: false,
                message: "Submission failed. Please try again later."
            })
        };
    }
};
