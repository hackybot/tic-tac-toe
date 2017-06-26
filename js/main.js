$(document).ready(function(){

  //store the gameboard element
  var gameBoard = $(".game-board");

  var positions = ["one","two","three","four","five","six","seven", "eight","nine"];

  var counterSelection = $(".counter-selection");

  //Flag to tell if game running
  var gameRunning = false;
  var gameEnd = false;

  var playerCounter;
  var computerCounter;

  //results variables
  var resultsContainer = $(".results");
  var resultText = $("#result-text");

  var moveCount = 0;

  //game difficulty
  var difficulty;


  //start the game!
  function start(){
    //check if there's a game currently running
    if(gameRunning) {
      //hide any elements and wipe the board.

      //reset origBoard
      origBoard = [0, 1, 2, 3, 4, 5, 6, 7, 8];

      resultsContainer.slideToggle(600);

      positions.forEach(function(item){
        var canvasContext = document.getElementById(item).getContext("2d");
        canvasContext.clearRect(0, 0, 100, 100);

        //remove attr value
        $("#" + item).removeAttr("data-counter");
      })

      //restore pointer events
      $("canvas").css("pointer-events", "auto");
    }

    //set the game running and game end flags
    gameRunning = true;
    gameEnd = false;
    moveCount = 0;

    //Show the counter selection box
    counterSelection.slideToggle(600);

    //On counter selection screen draw our canvas objects and delay for a cool effect
    setTimeout( function() {
      drawCross(document.getElementById("X"));
      drawCircle(document.getElementById("O"));
    }, 500);

    //store both the players counter and the computers counter.
    counterSelection.one("click", "canvas", function(){

      if ( $(this).attr("id") === "X"){
        playerCounter = "X";
        computerCounter = "O";
      } else {
        playerCounter ="O";
        computerCounter = "X";
      }

      counterSelection.slideToggle(600);
      gameBoard.slideToggle(600);


    });

    gameBoard.on("click", "canvas", function(){

      if( $(this).attr("data-counter")) {
        return false;
      }

      //Check which counter the player is.
      if (playerCounter  === "X") {
        drawCross(this);
        winDetection(this);
      } else {
        drawCircle(this);
        winDetection(this);
      }



      //disable further clicking until the computer has made its move
      $("canvas").css("pointer-events", "none");

      //run some computer move maker with delay to assume it's "thinking"
      difficulty = $("#difficulty").val();

      if( !gameEnd ) {

        if(difficulty === "easy") {
          setTimeout(function(){
            easyComputer();
          }, 1000);
        } else {
          //run minimax ai
          updateBoard();
          var move = minimax(origBoard, computerCounter);
          move = move.index;
          playTheMove(move);

        }





      }

    });


  };

  //on page load start the game
  start();


  //this function will draw a cross on a canvas that is passed through
  function drawCross(item){

    var canvas = item;

    //set the elemen data attr to the current counter
    $(item).attr("data-counter", "X");

    //get the rendering context
    var ctx = canvas.getContext('2d');
    // ctx.fillStyle = "#ff5252";
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.strokeStyle = "#ff5252";

    //Create a new path, future commands will apply to this path until "closePath()" is called
    ctx.beginPath();
    //First line / Counter variable
    var firstLineLog = 20;
    //begin drawing the first line from the top left corner
    function firstLineDraw(){

      if(firstLineLog === 90) {
        clearInterval(lineOneAnimation);
        ctx.closePath();
        lineTwoAnimation = setInterval(secondLineDraw, 20);
      }
      //Specify start path
      ctx.moveTo(10,10);
      //move to the default start location
      ctx.lineTo(firstLineLog, firstLineLog);
      //fill in the line using stroke()
      ctx.stroke();
      //add 10px to move the line for the next stroke
      firstLineLog += 10;
    }
    //spcify an interval to draw the line for a nice animation
    lineOneAnimation = setInterval(firstLineDraw, 20);

    //####  second Line ####
    //store first move x,y
    var secondLineLogOne = 20;
    var secondLineLogTwo = 80;

    function secondLineDraw(){

      //when the line is finished drawing stop the interval and close the path.
      if(secondLineLogTwo === 10) {
        clearInterval(lineTwoAnimation);
        ctx.closePath();
      }

      //Specify start path
      ctx.moveTo(90,10);
      ctx.lineTo(secondLineLogTwo, secondLineLogOne);
      ctx.stroke();
      secondLineLogOne += 10;
      secondLineLogTwo -= 10;

    };

  }; //close drawCross() function\
  //this function will draw a circle on the canvas.
  function drawCircle(item) {

    //current canvas being clicked on
    var canvas = item;

    //set the elemen data attr to the current counter
    $(item).attr("data-counter", "O");

    //get the rendering context
    var ctx = canvas.getContext('2d');

    ctx.lineWidth = 8;
    ctx.strokeStyle = '#536dfe';


    var angleLog = 1;

    function lineDraw() {

      if(angleLog === 7) {
        clearInterval(circleLineAnimation);
        ctx.closePath();
      }

      ctx.beginPath();

      //start an arc, clockwise
      ctx.arc( 50, 50, 35, 0, angleLog, false);

      ctx.stroke();

      //increment angle
      angleLog++;

    }
    //spcify an interval to draw the line for a nice animation
    circleLineAnimation = setInterval(lineDraw, 25);
  }


  //This function will tell you if the move just made is a winning move, based on the element(position) passed through
  function winDetection(item) {

    //keep track of moves to determine a draw
    moveCount++

    //id of the current item
    var itemId = $(item).attr("id");

    //store the current counter
    var counter = $(item).attr("data-counter"); // e.g. X / O

    //possible winning combinations based on counter location
    var winningCombos = {
      "one": [["two", "three"], ["five", "nine"], ["four", "seven"]],
      "two": [["one", "three"], ["five","eight"]],
      "three": [["one", "two"], ["five", "seven"], ["six", "nine"]],
      "four": [["one", "seven"], ["five","six"]],
      "five": [["four", "six"], ["two", "eight"], ["one", "nine"], ["three","seven"]],
      "six": [["three", "nine"], ["four", "five"]],
      "seven": [["one", "four"], ["three", "five"], ["eight", "nine"]],
      "eight": [["seven", "nine"],["two", "five"]],
      "nine": [["three","six"], ["seven","eight"], ["one", "five"]]
    }

    var winner = false;

    winningCombos[itemId].forEach(function(item){

      if ( $("#" + item[0]).attr("data-counter") === counter && $("#" + item[1]).attr("data-counter") === counter ) {


        winner = true;

        // $("#" + itemId).addClass("canvas-result");
        // $("#" + item[0]).addClass("canvas-result");
        // $("#" + item[1]).addClass("canvas-result");

        gameBoard.hide();
        gameEnd = true;

        if (counter === playerCounter) {
          resultText.text("Winner!").addClass("win").removeClass("lose draw");

        } else {
          resultText.text("Sorry, you lost!").addClass("lose").removeClass("win draw");
        }

      return true;

    }

      return false;
    });

    if (moveCount === 9) {
      gameBoard.hide();
      gameEnd = true;

      resultText.text("It's a draw!").addClass("draw").removeClass("lose win");
      resultsContainer.slideToggle(600);

    } else if (winner) {
      resultsContainer.slideToggle(600);
    }


  }

  //the easy game mode, the computer will pick a spot at random.
  function easyComputer(){

    var availablePositions = [];

    positions.forEach(function(item){
      //check if the position is available.
      if( !$("#" + item).attr("data-counter")) {
        availablePositions.push(item);
      }
    });

    //choose a random item from available positions and pass that through to the correct canvas drawing function
    var moveLocation = availablePositions[Math.floor( Math.random() * availablePositions.length)];

    moveLocation = document.getElementById(moveLocation);

    //depening on the computers counter draw its move on the position canvas
    if(computerCounter === "O") {
      drawCircle(moveLocation);
      winDetection(moveLocation);
    } else {
      drawCross(moveLocation);
      winDetection(moveLocation);

    }

    $("canvas").css("pointer-events", "auto");


  }


  //reset button listener
  var resetButtons = $(".reset");
  resetButtons.on("click", function(){

    start();

  });



  //update the board based on the moves taken
  function updateBoard() {
    for(var i=0; i < positions.length; i++ ){
      var selector = $("#" + positions[i]);

      if( selector.attr("data-counter")){
        origBoard[i] = selector.attr("data-counter");
      }
    };
    console.log(origBoard);
  }

  //minimax function for unbeatable difficulty
  //a log of the current board;
  var origBoard = [0, 1, 2, 3, 4, 5, 6, 7, 8];

  //A function that looks for winning combinations and returns true if it finds one
  //it takes the current board to test and the player to test against.
  function winning(board, player) {
    if(
      (board[0] == player && board[1] == player && board[2] == player) ||
      (board[3] == player && board[4] == player && board[5] == player) ||
      (board[6] == player && board[7] == player && board[8] == player) ||
      (board[0] == player && board[3] == player && board[6] == player) ||
      (board[1] == player && board[4] == player && board[7] == player) ||
      (board[2] == player && board[5] == player && board[8] == player) ||
      (board[0] == player && board[4] == player && board[8] == player) ||
      (board[2] == player && board[4] == player && board[6] == player)
   ) {
     return true;
   } else {
     return false;
   }
  };

  //a function which finds all the empty indexes of the given board
  function emptyIndexies(board) {
    return board.filter(s => s != "O" && s != "X");
  }

  //minimax function
  function minimax(newBoard, player) {

      //available spots on this board. returns an array of indexes to be used on the board for a position.
      var availSpots = emptyIndexies(newBoard);

      //This function is going to be recursively called so we need to be checking for terminal states(win,lost,tie) and return the value of these states
      if(winning(newBoard, playerCounter)){
        return {score: -10};
      } else if ( winning(newBoard, computerCounter)){
        return {score: 10};
      } else if ( availSpots.length === 0){
        //no available moves left so much be a draw.
        return {score: 0};
      }


      //an array to collect the moves available
      var moves = [];

      //loop through available spots
      for (var i=0; i < availSpots.length; i++) {

        var move = {};
        move.index = newBoard[availSpots[i]];

        //set the empty spot to the current player
        newBoard[availSpots[i]] = player;

        //collect the resulting score from calling minimax on the opponent of the current player
        if ( player == computerCounter) {
          var result = minimax(newBoard, playerCounter);
          move.score = result.score;
        } else {
          var result = minimax(newBoard, computerCounter);
          move.score = result.score;
        }

        //reset the spot to empty
        newBoard[availSpots[i]] = move.index;
        moves.push(move);

      }

      //if it is the computers(ai) turn, loop over the moves and choose the one with the highest(best) score
      var bestMove;

      if ( player === computerCounter) {
        var bestScore = -10000;

        for(var i=0; i < moves.length; i++){
          if(moves[i].score > bestScore) {
            bestScore = moves[i].score;
            bestMove = i;
          }
        }
      } else {
        //loop over the moves and choose the lowest score
        var bestScore = 10000;
        for(var i=0; i < moves.length; i++){
          if(moves[i].score < bestScore ){
            bestScore = moves[i].score;
            bestMove = i;
          }
        }
      }
      return moves[bestMove];
  }

  //play the ai move
  function playTheMove(moveLocation) {


    var moveLocation = document.getElementById( positions[moveLocation] );

    //depening on the computers counter draw its move on the position canvas
    if(computerCounter === "O") {
      drawCircle(moveLocation);
      winDetection(moveLocation);
    } else {
      drawCross(moveLocation);
      winDetection(moveLocation);
    }

    $("canvas").css("pointer-events", "auto");





  }


});
