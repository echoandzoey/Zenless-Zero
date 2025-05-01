// Import data loading function and handlers
import { getGameData } from "./data.js";
import { renderMobileChat } from "./mobileChatHandler.js";
import { renderNarration } from "./narrationHandler.js";
import { renderDialogueFixedView } from "./dialogueFixedViewHandler.js";
import { renderComicPanel } from "./comicPanelHandler.js";
import { renderCombat, cleanupCombat } from "./combatHandler.js";
import { renderCG, cleanupCG } from "./cgHandler.js";
// Import other handlers as they are created
// import { renderCombat } from './combatHandler.js';
// import { renderCG } from './cgHandler.js';

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

    // Add global listeners for special events
    document.addEventListener("combat:end", onCombatEnd);
    document.addEventListener("cg:continue", onCGContinue);
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

  // Check if the current event has an internal sequence (like dialogue)
  if (
    currentEvent.sequence &&
    currentSequenceIndex < currentEvent.sequence.length - 1
  ) {
    // Advance within the sequence
    currentSequenceIndex++;
    console.log(`Advancing sequence to index: ${currentSequenceIndex}`);
  } else {
    // Reset sequence index and advance to the next event
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
  // Set background if specified for this event type (example: dialogue_fixed_view)
  if (event.type === "dialogue_fixed_view") {
    // --- TODO: Get image URL dynamically from event data if possible ---
    // For now, use the specific image provided
    const imageUrl = "images/fixed_view_bg.png"; // <<< USE THE CORRECT PATH

    if (imageUrl) {
      console.log("Setting background image:", imageUrl);
      gameContainer.classList.add("has-background");
      gameContainer.style.backgroundImage = `url('${imageUrl}')`;
      currentBackgroundImage = imageUrl;
    } else {
      // If no image specified for this fixed dialogue, maybe use a default dark BG?
      gameContainer.style.backgroundColor = "#222"; // Example fallback
    }
  } else {
    // Ensure default background color is set for other views if needed
    gameContainer.style.backgroundColor = "#333"; // Reset to default dark bg
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
      // Narration events don't have an internal sequence index
      renderNarration(event);
      break;
    case "dialogue_fixed_view":
      renderDialogueFixedView(event, currentSequenceIndex);
      break;
    case "combat":
      renderCombat(event);
      // Add a special listener for combat events
      document.addEventListener("combat:end", onCombatEnd, { once: true });
      break;
    case "cg_animation":
      renderCG(event);
      // Add a special listener for CG events
      document.addEventListener("cg:continue", onCGContinue, { once: true });
      break;
    case "comic_panel":
      // Might need sequence index depending on implementation (currently unused by handler)
      renderComicPanel(event);
      break;
    // case 'dialogue_free_view':
    //     renderFreeDialogue(event);
    //     break;
    default:
      console.warn(`Unhandled event type: ${event.type}`);
      // Optionally display a placeholder or error
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

// Add event handlers for combat and CG events
function onCombatEnd() {
  cleanupCombat();
  advanceNarrative();
}

function onCGContinue() {
  cleanupCG();
  advanceNarrative();
}

// Add cleanup when ending the game
function endGame() {
  gameContainer.removeEventListener("click", handleInteraction);
  document.removeEventListener("combat:end", onCombatEnd);
  document.removeEventListener("cg:continue", onCGContinue);
  hideAllViews();
  gameContainer.innerHTML = '<h2 style="text-align: center;">The End</h2>';
  console.log("Game ended. Click listener removed.");
}

// --- Start the game ---
initializeGame();
