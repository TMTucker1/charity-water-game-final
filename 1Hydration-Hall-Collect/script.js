// Add this at the beginning of your script
window.addEventListener('error', function(e) {
  console.log('JavaScript error occurred: ', e.message);
  alert('A JavaScript error occurred: ' + e.message + ' at line ' + e.lineno);
});

// Game configuration and state variables
let currentCans = 0;         // Current number of items collected
let highestScore = 0;        // Highest score achieved in this session
let gameActive = false;      // Tracks if game is currently running
let spawnInterval;          // Holds the interval for spawning items
let gameTimer;              // Holds the game timer interval
let timeLeft = 30;          // Time left in seconds
let currentDifficulty = 'medium'; // Current difficulty level

// Difficulty settings
const difficultySettings = {
  easy: {
    time: 45,
    spawnRate: 800, // Spawn every 1 second (slower)
    name: 'Easy'
  },
  medium: {
    time: 30,
    spawnRate: 600, // Spawn every 0.8 seconds
    name: 'Medium'
  },
  hard: {
    time: 20,
    spawnRate: 400, // Spawn every 0.6 seconds (faster)
    name: 'Hard'
  }
};

// Real Charity: Water success stories
const successStories = [
  {
    title: "Meron's Story - Ethiopia",
    story: "Before getting clean water, 14-year-old Meron had to walk three hours every day to collect water from a muddy river. The water made her family sick, and she often missed school. Now, with a new well in her village, Meron can focus on her education and dreams of becoming a teacher. The clean water has transformed not just her life, but her entire community's future.",
    impact: "1,200 people in Meron's village now have access to clean water within 15 minutes of their homes."
  },
  {
    title: "Celina's Community - Honduras", 
    story: "Celina used to spend 6 hours daily walking to fetch water for her family of seven. The water source was contaminated and caused frequent illness. After Charity: Water built a well system in her community, Celina started a small business selling vegetables. Her children are healthier and attend school regularly.",
    impact: "850 people in rural Honduras gained access to clean water, improving health and economic opportunities."
  },
  {
    title: "Fatima's Village - Chad",
    story: "In Chad, Fatima's village relied on a dirty pond shared with animals. Children were constantly sick with waterborne diseases. When Charity: Water drilled a new well, everything changed. School attendance increased by 80%, and child mortality dropped significantly. Fatima now leads the village water committee.",
    impact: "2,100 people across 4 villages in Chad received clean water, dramatically improving health outcomes."
  },
  {
    title: "James's School - Uganda",
    story: "James, a teacher in rural Uganda, watched his students miss school due to water collection duties and illness from dirty water. A new borehole well at the school changed everything. Attendance soared, test scores improved, and the school became a community hub. James says it's the single most important change he's witnessed.",
    impact: "600 students and 3,000 community members gained access to clean water at the school site."
  }
];

// Function to update highest score with a loop check
function updateHighestScore(newScore) {
  // Use a loop to check if the new score is higher
  for (let i = 0; i < 1; i++) { // Simple loop structure as requested
    if (newScore > highestScore) {
      highestScore = newScore;
      // Show achievement for new high score
      if (newScore > 0) {
        showAchievement(`🏆 NEW HIGH SCORE: ${newScore} water cans! (${difficultySettings[currentDifficulty].name} Mode)`);
      }
      break; // Exit loop once comparison is made
    }
  }
}

// Handle difficulty button clicks
function handleDifficultySelection() {
  const difficultyButtons = document.querySelectorAll('.difficulty-btn');
  
  if (difficultyButtons.length === 0) {
    console.log('No difficulty buttons found!');
    return;
  }
  
  difficultyButtons.forEach(button => {
    button.addEventListener('click', () => {
      if (gameActive) return; // Don't allow difficulty change during game
      
      // Remove active class from all buttons
      difficultyButtons.forEach(btn => btn.classList.remove('active'));
      
      // Add active class to clicked button
      button.classList.add('active');
      
      // Update current difficulty
      currentDifficulty = button.dataset.level;
      
      // Update timer display
      timeLeft = difficultySettings[currentDifficulty].time;
      updateDisplay();
      
      // Show feedback
      showAchievement(`Difficulty set to ${difficultySettings[currentDifficulty].name} mode!`);
      setTimeout(() => {
        const achievementDiv = document.getElementById('achievements');
        if (achievementDiv) {
          achievementDiv.style.display = 'none';
        }
      }, 2000);
    });
  });
}

