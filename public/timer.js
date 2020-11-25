let playBTn = $("#playbtn");
let finishTime;
let pomodoroTime = 25;
let timerRunning;

playBTn.click(function(){
    togglePlayBtn();
});

function togglePlayBtn(){
    "use strict";
    if(playBTn.text() === "START") {
        startTimer();
        playBTn.text("STOP");
    }
    else {
        stopTimer();
        playBTn.text("START");
    }
}

function startTimer(){
    "use strict";
    let millisecondsToAdd = pomodoroTime*60*1000;
    finishTime = Date.now()+millisecondsToAdd;
    timerRunning = setInterval(function(){ timer(); }, 1000);
}

function stopTimer(){
    "use strict";
    clearInterval(timerRunning);
}

function timer(){
    "use strict";
    console.log("timer started...")
    if(finishTime>Date.now()){
        let remainingseconds = Math.round((finishTime-Date.now()) / 1000);
        let remainingminutes = Math.floor(remainingseconds / 60);
        remainingseconds-= remainingminutes*60;
        $("#minutes").text(remainingminutes);
        $("#seconds").text(remainingseconds);
    }
}
