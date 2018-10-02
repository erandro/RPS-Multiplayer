//Bootstrap form validation
(function () {
    'use strict';
    window.addEventListener('load', function () {
        // Fetch all the forms we want to apply custom Bootstrap validation styles to
        var forms = document.getElementsByClassName('needs-validation');
        // Loop over them and prevent submission
        var validation = Array.prototype.filter.call(forms, function (form) {
            form.addEventListener('submit', function (event) {
                if (form.checkValidity() === false) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                form.classList.add('was-validated');
            }, false);
        });
    }, false);
})();

var database = firebase.database();
var playersCountRef = database.ref("turn");
var playersRef = database.ref("players");
var chatData = database.ref("/chat");
var name = "username";
var playerNum = null;
var playersCount = null;
var playerOneExists = false;
var playerTwoExists = false;
var playerOneData = null;
var playerTwoData = null;
// var Turn = undefined;


// get data
playersRef.on("value", function (snapshot) {
    var data = snapshot.val();
    console.log(data);

    // Number of players currently in game
    playersCount = snapshot.numChildren();

    // Check to see if players exist
    playerOneExists = snapshot.child("1").exists();
    playerTwoExists = snapshot.child("2").exists();

    // Store each players information in a variable 
    playerOneData = snapshot.child("1").val();
    playerTwoData = snapshot.child("2").val();

    // Set player's one data
    if (playerOneExists) {
        $("#namePlayer1").text(playerOneData.name);
        $("#winPlayer1").text("Wins: " + playerOneData.wins);
        $("#losePlayer1").text("Losses: " + playerOneData.losses);
    } else {
        $("#player1-name").text("No addition Player yet");
        $("#player1-wins").empty();
        $("#player1-losses").empty();
    };

    // Set player's two data
    if (playerTwoExists) {
        $("#namePlayer2").text(playerTwoData.name);
        $("#winPlayer2").text("Wins: " + playerTwoData.wins);
        $("#losePlayer2").text("Losses: " + playerTwoData.losses);
    } else {
        $("#player2-name").text("No Player yet");
        $("#player2-wins").empty();
        $("#player2-losses").empty();
    };
});

// set turn to 1 (starting game - player one turn)
playersRef.on("child_added", function (snapshot) {
    if (playersCount === 1) {
        playersCountRef.set(1);
    };
});

function assigningPlayers() {
    //var chatDataDisc = database.ref("/chat/" + Date.now());
    name = $("#nameInput").val().trim();

    if (!playerOneExists) {
        playerNum = 1;
    } else {
        playerNum = 2;
    }

    playerRef = database.ref("/players/" + playerNum);

    playerRef.set({
        name,
        wins: 0,
        losses: 0,
        choice: null
    });

    playerRef.onDisconnect().remove();

    // playersCountRef.onDisconnect().remove();

};

// set data
$("#enterPlayer").on("click", function () {
    if (playersCount < 2 && $("#nameInput").val() !== "") {
        assigningPlayers();
    } else {
        alert("too many players");
    }
});

// turns
playersCountRef.on("value", function (snapshot) {
    playersCount = snapshot.val();

    if (playerNum) {

        // player one turn
        if (playersCount === 1) {
            if (playersCount === playerNum) {
                $("#box_C").html("<h2>It's Your Turn!</h2>");
                $("#box_" + playerNum).append("<li>Rock</li><li>Paper</li><li>Scissors</li>");
            }
            else {
                $("#box_C").html("<h2>Waiting on other player</h2>");
            }

            // Shows yellow border around active player
            $("#player1").css("border", "2px solid yellow");
            $("#player2").css("border", "1px solid black");
        }
        else if (playersCount === 2) {
            if (playersCount === playerNum) {
                $("#box_C").html("<h2>It's Your Turn!</h2>");
                $("#box_" + playerNum).append("<li>Rock</li><li>Paper</li><li>Scissors</li>");
            }
            else {
                $("#box_C").html("<h2>Waiting on other player</h2>");
            };

            // Shows yellow border around active player
            $("#player2").css("border", "2px solid yellow");
            $("#player1").css("border", "1px solid black");
        }

        else if (playersCount === 3) {

            // Where the game win logic takes place then resets to turn 1
            gameLogic(playerOneData.choice, playerTwoData.choice);

            // reveal both player choices
            $("#player1-chosen").text(playerOneData.choice);
            $("#player2-chosen").text(playerTwoData.choice);

            //  reset after timeout
            var moveOn = function () {

                $("#player1-chosen").empty();
                $("#player2-chosen").empty();
                $("#result").empty();

                // check to make sure players didn't leave before timeout
                if (playerOneExists && playerTwoExists) {
                    playersCountRef.set(1);
                }
            };

            //  show results for 2 seconds, then resets
            setTimeout(moveOn, 2000);
        }

        else {

            //  if (playerNum) {
            //    $("#player" + playerNum + " ul").empty();
            //  }
            $("#player1 ul").empty();
            $("#player2 ul").empty();
            $("#current-turn").html("<h2>Waiting for another player to join.</h2>");
            $("#player2").css("border", "1px solid black");
            $("#player1").css("border", "1px solid black");
        }
    }
});





// change icon color when pressed - can't press more then one time
$(document).on("click", ".icon", function () {
    var imgValue = this.alt;
    var imgID = "#" + this.id;
    $(imgID).attr("src", "assets/images/" + imgValue + "R.png");
    $(".icon").addClass("iconWithNoClick").removeClass("icon");

    playersCountRef.transaction(function (turn) {
        return turn + 1;
    });
});

var playerOnePick = null;
var playerTwoPick = null;

function checkWhoWon(playerOnePick, playerTwoPick) {

    function playerOneWon() {
        $("#box_C").html("<h2>" + playerOneData.name + "</h2><h2>Wins!</h2>");
        if (playerNum === 1) {
            playersRef.child("1").child("wins").set(playerOneData.wins + 1);
            playersRef.child("2").child("losses").set(playerTwoData.losses + 1);
        }
    };

    function playerTwoWon() {
        $("#box_C").html("<h2>" + playerTwoData.name + "</h2><h2>Wins!</h2>");
        if (playerNum === 2) {
            playersRef.child("2").child("wins").set(playerOneData.wins + 1);
            playersRef.child("1").child("losses").set(playerTwoData.losses + 1);
        }
    };

    function tie() {
        $("#box_C").html("<h2>It's a Tie!</h2>");
    };

    if (playerOnePick === playerTwoPick) {
        alert("Tie");
        tie();
        //game function
    } else if ((playerOnePick === "rock" && playerTwoPick === "scissors") || (playerOnePick === "paper" && playerTwoPick === "rock") || (playerOnePick === "scissors" && playerTwoPick === "paper")) {
        alert("player 1 won");
        playerOneWon();
        //show data on DOM
        //game function
    } else {
        alert("player 2 won");
        playerTwoWon();
        //show data on DOM
        //game function
    }
};