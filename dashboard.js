/*
 * Data Visualization - Framework
 * Copyright (C) University of Passau
 *   Faculty of Computer Science and Mathematics
 *   Chair of Cognitive sensor systems
 * Maintenance:
 *   2024, Alexander Gall <alexander.gall@uni-passau.de>
 *
 * All rights reserved.
 */

// TODO: File for Part 2
// TODO: You can edit this file as you wish - add new methods, variables etc. or change/delete existing ones.

// TODO: use descriptive names for variables
let chart1, chart2, chart3, chart4;
let countries = [];
let selectedYear;
let drawchart, worldsoninfo, dashboard_data;
let colors = d3.scaleOrdinal(d3.schemeCategory10);
document.addEventListener("DOMContentLoaded", function () {
  // Select chart elements from the DOM using D3
  chart1 = d3.select("#chart1"); // Adjust with your actual selector
  chart2 = d3.select("#chart2"); // Adjust with your actual selector
  chart3 = d3.select("#chart3"); // Adjust with your actual selector
  chart4 = d3.select("#chart4"); // Adjust with your actual selector

  // Call initDashboard function after selecting elements
  initDashboard(data);
});

function initDashboard(_data) {

  dashboard_data = data;

  // TODO: Initialize the environment (SVG, etc.) and call the needed methods
  //   countries = ["Nigeria", "Ghana"];
  selectedYear = 2000;

  drawchart = new DrawChart(
    _data,
    countries,
    selectedYear,
    chart1,
    chart2,
    chart3,
    chart4,
    colors
  );

  d3.json(
    "https://raw.githubusercontent.com/d3/d3.github.com/master/world-110m.v1.json"
  )
    .then(function (info) {
      worldjsoninfo = info;
      drawchart.renderMap(info);
    })
    .catch(function (error) {
      console.error("Error loading world map data:", error);
    });

  // Populate year filter dropdown
  drawchart.populateFilterWithYear();

  // Initial rendering of charts
  drawchart.createBarChart();
  drawchart.createLineChart();
  drawchart.drawPieChart()

  let playing = false;  
let interval;  
const minYear = 1980;  
const maxYear = 2022;  
const step = 1; 

  // Attach the update function to the year filter dropdown
  document.getElementById("yearFilter").addEventListener("change", update);

  document.getElementById('play-button').addEventListener('click', () => {  
    playing = !playing;  
    const playButton = document.getElementById('play-button');  
      
    if (playing) {  
        playButton.textContent = '⏸️ Pause time-lapse';  
        interval = setInterval(() => {  
            let yearfilter = document.getElementById("yearFilter") ; 
            let slider = document.getElementById('year-slider'); 
            let currentYearSpan = document.getElementById("current-year")
            let currentYear = parseInt(slider.value);  
            if (currentYear < maxYear) {  
              yearfilter.value = currentYear + step;
              currentYearSpan.innerText = currentYear + step  
              slider.value = currentYear + step;
                updateYear(currentYear + step);  
                updateTime()
            } else {  
                clearInterval(interval);  
                playing = false;  
                playButton.textContent = '▶ Play time-lapse';  
                
            }  
        }, 4000); // Change the interval as needed  
    } else {  
        clearInterval(interval);  
        playButton.textContent = '▶ Play time-lapse';  
    }  
});  

document.getElementById('year-slider').addEventListener('input', (event) => {  
  const year = event.target.value; 
  let currentYearSpan = document.getElementById("current-year")
  currentYearSpan.innerText = year 
  updateYear(year);  
  updateTime()

});


}


function updateYear(year){
  drawchart.setSelectedYear(year)
}

function updateTime(){
  
  // Clear the existing charts if needed
  clearDashboard()

  // Redraw the charts with the new data
  drawchart.createBarChart();
  drawchart.createLineChart();
  drawchart.renderMap(worldjsoninfo);
  drawchart.drawPieChart()
}

function update() {
  // Get the new selected year

  selectedYear = document.getElementById("yearFilter").value;

  // Update the DrawChart instance with the new year
  drawchart.setSelectedYear(selectedYear);

  // Clear the existing charts if needed
  clearDashboard()

  // Redraw the charts with the new data
  drawchart.createBarChart();
  drawchart.createLineChart();
  drawchart.renderMap(worldjsoninfo);
  drawchart.drawPieChart()
}

function updateCountries(countries){
  drawchart.setSelectedCountries(countries)
}

function updateLineChart(){
  if (chart3) chart3.selectAll("*").remove();
  countries = d3.scaleOrdinal(d3.schemeCategory10);
  drawchart.createLineChart()
}



// clear files if changes (dataset) occur
function clearDashboard() {
  // Check if charts are defined before clearing them
  if (chart1) chart1.selectAll("*").remove();
  if (chart2) chart2.selectAll("*").remove();
  if (chart3) chart3.selectAll("*").remove();
  if (chart4) chart4.selectAll("*").remove();
}
