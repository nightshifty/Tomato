let playBTn = $("#playbtn");
let finishTime;
let pomodoroTime = 0.1; //should be 25, is 0.1 for testing only
let timerRunning;
let remainingminutes;
let remainingseconds;
let remainingTimePerCent;
let audio = document.getElementById("audio"); 

//function called when clicked on update Pomodoro time, changes Pomodorotime in DB if logged in
function setPomTime(){
    pomodoroTime = document.getElementById("pomTime").value;
    if(pomodoroTime>0 && pomodoroTime<99999){
        $('#timer').attr('data-timetext', pomodoroTime + " : 00");
        //Tries to change the Pomodorotime back in the DB:
        $.post("/changePomoTime",
                {
                    newtime: pomodoroTime
                });
        }
}

//function called when clicked on update Pomodoro time, changes Pomodorotime in DB if logged in
function getPomoTimeFromDB(){
	$.getJSON("/getPomoTime")
  	.done(function( data ) {
    console.log("received JSON with PomoTime");
    $.each( data, function( key, val ) {
      pomodoroTime = val.POMOTIME;
      console.log("KEY" + key + " VAL "+val.POMOTIME + " Time from json =" + pomodoroTime);
      $('#timer').attr('data-timetext', pomodoroTime + " : 00");
    });
})
  .fail(function( jqxhr, textStatus, error ) {
    var err = textStatus + ", " + error;
    console.log( "Request Failed: " + err );
});
}



playBTn.click(function(){
    togglePlayBtn();
    
});

function togglePlayBtn(){
    "use strict";
    if(playBTn.text() === "START") {
        $('#timer').attr('data-timetext',pomodoroTime+" : 00");
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
        audio.play();
        trackTime();
    }

    

}

function trackTime(){
    $.post("/trackTime",
			{
				time: pomodoroTime,
				task: workingOnTaskID
            });
        refreshToDolist();
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