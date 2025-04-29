// Handler for 'comic_panel' event type

const viewContainer = document.getElementById("comic-panel-view");
const descriptionTextEl = document.getElementById("comic-description-text");

// Store created bubbles to remove them later
let currentBubbles = [];

function renderComicPanel(eventData) {
  console.log("Rendering Comic Panel Bubbles. Event Data:", eventData);

  // Clear previous bubbles
  currentBubbles.forEach((bubble) => bubble.remove());
  currentBubbles = [];

  // We need the sequence data for this layout
  if (!eventData.sequence || eventData.sequence.length === 0) {
    console.warn("Comic panel event has no sequence data for bubble layout.");
    // Optional: Display a fallback message or the description?
    const fallbackText = document.createElement("p");
    fallbackText.textContent =
      eventData.description || "[Comic Panel Content Missing]";
    fallbackText.style.textAlign = "center";
    fallbackText.style.padding = "50px";
    viewContainer.insertBefore(
      fallbackText,
      viewContainer.querySelector(".interaction-hint")
    );
    currentBubbles.push(fallbackText); // Add to list for removal later
    viewContainer.classList.remove("hidden");
    return;
  }

  eventData.sequence.forEach((item, index) => {
    const bubble = createComicBubble(item, index);
    if (bubble) {
      viewContainer.insertBefore(
        bubble,
        viewContainer.querySelector(".interaction-hint")
      ); // Insert before hint
      currentBubbles.push(bubble);
    }
  });

  // Ensure the view is visible
  viewContainer.classList.remove("hidden");
}

function createComicBubble(item, index) {
  const bubble = document.createElement("div");
  bubble.classList.add("comic-bubble");

  // Assign alternating left/right classes
  if (index % 2 === 0) {
    bubble.classList.add("bubble-left");
  } else {
    bubble.classList.add("bubble-right");
  }

  // Check if it's a dialogue item
  if (item.character && item.line) {
    const charSpan = document.createElement("span");
    charSpan.classList.add("bubble-character");
    charSpan.textContent = item.character;
    bubble.appendChild(charSpan);

    const lineSpan = document.createElement("span");
    lineSpan.classList.add("bubble-line");
    lineSpan.textContent = item.line;
    bubble.appendChild(lineSpan);

    if (item.action_description) {
      const actionSpan = document.createElement("span");
      actionSpan.classList.add("bubble-action");
      actionSpan.textContent = `(${item.action_description})`;
      bubble.appendChild(actionSpan);
    }
  } else {
    // Handle non-dialogue items in sequence if necessary (e.g., actions)
    // For now, we skip them or log a warning
    console.warn("Skipping non-dialogue item in comic sequence:", item);
    return null;
  }

  return bubble;
}

export { renderComicPanel };
