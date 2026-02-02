// FRONT CARD (SAME)
const FRONT_IMAGE = "./assets/images/front_card.jpg";
// BACK CARD(S)
const BACK_IMAGES = [
  "./assets/images/back_card/purple_flower.jpg",
  "./assets/images/back_card/geese_bird.jpg",
  "./assets/images/back_card/cherry_blossom.jpg",
  "./assets/images/back_card/monarch_butterfly.jpg",
  "./assets/images/back_card/pink_magnolia_flower.jpg",
  "./assets/images/back_card/pink_tulip.jpg",
  "./assets/images/back_card/white_daisy.jpg",
  "./assets/images/back_card/yellow_bird.jpg",
  "./assets/images/back_card/pink_butterfly.jpg",
  "./assets/images/back_card/spring_fox.jpg",
  "./assets/images/back_card/orange_cat.jpg",
  "./assets/images/back_card/bumble_bee.jpg",
  "./assets/images/back_card/field_cat.jpg",
  "./assets/images/back_card/wisteria_flower.jpg",
  "./assets/images/back_card/wild_bunny.jpg",
  "./assets/images/back_card/lady_bug.jpg",
  "./assets/images/back_card/field_dog.jpg",
  "./assets/images/back_card/hum_bird.jpg",
];

// SOUNDS
const flipSound = new Audio("./assets/sound_effects/flip.mp3");
const matchSound = new Audio("./assets/sound_effects/match.mp3");
const wrongSound = new Audio("./assets/sound_effects/wrong.mp3");

// DOM
const board = document.getElementById("gameBoard");
const movesDisplay = document.getElementById("moves");
const totalMovesDisplay = document.getElementById("totalMoves");
const timeDisplay = document.getElementById("time");
const difficultySelect = document.getElementById("difficulty");
const newGameBtn = document.getElementById("newGameBtn");

// GAME STATE
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let moves = 0;
let matchedPairs = 0;
let timer = null;
let seconds = 0;

// SESSION KEY FOR THIS TAB
function sessionKey(key) {
  if (!sessionStorage.getItem("tabID")) {
    sessionStorage.setItem("tabID", Date.now() + "-" + Math.random());
  }
  return sessionStorage.getItem("tabID") + "-" + key;
}

// SHUFFLE ARRAY
const shuffle = array => [...array].sort(() => Math.random() - 0.5);

// CREATE CARD
function createCard(backImage) {
  const card = document.createElement("div");
  card.classList.add("card");

  card.innerHTML = `
    <div class="card-inner">
      <div class="card-face card-front">
        <img src="${FRONT_IMAGE}" alt="card front" />
      </div>
      <div class="card-face card-back">
        <img src="${backImage}" alt="card back" />
      </div>
    </div>
  `;

  card.addEventListener("click", () => {
    handleCardClick(card, backImage);
    saveCardState();
  });

  return card;
}

// HANDLE CARD CLICK
function handleCardClick(card, image) {
  if (lockBoard || card === firstCard?.card || card.classList.contains("matched")) return;

  card.classList.add("flip");
  flipSound.currentTime = 0; 
  flipSound.play(); 

  if (!firstCard) {
    firstCard = { card, image };
    return;
  }

  secondCard = { card, image };
  incrementMoves();
  checkMatch();
}

// CHECK MATCH
function checkMatch() {
  if (firstCard.image === secondCard.image) {
    firstCard.card.classList.add("matched");
    secondCard.card.classList.add("matched");
    matchSound.currentTime = 0;
    matchSound.play();  
    matchedPairs++;
    resetTurn();

    if (matchedPairs === board.children.length / 2) {
      clearInterval(timer);
      setTimeout(() => {
        alert(` Game Over!\nMoves: ${moves}\nTime: ${timeDisplay.textContent}`);
      }, 300);
    }
  } else {
    lockBoard = true;
    wrongSound.currentTime = 0;
    wrongSound.play(); 
    setTimeout(() => {
      firstCard.card.classList.remove("flip");
      secondCard.card.classList.remove("flip");
      resetTurn();
    }, 800);
  }
}

function resetTurn() {
  [firstCard, secondCard, lockBoard] = [null, null, false];
}

// INCREMENT MOVES
function incrementMoves() {
  moves++;
  movesDisplay.textContent = moves;
  sessionStorage.setItem(sessionKey("moves"), moves);

  // total moves across all tabs
  let totalMoves = Number(localStorage.getItem("totalMoves") || 0);
  totalMoves++;
  localStorage.setItem("totalMoves", totalMoves);
  totalMovesDisplay.textContent = totalMoves;
}

