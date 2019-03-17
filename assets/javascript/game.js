// Initialize Firebase
var config = {
    apiKey: "AIzaSyCGt8XDESHLKYCiEGVnJKLXvCdZwCFFG8A",
    authDomain: "rockpaperscissors-c078c.firebaseapp.com",
    databaseURL: "https://rockpaperscissors-c078c.firebaseio.com",
    projectId: "rockpaperscissors-c078c",
    storageBucket: "rockpaperscissors-c078c.appspot.com",
    messagingSenderId: "823666906371"
  };
  firebase.initializeApp(config);

//Create variable to reference the database
var database = firebase.database();

//Define initial variable to hold values
var player1 = "";
var player2 = "";
var thisPlayer = "";
var player1Choice = [0,0,0];
var player2Choice = [0,0,0];
var player1Q = false;
var player2Q = false;
var gameTime = false;
var player1ID = "";

//========================USEFUL FUNCTIONS================================
//function to set the rock paper scissors stage
function setStage(append, title) {
    let colRock = $("<div>");
    colRock.addClass("col-4 "+title+"Col");
    let cardRock = $("<div>");
    cardRock.addClass("card cardChoice");
    cardRock.attr("style","width: 100%;");
    cardRock.attr("data-value", title.toLowerCase());
    let cardImage = $("<img>");
    cardImage.addClass("card-img-top "+title+"Image");
    let cardBody = $("<div>");
    cardBody.addClass("card-body fightDisplay")
    cardBody.data("value", title);
    let cardText = $("<p>");
    cardText.addClass("card-text queueDisplay");
    cardText.text(title.toUpperCase());

    cardBody.append(cardText);
    cardRock.append(cardImage);
    cardRock.append(cardBody);
    colRock.append(cardRock)

    $(append).append(colRock);
    //add giffy to the card image
    getGif(title, "."+title+"Image", 2);
}

//===============================CONNECTED USERS COUNT AND TRACKER===========================================
// 1.connectionsRef references a specific location in our database to store connections.
var connectionsRef = database.ref("/connections");
// 2.'.info/connected' is a special location provided by Firebase that is updated every time
// the client's connection state changes.
// '.info/connected' is a boolean value, true if the client is connected and false if they are not.
var connectedRef = database.ref(".info/connected");
// 3.When the client's connection state changes...
connectedRef.on("value", function(snap) {

    // If they are connected..
    if (snap.val()) {
  
      // Add user to the connections list.
      var con = connectionsRef.push(true);
  
      // Remove user from the connection list when they disconnect.
      con.onDisconnect().remove();
    }
  });
    //=========WHEN THE CONNECTIONS LIST CHANGES====================
    connectionsRef.on("value", function(snapshot) {
  
        
        // The number of online users is the number of children in the connections list.
        var opponentCount = parseInt(snapshot.numChildren()) - 1;
        // Display the viewer count in the html.
        $(".queueDisplay").html("Opponents Ready<br>"+opponentCount);
      });

//===========WHEN THE DATABASE CHANGES===============================
database.ref().on("value", function(snap) {
    connection = snap.val().connections;
    if ((snap.child("player1").exists()) && (!snap.child("player2").exists())) {
        player1Q = true;
    }
    //When both players are ready
    else if ((snap.child("player1").exists())  && (snap.child("player2").exists()) && (gameTime === false)) {
        player2Q = true;
        if (player2 === snap.child("player2")) {thisPlayer = player2;}
        player1 = snap.child("player1");
        player2 = snap.child("player2");
        //empty wrapper
        $("#wrapper").empty();

        //Add the rock paper scissors option
        let newRow = $("<div>");
        newRow.addClass("row optionRow");
        $("#wrapper").append(newRow);
        setStage(".optionRow", "Rock");
        setStage(".optionRow", "Paper");
        setStage(".optionRow", "Scissors");

        //============WHEN THE USER CLICKS THEIR ATTACK=================
        $(".cardChoice").on("click", function() {
            $("#wrapper").empty();
            //append Divs for hand images for showdown
            $("#wrapper").append("<div class='row'><div class='col-6'><img class='leftHand' /></div><div class='col-6'><img class='rightHand'></div>");
            //add hand images to stage
            $(".leftHand").attr("src", "assets/images/leftRock.jpg");
            $(".rightHand").attr("src", "assets/images/rightRock.jpg");
            //record userChoice into database
            databaseReference = database.ref("player1/"+player1ID);
            databaseReference.update({
                userInput: "Rock"
            })
            //rock paper scissors shoot
            $('#myModal').modal({show: true});
            $('#myModal').on('shown.bs.modal', function () {
            $('#myInput').trigger('focus')
            })
            var intervalID = setInterval(countDown, 1000);
        })
    }
})

//====================CLICK JOIN GAME BUTTON==================================
$(".ready").on("click", function() {
    event.preventDefault();
    //if player1 is not selected
    if (player1Q === false) {
        //get information from user
        player1 = $("#firstName").val().trim();
        //set player1 to user information
        var newRef1 = database.ref('/player1').push({
        name: player1,
        userInput: ""
        })
        player1ID = newRef1.key;
    }
    //if player 1 is selected but not player 2
    else if (player2Q === false) {
        player2 = $("#firstName").val().trim();
        player2Q = true;
        var newRef2 = database.ref('/player2').push({
            name: player2,
            userInput: ""
        })
        var player2ID = newRef2.key;
    }
    $(".playerWrapper").remove();
})



//count clock for function countdown for rock paper scissors shoot animation
var countClock = 0;
    function countDown() {
        switch(countClock) {
            case 0: $(".timer").html("<h1>ROCK</h1>");
            countClock++;
            break;
            case 1: $(".timer").html("<h1>PAPER</h1>");
            countClock++;
            break;
            case 2: $(".timer").html("<h1>SCISSORS</h1>");
            countClock++;
            break;
            case 3: $(".timer").html("<h1>SHOOT</h1>");
            countClock++;
            break;
            case 4: $("#myModal").modal('hide');
            // location.reload();
            countClock = 0;
            break;
        }
    }

    //function to get random giffy URL
    function getGif(search, tag, imageSize) {
        var urlQuery = "https://api.giphy.com/v1/gifs/random?api_key=dc6zaTOxFJmzC&tag="+search;
        $.ajax({
            url: urlQuery,
            method: "GET"
        }).then(function(response) {
            if (Number(imageSize) === 1) {
            $(tag).attr("src", response.data.images.original.url);
            }
            else if (Number(imageSize) === 2) {
            $(tag).attr("src", response.data.images.fixed_height.url);
            }
    });
}

getGif("loading", ".imageLoading", 1);


