// * for play button dom
const playbtn = $("#play");

// * Grid Selection Option dom
const gridSelection = $("#grid-options");

// * Variable to store the no of grids selected by user
let noOfGrids = 0;

// * Start page dom
const startPageDom = $("#start-game");

// * Game Page Dom
const gamePageDom = $("#game-page");

// * Grid box DOm
const gridBoxDom = $("#grids");

// * Array To Store the Symbols of total 32
let symbols = [];

// * Array to Store the timer
let timer = {};

// * Array to store the grids boxes
let grid_box = [];

// * To store the Number of pairs found
let pairs = 0;

// * To Store the number of moves made
let moves = 0;

// * To store the timer minutes with seconds
let minutes = 0;
let seconds = 0;

// * Current progress of the progress bar
let progress = 0;

// * Increment of the progress bar
let inc = 0;

// * Array to store the click element
let flipped_Elements = [];

// * To store the setinterval id.
let interval = 0;

// * DOM of modal
const gameModal = $("#game-modal");

// * Boostrap function of modal
let myModal = undefined;

// * flag to check if the game is Paused
let isPaused = false;

// * Selecting the label of the moves and pairs
const pairsFoundlabel = $("#pairs-found-label");
const movesLabel = $("#moves-label");

// * Toast DOM
const toast = $("#game-toast");

// ! Document Ready event to load all the required after the dom is ready
$(function () {
  myModal = new bootstrap.Modal("#game-modal", {
    backdrop: "static",
    keyboard: false,
  });
  symbols = data?.symbols;
  timer = data?.timer;
  createGridSelectOption();
});

// ? Function to dynamically create options
function createGridSelectOption() {
  for (const value in timer) {
    gridSelection.append($("<option>").val(value).text(`${value} x ${value}`));
  }
}

// ? Function to toggle the toast whether to show or hide
function toggleToast(toHide) {
  toast.removeClass(toHide ? "hide-toast" : "show-toast");
  toast.addClass(toHide ? "show-toast" : "hide-toast");
}

// ? Function to create the div Element boxes or grid card
function createElement(className, value, isFirst) {
  let flipContainer = $("<div>")
    .addClass("game-card flip-container")
    .attr("id", isFirst ? value : `idx${value}`);
  let flipInner = $("<div>").addClass("flip-inner");
  let frontElement = $("<div>")
    .addClass(`flip-front front single-card card-hover`)
    .data("place", value);
  let backElement = $("<div>")
    .addClass(`bi ${className} flip-back back single-card`)
    .data("place", value); // data-place
  flipInner.append(frontElement, backElement);
  return flipContainer.append(flipInner);
}

// ? Shuffle The array of the grid box
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    let temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}

// ? Function to set to game page
function setGame(grids) {
  symbols = shuffleArray(symbols);
  minutes = timer[grids];
  gridBoxDom.css("grid-template-columns", "auto ".repeat(grids));
  inc = 100 / (minutes * 60);
  for (let i = 0; i < (grids * grids) / 2; i++) {
    grid_box.push(
      createElement(symbols[i], i, true),
      createElement(symbols[i], i, false)
    );
  }
  grid_box = shuffleArray(grid_box);
  gridBoxDom.append(grid_box);
  assignfunctionalityTOCards();
  startInterval();
}

// ? Function to set or remove Start Page
function setStartPage(isStart) {
  startPageDom.toggle(isStart);
  gamePageDom.prop("hidden", isStart);
  if (!isStart) setGame(noOfGrids);
}

// ! Event listener if page is refereshed
$(window).on("beforeunload", function (e) {
  e.preventDefault();
});

// ! Event Listener for play button
playbtn.click(function () {
  if (gridSelection.val() === "select") {
    alert("Please Select Proper No of Grids.");
  } else {
    noOfGrids = gridSelection.val();
    setStartPage(false);
  }
});

// ? Increase Moves function
function updateMoves(reset = false) {
  moves = reset ? 0 : moves + 1;
  movesLabel.text(moves);
}

// ? function to increase the pairs
function updatePairs(reset = false) {
  pairs = reset ? 0 : pairs + 1;
  pairsFoundlabel.text(pairs);
}

// ? Function to assign the flip functionality to each card
function assignfunctionalityTOCards() {
  // * Game Card div DOM
  let gameCards = $(".front");

  // * Click functions on each game card
  gameCards.on("click", function (e) {
    $(e.target).parents(".flip-container").addClass("flipped");
    updateMoves();
    flipped_Elements.push(e.target);
    if (flipped_Elements.length >= 2 && flipped_Elements.length <= 2) {
      checkmatched();
    }
  });
}

// ! Home Button Functionality
$("#home-btn").click(homeButtonFunctionality);

// ! Pause Button Functionality
$("#pause-btn").click(() => {
  pauseFunctionality(true);
  showModal(
    "Paused",
    `
    <div class="d-flex flex-column align-items-center gap-2">
    <img src="./Images/pause.png" alt="pause image" style="width:80px;">
    <h4>Game Paused !</h4>
    <div class="d-flex justify-content-center align-items-center gap-3">
    <button class="btn btn-outline-primary px-4 py-0 rounded-2 d-flex align-items-center gap-2" id="modal-play-btn">
    <span class="bi bi-play-circle-fill fs-3">
    </span>
    <span class="fs-5">
    PLAY
    </span>
    </button>
    <button class="btn btn-success px-4 py-0 rounded-2 d-flex align-items-center gap-2" id="modal-home-btn">
    <span class=" bi bi-house-fill fs-3">
    </span>
    <span class="fs-5">
    HOME
    </span>
    </button>
    </div> 
    </div>`
  );
});

