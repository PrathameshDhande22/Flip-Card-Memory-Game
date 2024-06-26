// * for play button dom
const playbtn = $("#play");

// * Grid Selection Option dom
const gridSelection = $("#grid-options");

// * to decide whether start-page is opened or game page
let isStartPage = true;

// * Variable to store the no of grids selected by user
// TODO : Make the changes here before setting hidden for game page
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
let timer = [];

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

// * Boolean variable to check for second
let isSecond = false;

// * Selecting the label of the moves and pairs
const pairsFoundlabel = $("#pairs-found-label");
const movesLabel = $("#moves-label");

// * To fetch the json data for storing the symbols and timer
$.getJSON("./Scripts/data.json", function (res) {
  symbols = res?.symbols;
  timer = res?.timer;
}).fail(function () {
  console.log("failed");
});

// ? Function to create the div Element boxes
function createElement(className, value, isFirst) {
  let divElement = $("<div>").addClass("game-card");
  isFirst ? divElement.attr("id", value) : divElement.attr("id", `idx${value}`);
  let frontElement = $("<div>")
    .addClass(`front single-card ${className}`)
    .data("place", value);
  let backElement = $("<div>")
    .addClass(`bi ${className} back single-card`)
    .data("place", value);
  divElement.append(frontElement, backElement);
  return divElement;
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
  inc = 100 / getSeconds(timer[grids]);
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
  if (isStart) {
    gamePageDom.prop("hidden", true);
    startPageDom.show();
  } else {
    startPageDom.hide();
    gamePageDom.prop("hidden", false);
    setGame(noOfGrids);
  }
}

// ? Function to get the seconds from minutes
function getSeconds(minutes) {
  return minutes * 60;
}

// ! Event listener if page is refereshed
// TODO: Undo these before production
/* $(window).on("beforeunload", function (e) {
  e.preventDefault();
}); */

// ! Event Listener for play button
playbtn.click(function () {
  if (gridSelection.val() === "select") {
    alert("Please Select Proper No of Grids.");
  } else {
    noOfGrids = gridSelection.val();
    isStartPage = false;
    setStartPage(false);
  }
});


// ? Increase Moves function
function increaseMoves() {
  moves++;
  movesLabel.text(moves);
}

// ? function to increase the pairs
function increasePairs() {
  pairs++;
  pairsFoundlabel.text(pairs);
}

function assignfunctionalityTOCards() {
  // * Game Card div DOM
  let gameCards = $(".game-card");

  // * Attaching the flip function to every game cards
  gameCards.each(function (idx, value) {
    $(value)
      .flip({ trigger: "manual" })
      .click(function () {
        $(this).flip(true);
      });
  });

  // * Click functions on each game card
  gameCards.on("click", function (e) {
    if (!$(e.target).is(".back")) {
      increaseMoves();
      flipped_Elements.push(e.target);
      console.log(flipped_Elements.length)
      /* isSecond ? checkmatched() : null;
      flipped_Elements.length >= 1 ? (isSecond = true) : null; */
    }
    console.log($(e.target));
  });
}

function startInterval() {
  let interval = setInterval(function () {
    if (seconds === 0) {
      seconds = 60;
      minutes--;
      if (minutes === -1 && seconds == 60) {
        minutes = 0;
        seconds = 0;
      }
    } else {
      seconds--;
    }
    $("#timer").html(`<b>${minutes}</b> min : <b>${seconds}</b> secs`);
    progress += inc;
    $("#time-bar").css("width", progress + "%");
    if (minutes === 0 && seconds === 0) {
      clearInterval(interval);
      // TODO: Show The time out Modal here
    }
  }, 1000);
}

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
  });
}

// ? Function to remove the first 2 elements from the array
function removeFirstTwo() {
  flipped_Elements.splice(0, 2);
}

// ? flip Back for the Pushed element.
function flipBack() {
  console.log(flipped_Elements);
  flipped_Elements.map((value) => {
    $(value).parents(".game-card").flip(false);
  });
  removeFirstTwo();
}

// ? Match pairs found function
function checkmatched() {
  if (
    $(flipped_Elements[0]).data("place") ===
    $(flipped_Elements[1]).data("place")
  ) {
    console.log("working");
    increasePairs();
    removeFirstTwo();
    showToasts("You found New Pairs", "Pair Found");
  }
}
