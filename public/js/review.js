// ==========================
// Customer Information
// ==========================

const customerReview = document.getElementById("customerReview");

if (customerReview) {

    customerReview.innerHTML = `

        <p><strong>Organisation:</strong> ${localStorage.getItem("organisation") || ""}</p>

        <p><strong>Contact Person:</strong> ${localStorage.getItem("contactPerson") || ""}</p>

        <p><strong>Department:</strong> ${localStorage.getItem("department") || ""}</p>

        <p><strong>Designation:</strong> ${localStorage.getItem("designation") || ""}</p>

        <p><strong>Email:</strong> ${localStorage.getItem("email") || ""}</p>

        <p><strong>Phone:</strong> ${localStorage.getItem("phone") || ""}</p>

    `;

}

// ==========================
// Selected Test
// ==========================

const testReview = document.getElementById("testReview");

if (testReview) {

    const nanoModules = JSON.parse(
        localStorage.getItem("nanoModules") || "[]"
    );

    testReview.innerHTML = `

        <p><strong>Selected Test:</strong> ${localStorage.getItem("selectedTest") || ""}</p>

        <p><strong>Additional Nano Modules:</strong> ${nanoModules.join(", ") || "None"}</p>

    `;

}

// ==========================
// Material Information
// ==========================

const materialReview = document.getElementById("materialReview");

if (materialReview) {

    materialReview.innerHTML = `

        <p><strong>Material Category:</strong> ${localStorage.getItem("materialCategory") || ""}</p>

        <p><strong>Material Form:</strong> ${localStorage.getItem("materialForm") || ""}</p>

        <p><strong>Material Description:</strong> ${localStorage.getItem("materialDescription") || ""}</p>

    `;

}
// Get selected properties
const properties = JSON.parse(
    localStorage.getItem("properties") || "[]"
);
// ==========================
// Test Configuration
// ==========================

const configurationReview = document.getElementById("configurationReview");

if (configurationReview) {

    // Get saved properties
    const properties = JSON.parse(
        localStorage.getItem("properties") || "[]"
    );

    configurationReview.innerHTML = `

        <p><strong>Specimen Type:</strong> ${localStorage.getItem("specimenType") || ""}</p>

        <p><strong>Sample Cross Section:</strong> ${localStorage.getItem("crossSection") || ""}</p>

        <p><strong>Custom Width:</strong> ${localStorage.getItem("customWidth") || ""} mm</p>

        <p><strong>Custom Thickness:</strong> ${localStorage.getItem("customThickness") || ""} mm</p>

        <p><strong>Preferred Force Range:</strong> ${localStorage.getItem("forceRange") || ""}</p>

        <p><strong>Maximum Elongation:</strong> ${localStorage.getItem("elongation") || ""}</p>

        <p><strong>Properties Measured:</strong> ${properties.join(", ")}</p>

        <p><strong>Other Property:</strong> ${localStorage.getItem("otherPropertyText") || ""}</p>

        <p><strong>Strain Measurement Method:</strong> ${localStorage.getItem("strainMethod") || ""}</p>

    `;

}
// ==========================
// Submit Request
// ==========================

const submitButton = document.getElementById("submitButton");

if (submitButton) {

    submitButton.addEventListener("click", async function () {

        submitButton.disabled = true;
        submitButton.textContent = "Submitting...";

        // Collect all data from localStorage
        const data = {
            organisation: localStorage.getItem("organisation"),
            contactPerson: localStorage.getItem("contactPerson"),
            department: localStorage.getItem("department"),
            designation: localStorage.getItem("designation"),
            email: localStorage.getItem("email"),
            phone: localStorage.getItem("phone"),

            selectedTest: localStorage.getItem("selectedTest"),
            nanoModules: localStorage.getItem("nanoModules"),

            materialCategory: localStorage.getItem("materialCategory"),
            materialForm: localStorage.getItem("materialForm"),
            materialDescription: localStorage.getItem("materialDescription"),

            specimenType: localStorage.getItem("specimenType"),
            crossSection: localStorage.getItem("crossSection"),
            customWidth: localStorage.getItem("customWidth"),
            customThickness: localStorage.getItem("customThickness"),

            forceRange: localStorage.getItem("forceRange"),
            elongation: localStorage.getItem("elongation"),

            properties: localStorage.getItem("properties"),
            otherPropertyText: localStorage.getItem("otherPropertyText"),
            strainMethod: localStorage.getItem("strainMethod")
        };

        try {

            const response = await fetch("/submit", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(data)

            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Submission failed.");
            }

            const reference = result.referenceNumber || "";

            localStorage.clear();

            window.location.href =
                "success.html?ref=" + encodeURIComponent(reference);

        } catch (error) {

            console.error(error);

            submitButton.disabled = false;
            submitButton.textContent = "Submit Request";

            alert(
                "Unable to submit your requirement. " +
                "Please check your connection and try again."
            );

        }

    });

}