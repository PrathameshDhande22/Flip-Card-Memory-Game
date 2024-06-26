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
function increaseMoves(toReset) {
  if (toReset) {
    movesLabel.text(0);
  } else {
    moves++;
    movesLabel.text(moves);
  }
}

// ? function to increase the pairs
function increasePairs(toReset) {
  if (toReset) {
    pairsFoundlabel.text(0);
  } else {
    pairs++;
    pairsFoundlabel.text(pairs);
  }
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
      increaseMoves(false);
      flipped_Elements.push(e.target);
      if (flipped_Elements.length >= 2) {
        checkmatched();
      }
    }
  });
}

// ? These Functions resets all the variables
function resetALL() {
  flipped_Elements.splice(0, flipped_Elements.length);
  minutes = 0;
  seconds = 0;
  pairs = 0;
  moves = 0;
  interval = 0;
  grid_box.splice(0, grid_box.length);
  noOfGrids = 0;
  gridSelection.val("select");
  progress = 0;
  $("#timer").html(`<b>00</b> min : <b>00</b> secs`);
  $("#time-bar").css("width", "0%");
  increaseMoves(true);
  increasePairs(true);
  gridBoxDom.empty();
}

// ? function to start the interval or timer with progress bar.
function startInterval() {
  interval = setInterval(function () {
    if (seconds === 0) {
      seconds = 59;
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
      if (!checkIsWinner()) {
        clearInterval(interval);
        showModal(
          "Time OUT !",
          getModalMessage("../Images/timeout.png", "You LOST !")
        );
      }
    }
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
  });
}

// ? Function to remove the first 2 elements from the array
function removeFirstTwo() {
  flipped_Elements.splice(0, 2);
}

// ? flip Back for the Pushed element.
function flipBack() {
  $(flipped_Elements[0]).parents(".game-card").flip(false);
  $(flipped_Elements[1]).parents(".game-card").flip(false);
  removeFirstTwo();
}

// ? Match pairs found function
function checkmatched() {
  if (
    $(flipped_Elements[0]).data("place") ===
    $(flipped_Elements[1]).data("place")
  ) {
    increasePairs(false);
    showToasts("You found New Pair", "Pair Found");
    checkIsWinner();
    removeFirstTwo();
  } else {
    setTimeout(() => {
      flipBack();
    }, 300);
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
    clearInterval(interval);
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