function handleItemClick(event) {
  if (!gameActive) return;
  
  const target = event.target;
  
  // Check if clicked on a water can
  if (target.classList.contains('water-can')) {
    currentCans++;
    updateDisplay();
    
    // Remove the item wrapper
    const itemWrapper = target.closest('.item-wrapper');
    if (itemWrapper) {
      itemWrapper.remove();
    }
    
    // Check for milestone achievements (but don't end game)
    if (currentCans === 20) {
      showSuccessStoryPopup();
      showAchievement('🎉 Amazing! You reached 20 water cans! Keep going for an even higher score!');
    } else if (currentCans % 10 === 0 && currentCans > 20) {
      showAchievement(`🌟 Outstanding! ${currentCans} water cans collected!`);
    }
  }
  
  // Check if clicked on penalty circle
  else if (target.classList.contains('penalty-circle')) {
    // Penalty: lose 2 seconds
    timeLeft = Math.max(0, timeLeft - 2);
    updateDisplay();
    
    // Remove the item wrapper
    const itemWrapper = target.closest('.item-wrapper');
    if (itemWrapper) {
      itemWrapper.remove();
    }
    
    // Show penalty feedback
    showAchievement('⚠️ Penalty! -2 seconds');
    setTimeout(() => {
      document.getElementById('achievements').style.display = 'none';
    }, 1500);
  }
}

// Creates the 4x4 game grid where items will appear
function createGrid() {
  const grid = document.querySelector('.game-grid');
  grid.innerHTML = ''; // Clear any existing grid cells
  for (let i = 0; i < 16; i++) {
    const cell = document.createElement('div');
    cell.className = 'grid-cell'; // Each cell represents a grid square
    grid.appendChild(cell);
  }
}

// Update the display elements
function updateDisplay() {
  document.getElementById('current-cans').textContent = currentCans;
  document.getElementById('highest-score').textContent = highestScore;
  document.getElementById('timer').textContent = timeLeft;
}

// Show Charity: Water success story popup
function showSuccessStoryPopup() {
  // Pick a random success story
  const story = successStories[Math.floor(Math.random() * successStories.length)];
  
  // Create popup overlay
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    animation: fadeIn 0.3s ease-in;
  `;
  
  // Create popup content
  const popup = document.createElement('div');
  popup.style.cssText = `
    background: white;
    padding: 30px;
    border-radius: 15px;
    max-width: 500px;
    margin: 20px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    animation: slideIn 0.4s ease-out;
    position: relative;
  `;
  
  popup.innerHTML = `
    <div style="text-align: center; margin-bottom: 20px;">
      <img src="https://assets.charitywater.org/images/logos/cw-logo-blue.svg" 
           alt="Charity: Water" 
           style="max-width: 150px; height: auto;"
           onerror="this.style.display='none'">
      <h2 style="color: #2E9DF7; margin: 10px 0; font-size: 24px;">Milestone Reached!</h2>
      <div style="background: #FFC907; color: #333; padding: 8px 16px; border-radius: 20px; display: inline-block; font-weight: bold; margin-bottom: 15px;">
        🏆 You collected ${currentCans} water cans!
      </div>
    </div>
    
    <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
      <h3 style="color: #159A48; margin-top: 0; font-size: 20px;">${story.title}</h3>
      <p style="line-height: 1.6; color: #333; margin-bottom: 15px;">${story.story}</p>
      <div style="background: #e8f4f8; padding: 12px; border-radius: 8px; border-left: 4px solid #2E9DF7;">
        <strong style="color: #2E9DF7;">Impact:</strong> ${story.impact}
      </div>
    </div>
    
    <div style="text-align: center;">
      <p style="font-size: 14px; color: #666; margin-bottom: 15px;">
        Keep playing to set an even higher score!
      </p>
      <button id="close-popup" style="
        background: #2E9DF7;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 25px;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        transition: background 0.3s;
        margin-right: 10px;
      ">Continue Playing</button>
      <a href="https://www.charitywater.org" target="_blank" style="
        background: #FFC907;
        color: #333;
        text-decoration: none;
        padding: 12px 24px;
        border-radius: 25px;
        font-size: 16px;
        font-weight: bold;
        display: inline-block;
        transition: background 0.3s;
      ">Learn More</a>
    </div>
  `;
  
  // Add animations
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideIn {
      from { transform: scale(0.8) translateY(-20px); opacity: 0; }
      to { transform: scale(1) translateY(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
  
  overlay.appendChild(popup);
  document.body.appendChild(overlay);
  
  // Close popup functionality
  const closeButton = popup.querySelector('#close-popup');
  closeButton.onclick = function() {
    overlay.style.animation = 'fadeOut 0.3s ease-out forwards';
    setTimeout(() => {
      document.body.removeChild(overlay);
      document.head.removeChild(style);
    }, 300);
  };
  
  // Add fadeOut animation
  style.textContent += `
    @keyframes fadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }
  `;
  
  // Close on overlay click (but not popup content)
  overlay.onclick = function(e) {
    if (e.target === overlay) {
      closeButton.click();
    }
  };
}

// Start the game timer
function startTimer() {
  gameTimer = setInterval(() => {
    timeLeft--;
    updateDisplay();
    
    if (timeLeft <= 0) {
      endGame();
      showAchievement(`Time's up! Final Score: ${currentCans} water cans (${difficultySettings[currentDifficulty].name} Mode)`);
    }
  }, 1000);
}

