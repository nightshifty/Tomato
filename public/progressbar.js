

function setCircleDasharray(percentage) {
    const circleDasharray = `${(
        percentage * 2.83
    ).toFixed(0)} 283`;
    document
        .getElementById("base-timer-path-remaining")
        .setAttribute("stroke-dasharray", circleDasharray);
}