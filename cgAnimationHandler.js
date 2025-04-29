// Handler for 'cg_animation' event type

const viewContainer = document.getElementById("cg-animation-view");
const descriptionTextEl = document.getElementById("cg-description-text");
const videoPlaceholderEl = document.getElementById("cg-video-placeholder");
const assetRefSpan = document.getElementById("cg-asset-ref"); // Span inside placeholder

// TODO: Implement actual video loading/playback later
// const videoElement = document.getElementById('actual-cg-video'); // If you add a <video> tag

function renderCGAnimation(eventData) {
  console.log("Rendering CG Animation. Event Data:", eventData);

  if (!eventData || !eventData.description || !eventData.asset_ref) {
    console.error("Invalid CG animation event data");
    viewContainer.classList.add("hidden");
    return;
  }

  // Display description
  descriptionTextEl.textContent = eventData.description;

  // Display asset_ref in placeholder
  assetRefSpan.textContent = eventData.asset_ref;

  // TODO: Later, load video source based on eventData.asset_ref
  // videoElement.src = `videos/${eventData.asset_ref}.mp4`; // Example path
  // videoElement.load();
  // videoElement.play(); // Optional: autoplay

  // Show the CG animation view container
  viewContainer.classList.remove("hidden");
}

export { renderCGAnimation };
