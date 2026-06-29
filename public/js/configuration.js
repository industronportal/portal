// ==========================
// Get Selected Test
// ==========================

const selectedTest = localStorage.getItem("selectedTest");

// ==========================
// Per-Test Configuration Data
// ==========================

const TEST_CONFIG = {
    "Tensile": {
        deformationLabel: "Maximum Elongation Required *",
        properties: [
            { value: "UTS", label: "Ultimate Tensile Strength (UTS)" },
            { value: "Yield Strength", label: "Yield Strength" },
            { value: "Young's Modulus", label: "Young's Modulus / Stiffness" },
            { value: "Elongation", label: "Elongation at Break (%)" },
            { value: "Toughness", label: "Toughness / Area under Curve" },
            { value: "Fracture Load", label: "Fracture Load & Displacement" }
        ]
    },
    "Compression": {
        deformationLabel: "Maximum Compression Displacement *",
        properties: [
            { value: "Compressive Strength", label: "Compressive Strength" },
            { value: "Compressive Yield Strength", label: "Compressive Yield Strength" },
            { value: "Compressive Modulus", label: "Compressive Modulus" },
            { value: "Strain at Failure", label: "Strain at Failure (%)" },
            { value: "Energy Absorption", label: "Energy Absorption" }
        ]
    },
    "Bending": {
        deformationLabel: "Maximum Deflection Required *",
        properties: [
            { value: "Flexural Strength", label: "Flexural Strength" },
            { value: "Flexural Modulus", label: "Flexural Modulus" },
            { value: "Maximum Deflection", label: "Maximum Deflection" },
            { value: "Yield Load", label: "Yield Load" },
            { value: "Break Load", label: "Break Load" }
        ]
    },
    "Fracture": {
        deformationLabel: "Maximum Displacement Required *",
        properties: [
            { value: "Fracture Toughness", label: "Fracture Toughness (K_IC)" },
            { value: "Crack Growth Rate", label: "Crack Growth Rate (da/dN)" },
            { value: "Fatigue Life", label: "Fatigue Life (Cycles to Failure)" },
            { value: "Stress Intensity", label: "Stress Intensity Factor" },
            { value: "Critical Load", label: "Critical Load" }
        ]
    },
    "Creep": {
        deformationLabel: "Maximum Strain / Displacement *",
        properties: [
            { value: "Creep Strain", label: "Creep Strain" },
            { value: "Creep Rate", label: "Steady-State Creep Rate" },
            { value: "Time to Rupture", label: "Time to Rupture" },
            { value: "Stress Relaxation", label: "Stress Relaxation" },
            { value: "Activation Energy", label: "Activation Energy" }
        ]
    }
};

const isMechanicalTest = Object.prototype.hasOwnProperty.call(
    TEST_CONFIG,
    selectedTest
);

// ==========================
// Show / Hide Sections
// ==========================

const mechSection = document.getElementById("mechSection");
const comingSoonSection = document.getElementById("comingSoonSection");

if (mechSection) {
    mechSection.style.display = isMechanicalTest ? "block" : "none";
}

if (comingSoonSection) {
    comingSoonSection.style.display = isMechanicalTest ? "none" : "block";
}

// ==========================
// Populate Test-Specific Fields
// ==========================

if (isMechanicalTest) {

    const config = TEST_CONFIG[selectedTest];

    const configTitle = document.getElementById("configTitle");
    if (configTitle) {
        configTitle.textContent = selectedTest + " Test Configuration";
    }

    const deformationLabel = document.getElementById("deformationLabel");
    if (deformationLabel) {
        deformationLabel.textContent = config.deformationLabel;
    }

    const propertiesGroup = document.getElementById("propertiesGroup");
    if (propertiesGroup) {

        let html = "";

        config.properties.forEach(function (property) {
            html += `
                <label>
                    <input type="checkbox" name="properties" value="${property.value}">
                    ${property.label}
                </label>`;
        });

        // Always offer an "Other" option
        html += `
            <label>
                <input type="checkbox" id="otherProperty" name="properties" value="Other">
                Other
            </label>`;

        propertiesGroup.innerHTML = html;
    }
}

