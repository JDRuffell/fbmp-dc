console.log("[FB Helper] Content script loaded");

let lastUrl = location.href;

// Initial setup on page load
function setup() {
  console.log("[FB Helper] Running setup...");
  onPageChange();
}

setup();

// Observe URL changes
const urlObserver = new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    console.log("[FB Helper] URL changed to", lastUrl);
    onPageChange();
  }
});

urlObserver.observe(document, { subtree: true, childList: true });

// Main logic to add/remove button based on URL
function onPageChange() {
  const isListingPage = location.href.includes("/marketplace/item/");
  const existingButton = document.querySelector(".fb-copy-button");

  console.log(`[FB Helper] onPageChange triggered. isListingPage: ${isListingPage}, buttonExists: ${!!existingButton}`);

  if (isListingPage && !existingButton) {
    console.log("[FB Helper] Creating copy button...");
    createButton(location.href);
  } else if (!isListingPage && existingButton) {
    console.log("[FB Helper] Removing existing copy button...");
    existingButton.remove();
  } else {
    console.log("[FB Helper] No action needed onPageChange.");
  }
}

// Create the floating copy button with clipboard functionality
function createButton(url) {
  console.log("[FB Helper] Inside createButton function.");

  const button = document.createElement("button");
  button.innerText = "📋 Copy Marketplace Info";
  button.className = "fb-copy-button";

  Object.assign(button.style, {
    position: "fixed",
    top: "80px",
    right: "20px",
    zIndex: 9999,
    padding: "10px",
    fontSize: "14px",
    backgroundColor: "#1877F2",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  });

  button.onclick = () => {
    console.log("[FB Helper] Copy button clicked.");
    button.innerText = "⏳ Loading...";
    const media = getLargestVisibleMedia();

    if (!media) {
      console.warn("[FB Helper] No visible media found to copy.");
      button.innerText = "❌ No media found";
      setTimeout(() => (button.innerText = "📋 Copy Marketplace Info"), 2000);
      return;
    }

    let text = `📦 Facebook Listing\nLink: ${url}\n`;

    if (media.type === "video") {
      text += `Video: ${media.src}`;
    } else {
      text += `Image: ${media.src}`;
    }

    navigator.clipboard.writeText(text).then(() => {
      console.log("[FB Helper] Text copied to clipboard:", text);
      button.innerText = "✅ Copied!";
      setTimeout(() => (button.innerText = "📋 Copy Marketplace Info"), 2000);
    });
  };


  document.body.appendChild(button);
  console.log("[FB Helper] Copy button added to the page.");
}

function getLargestVisibleMedia() {
  console.log("[FB Helper] Searching for largest visible media (video or image)...");

  const candidates = [...document.querySelectorAll('video[src], img[src*="scontent"]')];
  let bestMedia = null;
  let maxVisibleArea = 0;

  candidates.forEach(media => {
    const rect = media.getBoundingClientRect();

    // Calculate visible width and height within viewport
    const visibleWidth = Math.max(0, Math.min(rect.right, window.innerWidth) - Math.max(rect.left, 0));
    const visibleHeight = Math.max(0, Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0));
    const visibleArea = visibleWidth * visibleHeight;

    console.log(`[FB Helper] Media ${media.tagName} src: ${media.src}, visible area: ${visibleArea}`);

    if (visibleArea > maxVisibleArea) {
      maxVisibleArea = visibleArea;
      bestMedia = media;
    }
  });

  if (bestMedia) {
    console.log(`[FB Helper] Selected media: ${bestMedia.tagName} src: ${bestMedia.src} with area: ${maxVisibleArea}`);
    return { type: bestMedia.tagName.toLowerCase(), src: bestMedia.src };
  } else {
    console.warn("[FB Helper] No visible media found.");
    return null;
  }
}


