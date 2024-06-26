// * for play button dom
const playbtn = $("#play");

// * Grid Selection Option dom
const gridSelection = $("#grid-options");

// * to decide whether start-page is opened or game page
let isStartPage = true;

// * Variable to store the no of grids selected by user
let noOfGrids = 4;

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

// * Selecting the label of the moves and pairs
const pairsFoundlabel = $("#pairs-found-label");
const movesLabel = $("#moves-label");

// * To fetch the json data for storing the symbols and timer
$.getJSON("../Scripts/data.json", function (res) {
  symbols = res?.symbols;
  timer = res?.timer;
});

// ? Function to create the div Element boxes
function createElement(className, value) {
  let divElement = $("<div>").addClass("flip-container");
  let flipper = $("<div>").addClass("flipper game-card");
  let frontElement = $("<div>")
    .addClass(`front single-card`)
    .data("place", value);
  let backElement = $("<div>")
    .addClass(`bi ${className} back single-card`)
    .data("place", value);
  flipper.append(frontElement, backElement);
  divElement.append(flipper);
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
  gridBoxDom.css("grid-template-columns", "auto ".repeat(grids));
  inc = 100 / getSeconds(timer[grids]);
  for (let i = 0; i < (grids * grids) / 2; i++) {
    grid_box.push(createElement(symbols[i], i), createElement(symbols[i], i));
  }
  grid_box = shuffleArray(grid_box);
  gridBoxDom.append(grid_box);
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

//#region timer

// ? Function to get the seconds from minutes
function getSeconds(minutes) {
  return minutes * 60;
}

// ! Event Listener for timer
let interval = setInterval(function () {
  seconds++;

  if (seconds === 60) {
    minutes++;
    seconds = 0;
  }
  if (minutes === timer[noOfGrids]) {
    clearInterval(interval);
  
  }
  $("#timer").html(`<b>${minutes}</b> min : <b>${seconds}</b> secs`);
  progress += inc;
  $("#time-bar").css("width", progress + "%");
}, 1000);

//#endregion

// ! Event listener if page is refereshed
n
/* $(window).on("beforeunload", function (e) {
  e.preventDefault();
}); */

//#region play-button
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

//#endregion

//#region temporary
$(document).ready(function () {
  setGame(noOfGrids);
});
//#endregion

// ! Event Listener after document is loaded load the flips
$(function () {
  let gameCards = $(".game-card");

  gameCards.toArray().map(function (value) {});

  function flipBack() {
    flipped_Elements.map((value) => {
      $(value).removeClass("flipped")
    });
    flipped_Elements.splice(0,2)
  }
  gameCards.on("click", function (e) {
    if (flipped_Elements.length >= 2) {
      flipBack();
       }
    flipped_Elements.push(e.target);
  });

  $(".flip-container").click(function () {
    $(this).addClass("flipped");
  });
});


if (minutes === -1 && seconds == 60) {
  minutes = 0;
  seconds = 0;
}


min=3
seconds=30

actualmin=6
actualsec=0

actualmin-min= 3 
seconds-actualsec=30
