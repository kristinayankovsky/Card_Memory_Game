// FRONT CARD (SAME)
const FRONT_IMAGE = "./assets/images/front_card.jpg";
//BACK CARD(S)
const BACK_IMAGES = [
    "./assets/images/back_card/purple_flower.jpg", //CARD 1
    "./assets/images/back_card/geese_bird.jpg", //CARD 2
    "./assets/images/back_card/cherry_blossom.jpg", //CARD 3
    "./assets/images/back_card/monarch_butterfly.jpg", //CARD 4
    "./assets/images/back_card/pink_magnolia_flower.jpg", //CARD 5
    "./assets/images/back_card/pink_tulip.jpg", //CARD 6
    "./assets/images/back_card/white_daisy.jpg", //CARD 7
    "./assets/images/back_card/yellow_bird.jpg", //CARD 8
    "./assets/images/back_card/pink_butterfly.jpg", //CARD 9
    "./assets/images/back_card/spring_fox.jpg", //CARD 10
    "./assets/images/back_card/orange_cat.jpg", //CARD 11
    "./assets/images/back_card/bumble_bee.jpg", //CARD 12
    "./assets/images/back_card/field_cat.jpg", //CARD 13
    "./assets/images/back_card/wisteria_flower.jpg", //CARD 14
    "./assets/images/back_card/wild_bunny.jpg", //CARD 15
    "./assets/images/back_card/lady_bug.jpg", //CARD 16
    "./assets/images/back_card/field_dog.jpg", //CARD 17
    "./assets/images/back_card/hum_bird.jpg", //CARD 18 
];

//SOUNDS

const flipSound = new Audio("./assets/sound_effects/flip.mp3");
const matchSound = new Audio("./assets/sound_effects/match.mp3");
const wrongSound = new Audio("./assets/sound_effects/wrong.mp3");





//DOM 
const board = document.getElementById("gameBoard");
const movesDisplay = document.getElementById("moves");
const timeDisplay = document.getElementById("time");
const difficultySelect = document.getElementById("difficulty");
const newGameBtn = document.getElementById("newGameBtn");

//GAME STATE
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let moves = 0;
let matchedPairs = 0;
let timer = null;
let seconds = 0;

//Functionality
const shuffle = array => [...array].sort(() => Math.random() - 0.5);
//Card creation
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

  card.addEventListener("click", () => handleCardClick(card, backImage));
  return card;
}




//Event handle
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
    moves++;
    movesDisplay.textContent = moves;

    checkMatch();
}

//Game Logic
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

//Timer
function startTimer() {
  clearInterval(timer);
  seconds = 0;

  timer = setInterval(() => {
    seconds++;
    const min = String(Math.floor(seconds / 60)).padStart(2, "0");
    const sec = String(seconds % 60).padStart(2, "0");
    timeDisplay.textContent = `${min}:${sec}`;
  }, 1000);
}

//New game
function startGame() {
  board.innerHTML = "";
  moves = 0;
  matchedPairs = 0;
  movesDisplay.textContent = "0";
  timeDisplay.textContent = "00:00";

  const size = Number(difficultySelect.value);
  board.style.gridTemplateColumns = `repeat(${size}, max-content)`;


  const totalPairs = (size * size) / 2;
  const selectedImages = BACK_IMAGES.slice(0, totalPairs);
  const cards = shuffle([...selectedImages, ...selectedImages]);

  cards.forEach(image => board.appendChild(createCard(image)));

  startTimer();
}
//Listeners
newGameBtn.addEventListener("click", startGame);
difficultySelect.addEventListener("change", startGame);

// init

startGame();