// ? Pause button functionality
function pauseFunctionality(toPauseGame) {
  isPaused = toPauseGame;
}

// ? These Functions resets all the variables
function resetALL() {
  flipped_Elements = [];
  minutes = seconds = pairs = moves = interval = noOfGrids = progress = inc = 0;
  grid_box = [];
  gridSelection.val("select");
  $("#timer").html(`<b>00</b> min : <b>00</b> secs`);
  $("#time-bar").css("width", "0%");
  updateMoves(true);
  updatePairs(true);
  gridBoxDom.empty();
  isPaused = false;
  clearInterval(interval);
}

// ? function to start the interval or timer with progress bar.
function startInterval() {
  interval = setInterval(function () {
    if (!isPaused) {
      if (seconds === 0) {
        seconds = 59;
        minutes--;
      } else {
        seconds--;
      }
      if (minutes === 0 && seconds === 0) {
        clearInterval(interval);
        if (!checkIsWinner()) {
          showModal(
            "Time OUT !",
            getModalMessage(
              "./Images/timeout.png",
              "You LOST !",
              `<span>Time Given: <b>${timer[noOfGrids]}</b> min : <b>00</b> secs</span>`
            )
          );
        }
      }
      $("#timer").html(`<b>${minutes}</b> min : <b>${seconds}</b> secs`);
      progress += inc;
      $("#time-bar").css("width", progress + "%");
    }
  }, 1000);
}

// ? Show toasts function
function showToast(text, icon) {
  toggleToast(true);
  $("#toast-body").text(text);
  $("#toast-icon").addClass(icon);
  setTimeout(() => toggleToast(false), 2800);
}

// ? flip Back for the Pushed element.
function flipBack() {
  const tempElem = flipped_Elements.splice(0, 2);
  tempElem.forEach((value) => {
    $(value).parents(".flip-container").removeClass("flipped");
  });
}

// ? Match pairs found function
function checkmatched() {
  // data-place =0
  if (
    $(flipped_Elements[0]).data("place") ===
    $(flipped_Elements[1]).data("place")
  ) {
    updatePairs();
    showToast("You found New Pair", "bi-check-circle-fill");
    if (checkIsWinner()) clearInterval(interval);
    flipped_Elements = [];
  } else {
    setTimeout(flipBack, 400);
  }
}

// ? Function to Calculate difference between two timers
function calculateDiffTime() {
  const timeAllotatedInSeconds = timer[noOfGrids] * 60;
  const remainingTimeInSeconds = minutes * 60 + seconds;
  const differenceTimeinSeconds =
    timeAllotatedInSeconds - remainingTimeInSeconds;
  const diffMinutes = Math.floor(differenceTimeinSeconds / 60);
  const diffSeconds = differenceTimeinSeconds % 60;
  return [diffMinutes, diffSeconds];
}

// ? Returns the modal message
function getModalMessage(image, winner, timeMessage) {
  return `
    <div class="d-flex gap-3 justify-content-center flex-column align-items-center">
    <img src="${image}" class="img-modal-body" alt="winner or loser image">
    <h4>${winner}</h4>
    <div class="d-flex gap-2 flex-column">
   ${timeMessage}
    <span>Moves : <b>${moves}</b></span>
    <span>Pairs Found : <b>${pairs}</b></span>
    </div>
    </div>
    `;
}

// ? Function to check if game is in winning mode.
function checkIsWinner() {
  if (pairs === (noOfGrids * noOfGrids) / 2) {
    let [diffMinutes, diffSeconds] = calculateDiffTime();
    showModal(
      "Congratulations !",
      getModalMessage(
        "./Images/winner.png",
        "You Won !!",
        `<span>Time Taken: <b>${diffMinutes}</b> min : <b>${diffSeconds}</b> secs</span>`
      )
    );
    return true;
  }
  return false;
}

// ? Function to reset all variable and go back to start page.
function startNewGame() {
  resetALL();
  setStartPage(true);
}

// ? Home button which asks for the confirmation
function homeButtonFunctionality() {
  window.location.reload();
}

// ? these function shows the modal whenever the timeout and wins the game.
function showModal(title, html) {
  gameModal
    .find(".modal-footer button,.modal-header button")
    .click(startNewGame);
  gameModal.find(".modal-title").text(title);
  gameModal.find(".modal-body").html(html);
  gameModal.find(".modal-footer,.modal-header button").show();
  if (isPaused) {
    gameModal.find(".modal-footer,.modal-header button").hide();
    gameModal.find(".modal-body div > #modal-play-btn").click(function () {
      pauseFunctionality(false);
      myModal.hide();
    });
    gameModal
      .find(".modal-body div> #modal-home-btn")
      .click(homeButtonFunctionality);
  }
  myModal.show();
}
