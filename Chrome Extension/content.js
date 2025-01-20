// content.js

// Create and inject the overlay button once the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  injectOverlayButton();
});

// Function to inject the overlay button
function injectOverlayButton() {
  // Check if we're on a YouTube video page
  if (!isYouTubeVideo(window.location.href)) return;

  // Avoid injecting multiple buttons
  if (document.getElementById("transcribee-button")) return;

  // Create the button element
  const button = document.createElement("button");
  button.id = "transcribee-button";
  button.className = "ytp-button";
  button.title = "Transcribe with Transcrib.ee";

  // Create SVG element with the paths
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("height", "100%");
  svg.setAttribute("version", "1.0");
  svg.setAttribute("viewBox", "0 0 1024 1024");
  svg.setAttribute("width", "100%");
  svg.setAttribute("preserveAspectRatio", "xMidYMid meet");

  // Create the group for transformation
  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  g.setAttribute(
    "transform",
    "translate(0.000000,1024.000000) scale(0.100000,-0.100000)"
  );

  // Create and add the paths
  const paths = [
    "M3825 8250 c-3 -5 -3 -15 1 -21 9 -16 348 -179 672 -324 l262 -118 0 -109 0 -109 -80 7 -80 7 -88 -94 c-182 -193 -292 -319 -292 -335 0 -17 74 -117 192 -262 37 -46 68 -86 68 -90 0 -4 -103 -110 -228 -235 l-228 -228 -109 40 c-61 21 -276 103 -480 181 -393 150 -667 253 -1200 450 -181 67 -606 225 -943 352 -338 126 -619 227 -625 225 -15 -6 -587 -1178 -587 -1202 0 -3 174 -204 387 -446 214 -243 395 -450 403 -459 14 -16 50 -18 391 -23 210 -3 384 -9 394 -14 15 -9 15 -12 -8 -30 -14 -11 -151 -83 -304 -161 -153 -78 -289 -151 -303 -161 l-24 -19 27 -39 c14 -21 138 -171 275 -333 l248 -295 712 -8 713 -8 32 24 c36 28 406 367 796 730 l264 246 159 -151 c87 -82 158 -153 158 -157 0 -11 -49 -85 -148 -223 -165 -233 -268 -429 -331 -635 -44 -140 -51 -207 -51 -493 0 -295 9 -387 75 -735 25 -132 45 -243 45 -247 0 -7 698 -638 1023 -926 l117 -104 187 169 c104 93 350 315 548 492 198 178 368 331 379 341 30 29 110 458 141 760 22 211 16 469 -14 612 -60 280 -164 487 -413 821 -110 147 -110 148 -92 169 52 58 301 278 315 278 22 0 170 -132 654 -585 207 -193 352 -321 402 -354 37 -25 56 -29 145 -35 57 -4 372 -2 702 3 561 9 600 10 616 28 84 90 550 653 550 664 0 4 -160 88 -356 186 l-356 180 258 6 c141 4 327 7 413 8 l156 0 201 227 c111 125 293 332 404 461 l203 233 -34 77 c-52 119 -273 580 -418 868 l-131 263 -82 -31 c-46 -17 -391 -143 -768 -281 -858 -313 -1406 -518 -1855 -693 -441 -173 -609 -235 -635 -235 -14 0 -100 78 -247 223 l-225 222 74 90 c112 136 178 226 185 253 3 13 0 34 -7 47 -24 45 -318 352 -353 368 -22 11 -60 17 -100 17 l-65 0 -7 63 c-4 34 -5 84 -3 111 l3 49 455 204 c250 113 461 209 468 215 28 23 -6 30 -60 13 -151 -50 -910 -398 -919 -422 -4 -10 -8 -64 -8 -120 l-1 -103 -321 0 -321 0 6 53 c3 28 9 80 12 114 l6 61 -58 30 c-94 47 -919 422 -929 422 -2 0 -7 -4 -10 -10z",
    "M3214 7627 c-36 -31 -32 -40 87 -217 l99 -147 0 -164 c0 -90 5 -181 11 -202 12 -44 26 -53 312 -197 138 -69 210 -100 234 -100 28 0 45 10 94 57 32 31 59 63 59 72 0 11 -78 59 -228 140 -125 69 -244 134 -264 145 l-38 21 0 108 0 108 -51 47 c-29 26 -103 116 -166 200 -63 83 -116 152 -118 152 -2 0 -16 -10 -31 -23z",
    "M6984 7608 c-17 -18 -73 -88 -123 -156 -51 -67 -113 -139 -137 -160 l-45 -38 -7 -114 -7 -115 -260 -142 c-143 -78 -261 -147 -264 -154 -4 -12 135 -149 152 -149 5 0 135 64 288 142 l279 142 0 198 0 198 100 150 c105 159 120 199 81 220 -26 13 -23 15 -57 -22z",
    "M3999 5009 c-73 -53 -482 -425 -736 -671 l-103 -99 0 -326 0 -325 -135 -215 c-74 -119 -135 -223 -135 -232 0 -21 19 -41 40 -41 26 0 71 56 190 235 144 217 166 245 194 245 44 0 46 11 46 265 l0 240 237 270 c317 362 492 573 500 603 7 28 -3 49 -33 69 -18 12 -26 10 -65 -18z",
    "M6180 5014 c-21 -19 -30 -34 -28 -50 3 -25 278 -356 572 -689 l186 -210 0 -170 c1 -239 9 -298 42 -325 29 -22 117 -138 241 -316 100 -143 119 -161 152 -146 14 6 25 18 25 26 0 9 -57 108 -126 222 -151 246 -143 212 -144 619 l-1 270 -266 245 c-308 284 -581 528 -605 541 -12 7 -25 2 -48 -17z",
    "M3547 3423 l-97 -138 0 -453 0 -453 -94 -162 c-51 -89 -105 -186 -120 -214 l-26 -53 20 -20 c11 -11 24 -20 28 -20 20 0 48 37 161 215 133 207 165 245 211 245 l30 0 0 595 c0 327 -4 595 -8 595 -4 0 -51 -62 -105 -137z",
    "M6606 3514 c-3 -26 -6 -294 -6 -595 l0 -549 24 0 c43 0 87 -51 223 -257 73 -112 135 -203 138 -203 2 0 15 4 29 10 48 18 40 38 -126 317 l-78 132 0 463 0 464 -94 128 c-52 70 -96 130 -99 132 -2 3 -7 -16 -11 -42z",
  ];

  paths.forEach((d) => {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", d);
    path.setAttribute("fill", "#fff");
    g.appendChild(path);
  });

  svg.appendChild(g);
  button.appendChild(svg);

  // Add click event listener
  button.addEventListener("click", () => {
    // Visual feedback
    button.style.transform = "scale(0.9)";
    setTimeout(() => {
      button.style.transform = "scale(1)";
    }, 100);

    if (isYouTubeVideo(window.location.href)) {
      // Get current video time
      const video = document.querySelector("video");
      const currentTime = video ? Math.floor(video.currentTime) : 0;

      // Create URL with timestamp
      const cleanUrl = window.location.href.replace(/^https?:\/\//, "");
      const transcribeUrl = `https://transcrib.ee/${cleanUrl}?t=${currentTime}`;

      // Open in new tab
      window.open(transcribeUrl, "_blank");
    }
  });

  // Find the right controls container and insert the button
  function insertButton() {
    const rightControls = document.querySelector(".ytp-right-controls");
    if (rightControls && !document.getElementById("transcribee-button")) {
      // Insert before the settings button
      const settingsButton = rightControls.querySelector(
        ".ytp-settings-button"
      );
      if (settingsButton) {
        rightControls.insertBefore(button, settingsButton);
      }
    }
  }

  // Initial insert
  insertButton();

  // Watch for player updates
  const observer = new MutationObserver(() => {
    insertButton();
  });

  // Start observing
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

// Initialize when DOM is loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", injectOverlayButton);
} else {
  injectOverlayButton();
}

// Watch for navigation (for YouTube's SPA navigation)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    injectOverlayButton();
  }
}).observe(document, { subtree: true, childList: true });

