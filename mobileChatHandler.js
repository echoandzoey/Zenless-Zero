// Handler for 'mobile_chat' event type

const viewContainer = document.getElementById("mobile-chat-view");
const messageList = document.getElementById("chat-message-list");
const PLAYER_CHARACTER_NAME = "铃"; // Define the player character's name

let lastRenderedSequenceIndex = -1; // Keep track of the last rendered index for this view

function renderMobileChat(eventData, sequenceIndex) {
  console.log(
    "Rendering Mobile Chat History. Event Data:",
    eventData,
    "Target Sequence Index:",
    sequenceIndex
  );

  if (!eventData || !eventData.sequence) {
    console.error("Invalid mobile chat event data");
    viewContainer.classList.add("hidden");
    return;
  }

  // If the sequenceIndex is 0, it means we are starting a new mobile_chat event.
  // Clear the previous chat history for this specific event type.
  if (sequenceIndex === 0 && lastRenderedSequenceIndex !== -1) {
    console.log("New mobile_chat event detected, clearing history.");
    messageList.innerHTML = "";
    lastRenderedSequenceIndex = -1; // Reset tracker
  }
  // If the index decreased (e.g., going back), clear and re-render (simplest approach)
  else if (sequenceIndex < lastRenderedSequenceIndex) {
    console.log("Sequence index decreased, clearing and re-rendering history.");
    messageList.innerHTML = "";
    lastRenderedSequenceIndex = -1;
  }

  // Render messages from the last rendered index up to the current sequenceIndex
  for (let i = lastRenderedSequenceIndex + 1; i <= sequenceIndex; i++) {
    if (i >= eventData.sequence.length) break; // Boundary check

    const sequenceItem = eventData.sequence[i];
    const messageBubble = createMessageBubble(sequenceItem);
    if (messageBubble) {
      messageList.appendChild(messageBubble);
    }
  }

  lastRenderedSequenceIndex = sequenceIndex; // Update the tracker

  // Scroll to the bottom of the message list
  messageList.scrollTop = messageList.scrollHeight;

  // Show the mobile chat view container if it's hidden
  if (viewContainer.classList.contains("hidden")) {
    viewContainer.classList.remove("hidden");
  }
}

function createMessageBubble(item) {
  const bubble = document.createElement("div");
  bubble.classList.add("message-bubble");

  if (item.character && item.lines) {
    // Dialogue line
    bubble.classList.add(
      item.character === PLAYER_CHARACTER_NAME ? "sent" : "received"
    );

    // Add character name (optional for sent messages)
    if (item.character !== PLAYER_CHARACTER_NAME) {
      const nameSpan = document.createElement("span");
      nameSpan.classList.add("character-name");
      nameSpan.textContent = item.character;
      bubble.appendChild(nameSpan);
    }

    // Add message lines
    const linesP = document.createElement("p");
    linesP.textContent = item.lines.join("\n"); // Join multiple lines if needed
    bubble.appendChild(linesP);

    // Add metadata (timestamp/status)
    if (item.metadata) {
      const metaSpan = document.createElement("span");
      if (item.metadata.timestamp) {
        metaSpan.classList.add("timestamp");
        metaSpan.textContent = item.metadata.timestamp;
      } else if (item.metadata.status) {
        metaSpan.classList.add("status");
        metaSpan.textContent = item.metadata.status;
      }
      if (metaSpan.textContent) {
        bubble.appendChild(metaSpan);
      }
    }
  } else if (item.action) {
    // Action/System message
    bubble.classList.add("action");
    bubble.textContent = item.action;
    // Optionally style actions differently (e.g., centered, different background/color)
  } else {
    console.warn("Unknown sequence item format for bubble:", item);
    return null; // Don't create a bubble for unknown formats
  }

  return bubble;
}

export { renderMobileChat };
