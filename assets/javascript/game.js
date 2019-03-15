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
var player1Choice = [0,0,0];
var player2Choice = [0,0,0];

database.ref().on("value", function(snap) {
    console.log(snap);
})


//count clock for function
var countClock = 0;
// $('#myModal').modal({show: true});
$('#myModal').on('shown.bs.modal', function () {
    $('#myInput').trigger('focus')
})

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
            countClock = 0;
            clearInterval(intervalID);
            break;
        }
    }


    
    $(".ready").on("click", function() {
        event.preventDefault();
        //-----execute once both players are queued up
        // $('#myModal').modal({show: true});
        // var intervalID = setInterval(countDown, 1250);
        var firstName = $("#firstName").val().trim();
        var email = $("#email").val().trim();
    })
    

    //function to get random giffy URL
    function getGif(search, tag) {
        clearInterval(intervalID2);
        var urlQuery = "https://api.giphy.com/v1/gifs/random?api_key=dc6zaTOxFJmzC&tag="+search;
        $.ajax({
            url: urlQuery,
            method: "GET"
        }).then(function(response) {
            $(tag).attr("src", response.data.images.original.url);
    });
}

var intervalID2 = setInterval(getGif("loading", ".imageLoading"), 4000);
