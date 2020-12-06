/**
 * Actually a part of the timer, excluded to make clear it´s an (modified) external code snippet
 */

/**
 * modified EXTERNAL CODE SNIPPET
 * Credit: Mateusz Rybczonec
 * https://css-tricks.com/how-to-create-an-animated-countdown-timer-with-html-css-and-javascript/
 */
function setCircleDasharray(percentage) {
    const circleDasharray = `${(
        percentage * 2.83
    ).toFixed(0)} 283`;
    document
        .getElementById("base-timer-path-remaining")
        .setAttribute("stroke-dasharray", circleDasharray);
}
//end of modified external code snippet