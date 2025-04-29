async function getGameData() {
  try {
    const response = await fetch("zenlesszero.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log("Game data loaded successfully:", data);
    return data;
  } catch (error) {
    console.error("Could not load game data:", error);
    return null; // Or handle the error more gracefully
  }
}

// Export the function so main.js can import it
export { getGameData };
