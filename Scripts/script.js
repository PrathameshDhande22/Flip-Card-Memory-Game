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

// * Selecting the label of the moves and pairs
const pairsFoundlabel = $("#pairs-found-label");
const movesLabel = $("#moves-label");

// * To fetch the json data for storing the symbols and timer
$.getJSON("../Scripts/data.json", function (res) {
  symbols = res?.symbols;
  timer = res?.timer;
});

// ? Function to create the div Element boxes
function createElement(className) {
  let divElement = $("<div>").addClass("game-card");
  let frontElement = $("<div>").addClass(`single-card front`);
  let backElement = $("<div>").addClass(`bi ${className} back single-card`);
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
  gridBoxDom.css("grid-template-columns", "auto ".repeat(grids));
  inc = 100 / getSeconds(timer[grids]);
  for (let i = 0; i < (grids * grids) / 2; i++) {
    grid_box.push(createElement(symbols[i]), createElement(symbols[i]));
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
    // TODO: Show The time out Modal here
  }
  $("#timer").html(`<b>${minutes}</b> min : <b>${seconds}</b> secs`);
  progress += inc;
  $("#time-bar").css("width", progress + "%");
}, 1000);

//#endregion

// ! Event listener if page is refereshed
// TODO: Undo these before production
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

// TODO: Remove these region after development
//#region temporary
$(document).ready(function () {
  setGame(noOfGrids);
});
//#endregion

// ! Event Listener after document is loaded load the flips
$(function () {
  $(".game-card").flip({ trigger: "click" });
});
