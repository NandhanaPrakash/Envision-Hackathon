document.addEventListener("DOMContentLoaded", function () {
    let usageText = document.getElementById("usage");
    let resetButton = document.getElementById("reset");

    // Fetch stored usage data
    chrome.storage.local.get(["visitCount"], (data) => {
        let visitCount = data.visitCount || 0;
        usageText.textContent = `Netflix Logins This Month: ${visitCount}`;
    });

    // Reset button clears data properly
    resetButton.addEventListener("click", () => {
        chrome.storage.local.set({ visitCount: 0, lastVisit: null }, () => {
            console.log("Visit count reset!");
            usageText.textContent = "Netflix Logins This Month: 0";
        });
    });
});
