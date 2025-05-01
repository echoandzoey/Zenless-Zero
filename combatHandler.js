// Combat Handler
// Handles combat events that include video playback and in-combat dialogue

const combatContainer = document.getElementById("combat-view");
const combatVideo = document.createElement("video");
const dialogueBox = document.createElement("div");
const skipButton = document.createElement("button");

// Set up elements
combatVideo.className = "combat-video";
dialogueBox.className = "combat-dialogue";
skipButton.className = "skip-button";
skipButton.textContent = "跳过";

// Add elements to container
combatContainer.appendChild(combatVideo);
combatContainer.appendChild(dialogueBox);
combatContainer.appendChild(skipButton);

// Track current dialogue index and state
let currentDialogueIndex = 0;
let currentCombatEvent = null;
let phaseVideos = [];
let isInPhaseTransition = false;

/**
 * Renders a combat event with video and dialogue
 * @param {Object} event - The combat event object
 */
export function renderCombat(event) {
  // Reset state
  currentDialogueIndex = 0;
  currentCombatEvent = event;
  isInPhaseTransition = false;
  dialogueBox.innerHTML = "";

  // 确保event有video_playback属性
  if (!event.video_playback) {
    event.video_playback = {
      video_file: "/videos/battle.mp4",
      loop: false,
      skip_allowed: true,
    };
  }

  // Show combat container
  combatContainer.classList.remove("hidden");

  // Set up video if available
  if (event.video_playback) {
    // Store phase videos if available
    phaseVideos = event.video_playback.phase_videos || [];

    // Setup main video
    let videoPath = "/videos/battle.mp4"; // 添加前导斜杠，确保从根目录加载

    // 确保视频元素可见但保持原始比例
    combatVideo.style.display = "block";
    // 移除固定宽高
    combatVideo.removeAttribute("width");
    combatVideo.removeAttribute("height");
    // 使用CSS保持比例
    combatVideo.style.maxWidth = "100%";
    combatVideo.style.height = "auto";
    combatVideo.style.objectFit = "contain"; // 保持原始比例

    combatVideo.src = videoPath;
    combatVideo.loop = event.video_playback.loop || false;
    combatVideo.controls = false; // 恢复为无控制器

    console.log("尝试加载视频:", videoPath); // 添加调试日志

    // Setup skip button
    skipButton.style.display = event.video_playback.skip_allowed
      ? "block"
      : "none";

    // Play video
    combatVideo
      .play()
      .then(() => {
        console.log("视频播放成功!");
      })
      .catch((err) => {
        console.error("Error playing combat video:", err);
        // 显示更详细的错误信息
        alert("视频加载失败: " + videoPath + " - " + err.message);
        combatVideo.style.display = "none";
        combatContainer.style.backgroundColor = "#000";
      });

    // Add event listeners
    combatVideo.addEventListener("ended", handleVideoEnd);
    skipButton.addEventListener("click", skipVideo);

    // Display initial dialogue if available
    displayCombatDialogue();

    // Set up phase transition triggers if needed
    if (phaseVideos.length > 0) {
      setupPhaseTransitions();
    }
  } else {
    // No video, just show a static background
    combatVideo.style.display = "none";
    combatContainer.style.backgroundColor = "#000"; // 使用黑色背景代替图片
    displayCombatDialogue();
  }
}

/**
 * Displays dialogue that appears during combat
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

  // Set a timeout to auto-advance dialogue if needed (can be adjusted)
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
    // Finished playing main video, you can add combat gameplay logic here
    // For now, we'll just display an end message
    dialogueBox.innerHTML = '<div class="combat-message">战斗结束!</div>';

    // Remove event listeners
    combatVideo.removeEventListener("ended", handleVideoEnd);
    skipButton.removeEventListener("click", skipVideo);
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
  // This would be connected to gameplay events in a real implementation
  // For demo purposes, we'll use buttons to trigger phase changes

  // Create phase buttons (in a real game these would be triggered by game events)
  const phaseButtonContainer = document.createElement("div");
  phaseButtonContainer.className = "phase-buttons debug-only";

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
export function cleanupCombat() {
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
