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
let chart1, chart2, chart3, chart4, countries;

function initDashboard(_data) {

    // TODO: Initialize the environment (SVG, etc.) and call the nedded methods
     countries = ['Nigeria', 'Ghana']
    
     const dataPreprocessing = new DataPreprocessing(_data, countries)
 
     //top 10

 
    d3.json("https://raw.githubusercontent.com/d3/d3.github.com/master/world-110m.v1.json").then(function(data) {  
        dataPreprocessing.renderMap(data);  
    }); 

  

    //  SVG containerss
    
    //
    dataPreprocessing.createBarChart()
    dataPreprocessing.createLineChart()
    //  SVG container
    dataPreprocessing.createCorrelationHeatMap()
  


}





// clear files if changes (dataset) occur
function clearDashboard() {

    chart1.selectAll("*").remove();
    chart2.selectAll("*").remove();
    chart3.selectAll("*").remove();
    chart4.selectAll("*").remove();
}

