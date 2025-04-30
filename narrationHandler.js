// Handler for 'narration' event type

const viewContainer = document.getElementById("narration-view");
const narrationTextEl = document.getElementById("narration-text");

function renderNarration(eventData) {
  console.log("Rendering Narration. Event Data:", eventData);

  // Check for either 'text' or 'description'
  const narrationContent = eventData.text || eventData.description;

  if (!eventData || typeof narrationContent !== "string") {
    console.error(
      "Invalid narration event data: Missing 'text' or 'description'",
      eventData
    );
    viewContainer.classList.add("hidden");
    return;
  }

  narrationTextEl.textContent = narrationContent; // Use the found content

  // Show the narration view container
  viewContainer.classList.remove("hidden");
}

// Export the function so main.js can import it
export { renderNarration };
