// Notify background script when Netflix is visited
chrome.runtime.sendMessage({ action: "netflixVisited" });
chrome.runtime.sendMessage({ action: "netflix_opened" });
