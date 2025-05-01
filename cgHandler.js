// CG Animation Handler
// Handles CG animation events that include video playback

const cgContainer = document.getElementById("cg-view");
const cgVideo = document.createElement("video");
const skipButton = document.createElement("button");
const continueOverlay = document.createElement("div");

// Set up elements
cgVideo.className = "cg-video";
skipButton.className = "skip-button";
skipButton.textContent = "跳过";
continueOverlay.className = "continue-overlay hidden";
continueOverlay.textContent = "点击继续";

// Add elements to container
cgContainer.appendChild(cgVideo);
cgContainer.appendChild(skipButton);
cgContainer.appendChild(continueOverlay);

/**
 * Renders a CG animation event with video playback
 * @param {Object} event - The CG animation event object
 */
export function renderCG(event) {
  // Reset state
  continueOverlay.classList.add("hidden");

  // Show CG container
  cgContainer.classList.remove("hidden");

  // Set up video if available
  if (event.asset_ref) {
    // Get the video path from asset_ref - in a real game, you might have an asset manager
    // For now, we'll assume asset_ref is the video filename without extension
    const videoPath = `videos/${event.asset_ref}.mp4`;

    // Setup video
    cgVideo.src = videoPath;
    cgVideo.loop = false;
    cgVideo.controls = false;

    // Setup skip button (default to true if not specified)
    skipButton.style.display = event.skip_allowed === false ? "none" : "block";

    // Add event description if available
    if (event.description) {
      const descriptionElem = document.createElement("div");
      descriptionElem.className = "cg-description";
      descriptionElem.textContent = event.description;
      cgContainer.appendChild(descriptionElem);

      // Remove after a few seconds
      setTimeout(() => {
        if (descriptionElem.parentNode === cgContainer) {
          cgContainer.removeChild(descriptionElem);
        }
      }, 5000);
    }

    // Play video
    cgVideo.play().catch((err) => {
      console.error("Error playing CG video:", err);
      // Fallback: show a static image
      cgVideo.style.display = "none";
      cgContainer.style.backgroundImage = `url("images/${event.asset_ref}.jpg")`;
      // Show continue overlay immediately for static images
      continueOverlay.classList.remove("hidden");
    });

    // Add event listeners
    cgVideo.addEventListener("ended", handleVideoEnd);
    skipButton.addEventListener("click", skipVideo);
    continueOverlay.addEventListener("click", handleContinue);
  } else {
    console.error("No asset reference provided for CG animation");
    // Show an error message
    cgContainer.innerHTML +=
      '<div class="error-message">Error: Missing animation asset</div>';
    // Still show the continue button so player isn't stuck
    continueOverlay.classList.remove("hidden");
  }
}

/**
 * Handles video end event
 */
function handleVideoEnd() {
  // Show the continue overlay when video ends
  continueOverlay.classList.remove("hidden");
}

/**
 * Skips the current video
 */
function skipVideo() {
  cgVideo.currentTime = cgVideo.duration - 0.1;
  // Or immediately end and show continue
  // handleVideoEnd();
}

/**
 * Handles the continue button click
 */
function handleContinue() {
  // Trigger the game to advance to the next event
  // In a real implementation, this would call back to the main game loop
  // For now we'll dispatch a custom event the main.js can listen for
  const continueEvent = new CustomEvent("cg:continue");
  document.dispatchEvent(continueEvent);

  // Clean up
  cleanupCG();
}

/**
 * Clean up event listeners and reset state
 */
export function cleanupCG() {
  cgVideo.removeEventListener("ended", handleVideoEnd);
  skipButton.removeEventListener("click", skipVideo);
  continueOverlay.removeEventListener("click", handleContinue);

  cgVideo.pause();
  cgVideo.src = "";

  // Remove any dynamically added elements
  const description = cgContainer.querySelector(".cg-description");
  if (description) {
    cgContainer.removeChild(description);
  }

  const errorMsg = cgContainer.querySelector(".error-message");
  if (errorMsg) {
    cgContainer.removeChild(errorMsg);
  }

  // Reset background
  cgContainer.style.backgroundImage = "";
}
