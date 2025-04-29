// Handler for 'combat' event type

const viewContainer = document.getElementById("combat-view");
const encounterRefSpan = document.getElementById("combat-encounter-ref");
const dialogueDisplayEl = document.getElementById("combat-dialogue-display");
const videoPlaceholderEl = document.getElementById("combat-video-placeholder");

// TODO: Implement actual video/gameplay later

function renderCombat(eventData) {
  console.log("Rendering Combat. Event Data:", eventData);

  if (!eventData || !eventData.encounter_ref) {
    console.error("Invalid combat event data");
    viewContainer.classList.add("hidden");
    return;
  }

  // Display encounter_ref in placeholder
  encounterRefSpan.textContent = eventData.encounter_ref;

  // Display dialogue during combat (basic implementation)
  if (eventData.dialogue_during && eventData.dialogue_during.length > 0) {
    // Just showing the first line for now, could cycle or display differently
    const firstDialogue = eventData.dialogue_during[0];
    dialogueDisplayEl.textContent = `${firstDialogue.character}: "${firstDialogue.line}"`;
    dialogueDisplayEl.style.display = "block";
  } else {
    dialogueDisplayEl.textContent = "";
    dialogueDisplayEl.style.display = "none";
  }

  // TODO: Later, load video/trigger gameplay based on eventData.encounter_ref

  // Show the combat view container
  viewContainer.classList.remove("hidden");
}

export { renderCombat };