// SAVE / RESTORE CARD STATE
function saveCardState() {
  const state = Array.from(board.children).map(card => ({
    image: card.querySelector(".card-back img").src,
    flipped: card.classList.contains("flip"),
    matched: card.classList.contains("matched")
  }));
  sessionStorage.setItem(sessionKey("cards"), JSON.stringify(state));
}

function restoreCardState() {
  const saved = JSON.parse(sessionStorage.getItem(sessionKey("cards")) || "[]");
  saved.forEach((data, i) => {
    const card = board.children[i];
    if (!card) return;
    if (data.flipped) card.classList.add("flip");
    if (data.matched) card.classList.add("matched");
    if (data.matched) matchedPairs++;
  });
}

// TIMER
function startTimer() {
  clearInterval(timer);
  timer = setInterval(() => {
    seconds++;
    updateTimerDisplay();
    sessionStorage.setItem(sessionKey("timer"), seconds);
  }, 1000);
}

function updateTimerDisplay() {
  const min = String(Math.floor(seconds / 60)).padStart(2, "0");
  const sec = String(seconds % 60).padStart(2, "0");
  timeDisplay.textContent = `${min}:${sec}`;
}

function restoreTimer() {
  const saved = Number(sessionStorage.getItem(sessionKey("timer")) || 0);
  seconds = saved;
  updateTimerDisplay();
  startTimer();
}

// RESTORE MOVES
function restoreMoves() {
  moves = Number(sessionStorage.getItem(sessionKey("moves")) || 0);
  movesDisplay.textContent = moves;
}

function restoreTotalMoves() {
  const total = Number(localStorage.getItem("totalMoves") || 0);
  totalMovesDisplay.textContent = total;
}

// LISTEN TO TOTAL MOVES IN OTHER TABS
window.addEventListener("storage", e => {
  if (e.key === "totalMoves") {
    totalMovesDisplay.textContent = e.newValue;
  }
});

// GET OR CREATE CARD ORDER
function getCardOrder(size) {
  const key = sessionKey("cardOrder");
  let savedOrder = JSON.parse(sessionStorage.getItem(key) || "null");

  if (!savedOrder) {
    const totalPairs = (size * size) / 2;
    const selectedImages = BACK_IMAGES.slice(0, totalPairs);
    const cards = shuffle([...selectedImages, ...selectedImages]);
    sessionStorage.setItem(key, JSON.stringify(cards));
    savedOrder = cards;
  }

  return savedOrder;
}

// START GAME
function startGame() {
  // Restore difficulty for this tab
  const savedDifficulty = sessionStorage.getItem(sessionKey("difficulty"));
  if (savedDifficulty) difficultySelect.value = savedDifficulty;

  board.innerHTML = "";
  matchedPairs = 0;

  restoreMoves();
  restoreTotalMoves();

  const size = Number(difficultySelect.value);
  board.style.gridTemplateColumns = `repeat(${size}, auto)`; // keep your CSS widths

  const cards = getCardOrder(size);
  cards.forEach(image => board.appendChild(createCard(image)));

  restoreCardState();
  restoreTimer();
}

// DIFFICULTY CHANGE 
difficultySelect.addEventListener("change", () => {
  const currentDifficulty = difficultySelect.value;
  const prevDifficulty = sessionStorage.getItem(sessionKey("prevDifficulty"));

  if (currentDifficulty !== prevDifficulty) {
    sessionStorage.setItem(sessionKey("prevDifficulty"), currentDifficulty);
    sessionStorage.removeItem(sessionKey("cardOrder")); // reshuffle for new difficulty
    sessionStorage.removeItem(sessionKey("cards"));     // reset flipped/matched cards
    sessionStorage.removeItem(sessionKey("moves"));     // reset moves
    sessionStorage.removeItem(sessionKey("timer"));     // reset timer
    seconds = 0;
    moves = 0;
  }

  startGame(); // rebuild board immediately
});

// NEW GAME BUTTON
newGameBtn.addEventListener("click", () => {
  sessionStorage.removeItem(sessionKey("cardOrder")); // force reshuffle
  sessionStorage.removeItem(sessionKey("cards"));     // reset flipped/matched
  sessionStorage.removeItem(sessionKey("moves"));     // reset moves
  sessionStorage.removeItem(sessionKey("timer"));     // reset timer
  seconds = 0;
  moves = 0;
  startGame();
});

// INIT
startGame();
