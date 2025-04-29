// Handler for 'dialogue_fixed_view' event type

const viewContainer = document.getElementById("dialogue-fixed-view");
// Get references to elements inside the fixed dialogue container (defined in index.html)
const characterEl = document.getElementById("fixed-dialogue-character");
const lineEl = document.getElementById("fixed-dialogue-line");
const actionEl = document.getElementById("fixed-dialogue-action");

function renderDialogueFixedView(eventData, sequenceIndex) {
  console.log(
    "Rendering Fixed Dialogue. Event Data:",
    eventData,
    "Sequence Index:",
    sequenceIndex
  );

  if (
    !eventData ||
    !eventData.sequence ||
    sequenceIndex >= eventData.sequence.length
  ) {
    console.error("Invalid fixed dialogue event data or sequence index");
    viewContainer.classList.add("hidden");
    return;
  }

  const sequenceItem = eventData.sequence[sequenceIndex];

  // Clear previous action
  actionEl.textContent = "";
  actionEl.style.display = "none";

  // Assuming sequence items have character, line, and optional action_description
  if (sequenceItem.character && sequenceItem.line) {
    characterEl.textContent = sequenceItem.character + ":"; // Add colon for style
    lineEl.textContent = sequenceItem.line;

    if (sequenceItem.action_description) {
      actionEl.textContent = sequenceItem.action_description;
      actionEl.style.display = "block";
    }
  } else {
    console.warn(
      "Unknown sequence item format for fixed dialogue:",
      sequenceItem
    );
    // Handle potential other formats or errors
    characterEl.textContent = "Error:";
    lineEl.textContent = "Invalid dialogue data.";
  }

  // TODO: Handle view_metadata (style, interactionHint)
  // Example: Change styling based on eventData.view_metadata.style

  // Show the fixed dialogue view container
  viewContainer.classList.remove("hidden");
}

export { renderDialogueFixedView };
