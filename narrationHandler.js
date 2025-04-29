// Handler for 'narration' event type

const viewContainer = document.getElementById("narration-view");
const narrationTextEl = document.getElementById("narration-text");

function renderNarration(eventData) {
  console.log("Rendering Narration. Event Data:", eventData);

  if (!eventData || typeof eventData.text !== "string") {
    console.error("Invalid narration event data");
    viewContainer.classList.add("hidden");
    return;
  }

  narrationTextEl.textContent = eventData.text;

  // Show the narration view container
  viewContainer.classList.remove("hidden");
}

// Export the function so main.js can import it
export { renderNarration };
