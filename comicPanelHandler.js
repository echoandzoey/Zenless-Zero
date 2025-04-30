// Handler for 'comic_panel' event type
const viewContainer = document.getElementById("comic-panel-view"); // Assumes an element with id="comic-panel-view" exists in index.html

function renderComicPanel(eventData) {
  console.log("Rendering Comic Panel. Event Data:", eventData);

  if (!viewContainer) {
    console.error("Comic panel view container not found!");
    return;
  }

  if (!eventData || !eventData.content_overlay) {
    console.error("Invalid comic panel event data:", eventData);
    viewContainer.innerHTML = "<p>Error displaying comic panel.</p>"; // Display error in the container
    viewContainer.classList.remove("hidden");
    return;
  }

  // Clear previous content
  viewContainer.innerHTML = "";

  // Assuming 'content_overlay' contains items with 'panel', 'dialogue', or 'narration'
  // We might need a more sophisticated grouping by panel number later
  eventData.content_overlay.forEach((item) => {
    const panelElement = document.createElement("div");
    panelElement.classList.add("panel"); // Use styles from styles.css

    if (item.dialogue) {
      const dialogue = item.dialogue;
      const characterNameEl = document.createElement("span");
      characterNameEl.classList.add("character-name");
      // Basic character name to class mapping (can be expanded)
      const characterClass = dialogue.character
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-"); // Simple slugify
      characterNameEl.classList.add(characterClass); // Add class like 'drunk', 'shop-owner'
      characterNameEl.textContent = dialogue.character;

      const speechBubbleEl = document.createElement("div");
      speechBubbleEl.classList.add("speech-bubble");
      speechBubbleEl.textContent = dialogue.line;

      panelElement.appendChild(characterNameEl);
      panelElement.appendChild(speechBubbleEl);

      if (dialogue.action_description) {
        const actionEl = document.createElement("p");
        actionEl.classList.add("character-action");
        actionEl.textContent = dialogue.action_description;
        panelElement.appendChild(actionEl);
      }
    } else if (item.narration) {
      const narrationEl = document.createElement("p");
      // Add a specific class for narration styling if needed
      narrationEl.textContent = item.narration;
      panelElement.appendChild(narrationEl);
    }
    // Append the constructed panel to the main view container
    // This avoids the 'insertBefore null' error by simply adding to the end.
    viewContainer.appendChild(panelElement);
  });

  // Show the comic panel view container
  viewContainer.classList.remove("hidden");
}

// Export the function so main.js can import it
export { renderComicPanel };
