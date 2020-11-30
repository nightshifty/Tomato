let playBTn = $("#playbtn");
let finishTime;
let pomodoroTime = document.getElementById("pomTime").value;
let timerRunning;
let remainingminutes;
let remainingseconds;
let remainingTimePerCent;

//get pomotime 
function getPomTime(){
    pomodoroTime = document.getElementById("pomTime").value;
}



playBTn.click(function(){
    togglePlayBtn();
});

function togglePlayBtn(){
    "use strict";
    if(playBTn.text() === "START") {
        startTimer();
        playBTn.text("RESET");
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
    if(finishTime>=Date.now()){
        remainingseconds = Math.round((finishTime-Date.now()) / 1000);
        remainingminutes = Math.floor(remainingseconds / 60);
        remainingseconds-= remainingminutes*60;
        $("#minutes").text(remainingminutes);
        $("#seconds").text(remainingseconds);
        remainingTimePerCent = (remainingminutes*60+remainingseconds)/((pomodoroTime*60)/100)
        updateProgressBar(remainingTimePerCent);
    }else{
        remainingseconds = 0;
        remainingTimePerCent = 0;
        updateProgressBar(0)
        stopTimer();
    }
}

function updateProgressBar(percentage){
    let $circle = $('#svg #bar');
    
    let r = $circle.attr('r');
    let c = Math.PI*(r*2);
    let pct = ((100-percentage)/100)*c;
    $circle.css({ strokeDashoffset: pct});
    if(remainingseconds<10)
        remainingseconds="0"+remainingseconds;
    $('#timer').attr('data-timetext',remainingminutes+" : "+remainingseconds);


}