// Show achievement message
function showAchievement(message) {
  const achievementDiv = document.getElementById('achievements');
  achievementDiv.textContent = message;
  achievementDiv.style.display = 'block';
  achievementDiv.style.background = '#4FCB53';
  achievementDiv.style.color = 'white';
  achievementDiv.style.padding = '15px';
  achievementDiv.style.borderRadius = '8px';
  achievementDiv.style.marginBottom = '20px';
  achievementDiv.style.textAlign = 'center';
  achievementDiv.style.fontWeight = 'bold';
}

// Ensure the grid is created when the page loads
createGrid();

// Spawns a new item in a random grid cell (either water can or penalty circle)
function spawnItem() {
  if (!gameActive) return; // Stop if the game is not active
  const cells = document.querySelectorAll('.grid-cell');
  
  // Find empty cells (cells without items)
  const emptyCells = Array.from(cells).filter(cell => !cell.querySelector('.item-wrapper'));
  
  if (emptyCells.length === 0) return; // No empty cells available
  
  // Select a random empty cell
  const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];

  // Decide what to spawn (70% water can, 30% penalty circle)
  const spawnWaterCan = Math.random() < 0.7;
  
  // Create the item wrapper
  const itemWrapper = document.createElement('div');
  itemWrapper.className = 'item-wrapper';
  
  if (spawnWaterCan) {
    // Create water can
    itemWrapper.innerHTML = '<div class="water-can"></div>';
  } else {
    // Create penalty circle
    itemWrapper.innerHTML = '<div class="penalty-circle">✕</div>';
  }
  
  randomCell.appendChild(itemWrapper);
  
  // Auto-remove the item after 2 seconds if not clicked
  setTimeout(() => {
    if (itemWrapper.parentNode && gameActive) {
      itemWrapper.remove();
    }
  }, 2000);
}

// Initializes and starts a new game
function startGame() {
  if (gameActive) return; // Prevent starting a new game if one is already active
  
  // Reset game state
  gameActive = true;
  currentCans = 0;
  timeLeft = difficultySettings[currentDifficulty].time; // Set time based on difficulty
  
  // Clear achievements
  document.getElementById('achievements').style.display = 'none';
  
  // Update display
  updateDisplay();
  
  // Set up the game grid
  createGrid();
  
  // Add click event listener to the grid for item clicks
  const grid = document.querySelector('.game-grid');
  grid.addEventListener('click', handleItemClick);
  
  // Start spawning items based on difficulty and timer
  spawnInterval = setInterval(spawnItem, difficultySettings[currentDifficulty].spawnRate);
  startTimer();
  
  // Hide the start button during gameplay
  const startButton = document.getElementById('start-game');
  startButton.style.display = 'none';
  
  // Disable difficulty buttons during game
  const difficultyButtons = document.querySelectorAll('.difficulty-btn');
  difficultyButtons.forEach(btn => btn.disabled = true);
}

function endGame() {
  gameActive = false; // Mark the game as inactive
  clearInterval(spawnInterval); // Stop spawning items
  clearInterval(gameTimer); // Stop the timer
  
  // Check if player beat their high score
  if (currentCans > highestScore) {
    // Play win sound when player beats high score
    playWinSound();
  } else if (highestScore > 0) {
    // Play lost sound when player doesn't beat high score
    // Only play if there was a previous high score
    playLostSound();
  }
  
  // Update highest score when game ends
  updateHighestScore(currentCans);
  updateDisplay();
  
  // Remove click event listener
  const grid = document.querySelector('.game-grid');
  grid.removeEventListener('click', handleItemClick);
  
  // Show the start button again and reset its text
  const startButton = document.getElementById('start-game');
  startButton.style.display = 'block';
  startButton.textContent = 'Start New Game';
  startButton.disabled = false;
  
  // Re-enable difficulty buttons
  const difficultyButtons = document.querySelectorAll('.difficulty-btn');
  difficultyButtons.forEach(btn => btn.disabled = false);
}

// Add sound functions for the Hydration Hall game
function playWinSound() {
  const winSound = new Audio('../assets/Sound/win.wav');
  winSound.volume = 1;
  winSound.play().catch(error => {
    console.log('Error playing win sound:', error);
  });
}

function playLostSound() {
  const lostSound = new Audio('../assets/Sound/Lost.wav');
  lostSound.volume = 1;
  lostSound.play().catch(error => {
    console.log('Error playing lost sound:', error);
  });
}

// Make sure ALL event listeners are inside DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
  console.log("DOM fully loaded");
  
  // Check if elements exist
  const startButton = document.getElementById('start-game');
  const difficultyButtons = document.querySelectorAll('.difficulty-btn');
  
  console.log("Start button found:", !!startButton);
  console.log("Difficulty buttons found:", difficultyButtons.length);
  
  // Set up difficulty selection handlers  // Set up click handler for the start button
  handleDifficultySelection();ventListener('click', startGame);
  
  // Initialize display
  updateDisplay();
  
  // Ensure the grid is created when the page loads
  createGrid();
  
  // IMPORTANT: Move the start button event listener here
  if (startButton) {
    startButton.addEventListener('click', function() {
      console.log("Start button clicked");
      startGame();
    });
  } else {
    console.error("Start button not found! Check your HTML.");
  }
});