// Function to redirect to Transcrib.ee with the YouTube URL directly appended
function redirectToTranscribEE(youtubeUrl) {
  // Remove the protocol (http:// or https://) from the YouTube URL
  const cleanUrl = youtubeUrl.replace(/^https?:\/\//, "");
  const transcribEEUrl = `https://transcrib.ee/${cleanUrl}`;
  window.open(transcribEEUrl, "_blank");
}

// Function to check if URL is a YouTube video
function isYouTubeVideo(url) {
  const youtubeRegex = /^https?:\/\/(www\.)?youtube\.com\/watch\?v=.+/;
  return youtubeRegex.test(url);
}

// Function to add double 'E' keyboard shortcut listener
function addDoubleEListener() {
  let lastEPressTime = 0;
  const maxInterval = 300; // Maximum interval between E presses in ms

  document.addEventListener("keydown", (event) => {
    // Check if CMD/Ctrl is held and E is pressed
    if (event.key.toLowerCase() === "e" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();

      const currentTime = Date.now();
      const timeDiff = currentTime - lastEPressTime;

      if (timeDiff < maxInterval) {
        // Second E press detected while CMD is still held
        triggerTranscription();
        lastEPressTime = 0; // Reset the timer
      } else {
        // First E press
        lastEPressTime = currentTime;
      }
    } else if (!event.metaKey && !event.ctrlKey) {
      // Reset if CMD/Ctrl is released
      lastEPressTime = 0;
    }
  });

  // Reset the timer if CMD/Ctrl is released
  document.addEventListener("keyup", (event) => {
    if (event.key === "Meta" || event.key === "Control") {
      lastEPressTime = 0;
    }
  });
}

// Function to trigger transcription by opening Transcrib.ee with the current YouTube URL
function triggerTranscription() {
  if (isYouTubeVideo(window.location.href)) {
    redirectToTranscribEE(window.location.href);
  } else {
    // Optionally, display a notification or alert
    alert("Please navigate to a YouTube video page to use this feature.");
  }
}
