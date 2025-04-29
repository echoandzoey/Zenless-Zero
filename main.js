// Import data loading function and handlers
import { getGameData } from "./data.js";
import { renderMobileChat } from "./mobileChatHandler.js";
import { renderNarration } from "./narrationHandler.js";
import { renderDialogueFixedView } from "./dialogueFixedViewHandler.js";
import { renderComicPanel } from "./comicPanelHandler.js"; // Import comic handler
import { renderCGAnimation } from "./cgAnimationHandler.js"; // Import CG handler
import { renderCombat } from "./combatHandler.js"; // Import Combat handler
// Import other handlers as they are created
// import { renderCombat } from './combatHandler.js';

// DOM Elements
const gameContainer = document.getElementById("game-container");
const viewContainers = document.querySelectorAll(".view-container");

// Game State
let gameData = null;
let currentSceneIndex = 0;
let currentEventIndex = 0;
let currentSequenceIndex = 0; // For events with internal sequences (like dialogue)
let currentBackgroundImage = ""; // Keep track of the background

// --- Main Game Loop ---

async function initializeGame() {
  gameData = await getGameData();
  if (gameData && gameData.scenes && gameData.scenes.length > 0) {
    console.log("Game initialized. Starting narrative.");
    displayCurrentEvent();
    // Add main click listener to advance the narrative
    gameContainer.addEventListener("click", handleInteraction);
  } else {
    console.error("Failed to initialize game or no scenes found.");
    gameContainer.innerHTML =
      '<p style="color: red; text-align: center;">Error loading game data.</p>';
  }
}

function handleInteraction() {
  // Basic interaction: advance to the next step
  // More complex interaction (choices, etc.) will need refinement here
  console.log("Interaction detected.");
  advanceNarrative();
}

function advanceNarrative() {
  if (!gameData) return;

  const currentScene = gameData.scenes[currentSceneIndex];
  const currentEvent = currentScene.events[currentEventIndex];

  // Determine the sequence source and length for the current event
  let sequenceSource = null;
  let sequenceLength = 0;

  // Only check for .sequence (used by mobile_chat, dialogue_fixed_view)
  if (currentEvent.sequence) {
    sequenceSource = currentEvent.sequence;
    sequenceLength = currentEvent.sequence.length;
  }
  // REMOVED check for content_overlay here
  // Add checks for other potential sequence sources if needed later

  const eventHasInternalSequence = sequenceLength > 0;

  // If the event has a sequence and we are not at the end of it, advance the sequence index.
  if (eventHasInternalSequence && currentSequenceIndex < sequenceLength - 1) {
    currentSequenceIndex++;
    console.log(`Advancing sequence to index: ${currentSequenceIndex}`);
  } else {
    // Otherwise, reset sequence index and advance to the next event.
    // This now also applies immediately to comic_panel
    currentSequenceIndex = 0;
    currentEventIndex++;
    console.log(`Advancing event to index: ${currentEventIndex}`);

    // Check if we need to advance to the next scene
    if (currentEventIndex >= currentScene.events.length) {
      currentEventIndex = 0;
      currentSceneIndex++;
      console.log(`Advancing scene to index: ${currentSceneIndex}`);

      // Check if the game has ended
      if (currentSceneIndex >= gameData.scenes.length) {
        console.log("Narrative finished.");
        endGame();
        return;
      }
    }
  }

  displayCurrentEvent();
}

function displayCurrentEvent() {
  if (!gameData || currentSceneIndex >= gameData.scenes.length) return;

  const scene = gameData.scenes[currentSceneIndex];
  if (currentEventIndex >= scene.events.length) return;

  const event = scene.events[currentEventIndex];

  // --- Background Handling ---
  // Reset background by default
  gameContainer.classList.remove("has-background");
  if (currentBackgroundImage) {
    gameContainer.style.backgroundImage = "";
    currentBackgroundImage = "";
  }
  // Set background only for dialogue_fixed_view
  if (event.type === "dialogue_fixed_view") {
    const imageUrl = "images/fixed_view_bg.png";
    if (imageUrl) {
      console.log("Setting background image:", imageUrl);
      gameContainer.classList.add("has-background");
      gameContainer.style.backgroundImage = `url('${imageUrl}')`;
      currentBackgroundImage = imageUrl;
    } else {
      gameContainer.style.backgroundColor = "#222";
    }
  } else {
    // Ensure appropriate background color for non-image views
    // This might vary based on the view itself (e.g., narration is black)
    // Setting a default here, but handlers can override if needed.
    gameContainer.style.backgroundColor = "#000"; // Default to black if no image
  }
  // --- End Background Handling ---

  // Hide all view containers before showing the current one
  hideAllViews();

  console.log(
    `Displaying Event: Scene ${scene.sceneId}, Event Index ${currentEventIndex}, Type: ${event.type}`
  );

  // Determine which handler to call based on event type
  switch (event.type) {
    case "mobile_chat":
      renderMobileChat(event, currentSequenceIndex);
      break;
    case "narration":
      renderNarration(event);
      break;
    case "dialogue_fixed_view":
      renderDialogueFixedView(event, currentSequenceIndex);
      break;
    case "comic_panel":
      renderComicPanel(event);
      break;
    case "cg_animation":
      renderCGAnimation(event);
      break;
    case "combat":
      renderCombat(event);
      break;
    // --- Add cases for other event types ---
    // case 'combat':
    //     renderCombat(event);
    //     break;
    // case 'dialogue_free_view':
    //     renderFreeDialogue(event);
    //     break;
    default:
      console.warn(`Unhandled event type: ${event.type}`);
      showPlaceholder(`Unsupported event type: ${event.type}`);
      break;
  }
}

function hideAllViews() {
  viewContainers.forEach((container) => container.classList.add("hidden"));
}

function showPlaceholder(message) {
  // Simple placeholder for unhandled types
  const placeholderView = document.getElementById("placeholder-view"); // Assuming you add this to HTML
  if (placeholderView) {
    placeholderView.textContent = message;
    placeholderView.classList.remove("hidden");
  } else {
    gameContainer.innerHTML += `<p style="color: orange; text-align: center;">${message}</p>`;
  }
}

function endGame() {
  gameContainer.removeEventListener("click", handleInteraction);
  hideAllViews();
  gameContainer.innerHTML = '<h2 style="text-align: center;">The End</h2>';
  console.log("Game ended. Click listener removed.");
}

// --- Start the game ---
initializeGame();
