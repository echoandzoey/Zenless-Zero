// Combat Player
// Handles combat event video playback and dialogue

// Get DOM elements
const startScreen = document.getElementById("start-screen");
const startButton = document.getElementById("start-button");
const combatContainer = document.getElementById("combat-container");
const combatVideo = document.getElementById("combat-video");
const dialogueBox = document.getElementById("dialogue-box");
const skipButton = document.getElementById("skip-button");

// Track current dialogue index and state
let currentDialogueIndex = 0;
let currentCombatEvent = null;
let phaseVideos = [];
let isInPhaseTransition = false;
let gameData = null;

/**
 * Initialize the combat player with game data
 */
function initCombatPlayer() {
  // Add event listener for start button
  startButton.addEventListener("click", startCombat);

  // Add event listeners for skip button
  skipButton.addEventListener("click", skipVideo);

  // Get combat encounter from URL
  const urlParams = new URLSearchParams(window.location.search);
  const encounterRef = urlParams.get("encounter") || "hollow_rescue_1"; // Default to first encounter

  // Load game data
  loadGameData()
    .then(() => {
      // Get the combat event for the specified encounter
      findCombatEvent(encounterRef);
    })
    .catch((error) => {
      console.error("Error loading game data:", error);
      alert("无法加载游戏数据，请刷新页面重试");
    });
}

/**
 * Load game data from JSON file
 */
async function loadGameData() {
  try {
    const response = await fetch("zenlesszero.json");
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    gameData = await response.json();
    console.log("Game data loaded successfully:", gameData.gameTitle);
  } catch (error) {
    console.error("Error loading game data:", error);
    throw error;
  }
}

/**
 * Find the combat event with the specified encounter reference
 */
function findCombatEvent(encounterRef) {
  if (!gameData || !gameData.scenes) {
    console.error("No game data available");
    return;
  }

  let foundCombatEvent = null;

  // Loop through all scenes
  for (const scene of gameData.scenes) {
    if (!scene.events) continue;

    // Loop through events in each scene
    for (const event of scene.events) {
      if (event.type === "combat" && event.encounter_ref === encounterRef) {
        foundCombatEvent = event;
        break;
      }
    }

    if (foundCombatEvent) break;
  }

  if (foundCombatEvent) {
    console.log(`Found combat event: ${encounterRef}`);
    prepareCombatEvent(foundCombatEvent);
  } else {
    console.error(`Combat event not found: ${encounterRef}`);
    // Fallback to sample event if not found
    loadSampleCombatEvent();
  }
}

/**
 * Prepare a combat event from game data
 */
function prepareCombatEvent(combatEvent) {
  // Create a video playback object if not present
  const videoFileName = combatEvent.encounter_ref.includes("boss")
    ? "videos/boss_battle.mp4"
    : "videos/battle.mp4";

  // Structure the combat event in the format our renderer expects
  const formattedEvent = {
    id: combatEvent.encounter_ref,
    video_playback: {
      video_file: videoFileName,
      loop: false,
      skip_allowed: true,
    },
    dialogue_during: combatEvent.dialogue_during || [],
  };

  // Store the event but don't render yet (wait for user interaction)
  currentCombatEvent = formattedEvent;

  // Update the start screen title based on the combat
  const startTitle = document.querySelector(".start-content h1");
  if (startTitle) {
    startTitle.textContent = combatEvent.encounter_ref.includes("boss")
      ? "BOSS战斗准备"
      : "战斗准备";
  }
}

/**
 * Start combat after user interaction
 */
function startCombat() {
  // Hide start screen
  startScreen.style.display = "none";

  // Show combat container
  combatContainer.classList.remove("hidden");

  // Render the combat with the preloaded event
  if (currentCombatEvent) {
    renderCombat(currentCombatEvent);
  } else {
    console.error("No combat event loaded");
  }
}

/**
 * Load a sample combat event for testing
 */
function loadSampleCombatEvent() {
  const sampleEvent = {
    id: "sample-combat",
    video_playback: {
      video_file: "videos/battle.mp4",
      loop: false,
      skip_allowed: true,
      phase_videos: [
        {
          video_file: "videos/boss_battle.mp4",
          dialogue: {
            character: "敌人",
            line: "你以为这就是我的全部力量吗？",
          },
        },
      ],
    },
    dialogue_during: [
      {
        character: "主角",
        line: "我必须战胜你！",
        action_description: "握紧武器",
        timing_hint: "early_combat",
      },
      {
        character: "敌人",
        line: "你太天真了！",
        action_description: "准备攻击",
        timing_hint: "mid_combat",
      },
      {
        character: "主角",
        line: "看我的实力！",
        action_description: null,
        timing_hint: "player_action_response",
      },
    ],
  };

  // Store the event but don't render yet (wait for user interaction)
  currentCombatEvent = sampleEvent;
}

/**
 * Renders a combat event with video and dialogue
 * @param {Object} event - The combat event object
 */
