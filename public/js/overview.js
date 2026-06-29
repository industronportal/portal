// ===========================
// Nano Platform Options
// ===========================

const nanoCheckbox = document.getElementById("nanoIndentation");
const nanoOptions = document.querySelector(".nano-options");

if (nanoCheckbox && nanoOptions) {

    nanoCheckbox.addEventListener("change", function () {

        nanoOptions.style.display = nanoCheckbox.checked ? "block" : "none";

    });

}

// ===========================
// Save Customer Information
// ===========================

const nextButton = document.getElementById("nextButton");

if (nextButton) {

    nextButton.addEventListener("click", function (event) {

        // Stop the link from navigating immediately
        event.preventDefault();

        // ===========================
        // Validate Required Fields
        // ===========================

        const organisation = document.getElementById("organisation").value.trim();
        const contactPerson = document.getElementById("contactPerson").value.trim();
        const email = document.getElementById("email").value.trim();
        const phone = document.getElementById("phone").value.trim();

        if (!organisation) {
            alert("Please enter your Organisation / Institution.");
            return;
        }

        if (!contactPerson) {
            alert("Please enter the Contact Person.");
            return;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email || !emailPattern.test(email)) {
            alert("Please enter a valid Email Address.");
            return;
        }

        if (!phone) {
            alert("Please enter a Phone / Mobile number.");
            return;
        }

        const selectedMechanical =
            document.querySelector('input[name="mechanicalTest"]:checked');

        const nanoTests = document.querySelectorAll(".nanoTest");

        let nanoSelected = false;
        let selectedNanoTest = "";

        nanoTests.forEach(test => {

            if (test.checked) {

                nanoSelected = true;
                selectedNanoTest = test.value;

            }

        });

        // Nothing selected
        if (!selectedMechanical && !nanoSelected) {

            alert("Please select at least one test.");

            return;

        }

        // Mechanical Test selected
        if (selectedMechanical) {

            localStorage.setItem(
                "selectedTest",
                selectedMechanical.value
            );

        }

        // Nano Platform selected
        else {

            localStorage.setItem(
                "selectedTest",
                selectedNanoTest
            );

        }

        // Collect selected Nano Additional Modules
        const nanoModules = [];

        document
            .querySelectorAll(".nanoModule:checked")
            .forEach(function (module) {
                nanoModules.push(module.value);
            });

        localStorage.setItem(
            "nanoModules",
            JSON.stringify(nanoModules)
        );

        localStorage.setItem("organisation", organisation);
        localStorage.setItem("contactPerson", contactPerson);

        localStorage.setItem("department",
            document.getElementById("department").value.trim());

        localStorage.setItem("designation",
            document.getElementById("designation").value.trim());

        localStorage.setItem("email", email);
        localStorage.setItem("phone", phone);

        // Go to next page
        window.location.href = "test-configuration.html";

    });

}