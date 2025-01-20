// background.js

// Listener for extension icon click
chrome.action.onClicked.addListener((tab) => {
  if (isYouTubeVideo(tab.url)) {
    redirectToTranscribEE(tab.url, tab.id);
  } else {
    showNotification(
      "Transcrib.ee Extension",
      "Please navigate to a YouTube video page to use this feature."
    );
  }
});

// Listener for keyboard shortcuts (single E press)
chrome.commands.onCommand.addListener((command) => {
  if (command === "trigger-transcription") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (isYouTubeVideo(activeTab.url)) {
        redirectToTranscribEE(activeTab.url, activeTab.id);
      } else {
        showNotification(
          "Transcrib.ee Extension",
          "Please navigate to a YouTube video page to use this feature."
        );
      }
    });
  }
});

// Function to check if URL is a YouTube video
function isYouTubeVideo(url) {
  const youtubeRegex = /^https?:\/\/(www\.)?youtube\.com\/watch\?v=.+/;
  return youtubeRegex.test(url);
}

// Function to redirect to Transcrib.ee with the YouTube URL
function redirectToTranscribEE(youtubeUrl, tabId) {
  // Remove the protocol (http:// or https://) from the YouTube URL
  const cleanUrl = youtubeUrl.replace(/^https?:\/\//, "");
  const transcribEEUrl = `https://transcrib.ee/${cleanUrl}`;

  chrome.tabs.create({ url: transcribEEUrl }, (tab) => {
    if (chrome.runtime.lastError) {
      showNotification(
        "Redirection Failed",
        "Unable to redirect to Transcrib.ee. Please try again."
      );
    }
  });
}

// Function to show notifications
function showNotification(title, message) {
  const notificationOptions = {
    type: "basic",
    title: title,
    message: message,
    iconUrl: chrome.runtime.getURL("icon.png")
  };

  chrome.notifications.create("", notificationOptions, (notificationId) => {
    if (chrome.runtime.lastError) {
      console.error("Notification error:", chrome.runtime.lastError);
    }
  });
}
