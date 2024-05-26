/** handle data preprocessing 
 * @param data the dataset
*/
 class DataPreprocessing {
   //initialization of the data

   constructor(data) {
     this.data = data;
   }
   /** check if dataset has null values */
   prepocessCharacters() {
     this.data = Object.values(this.data);
     if (typeof this.data !== "object" || this.data === null) {
       console.log("Object is not iterable.");
       return;
     }

     for (let key in this.data) {
       if (this.data.hasOwnProperty(key)) {
         let value = this.data[key];
         console.log(value, "value");
         if (typeof value !== "number") {
           console.log(value, "is number");
           let intValue = parseInt(value);
           if (!isNaN(intValue)) {
             this.data[key] = intValue;
             console.log(`Value converted to int: ${value}`);
           } else {
             console.log(`Could not convert value to int: ${value}`);
           }
         }
       }
     }
     return this.data;
   }

   // Example usage

   /** render world map of country */
   renderMap(world) {
     var width = 600;
     var height = 500;

     var projection = d3
       .geoNaturalEarth1()
       .scale(150)
       .translate([width / 2, height / 2]);

     var path = d3.geoPath().projection(projection);

     // Create a mapping between country names and GDP values
     var gdpMap = {};

     this.data.forEach((country) => {
       gdpMap[country.Country] = country["2022"]; // Change this to the desired year
     });

     // Create color scale based on GDP values
     var colorScale = d3
       .scaleSequential()
       .domain([0, d3.max(this.data.map((country) => country["2022"]))]) // Change this to the desired year
       .interpolator(d3.interpolateViridis); // Or any other color scheme

     // Append SVG element
     var svg = d3
       .select("#chart1")
       .append("svg")
       .attr("width", width)
       .attr("height", height);

     // Load world map data

     // Draw countries
     svg
       .selectAll("path")
       .data(topojson.feature(world, world.objects.countries).features)
       .enter()
       .append("path")
       .data(topojson.feature(world, world.objects.countries).features)
       .attr("d", path)
       .attr("fill", function (d) {
         //TODO add property color
         var countryGDP = gdpMap[d.properties.name];
         console.log(countryGDP, "the country gpd");
         console.log("gpd property", d);
         return countryGDP ? colorScale(countryGDP) : "#ccc"; // Fallback color for missing data
       })
       .attr("stroke", "#fff"); // Add stroke for better visualization
   }

   calculateCorrelations() {
     /* // Extract the attributes into separate arrays  
    const attributes = [];  
    for (let i = 1; i < 12; i++) {  
      attributes.push(this.data.map((row) => parseFloat(row[i])));  
    }  
  
    // Calculate the mean of each attribute  
    const means = attributes.map((attribute) => attribute.reduce((sum, value) => sum + value, 0) / attribute.length);  
  
    // Calculate the covariance matrix  
    const covarianceMatrix = [];  
    for (let i = 0; i < 12; i++) {  
      covarianceMatrix[i] = [];  
      for (let j = 0; j < 12; j++) {  
        let covariance = 0;  
        for (let k = 0; k < this.data.length; k++) {  
          covariance += (attributes[i][k] - means[i]) * (attributes[j][k] - means[j]);  
        }  
        covariance /= this.data.length;  
        covarianceMatrix[i][j] = covariance;  
      }  
    }  
  
    // Calculate the standard deviation of each attribute  
    const stdDeviations = attributes.map((attribute) => Math.sqrt(attribute.reduce((sum, value) => sum + Math.pow(value - means[i], 2), 0) / attribute.length));  
  
    // Calculate the correlation matrix  
    const correlationMatrix = [];  
    for (let i = 0; i < 12; i++) {  
      correlationMatrix[i] = [];  
      for (let j = 0; j < 12; j++) {  
        const correlation = covarianceMatrix[i][j] / (stdDeviations[i] * stdDeviations[j]);  
        correlationMatrix[i][j] = correlation;  
      }  
    }  
  
    console.log(correlationMatrix); */
   }

   // Usage:

   updateFilterByYear() {}

   /** calculate correlation coefficient */
   calculateCorrelation(data1, data2) {
     if (data1.length !== data2.length) {
       throw new Error("Input arrays must have the same length");
     }

     const n = data1.length;

     // Calculate the mean of each dataset
     const mean1 = data1.reduce((acc, val) => acc + val, 0) / n;
     const mean2 = data2.reduce((acc, val) => acc + val, 0) / n;

     // Calculate the sum of the products of the differences from the mean
     let covariance = 0;
     let variance1 = 0;
     let variance2 = 0;

     for (let i = 0; i < n; i++) {
       const diff1 = data1[i] - mean1;
       const diff2 = data2[i] - mean2;

       covariance += diff1 * diff2;
       variance1 += diff1 * diff1;
       variance2 += diff2 * diff2;
     }

     // Calculate the correlation coefficient
     const correlation = covariance / Math.sqrt(variance1 * variance2);

     return correlation;
   }

   createCorrelationHeatMap() {
     // Assuming gdpData is your dataset

     // Calculate correlation matrix
     var years = Object.keys(this.data[0]).filter(
       (key) => key !== "Country" && key !== "id"
     ); // Get years
     var correlationMatrix = years.map((year1) => {
       return years.map((year2) => {
         var values1 = this.data.map((country) => country[year1]);
         var values2 = this.data.map((country) => country[year2]);
         return (
           d3.mean(d3.zip(values1, values2).map(([x, y]) => x * y)) -
           d3.mean(values1) * d3.mean(values2)
         );
       });
     });

   
     // Set up heatmap dimensions
     var margin = { top: 50, right: 50, bottom: 50, left: 50 };
     var width = 500 - margin.left - margin.right;
     var height = 500 - margin.top - margin.bottom;

     // Create SVG container
     var svg = d3
       .select("#chart4")
       .append("svg")
       .attr("width", width + margin.left + margin.right)
       .attr("height", height + margin.top + margin.bottom)
       .append("g")
       .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

     // Create color scale
     var colorScale = d3.scaleSequential(d3.interpolateRdBu).domain([-1, 1]); // Adjust domain based on correlation values

     // Create heatmap rectangles
       svg
       .selectAll(".heatmap")
       .data(correlationMatrix)
       .enter()
       .append("g")
       .attr("class", "row")
       .selectAll(".cell")
       .data((d) => d)
       .enter()
       .append("rect")
       .attr("class", "cell")
       .attr("x", (d, i) => i * (width / years.length))
       .attr("y", (d, i) => i * (height / years.length))
       .attr("width", width / years.length)
       .attr("height", height / years.length)
       .style("fill", (d) => colorScale(d));

       // Add color scale legend
var legendWidth = 100;
var legendHeight = 20;
var legend = svg.append("g")
    .attr("class", "legend")
    .attr("transform", "translate(" + (width - legendWidth) + "," + (height - legendHeight) + ")");

var legendScale = d3.scaleLinear()
    .domain([-1, 1])
    .range([0, legendWidth]);

var legendAxis = d3.axisBottom(legendScale)
    .ticks(5)
    .tickFormat(d3.format(".1f"));

legend.append("g")
    .attr("class", "legend-axis")
    .attr("transform", "translate(0," + legendHeight + ")")
    .call(legendAxis);

// Add labels to heatmap cells
var cellLabels = svg.selectAll(".cell-label")
    .data(correlationMatrix)
    .enter().append("g")
    .attr("class", "cell-label")
    .selectAll(".label")
    .data((d, i) => d.map((value, j) => ({ value, i, j })))
    .enter().append("text")
    .attr("class", "label")
    .attr("x", d => (d.j + 0.5) * (width / years.length))
    .attr("y", d => (d.i + 0.5) * (height / years.length))
    .attr("dy", "0.35em")
    .attr("text-anchor", "middle")
    .style("fill", "black")
    .text(d => d3.format(".2f")(d.value));

       
   }

   top10CountryHighestGdp() {
     // Sort the data in descending order based on the "2022" attribute
     this.data = this.data.sort((a, b) => b["2023"] - a["2023"]);

     // Get the top 10 highest values
     const top10 = this.data.slice(0, 10);

     return top10;
   }
   createBarChart() {
     let top10 = this.top10CountryHighestGdp();

     const margin = { top: 20, right: 20, bottom: 40, left: 40 };
     const width = 600 - margin.left - margin.right;
     const height = 400 - margin.top - margin.bottom;

     // Create an SVG container
     const svg = d3
       .select("#chart2")
       .append("svg")
       .attr("width", width + margin.left + margin.right)
       .attr("height", height + margin.top + margin.bottom)
       .append("g")
       .attr("transform", `translate(${margin.left},${margin.top})`);

     let year = "2021";

     const x = d3
       .scaleLinear()
       .domain([
         0,
         d3.max(top10, (d) => parseFloat(d[year].toString().replace(/,/g, ""))),
       ])
       .range([0, width]);

     const y = d3
       .scaleBand()
       .domain(top10.map((d) => d.Country))
       .range([0, height])
       .padding(0.1);

     svg
       .append("g")
       .attr("class", "x-axis")
       .attr("transform", `translate(0,${height})`)
       .call(d3.axisBottom(x).ticks(5).tickFormat(d3.format(".2s")))
       .append("text")
       .attr("class", "axis-label")
       .attr("x", width)
       .attr("y", margin.bottom - 10)
       .attr("text-anchor", "end")
       .text("GDP (in billion USD)");

     // Add y-axis
     svg
       .append("g")
       .attr("class", "y-axis")
       .call(d3.axisLeft(y))
       .append("text")
       .attr("class", "axis-label")
       .attr("x", -margin.left)
       .attr("y", -margin.top) // Adjusted position
       .attr("dy", "6em") // Added for better alignment
       .style("text-anchor", "start")
       .attr("transform", "rotate(-90)") // Rotated for vertical orientation
       .style("font-size", "14px") // Adjust font size
       .style("font-family", "Arial, sans-serif") // Adjust font family
       .text("Country");

     // Add bars
     svg
       .selectAll(".bar")
       .data(top10)
       .enter()
       .append("rect")
       .attr("class", "bar")
       .attr("x", x(0))
       .attr("y", (d) => y(d.Country))
       .attr("width", (d) =>
         x(parseFloat(d[year].toString().replace(/,/g, "")))
       )
       .attr("height", y.bandwidth());
   }

   // Call the createHistogram function
 }

