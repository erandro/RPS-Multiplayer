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


var playersCount = 0;
var playerOneExists = false;
var playerTwoExists = false;
var playerOneData = null;
var playerTwoData = null;
var database = firebase.database();
var playersRef = database.ref("players");


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



    $("#namePlayer1").text(data.name);
    $("#winPlayer1").text("Wins: " + data.wins);
    $("#losePlayer1").text("Losses: " + data.losses);

    $("#namePlayer2").text(data.name);
    $("#winPlayer2").text("Wins: " + data.wins);
    $("#losePlayer2").text("Losses: " + data.losses);

});

function assigningPlayers() {
    var name = $("#nameInput").val().trim();
    if (playerOneExists) {
        playerNum = 2;
    } else {
        playerNum = 1;
    }

    playerRef = database.ref("/players/" + playerNum)

    playerRef.set({
        name: name,
        wins: 0,
        losses: 0
    });

    playerRef.onDisconnnect().remove();
}

var playerNum = 0;
var playerRef = null;
// set data
$("#enterPlayer").on("click", function () {
    if (playersCount < 2) {
        // playersCount = playersCount + 1;
        assigningPlayers();
    } else {
        alert("too many players");
    }
});

// change icon color when pressed - can't press more then onc time
$(document).on("click", ".icon", function () {
    var imgValue = this.alt;
    var imgID = "#" + this.id;
    $(imgID).attr("src", "assets/images/" + imgValue + "R.png");
    $(".icon").addClass("iconWithNoClick").removeClass("icon");
});

function checkWhoWon() {
    if (player1pick === player2pick) {
        alert("Tie");
        //game function
    } else if ((player1pick === "rock" && player2pick === "scissors") || (player1pick === "paper" && player2pick === "rock") || (player1pick === "scissors" && player2pick === "paper")) {
        alert("player 1 won");
        //+1 to palyer 1 wins, +1 to player 2 losses
        //show data on DOM
        //game function
    } else {
        alert("player 2 won");
        //+1 to palyer 2 wins, +1 to player 1 losses
        //show data on DOM
        //game function
    }
};