function renderCombat(event) {
  // Reset state
  currentDialogueIndex = 0;
  isInPhaseTransition = false;
  dialogueBox.innerHTML = "";

  // Default video playback settings if not provided
  if (!event.video_playback) {
    event.video_playback = {
      video_file: "videos/battle.mp4",
      loop: false,
      skip_allowed: true,
    };
  }

  // Store phase videos if available
  phaseVideos = event.video_playback.phase_videos || [];

  // Setup main video
  let videoPath = event.video_playback.video_file;

  // Setup video element
  combatVideo.src = videoPath;
  combatVideo.loop = event.video_playback.loop || false;
  combatVideo.controls = false;
  combatVideo.muted = false; // Make sure audio is enabled

  console.log("Loading video:", videoPath);

  // Setup skip button
  skipButton.style.display = event.video_playback.skip_allowed
    ? "block"
    : "none";

  // Play video - this should now work because we have user interaction
  combatVideo
    .play()
    .then(() => {
      console.log("Video playing successfully!");
      // Start displaying dialogues sequentially from the beginning
      if (event.dialogue_during && event.dialogue_during.length > 0) {
        displayCombatDialogue();
      }
    })
    .catch((err) => {
      console.error("Error playing combat video:", err);
      alert("视频加载失败: " + videoPath + " - " + err.message);
      // Fallback to static view if video fails
      handleVideoFailure();
    });

  // Add event listeners
  combatVideo.addEventListener("ended", handleVideoEnd);
}

/**
 * Handle video playback failure
 */
function handleVideoFailure() {
  combatVideo.style.display = "none";
  combatContainer.style.backgroundColor = "#000";

  // Show error message in the dialogue box
  dialogueBox.style.display = "block";
  dialogueBox.innerHTML =
    '<div class="combat-message">视频加载失败，请检查文件路径或刷新页面重试。</div>';
}

/**
 * Displays dialogue that appears during combat (sequential method)
 */
function displayCombatDialogue() {
  // Check if there's dialogue to display
  if (
    !currentCombatEvent ||
    !currentCombatEvent.dialogue_during ||
    currentDialogueIndex >= currentCombatEvent.dialogue_during.length
  ) {
    dialogueBox.style.display = "none";
    return;
  }

  // Get current dialogue
  const dialogue = currentCombatEvent.dialogue_during[currentDialogueIndex];

  // Create dialogue elements
  dialogueBox.style.display = "block";
  dialogueBox.innerHTML = `
        <div class="character-name">${dialogue.character}</div>
        <div class="dialogue-text">${dialogue.line}</div>
        ${
          dialogue.action_description
            ? `<div class="action-description">${dialogue.action_description}</div>`
            : ""
        }
    `;

  // Set a timeout to auto-advance dialogue if needed
  setTimeout(() => {
    currentDialogueIndex++;
    displayCombatDialogue();
  }, 5000); // 5 seconds per dialogue
}

/**
 * Handles video end event
 */
function handleVideoEnd() {
  if (
    currentCombatEvent.video_playback &&
    currentCombatEvent.video_playback.loop
  ) {
    combatVideo.play();
  } else if (!isInPhaseTransition) {
    // Finished playing main video
    dialogueBox.innerHTML = '<div class="combat-message">战斗结束!</div>';

    // Remove event listeners
    combatVideo.removeEventListener("ended", handleVideoEnd);

    // Show button to return to game after 3 seconds
    setTimeout(() => {
      const returnButton = document.createElement("button");
      returnButton.className = "return-button";
      returnButton.textContent = "返回游戏";
      returnButton.addEventListener("click", () => {
        // In a real game, this would navigate back to the main game
        window.history.back();
      });
      dialogueBox.appendChild(returnButton);
    }, 3000);
  }
}

/**
 * Skips the current video
 */
function skipVideo() {
  combatVideo.currentTime = combatVideo.duration - 0.1;
}

/**
 * Sets up phase transition triggers for multi-phase boss battles
 */
function setupPhaseTransitions() {
  // Create phase buttons (for testing purposes)
  const phaseButtonContainer = document.createElement("div");
  phaseButtonContainer.className = "phase-buttons";

  phaseVideos.forEach((phase, index) => {
    const button = document.createElement("button");
    button.textContent = `触发阶段 ${index + 2}`; // Phase 2, 3, etc.
    button.addEventListener("click", () => triggerPhaseChange(phase));
    phaseButtonContainer.appendChild(button);
  });

  combatContainer.appendChild(phaseButtonContainer);
}

/**
 * Triggers a phase change in the battle
 * @param {Object} phaseData - Data for the new phase
 */
function triggerPhaseChange(phaseData) {
  if (!phaseData || !phaseData.video_file) return;

  isInPhaseTransition = true;

  // Pause current video
  combatVideo.pause();

  // Change source and play new phase video
  combatVideo.src = phaseData.video_file;
  combatVideo.play().catch((err) => {
    console.error("Error playing phase video:", err);
    isInPhaseTransition = false;
  });

  // Show phase-specific dialogue if applicable
  if (phaseData.dialogue) {
    dialogueBox.innerHTML = `
            <div class="character-name">${phaseData.dialogue.character}</div>
            <div class="dialogue-text">${phaseData.dialogue.line}</div>
        `;
  }

  // Reset state after phase video
  combatVideo.onended = () => {
    isInPhaseTransition = false;
    handleVideoEnd();
  };
}

/**
 * Clean up event listeners and reset state
 */
function cleanupCombat() {
  combatVideo.removeEventListener("ended", handleVideoEnd);
  skipButton.removeEventListener("click", skipVideo);
  combatVideo.pause();
  combatVideo.src = "";
  dialogueBox.innerHTML = "";

  // Remove phase buttons if they exist
  const phaseButtons = document.querySelector(".phase-buttons");
  if (phaseButtons) {
    phaseButtons.remove();
  }
}

// Initialize the player when the page loads
document.addEventListener("DOMContentLoaded", initCombatPlayer);
