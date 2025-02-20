// ✅ Detect Netflix visits & update visit count only once per 3 minutes
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "netflixVisited") {
        chrome.storage.local.get(["visitCount", "lastVisit"], (data) => {
            let visitCount = data.visitCount || 0;
            let lastVisit = data.lastVisit || null;
            let now = new Date();
            let lastVisitTime = lastVisit ? new Date(lastVisit) : null;

            // ✅ Only increase count if 3 minutes have passed
            if (!lastVisitTime || now - lastVisitTime >= 3 * 60 * 1000) {
                visitCount++;
                chrome.storage.local.set({ visitCount: visitCount, lastVisit: now.toISOString() }, () => {
                    console.log(`✅ Updated visit count: ${visitCount}`);
                });
            } else {
                console.log("⏳ Netflix opened, but count NOT updated (within 3-minute cooldown)");
            }
        });
    }
});

// 🔥 Check every 3 minutes if Netflix hasn't been visited & send notification
setInterval(() => {
    chrome.storage.local.get(["lastVisit"], (data) => {
        let lastVisit = data.lastVisit ? new Date(data.lastVisit) : null;
        let now = new Date();

        // ✅ If no Netflix activity for 3 minutes, show a notification
        if (!lastVisit || now - lastVisit >= 3 * 60 * 1000) {
            chrome.notifications.create({
                type: "basic",
                iconUrl: "icon.png",
                title: "Inactive Netflix Subscription",
                message: "You haven't used Netflix in the last 3 minutes! Consider canceling your subscription.",
                priority: 2
            });
            console.log("⚠️ Triggered subscription cancellation suggestion.");
        } else {
            console.log("✅ Netflix was used recently, skipping notification.");
        }
    });
}, 3 * 60 * 1000); // Runs every 3 minutes


chrome.runtime.onInstalled.addListener(() => {
    chrome.notifications.create({
        type: "basic",
        iconUrl: "icon.png",
        title: "Forced Notification",
        message: "This is a test notification on extension reload!",
        priority: 2
    });
});

const GOOGLE_SHEETS_URL = "1cNUmeee9nFi1M4zE6YYsp66XPnyTBLOvCYXdrLkK15g"; // Replace with your actual Web App URL
const GA_MEASUREMENT_ID = "G-NP5XS9QV0K"; // Replace with your actual Google Analytics Measurement ID
const GA_API_SECRET = "S2fzwzNuQxGb1nhN5uND5"; // Replace with your Google Analytics API Secret

// ✅ Send event to Google Analytics
function sendAnalyticsEvent(eventName) {
    fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${GA_MEASUREMENT_ID}&api_secret=${GA_API_SECRET}`, {
        method: "POST",
        body: JSON.stringify({
            client_id: crypto.randomUUID(),
            events: [{ name: eventName, params: { page_location: "https://www.netflix.com" } }]
        })
    }).then(response => console.log(`📊 Event sent to GA: ${eventName}`))
    .catch(error => console.error("❌ Failed to send data to GA:", error));
}

// ✅ Send notification data to Google Sheets
function sendNotificationDataToGoogleSheets(notificationCount) {
    fetch(GOOGLE_SHEETS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationCount: notificationCount, timestamp: new Date().toISOString() })
    }).then(response => console.log("✅ Notification data sent to Google Sheets"))
    .catch(error => console.error("❌ Failed to send data:", error));
}

// 🔥 Check every 3 minutes if Netflix hasn't been visited & send notification
setInterval(() => {
    chrome.storage.local.get(["lastVisit", "notificationCount"], (data) => {
        let lastVisit = data.lastVisit ? new Date(data.lastVisit) : null;
        let now = new Date();
        let notificationCount = data.notificationCount || 0;

        // ✅ If no Netflix activity for 3 minutes, show a notification & log it
        if (!lastVisit || now - lastVisit >= 3 * 60 * 1000) {
            notificationCount++;
            chrome.storage.local.set({ notificationCount: notificationCount }, () => {
                sendNotificationDataToGoogleSheets(notificationCount);
                sendAnalyticsEvent("netflix_inactivity_alert");
            });

            chrome.notifications.create({
                type: "basic",
                iconUrl: "icon.png",
                title: "Inactive Netflix Subscription",
                message: "You haven't used Netflix in the last 3 minutes! Consider canceling your subscription.",
                priority: 2
            });

            console.log(`⚠️ Triggered subscription cancellation suggestion. Notification Count: ${notificationCount}`);
        } else {
            console.log("✅ Netflix was used recently, skipping notification.");
        }
    });
}, 3 * 60 * 1000); // Runs every 3 minutes