// ==========================
// Custom Cross Section
// ==========================

const customCross = document.getElementById("customCrossSection");
const customDimensions = document.getElementById("customDimensions");

if (customCross && customDimensions) {

    document.querySelectorAll('input[name="crossSection"]').forEach(radio => {

        radio.addEventListener("change", function () {

            customDimensions.style.display =
                customCross.checked ? "block" : "none";

        });

    });

}

// ==========================
// Other Property (bound after dynamic render)
// ==========================

const otherProperty = document.getElementById("otherProperty");
const otherPropertyBox = document.getElementById("otherPropertyBox");

if (otherProperty && otherPropertyBox) {

    otherProperty.addEventListener("change", function () {

        otherPropertyBox.style.display =
            otherProperty.checked ? "block" : "none";

    });

}

// ==========================
// Save Configuration
// ==========================

const nextButton = document.getElementById("nextButton");

if (nextButton) {

    nextButton.addEventListener("click", function () {

        // ----- Material validation (all tests) -----
        const materialCategory = document.getElementById("materialCategory").value;
        const materialForm = document.getElementById("materialForm").value;

        if (!materialCategory) {
            alert("Please select a Material Category.");
            return;
        }

        if (!materialForm) {
            alert("Please select a Material Form.");
            return;
        }

        localStorage.setItem("materialCategory", materialCategory);
        localStorage.setItem("materialForm", materialForm);

        localStorage.setItem(
            "materialDescription",
            document.getElementById("materialDescription").value.trim()
        );

        // ----- Mechanical test validation & save -----
        if (isMechanicalTest) {

            const specimenType = document.querySelector(
                'input[name="specimenType"]:checked'
            );

            if (!specimenType) {
                alert("Please select a Specimen Type.");
                return;
            }

            const crossSection = document.querySelector(
                'input[name="crossSection"]:checked'
            );

            if (!crossSection) {
                alert("Please select a Sample Cross-Section.");
                return;
            }

            const customWidth = document.getElementById("customWidth").value;
            const customThickness = document.getElementById("customThickness").value;

            if (crossSection.value === "Custom" && (!customWidth || !customThickness)) {
                alert("Please enter both custom Width and Thickness.");
                return;
            }

            const forceRange = document.querySelector(
                'input[name="forceRange"]:checked'
            );

            if (!forceRange) {
                alert("Please select a Preferred Force Range.");
                return;
            }

            const elongation = document.querySelector(
                'input[name="elongation"]:checked'
            );

            if (!elongation) {
                alert("Please select the maximum deformation range.");
                return;
            }

            const properties = [];
            document
                .querySelectorAll('input[name="properties"]:checked')
                .forEach(function (property) {
                    properties.push(property.value);
                });

            if (properties.length === 0) {
                alert("Please select at least one property to be measured.");
                return;
            }

            localStorage.setItem("specimenType", specimenType.value);
            localStorage.setItem("crossSection", crossSection.value);
            localStorage.setItem("customWidth", customWidth);
            localStorage.setItem("customThickness", customThickness);
            localStorage.setItem("forceRange", forceRange.value);
            localStorage.setItem("elongation", elongation.value);
            localStorage.setItem("properties", JSON.stringify(properties));

            const otherPropertyTextEl = document.getElementById("otherPropertyText");
            localStorage.setItem(
                "otherPropertyText",
                otherPropertyTextEl ? otherPropertyTextEl.value.trim() : ""
            );

        } else {

            // Non-mechanical (nano) tests: clear stale mechanical config
            [
                "specimenType", "crossSection", "customWidth", "customThickness",
                "forceRange", "elongation", "properties", "otherPropertyText"
            ].forEach(function (key) {
                localStorage.removeItem(key);
            });

        }

        // Move to Review page
        window.location.href = "review.html";

    });

}
