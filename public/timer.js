/**
 * Containing neccessary functions for the timer
 */

let playBTn = $("#playbtn");
let finishTime;
let pomodoroTime = 0.3; //only integer > 0(can be set to 0.1 for testing reasons, bugs possible if so)
let timerRunning;
let remainingminutes;
let remainingseconds;
let remainingTimePerCent;
let audio = document.getElementById("audio"); 

/**
 * function called when clicked on update Pomodoro time in settings, 
 * changes Pomodorotime in DB if logged in using AJAX
 */
function setPomTime(){
    pomodoroTime = document.getElementById("pomTime").value;
    if(pomodoroTime>0 && pomodoroTime<99999){
        $("#remainingtime").text(pomodoroTime+" : 00");
        //Tries to change the Pomodorotime back in the DB:
        $.post("/changePomoTime",
                {
                    newtime: pomodoroTime
                });
        }
}

/**
 * function called on side loading.
 * Loads saved Pomodoro time from Database for signed in users only
 * updates text on screen
 */
function getPomoTimeFromDB(){
	$.getJSON("/getPomoTime")
  	.done(function( data ) {
    console.log("received JSON with PomoTime");
    $.each( data, function( key, val ) {
      pomodoroTime = val.POMOTIME;
      console.log("KEY" + key + " VAL "+val.POMOTIME + " Time from json =" + pomodoroTime);
      $("#remainingtime").text(pomodoroTime+" : 00");
    });
})
  .fail(function( jqxhr, textStatus, error ) {
    var err = textStatus + ", " + error;
    console.log( "Request Failed: " + err );
});
}

/**
 * onclick function to start/stop the timer
 */
playBTn.click(function(){
    "use strict";
    if(playBTn.text() === "START") {
        $("#remainingtime").text(pomodoroTime+" : 00");
        startTimer();
        playBTn.text("STOP");
        
    }
    else {
        stopTimer();
        playBTn.text("START");
    }
});

/**
 * setting up timer, creating interval each 1sec for timer
 */
function startTimer(){
    "use strict";
    let millisecondsToAdd = pomodoroTime*60*1000;
    finishTime = Date.now()+millisecondsToAdd;
    timerRunning = setInterval(function(){ timer(); }, 1000);
}

/**
 * stops the timer interval, changes button back to starting version
 */
function stopTimer(){
    "use strict";
    playBTn.text("START");
    clearInterval(timerRunning);
}

/**
 * Called once a second when timer is running.
 * Counts remaining time down, updates text showed on timer
 * Calls function to update the progressbar
 * Checks for date instead of only be called each second to avoid lacks/bugs
 * If time is over it calls the function to stop the timer
 */
function timer(){
    "use strict";
    console.log("timer started...")
    if(finishTime>=Date.now()){
        remainingseconds = Math.round((finishTime-Date.now()) / 1000);
        remainingminutes = Math.floor(remainingseconds / 60);
        remainingseconds-= remainingminutes*60;
        let sec, min;
        remainingseconds<10 ? sec = "0"+remainingseconds : sec=remainingseconds;
        remainingminutes<10 ? min = "0"+remainingminutes : min=remainingminutes;
        $("#remainingtime").text(min+" : "+sec);
        remainingTimePerCent = (remainingminutes*60+remainingseconds)/((pomodoroTime*60)/100);
        setCircleDasharray(remainingTimePerCent);
       
    }else{
        remainingseconds = 0;
        remainingTimePerCent = 0;
        stopTimer();
        $("#remainingtime").text("00 : 00");
        audio.play();
        trackTime();
        setCircleDasharray(0);
    }

    

}

/**
 * called if one complete timer ended succesfully (not when stopped manually)
 * sends the time and task to the database for signed in users
 */
function trackTime(){
    $.post("/trackTime",
			{
				time: pomodoroTime,
				task: workingOnTaskID
            });
        refreshToDolist();
}

