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

// * Selecting the label of the moves and pairs
const pairsFoundlabel = $("#pairs-found-label");
const movesLabel = $("#moves-label");

// * To fetch the json data for storing the symbols and timer
$.getJSON("https://api.npoint.io/b3fe4e7c0075bd200b4d", function (res) {
  symbols = res?.symbols;
  timer = res?.timer;
  createGridSelectOption();
}).fail(function () {
  alert("API Failed to get the data.");
});

// ? Function to dynamically create options
function createGridSelectOption() {
  Object.keys(timer).forEach((value) => {
    gridSelection.append($("<option>").val(value).text(`${value} x ${value}`));
  });
}

// ? Function to create the div Element boxes
function createElement(className, value, isFirst) {
  let divElement = $("<div>")
    .addClass("game-card")
    .attr("id", isFirst ? value : `idx${value}`);
  let frontElement = $("<div>")
    .addClass(`front single-card ${className}`)
    .data("place", value);
  let backElement = $("<div>")
    .addClass(`bi ${className} back single-card`)
    .data("place", value);
  return divElement.append(frontElement, backElement);
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
  let gameCards = $(".game-card");

  // * Attaching the flip function to every game cards
  gameCards.each(function (idx, value) {
    $(value)
      .flip({ trigger: "manual", speed: "300" })
      .click(function () {
        $(this).flip(true);
      });
  });

  // * Click functions on each game card
  gameCards.on("click", function (e) {
    if (!$(e.target).is(".back")) {
      updateMoves();
      flipped_Elements.push(e.target);
      if (flipped_Elements.length >= 2) {
        checkmatched();
      }
    }
  });
}

// ? These Functions resets all the variables
function resetALL() {
  flipped_Elements = [];
  minutes = 0;
  seconds = 0;
  pairs = 0;
  moves = 0;
  interval = 0;
  grid_box = [];
  noOfGrids = 0;
  gridSelection.val("select");
  progress = 0;
  $("#timer").html(`<b>00</b> min : <b>00</b> secs`);
  $("#time-bar").css("width", "0%");
  updateMoves(true);
  updatePairs(true);
  gridBoxDom.empty();
}

// ? function to start the interval or timer with progress bar.
function startInterval() {
  interval = setInterval(function () {
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
          getModalMessage("../Images/timeout.png", "You LOST !")
        );
      }
    }
    $("#timer").html(`<b>${minutes}</b> min : <b>${seconds}</b> secs`);
    progress += inc;
    $("#time-bar").css("width", progress + "%");
  }, 1000);
}

// ? Show toasts function
function showToasts(text, heading) {
  $.toast({
    heading: "Information",
    text: text,
    heading: heading,
    icon: "success",
    loader: true,
    showHideTransition: "fade",
    position: "left",
    loaderBg: "#e8960f",
    bgColor: "#742eff",
    stack: false,
    hideAfter: 1000,
  });
}

// ? flip Back for the Pushed element.
function flipBack() {
  flipped_Elements.forEach((card) => $(card).parents(".game-card").flip(false));
  flipped_Elements = [];
}

// ? Match pairs found function
function checkmatched() {
  if (
    $(flipped_Elements[0]).data("place") ===
    $(flipped_Elements[1]).data("place")
  ) {
    updatePairs();
    showToasts("You found New Pair", "Pair Found");
    if (checkIsWinner()) clearInterval(interval);
    flipped_Elements = [];
  } else {
    setTimeout(flipBack, 300);
  }
}

// ? Returns the modal message
function getModalMessage(image, winner) {
  return `
    <div class="d-flex gap-3 justify-content-center flex-column align-items-center">
    <img src="${image}" class="img-modal-body">
    <h4>${winner}</h4>
    <div class="d-flex gap-2 flex-column">
    <span>Time : <b>${timer[noOfGrids]}</b> min</span>
    <span>Moves : <b>${moves}</b></span>
    <span>Pairs Found : <b>${pairs}</b></span>
    </div>
    </div>
    `;
}

// ? Function to check if game is in winning mode.
function checkIsWinner() {
  if (pairs === (noOfGrids * noOfGrids) / 2) {
    showModal(
      "Congratulations !",
      getModalMessage("../Images/winner.png", "You Won !!")
    );
    return true;
  }
  return false;
}

// ? these function shows the modal whenever the timeout and wins the game.
function showModal(title, html) {
  $(function () {
    gameModal
      .find(".modal-footer button,.modal-header button")
      .click(function () {
        resetALL();
        setStartPage(true);
      });
    gameModal.find(".modal-title").text(title);
    gameModal.find(".modal-body").html(html);
    const myModal = new bootstrap.Modal("#game-modal");
    myModal.show();
  });
}
