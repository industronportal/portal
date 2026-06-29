// Display the reference number passed from the review page
const params = new URLSearchParams(window.location.search);
const reference = params.get("ref");

const referenceLine = document.getElementById("referenceLine");

if (referenceLine && reference) {
    referenceLine.innerHTML =
        '<span class="reference-pill">Reference Number: ' + reference + "</span>";
}
