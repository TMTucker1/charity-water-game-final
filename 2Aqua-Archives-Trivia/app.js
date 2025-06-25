class WaterCrisisTrivia {
    constructor() {
        this.score = 0;
        this.timeLeft = 30;
        this.timer = null;
        this.isAnswered = false;
        this.questionPool = [];
        
        // Add high score tracking
        this.highScore = this.getHighScore();
        
        // Additional water crisis facts for "Did You Know?" popup
        this.didYouKnowFacts = [
            "The human body is about 60% water, and we can only survive 3-5 days without it.",
            "It takes 2,700 liters of water to produce a single cotton t-shirt.",
            "A leaky faucet can waste over 3,000 gallons of water per year.",
            "Only 0.007% of the planet's water is available to fuel and feed its 6.8 billion people.",
            "The average distance women in Africa and Asia walk to collect water is 3.7 miles.",
            "Water-related diseases are responsible for more deaths in children than HIV/AIDS, malaria, and tuberculosis combined.",
            "Americans use 5 times the amount of water that Europeans use daily.",
            "A person can live about a month without food, but only about a week without water.",
            "More people have access to a mobile phone than to a toilet.",
            "The weight of water that women in Africa and Asia carry on their heads is equivalent to airline luggage limits - 44 pounds.",
            "Unsafe water kills more children each year than war, malaria, HIV/AIDS and traffic accidents combined.",
            "Every 20 seconds, a child dies from a water-related disease.",
            "Agriculture accounts for 70% of global freshwater use.",
            "By 2025, half of the world's population will be living in water-stressed areas.",
            "Clean water and sanitation can increase a country's GDP by up to 7%.",
            "In Madagascar, children under 5 are 3 times more likely to die if they don't have access to improved water sources.",
            "Treating diarrhea costs $43 billion annually in India alone.",
            "Girls are twice as likely to be out of school in areas without clean water.",
            "180 million people drink water that puts them at risk of getting cancer.",
            "Water scarcity affects 40% of the global population and this figure is rising.",
            "One flush of a Western toilet uses as much water as most Africans have for an entire day's washing, drinking, cleaning and cooking.",
            "The UN estimates that each person needs a minimum of 20 liters of clean water a day for basic needs.",
            "Climate change could displace 200 million people by 2050 due to water scarcity.",
            "Over 2 billion people live in countries experiencing high water stress.",
            "Improving water supply and sanitation could prevent 361,000 deaths of children under 5 each year."
        ];
        fetch('../assets/Sound/win.wav')
          .then(response => console.log('Win sound exists:', response.ok))
          .catch(error => console.error('Error checking win sound:', error));
        
        fetch('../assets/Sound/Lost.wav')
          .then(response => console.log('Lost sound exists:', response.ok))
          .catch(error => console.error('Error checking lost sound:', error));        
        this.initializeElements();
        this.bindEvents();
        this.updateHighScoreDisplay();
        
        // Add debug console log for audio paths
        console.log("Audio files should be located at:");
        console.log("../assets/Sound/win.wav");
        console.log("../assets/Sound/Lost.wav");
        
        // Check if Audio API is available
        console.log("Audio API available:", typeof Audio !== 'undefined');
    }
    
    // Get high score from localStorage
    getHighScore() {
        return parseInt(localStorage.getItem('waterTriviaHighScore') || 0);
    }
    
    // Save high score to localStorage
    saveHighScore(newScore) {
        if (newScore > this.highScore) {
            this.highScore = newScore;
            localStorage.setItem('waterTriviaHighScore', this.highScore);
            return true; // Return true if it's a new high score
        }
        return false; // Return false if not a new high score
    }
    
    // Reset high score
    resetHighScore() {
        if (confirm('Are you sure you want to reset your high score?')) {
            localStorage.removeItem('waterTriviaHighScore');
            this.highScore = 0;
            this.updateHighScoreDisplay();
            alert('High score has been reset!');
        }
    }
    
    // Update high score display
    updateHighScoreDisplay() {
        // You'll need to add this element to your HTML
        const highScoreElement = document.getElementById('high-score');
        if (highScoreElement) {
            highScoreElement.textContent = this.highScore;
        }
    }
    
    initializeElements() {
        this.startButton = document.getElementById('start-mission');
        this.quizContainer = document.getElementById('quiz-container');
        this.missionButton = document.querySelector('.mission-button');
        this.questionText = document.getElementById('question-text');
        this.answersContainer = document.getElementById('answers-container');
        this.feedback = document.getElementById('feedback');
        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('high-score');
        this.timerElement = document.getElementById('timer');
        this.timerBar = document.getElementById('timer-bar');
        this.resultScreen = document.getElementById('result-screen');
        this.resultTitle = document.getElementById('result-title');
        this.resultMessage = document.getElementById('result-message');
        this.playAgainButton = document.getElementById('play-again');
    }
    
    bindEvents() {
        this.startButton.addEventListener('click', () => this.startGame());
        this.playAgainButton.addEventListener('click', () => this.resetGame());
        
        // Add event listener for reset high score button
        const resetHighScoreBtn = document.getElementById('reset-high-score');
        if (resetHighScoreBtn) {
            resetHighScoreBtn.addEventListener('click', () => this.resetHighScore());
        }
    }
    
    startGame() {
        this.score = 0;
        this.timeLeft = 30;
        this.questionPool = [...questions]; // Assuming 'questions' is imported or defined elsewhere
        this.shuffleQuestions();
        this.isAnswered = false;
        
        this.missionButton.classList.add('hidden');
        this.quizContainer.classList.remove('hidden');
        this.resultScreen.classList.add('hidden');
        
        this.updateScore();
        this.startTimer();
        this.showNextQuestion();
    }
    
    shuffleQuestions() {
        // Fisher-Yates shuffle algorithm
        for (let i = this.questionPool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.questionPool[i], this.questionPool[j]] = [this.questionPool[j], this.questionPool[i]];
        }
    }
    
    startTimer() {
        this.timerBar.style.width = '100%';
        this.timerElement.textContent = this.timeLeft;
        
        clearInterval(this.timer);
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.timerElement.textContent = this.timeLeft;
            
            // Update timer bar
            const percentage = (this.timeLeft / 30) * 100;
            this.timerBar.style.width = `${percentage}%`;
            
            // Add warning effect when time is running low
            if (this.timeLeft <= 10) {
                this.timerBar.classList.add('timer-warning');
            }
            
            if (this.timeLeft <= 0) {
                clearInterval(this.timer);
                this.endGame();
            }
        }, 1000);
    }
    
    showNextQuestion() {
        // If we've gone through all questions, shuffle and start over
        if (this.questionPool.length === 0) {
            this.questionPool = [...questions];
            this.shuffleQuestions();
        }
        
        // Get the next question
        const currentQuestion = this.questionPool.pop();
        this.questionText.textContent = currentQuestion.question;
        
        this.answersContainer.innerHTML = '';
        this.feedback.classList.add('hidden');
        this.isAnswered = false;
        
        currentQuestion.answers.forEach((answer, index) => {
            const button = document.createElement('button');
            button.textContent = answer;
            button.className = 'answer-btn';
            button.addEventListener('click', () => this.selectAnswer(index, currentQuestion));
            this.answersContainer.appendChild(button);
        });
    }
    
    selectAnswer(selectedIndex, question) {
        if (this.isAnswered) return;
        
        this.isAnswered = true;
        const answerButtons = this.answersContainer.querySelectorAll('.answer-btn');
        
        answerButtons.forEach((button, index) => {
            button.classList.add('disabled');
            if (index === question.correct) {
                button.classList.add('correct');
            } else if (index === selectedIndex) {
                button.classList.add('incorrect');
            }
        });
        
        if (selectedIndex === question.correct) {
            this.score += 10; // Award 10 points per correct answer
            this.showFeedback(true, "Correct! +10 points");
        } else {
            this.showFeedback(false, `Incorrect. The correct answer is: ${question.answers[question.correct]}`);
        }
        
        this.updateScore();
        
        // Show next question after a brief delay
        setTimeout(() => {
            if (this.timeLeft > 0) {
                this.showNextQuestion();
            }
        }, 1000);
    }
    
    showFeedback(isCorrect, message) {
        this.feedback.textContent = message;
        this.feedback.className = `feedback ${isCorrect ? 'correct' : 'incorrect'}`;
        this.feedback.classList.remove('hidden');
        
        // Hide feedback after a brief time
        setTimeout(() => {
            this.feedback.classList.add('hidden');
        }, 900);
    }
    
    updateScore() {
        this.scoreElement.textContent = this.score;
    }
    
    updateHighScoreDisplay() {
        if (this.highScoreElement) {
            this.highScoreElement.textContent = this.highScore;
        }
    }
    
    playWinSound() {
        try {
            const winSound = new Audio('..assets/Sound/win.wav'); // Adjust path as needed
            winSound.volume = 1;
            winSound.play().catch(error => {
                console.log('Error playing win sound, using fallback:', error);
                this.playFallbackSound('win');
            });
        } catch (error) {
            console.log('Error creating Audio object, using fallback:', error);
            this.playFallbackSound('win');
        }
    }
    
    playLostSound() {
        // Try multiple possible paths
        const paths = [
            '../assets/Sound/Lost.wav',       // Original path
            '../assets/Sound/lost.wav',       // Lowercase filename
            '../assets/sound/Lost.wav',       // Lowercase folder
            '../../assets/Sound/Lost.wav',    // One level up
            '/assets/Sound/Lost.wav',         // Absolute path
            './assets/Sound/Lost.wav'         // Local path
        ];
        
        this.playAudioWithFallback(paths);
    }
    
    // New helper method to try multiple paths
    playAudioWithFallback(paths) {
        // Log all paths we're trying
        console.log("Attempting to play audio using these paths:", paths);
        
        // Try the first path
        const tryPath = (index) => {
            if (index >= paths.length) {
                console.error("All audio paths failed to load");
                return;
            }
            
            const audio = new Audio(paths[index]);
            audio.volume = 1;
            
            // Add event listeners to track success or failure
            audio.addEventListener('canplaythrough', () => {
                console.log(`Successfully loaded audio: ${paths[index]}`);
                audio.play();
            });
            
            audio.addEventListener('error', () => {
                console.log(`Failed to load audio: ${paths[index]}, trying next path...`);
                tryPath(index + 1);
            });
            
            // Start loading the audio
            audio.load();
        };
        
        tryPath(0);
    }
    
    // Add this method to your class
    playFallbackSound(type) {
        try {
            // Create oscillator for basic sounds
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            if (type === 'win') {
                // Happy sound
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
                gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
                oscillator.start();
                oscillator.stop(audioCtx.currentTime + 0.2);
                
                setTimeout(() => {
                    const osc2 = audioCtx.createOscillator();
                    osc2.connect(gainNode);
                    osc2.frequency.setValueAtTime(1320, audioCtx.currentTime); // E6
                    osc2.start();
                    osc2.stop(audioCtx.currentTime + 0.2);
                }, 200);
            } else {
                // Sad sound
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(440, audioCtx.currentTime); // A4
                gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
                oscillator.start();
                oscillator.stop(audioCtx.currentTime + 0.2);
                
                setTimeout(() => {
                    const osc2 = audioCtx.createOscillator();
                    osc2.connect(gainNode);
                    osc2.frequency.setValueAtTime(349.23, audioCtx.currentTime); // F4
                    osc2.start();
                    osc2.stop(audioCtx.currentTime + 0.3);
                }, 200);
            }
            
            console.log(`Playing fallback ${type} sound`);
        } catch (e) {
            console.error("Failed to play fallback sound:", e);
        }
    }
    
    endGame() {
        clearInterval(this.timer);
        this.quizContainer.classList.add('hidden');
        this.resultScreen.classList.remove('hidden');
        
        // Store the current high score before updating
        const previousHighScore = this.highScore;
        
        // Check if this is a new high score
        const isNewHighScore = this.saveHighScore(this.score);
        this.updateHighScoreDisplay();
        
        // Play appropriate sound based on high score comparison
        if (isNewHighScore) {
            console.log("Playing win sound for new high score");
            this.playWinSound(); // Play win sound for new high score
            
            this.resultTitle.textContent = "🎉 New High Score! 🎉";
            this.resultTitle.style.color = "#4CAF50";
            this.resultMessage.innerHTML = `
                Congratulations! You've set a new high score of ${this.score} points!<br>
                Your knowledge about the water crisis is impressive. Keep up the great work!<br><br>
                <strong>Challenge:</strong> Can you beat your own record? Try again!
            `;
        } else if (previousHighScore > 0) { 
            // Only play lost sound if there was a previous high score to beat
            console.log("Playing lost sound - didn't beat high score");
            this.playLostSound();
            
            this.resultTitle.textContent = "Time's Up!";
            this.resultTitle.style.color = "#f44336";
            this.resultMessage.innerHTML = `
                You scored ${this.score} points.<br>
                The highest score is ${this.highScore} points.<br><br>
                Play again to improve your score and learn more about the global water crisis!
            `;
        }
        
        // Show "Did You Know?" popup after a short delay
        setTimeout(() => {
            this.showDidYouKnowPopup();
        }, 2000);
    }
    
    // NEW METHOD: Show "Did You Know?" popup
    showDidYouKnowPopup() {
        // Get a random fact that wasn't in the quiz
        const randomFact = this.didYouKnowFacts[Math.floor(Math.random() * this.didYouKnowFacts.length)];
        
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
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            color: white;
            padding: 30px;
            border-radius: 20px;
            max-width: 500px;
            margin: 20px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            animation: slideIn 0.4s ease-out;
            position: relative;
            border: 3px solid #00d4ff;
        `;
        
        popup.innerHTML = `
            <div style="text-align: center;">
                <div style="font-size: 3rem; margin-bottom: 15px;">💡</div>
                <h2 style="color: #00d4ff; margin-bottom: 20px; font-size: 28px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">
                    Did You Know?
                </h2>
                <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 15px; margin-bottom: 25px; backdrop-filter: blur(10px);">
                    <p style="font-size: 18px; line-height: 1.6; margin: 0;">
                        ${randomFact}
                    </p>
                </div>
                <p style="font-size: 14px; opacity: 0.8; margin-bottom: 20px;">
                    Keep learning and spreading awareness about the global water crisis!
                </p>
                <button id="close-did-you-know" style="
                    background: linear-gradient(45deg, #00d4ff, #0099cc);
                    color: white;
                    border: none;
                    padding: 12px 30px;
                    border-radius: 25px;
                    font-size: 16px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 15px rgba(0,212,255,0.3);
                ">Got It!</button>
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
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
        `;
        document.head.appendChild(style);
        
        overlay.appendChild(popup);
        document.body.appendChild(overlay);
        
        // Close popup functionality
        const closeButton = popup.querySelector('#close-did-you-know');
        closeButton.onclick = function() {
            overlay.style.animation = 'fadeOut 0.3s ease-out forwards';
            setTimeout(() => {
                if (document.body.contains(overlay)) {
                    document.body.removeChild(overlay);
                }
                if (document.head.contains(style)) {
                    document.head.removeChild(style);
                }
            }, 300);
        };
        
        // Add hover effect to button
        closeButton.addEventListener('mouseover', () => {
            closeButton.style.transform = 'translateY(-2px)';
            closeButton.style.boxShadow = '0 6px 20px rgba(0,212,255,0.4)';
        });
        
        closeButton.addEventListener('mouseout', () => {
            closeButton.style.transform = 'translateY(0)';
            closeButton.style.boxShadow = '0 4px 15px rgba(0,212,255,0.3)';
        });
        
        // Close on overlay click (but not popup content)
        overlay.onclick = function(e) {
            if (e.target === overlay) {
                closeButton.click();
            }
        };
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new WaterCrisisTrivia();
});