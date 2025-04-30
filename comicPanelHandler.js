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

  // 1. Group content items by panel number
  const panelsGrouped = {};
  eventData.content_overlay.forEach((item) => {
    const panelNum = item.panel || 1; // Default to panel 1 if number is missing
    if (!panelsGrouped[panelNum]) {
      panelsGrouped[panelNum] = [];
    }
    panelsGrouped[panelNum].push(item);
  });

  // 2. Get sorted panel numbers
  const sortedPanelNumbers = Object.keys(panelsGrouped).sort(
    (a, b) => parseInt(a) - parseInt(b)
  );

  // 3. Create and populate panel elements for each group
  sortedPanelNumbers.forEach((panelNum) => {
    const itemsForPanel = panelsGrouped[panelNum];
    let dialogueCounter = 0; // Counter for dialogues within this panel

    // Create the main container for this logical panel
    const panelContainer = document.createElement("div");
    panelContainer.classList.add("panel"); // Use styles from styles.css
    // Optionally add data attribute for styling/debugging: panelContainer.dataset.panelNumber = panelNum;

    // Add content items (dialogue, narration) to this panel container
    itemsForPanel.forEach((item) => {
      if (item.dialogue) {
        const dialogue = item.dialogue;
        const dialogueWrapper = document.createElement("div"); // Wrapper for character + bubble
        dialogueWrapper.classList.add("dialogue-item");

        // Add alternating classes
        dialogueWrapper.classList.add(
          dialogueCounter % 2 === 0 ? "dialogue-even" : "dialogue-odd"
        );
        dialogueCounter++;

        const characterNameEl = document.createElement("span");
        characterNameEl.classList.add("character-name");
        const characterClass = dialogue.character
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "-");
        characterNameEl.classList.add(characterClass);
        characterNameEl.textContent = dialogue.character;

        const speechBubbleEl = document.createElement("div");
        speechBubbleEl.classList.add("speech-bubble");
        speechBubbleEl.textContent = dialogue.line;

        dialogueWrapper.appendChild(characterNameEl);
        dialogueWrapper.appendChild(speechBubbleEl);

        if (dialogue.action_description) {
          const actionEl = document.createElement("p");
          actionEl.classList.add("character-action");
          actionEl.textContent = dialogue.action_description;
          // Append action after the bubble, still within the dialogue wrapper
          dialogueWrapper.appendChild(actionEl);
        }
        panelContainer.appendChild(dialogueWrapper); // Add the whole dialogue item
      } else if (item.narration) {
        const narrationEl = document.createElement("p");
        narrationEl.classList.add("narration-box"); // Add a class for styling narration
        narrationEl.textContent = item.narration;
        panelContainer.appendChild(narrationEl);
      }
    });

    // Append the fully constructed panel container to the main view
    viewContainer.appendChild(panelContainer);
  });

  // Show the comic panel view container
  viewContainer.classList.remove("hidden");
}

// Export the function so main.js can import it
export { renderComicPanel };
