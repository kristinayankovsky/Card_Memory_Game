// front card
const FRONT_IMAGE = "./assets/images/front_card.jpg";

// back cards
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

// sounds
const flipSound = new Audio("./assets/sound_effects/flip.mp3");
const matchSound = new Audio("./assets/sound_effects/match.mp3");
const wrongSound = new Audio("./assets/sound_effects/wrong.mp3");

// dom
const board = document.getElementById("gameBoard");
const movesDisplay = document.getElementById("moves");
const totalMovesDisplay = document.getElementById("totalMoves");
const timeDisplay = document.getElementById("time");
const difficultySelect = document.getElementById("difficulty");
const newGameBtn = document.getElementById("newGameBtn");

// game state
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let moves = 0;
let matchedPairs = 0;
let timer = null;
let seconds = 0;

// unique key per tab
function sessionKey(key) {
  if (!sessionStorage.getItem("tabID")) {
    sessionStorage.setItem("tabID", Date.now() + "-" + Math.random());
  }
  return sessionStorage.getItem("tabID") + "-" + key;
}

// shuffle helper
const shuffle = array => [...array].sort(() => Math.random() - 0.5);

// create card
function createCard(backImage) {
  const card = document.createElement("div");
  card.classList.add("card");

  card.innerHTML = `
    <div class="card-inner">
      <div class="card-face card-front">
        <img src="${FRONT_IMAGE}">
      </div>
      <div class="card-face card-back">
        <img src="${backImage}">
      </div>
    </div>
  `;

  card.addEventListener("click", () => {
    handleCardClick(card, backImage);
    saveCardState();
  });

  return card;
}

// handle card click
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

// check match
function checkMatch() {
  if (firstCard.image === secondCard.image) {
    firstCard.card.classList.add("matched");
    secondCard.card.classList.add("matched");
    matchSound.currentTime = 0;
    matchSound.play();
    matchedPairs++;
    resetTurn();
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

// increment moves
function incrementMoves() {
  // per tab
  moves++;
  movesDisplay.textContent = moves;
  sessionStorage.setItem(sessionKey("moves"), moves);

  // across all tabs
  let totalMoves = Number(localStorage.getItem("totalMoves") || 0);
  totalMoves++;
  localStorage.setItem("totalMoves", totalMoves);
  totalMovesDisplay.textContent = totalMoves;
}

// save card state
function saveCardState() {
  const state = Array.from(board.children).map(card => ({
    flipped: card.classList.contains("flip"),
    matched: card.classList.contains("matched")
  }));
  sessionStorage.setItem(sessionKey("cards"), JSON.stringify(state));
}

// restore card state
function restoreCardState() {
  const saved = JSON.parse(sessionStorage.getItem(sessionKey("cards")) || "[]");
  saved.forEach((data, i) => {
    const card = board.children[i];
    if (!card) return;
    if (data.flipped) card.classList.add("flip");
    if (data.matched) {
      card.classList.add("matched");
      matchedPairs++;
    }
  });
}

// timer
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
  seconds = Number(sessionStorage.getItem(sessionKey("timer")) || 0);
  updateTimerDisplay();
  startTimer();
}

// restore moves
function restoreMoves() {
  moves = Number(sessionStorage.getItem(sessionKey("moves")) || 0);
  movesDisplay.textContent = moves;
}

// restore total moves
function restoreTotalMoves() {
  const total = Number(localStorage.getItem("totalMoves") || 0);
  totalMovesDisplay.textContent = total;
}

// listen for total move updates from other tabs
window.addEventListener("storage", e => {
  if (e.key === "totalMoves") {
    totalMovesDisplay.textContent = e.newValue;
  }
});

// get or create card order
function getCardOrder(size) {
  const key = sessionKey("cardOrder");
  let order = JSON.parse(sessionStorage.getItem(key) || "null");

  if (!order) {
    const totalPairs = (size * size) / 2;
    const selectedImages = BACK_IMAGES.slice(0, totalPairs);
    order = shuffle([...selectedImages, ...selectedImages]);
    sessionStorage.setItem(key, JSON.stringify(order));
  }

  return order;
}

// start game
function startGame() {

  // ensure correct difficulty on refresh
  difficultySelect.value =
    sessionStorage.getItem(sessionKey("difficulty")) || difficultySelect.value;

  board.innerHTML = "";
  matchedPairs = 0;

  restoreMoves();
  restoreTotalMoves();

  const size = Number(difficultySelect.value);

  // prevent 6x6 layout breaking
  board.style.gridTemplateColumns = `repeat(${size}, max-content)`;

  const cards = getCardOrder(size);
  cards.forEach(img => board.appendChild(createCard(img)));

  restoreCardState();
  restoreTimer();
}

// difficulty change
difficultySelect.addEventListener("change", () => {
  sessionStorage.setItem(sessionKey("difficulty"), difficultySelect.value);
  sessionStorage.removeItem(sessionKey("cardOrder"));
  sessionStorage.removeItem(sessionKey("cards"));
  sessionStorage.removeItem(sessionKey("moves"));
  sessionStorage.removeItem(sessionKey("timer"));
  seconds = 0;
  moves = 0;
  startGame();
});

// new game
newGameBtn.addEventListener("click", () => {
  sessionStorage.removeItem(sessionKey("cardOrder"));
  sessionStorage.removeItem(sessionKey("cards"));
  sessionStorage.removeItem(sessionKey("moves"));
  sessionStorage.removeItem(sessionKey("timer"));
  seconds = 0;
  moves = 0;
  startGame();
});

// init
startGame();


