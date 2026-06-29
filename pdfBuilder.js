const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

// Layout constants
const PAGE_LEFT = 50;
const PAGE_RIGHT = 545;
const CONTENT_WIDTH = PAGE_RIGHT - PAGE_LEFT; // 495
const ROW_PAD = 10;
const LABEL_WIDTH = 165;

// Brand colours
const BRAND = "#0B4F8A";
const LIGHT_LINE = "#E2E2E2";
const STRIPE = "#F4F8FC";

// Turn a value that may be a JSON array string into a readable string
function formatList(value) {

    if (!value) {
        return "-";
    }

    if (Array.isArray(value)) {
        return value.length ? value.join(", ") : "-";
    }

    try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
            return parsed.length ? parsed.join(", ") : "-";
        }
    } catch (e) {
        // Not JSON, fall through and return the raw value
    }

    return value;
}

// Start a new page if there isn't room for the next block
function ensureSpace(doc, needed) {
    const bottom = doc.page.height - doc.page.margins.bottom;
    if (doc.y + needed > bottom) {
        doc.addPage();
    }
}

function drawSection(doc, title) {

    doc.moveDown(0.35);
    ensureSpace(doc, 60);

    const y = doc.y;
    const barHeight = 22;

    doc
        .fillColor(BRAND)
        .rect(PAGE_LEFT, y, CONTENT_WIDTH, barHeight)
        .fill();

    doc
        .fillColor("white")
        .font("Helvetica-Bold")
        .fontSize(11.5)
        .text(title, PAGE_LEFT + ROW_PAD, y + 6);

    doc.x = PAGE_LEFT;
    doc.y = y + barHeight;
}

function makeRowAdder(doc) {

    let rowIndex = 0;

    return function addRow(label, value) {

        if (value === undefined || value === null || String(value).trim() === "") {
            value = "-";
        } else {
            value = String(value);
        }

        const valueX = PAGE_LEFT + ROW_PAD + LABEL_WIDTH;
        const valueWidth = PAGE_RIGHT - valueX - ROW_PAD;

        doc.font("Helvetica").fontSize(10);
        const labelHeight = doc.heightOfString(label, { width: LABEL_WIDTH });
        const valueHeight = doc.heightOfString(value, { width: valueWidth });
        const rowHeight = Math.max(labelHeight, valueHeight) + 9;

        ensureSpace(doc, rowHeight);

        const y = doc.y;

        // Zebra striping for readability
        if (rowIndex % 2 === 1) {
            doc.fillColor(STRIPE).rect(PAGE_LEFT, y, CONTENT_WIDTH, rowHeight).fill();
        }

        doc
            .fillColor(BRAND)
            .font("Helvetica-Bold")
            .fontSize(10)
            .text(label, PAGE_LEFT + ROW_PAD, y + 5, { width: LABEL_WIDTH });

        doc
            .fillColor("#222222")
            .font("Helvetica")
            .fontSize(10)
            .text(value, valueX, y + 5, { width: valueWidth });

        doc
            .strokeColor(LIGHT_LINE)
            .lineWidth(0.5)
            .moveTo(PAGE_LEFT, y + rowHeight)
            .lineTo(PAGE_RIGHT, y + rowHeight)
            .stroke();

        doc.x = PAGE_LEFT;
        doc.y = y + rowHeight;
        rowIndex++;
    };
}

