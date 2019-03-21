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
var playerChoice = "";
var opponentChoice = "";
var playerKey = "";
var opponentKey = "";
var stageSet = false;
var intervalID = "";
var result = "";
var playerName = "";
var opponentName = "";
var wins = 0;
var loss = 0;
var totalGame = 0;
var champion = false;
var playerInputStatus = "";
var opponentInputStatus = "";
var twoThreeAudio = new Audio('assets/images/twoThree.mov');
var finalRoundAudio = new Audio('assets/images/finalRound.mov');
var championAudio = new Audio('assets/images/champion.mov');


//========================USEFUL FUNCTIONS================================
function openForm() {
    document.getElementById("myForm").style.display = "block";
  }
  
  function closeForm() {
    document.getElementById("myForm").style.display = "none";
  }


//function to set the rock paper scissors stage
function setStage(append, title) {
    let colRock = $("<div>");
    colRock.addClass("col-4 "+title+"Col");
    let cardRock = $("<div>");
    cardRock.addClass("card cardChoice");
    cardRock.attr("data-value", title);
    let cardImage = $("<img>");
    cardImage.addClass("card-img-top "+title+"Image");
    let cardBody = $("<div>");
    cardBody.addClass("card-body fightDisplay")
    cardBody.data("value", title);
    let cardText = $("<p>");
    cardText.addClass("card-text buttonDisplay");
    cardText.text(title.toUpperCase());

    cardBody.append(cardText);
    cardRock.append(cardImage);
    cardRock.append(cardBody);
    colRock.append(cardRock)

    $(append).append(colRock);
    //add giffy to the card image
    getGif(title, "."+title+"Image", 2);
    // $('.'+title+'Image').attr('src', 'assets/images/rock.jpg');
}

//function to set the player cards to stage
function setPlayerCard(append, name, divNames) {
    let newCol = $('<div>');
    newCol.addClass('col-6');
    let newButton = $('<button>');
    newButton.attr('type', 'button');
    newButton.addClass('btn btn-primary '+divNames+'Button');
    newButton.html(name+'\'s Wins<br>');
    let newSpan = $('<span>');
    newSpan.addClass('badge badge-light '+divNames+'Badge');
    newSpan.text(wins);

    newButton.append(newSpan);
    newCol.append(newButton);
    $(append).append(newCol);
}

//function to change the headlines
function headlines(stringy) {
    $(".display-4").text(stringy);
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
      playerKey = con.getKey();
  
      // Remove user from the connection list when they disconnect.
      con.onDisconnect().remove();
    }
  });
    //=========WHEN THE CONNECTIONS LIST CHANGES====================
    connectionsRef.on("value", function(snapshot) {
  
        
        // The number of online users is the number of children in the connections list.
        var opponentCount = parseInt(snapshot.numChildren()) - 1;
        // Display the viewer count in the html.
        $(".queueDisplay").html("Opponents Online<br>"+opponentCount);
      });

//===========WHEN THE DATABASE CHANGES==================================================================

database.ref().on("value", function(snap) {
    //Get Unique Key of Both Users
    let connectorRef = snap.child('connections').val();
    let connectorRefArray = Object.keys(connectorRef);
    for (let key of connectorRefArray) {
        if (key === playerKey) {
            // console.log("this is my key: ", key);
        }
        else {
            // console.log("this is the other players key: ", key);
            opponentKey = key;
        }
    }
    
    //Reference to user Name
    let opponentNameStatus = snap.child('connections/'+opponentKey+'/name');
    let playerNameStatus = snap.child('connections/'+playerKey+'/name');

    //Reference to user Input
    opponentInputStatus = snap.child('connections/'+opponentKey+'/userInput');
    playerInputStatus = snap.child('connections/'+playerKey+'/userInput');

    
    //if player is ready and opponent is not
    if ((playerNameStatus.exists()) && (!opponentNameStatus.exists())) {
    headlines("Waiting on Opponent");
    }

        
    //when both players are ready and if the buttons have never been set
    if ( (snap.child('connections/'+opponentKey+'/name').exists()) && (snap.child('connections/'+playerKey+'/name').exists()) && (stageSet === false) ) {
        //Get opponents Name
        opponentName = snap.child('connections/'+opponentKey+'/name').val();
        //set player cards to the stage
        let cardRow = $('<div>');
        cardRow.addClass('row cardRow');
        $('.wrapper').append(cardRow);
        $('.playerBoardCol').text('YOU\'VE WON '+wins+' OUT OF '+totalGame);
        setPlayerCard('.cardRow', playerName, "player");
        setPlayerCard('.cardRow', opponentName, "opponent");

        //change headlines
        headlines("Choose Your Weapon");
        //make sure this only runs once after both players have signed in
        stageSet = true;
        //empty wrapper
        $("#wrapper").empty();
        //Add the rock paper scissors buttons
        let newRow = $("<div>");
        newRow.addClass("row optionRow");
        $("#wrapper").append(newRow);
        setStage(".optionRow", "Rock");
        setStage(".optionRow", "Paper");
        setStage(".optionRow", "Scissors");
        }

        //if player has chosen weapon and waiting on opponent
        if ((snap.child('connections/'+playerKey+'/userInput').exists()) && (!snap.child('connections/'+opponentKey+'/userInput').exists())) {
            headlines("Waiting On "+opponentName);
        }

        if ((snap.child('connections/'+playerKey+'/userInput').exists()) && (snap.child('connections/'+opponentKey+'/userInput').exists())) {
            //Get Opponents Choice and do logic for winner
            opponentChoice = snap.child('connections/'+opponentKey+'/userInput').val();
            headlines("Fight");

            //Logic for Rock Paper Scissors Game and add up win and loss count
            if (playerChoice === opponentChoice) {
                result = "Tie";
            }
            
            if (playerChoice === 'Rock') {
                if (opponentChoice === 'Paper') {
                    result = "Lose";
                    loss++;
                }
                else if (opponentChoice === 'Scissors') {
                    result = "Win";
                    wins++;
                }
            }
            if (playerChoice === 'Paper') {
                if (opponentChoice === 'Scissors') {
                    result = "Lose";
                    loss++
                }
                else if (opponentChoice === 'Rock') {
                    result = "Win";
                    wins++;
                }
            }
            if (playerChoice === 'Scissors') {
                if (opponentChoice === 'Rock') {
                    result = "Lose";
                    loss++;
                }
                else if (opponentChoice === 'Paper') {
                    result = "Win";
                    wins++;
                }
            }
            

            //add modal for countdown
            $('#myModal').modal({show: true});
            $('#myModal').on('shown.bs.modal', function () {
            $('#myInput').trigger('focus')
            })
            intervalID = setInterval(countDown, 1000);
        }
        
        //============WHEN THE USER CLICKS THEIR ATTACK=================
        $(".cardChoice").on("click", function() {
            //record userChoice into database
            
                playerChoice = $(this).data("value");
                database.ref('connections/'+playerKey).update({
                userInput: playerChoice
                })
                $("#wrapper").empty();
            
        })
})

//====================CLICK JOIN GAME BUTTON==================================
$(".ready").on("click", function() {
    event.preventDefault();
        //get information from user
        playerName = $("#firstName").val().trim();
        //set player to user information
        database.ref("connections/"+playerKey).update({
        name: playerName
        }, function(errorObject) {
            console.log("The read failed: " + errorObject.code);
          });
    $(".playerWrapper").remove();
})



//count clock for function countdown for rock paper scissors shoot animation and runs end game on Case 6 if 3 games have been played
var countClock = 0;
    function countDown() {
        switch(countClock) {
            case 0: 
            $(".timer").html("<h1>ROCK</h1>");
            //append Divs for hand images for showdown
            $("#wrapper").append("<div class='row'><div class='col-6'><img class='leftHand' /></div><div class='col-6'><img class='rightHand'></div>");
            //add hand images to stage
            $(".leftHand").attr("src", "assets/images/leftRock.jpg");
            $(".rightHand").attr("src", "assets/images/rightRock.jpg");
            countClock++;
            break;
            case 1: 
            $(".timer").html("<h1>PAPER</h1>");
            $(".leftHand").attr("src", "assets/images/leftPaper.jpg");
            $(".rightHand").attr("src", "assets/images/rightPaper.jpg");
            countClock++;
            break;
            case 2: 
            $(".timer").html("<h1>SCISSORS</h1>");
            $(".leftHand").attr("src", "assets/images/leftScissors.jpg");
            $(".rightHand").attr("src", "assets/images/rightScissors.jpg");
            countClock++;
            break;
            case 3: 
            $(".timer").html("<h1>SHOOT</h1>");
            countClock++;
            break;
            case 4: 
            $("#myModal").modal('hide');
            $(".leftHand").attr("src", "assets/images/left"+playerChoice+".jpg");
            $(".rightHand").attr("src", "assets/images/right"+opponentChoice+".jpg");
            countClock++;
            break;
            case 5:
            countClock++;
            headlines("You "+result);
            $(".timer").html("<h1>READY</h1>");
            break;
            case 6:
            //This is the end
            countClock++;
            totalGame = wins + loss;
            if (totalGame === 1) {twoThreeAudio.play()}
            if ((loss === wins) && (loss != 0)) {finalRoundAudio.play()}
            if ((wins === 2) || (loss === 2)) {
                if (wins === 2) {
                championAudio.play();
                }
                $('#wrapper').empty();
                clearInterval(intervalID);
                countClock=0;
                $('#restartGame').modal({
                    backdrop: 'static',
                    keyboard: false
                })
                $('#restartGame').modal({show: true});
                
                //When Rematch Button is hit
                $('.rematch').on("click", function() {
                    event.preventDefault();
                    loss = 0;
                    wins = 0;
                    countClock = 8;
                    countDown();
                })

                //When Quit Game is hit
                $('.quitGame').on("click", function() {
                    event.preventDefault();
                    database.ref('messages').remove();
                    location.reload();
                })
            }
            break;
            case 7: 
            countClock++;
            break;
            case 8:
            //empty wrapper
            $("#wrapper").empty();
            countClock=0;
            clearInterval(intervalID);
            stageSet = false;
            database.ref('connections/'+playerKey+'/userInput').remove();
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

//ADD MESSENGER LISTENER TO SEE IF THE USER FILLED OUT THE TRASH TALKING MODULE AND SUBMITTED THEIR FEELINGS
$('.feelingsBtn').on("click", function() {
    if (playerName !== "") {
        event.preventDefault();
        userMessage = $('#inputTrash').val().trim();

        database.ref('/messages').push({
            userMessage: playerName+': '+userMessage
        })
    }
})

database.ref('messages').on("child_added", function(snap) {
    let messageKey = snap.child('userMessage').val();
    var newLI = $('<li>');
        newLI.text(messageKey);
        $('.boxMessage').prepend(newLI);
})