// Draw all the content of the requirement PDF onto an existing document.
// Does NOT create the document or call doc.end().
function buildPdfContent(doc, data, referenceNumber, logoPath) {

    // ===== Header =====
    const hasLogo = logoPath && fs.existsSync(logoPath);
    if (hasLogo) {
        doc.image(logoPath, PAGE_LEFT, 40, { width: 95 });
    }

    const textX = hasLogo ? 160 : PAGE_LEFT;

    doc
        .font("Helvetica-Bold")
        .fontSize(17)
        .fillColor(BRAND)
        .text("INDUSTRON TECHNICAL SERVICES PVT. LTD.", textX, 44, {
            width: PAGE_RIGHT - textX
        });

    doc
        .font("Helvetica")
        .fontSize(7.5)
        .fillColor("#555555")
        .text(
            "Nano & Meso Scale Mechanical Characterization | Instrumentation | " +
            "Material Characterization Services | Consultancy",
            textX,
            doc.y + 2,
            { width: PAGE_RIGHT - textX }
        );

    const headerBottom = Math.max(doc.y + 8, 120);
    doc
        .strokeColor(BRAND)
        .lineWidth(2)
        .moveTo(PAGE_LEFT, headerBottom)
        .lineTo(PAGE_RIGHT, headerBottom)
        .stroke();

    // ===== Title block =====
    doc.y = headerBottom + 16;

    doc
        .font("Helvetica-Bold")
        .fontSize(16)
        .fillColor(BRAND)
        .text("Customer Requirement Collection Form", PAGE_LEFT, doc.y, {
            width: CONTENT_WIDTH,
            align: "center"
        });

    doc.moveDown(0.8);

    const bandY = doc.y;
    const bandHeight = 26;

    doc.fillColor(STRIPE).rect(PAGE_LEFT, bandY, CONTENT_WIDTH, bandHeight).fill();
    doc.strokeColor(LIGHT_LINE).lineWidth(0.5)
        .rect(PAGE_LEFT, bandY, CONTENT_WIDTH, bandHeight).stroke();

    doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .fillColor("#B00000")
        .text(`Reference No: ${referenceNumber}`, PAGE_LEFT + ROW_PAD, bandY + 8, {
            width: CONTENT_WIDTH / 2 - ROW_PAD
        });

    doc
        .font("Helvetica")
        .fontSize(9)
        .fillColor("#555555")
        .text(
            "Generated: " + new Date().toLocaleString(),
            PAGE_LEFT + CONTENT_WIDTH / 2,
            bandY + 9,
            { width: CONTENT_WIDTH / 2 - ROW_PAD, align: "right" }
        );

    doc.x = PAGE_LEFT;
    doc.y = bandY + bandHeight + 4;

    // ===== Customer Information =====
    drawSection(doc, "CUSTOMER INFORMATION");
    let addRow = makeRowAdder(doc);
    addRow("Organisation", data.organisation);
    addRow("Contact Person", data.contactPerson);
    addRow("Department", data.department);
    addRow("Designation", data.designation);
    addRow("Email", data.email);
    addRow("Phone", data.phone);

    // ===== Selected Test =====
    drawSection(doc, "TEST DETAILS");
    addRow = makeRowAdder(doc);
    addRow("Test Requested", data.selectedTest);
    addRow("Additional Nano Modules", formatList(data.nanoModules));

    // ===== Material Information =====
    drawSection(doc, "MATERIAL INFORMATION");
    addRow = makeRowAdder(doc);
    addRow("Material Category", data.materialCategory);
    addRow("Material Form", data.materialForm);
    addRow("Description", data.materialDescription);

    // ===== Test Configuration (mechanical tests only) =====
    const isMechanical = data.specimenType || data.forceRange;

    drawSection(doc, "TEST CONFIGURATION");
    addRow = makeRowAdder(doc);

    if (isMechanical) {

        addRow("Specimen Type", data.specimenType);
        addRow("Cross Section", data.crossSection);

        if (data.crossSection === "Custom") {
            addRow("Custom Width",
                data.customWidth ? data.customWidth + " mm" : "-");
            addRow("Custom Thickness",
                data.customThickness ? data.customThickness + " mm" : "-");
        }

        addRow("Force Range", data.forceRange);
        addRow("Deformation Range", data.elongation);
        addRow("Properties to Measure", formatList(data.properties));

        if (data.otherPropertyText) {
            addRow("Other Property", data.otherPropertyText);
        }

        addRow("Strain Method", data.strainMethod);

    } else {

        addRow(
            "Note",
            "Detailed configuration for the selected test will be discussed " +
            "directly with the Industron technical team."
        );
    }

    // ===== Footer =====
    ensureSpace(doc, 70);
    doc.moveDown(1.5);

    doc
        .strokeColor(LIGHT_LINE)
        .lineWidth(1)
        .moveTo(PAGE_LEFT, doc.y)
        .lineTo(PAGE_RIGHT, doc.y)
        .stroke();

    doc.moveDown(0.6);

    doc
        .fillColor("#888888")
        .font("Helvetica")
        .fontSize(8.5)
        .text(
            "Generated automatically by the Industron Customer Requirement Collection Portal",
            PAGE_LEFT, doc.y, { width: CONTENT_WIDTH, align: "center" }
        );

    doc
        .fillColor(BRAND)
        .font("Helvetica-Bold")
        .fontSize(9)
        .text("Industron Technical Services Pvt. Ltd.", {
            width: CONTENT_WIDTH, align: "center"
        });

    doc
        .fillColor("#888888")
        .font("Helvetica")
        .fontSize(8.5)
        .text("www.industronnano.com", {
            width: CONTENT_WIDTH, align: "center"
        });
}

// Write the requirement PDF to a file (used by the local Express server).
// Returns the PDFDocument and the write stream.
function createRequirementPdf(data, referenceNumber, filePath, logoPath) {

    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    buildPdfContent(doc, data, referenceNumber, logoPath);

    doc.end();

    return { doc, stream };
}

// Generate the requirement PDF entirely in memory (used by the Vercel
// serverless function, which has no persistent filesystem).
// Returns a Promise that resolves to a Buffer.
function createRequirementPdfBuffer(data, referenceNumber, logoPath) {

    return new Promise((resolve, reject) => {

        const doc = new PDFDocument({ margin: 50 });
        const chunks = [];

        doc.on("data", (chunk) => chunks.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(chunks)));
        doc.on("error", reject);

        buildPdfContent(doc, data, referenceNumber, logoPath);

        doc.end();
    });
}

module.exports = {
    formatList,
    createRequirementPdf,
    createRequirementPdfBuffer
};
