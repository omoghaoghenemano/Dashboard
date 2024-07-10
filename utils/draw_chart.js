/** handle data preprocessing
 * @param data the dataset
 */
class DrawChart extends PreprocessData {
  //initialization of the data

  constructor(data, countries, selectedYear, chart1, chart2, chart3, chart4,colors) {
    super(data, selectedYear);
    this.data = this.format_dataset(data);
    this.countries = countries;
    this.selectedYear = selectedYear;
    this.chart1 = chart1;
    this.chart2 = chart2;
    this.chart3 = chart3;
    this.chart4 = chart4;
    this.colors = colors
    
  }

  //set selected year
  setSelectedYear(year) {
    this.selectedYear = year;

  }


 
  setSelectedCountries(countries) {  
    this.countries = countries;  
}  

    // Method to draw Pie Chart: GDP Distribution by Continent  
    drawPieChart() {  
      // Aggregate GDP by continent  
      const continentGDP = {};  
      this.data.forEach((country) => {  
        const continent = country.Continent; // Assuming your data has a 'Continent' field  
        const gdp = parseFloat(country[this.selectedYear]);  
        if (!isNaN(gdp) && continent !== 'Unknown') {  
          if (continentGDP[continent]) {  
            continentGDP[continent] += gdp;  
          } else {  
            continentGDP[continent] = gdp;  
          }  
        }  
      });  
    
      // Convert the aggregated data into an array suitable for D3 pie chart  
      const pieData = Object.keys(continentGDP).map((continent) => ({  
        continent: continent,  
        gdp: continentGDP[continent],  
      }));  
    
      const width = 500;  
      const height = 300;  
      const radius = Math.min(width, height) / 2;  
    
       
    
      const pie = d3.pie().value((d) => d.gdp);  
    
      const arc = d3.arc().outerRadius(radius - 10).innerRadius(0);  
    
      const labelArc = d3.arc().outerRadius(radius - 40).innerRadius(radius - 40);  
      const colors = d3.scaleOrdinal(d3.schemeCategory10);
      const svg = d3  
        .select("#chart4") // Assuming you want to draw the pie chart in chart2  
        .append("svg")  
        .attr("width", width)  
        .attr("height", height)  
        .append("g")  
        .attr("transform", `translate(${width / 2},${height / 2})`);  
    
      const g = svg  
        .selectAll(".arc")  
        .data(pie(pieData))  
        .enter()  
        .append("g")  
        .attr("class", "arc");  
    
        g.append("path")  
        .attr("d", arc)  
        .style("fill", (d) => colors(d.data.continent))  
        .transition()  
        .duration(1000)  
        .attrTween("d", function (d) {  
            const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);  
            return function (t) {  
                return arc(interpolate(t));  
            };  
        });
      g.append("text")  
        .attr("transform", (d) => `translate(${labelArc.centroid(d)})`)  
        .attr("dy", ".35em")  
        .text((d) => d.data.continent);  
    
        // Optional: Add a legend  
        const legend = svg  
        .selectAll(".legend")  
        .data(colors.domain())  
        .enter()  
        .append("g")  
        .attr("class", "legend")  
        .attr("transform", (d, i) => `translate(-35,${i * 20 - height / 2})`);  
    
      legend  
        .append("rect")  
        .attr("x", width / 2 - 18)  
        .attr("width", 18)  
        .attr("height", 18)  
        .style("fill", colors);  
    
      legend  
        .append("text")  
        .attr("x", width / 2 - 24)  
        .attr("y", 9)  
        .attr("dy", ".35em")  
        .style("text-anchor", "end")  
        .text((d) => d);  
    }  
    
    createLineChart() {
      const lineChartWidth = 500;
      const lineChartHeight = 300;
      const margin = { top: 20, right: 20, bottom: 50, left: 50 };
  
      this.chart3 = d3
        .select("#chart3")
        .append("svg")
        .attr("width", lineChartWidth + margin.left + margin.right)
        .attr("height", lineChartHeight + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
        console.log("did countries update", this.countries)
      // Prepare the data
      const parseYear = d3.timeParse("%Y");

      if(this.countries.length < 1){
        let top = this.top10CountryHighestGdp()
        //use only top 10 countries if the array length is less 1
        let countriesArray = Array.from(top).map(d => d.Country);
        this.countries = countriesArray
    
      }
      // Add other countries as needed
      const selectedData = this.data.filter((d) =>
        this.countries.includes(d.Country)
      );
  
      // Prepare scales and axes
      const xScale = d3
        .scaleTime()
        .domain([parseYear(1980), parseYear(2022)])
        .range([0, lineChartWidth]);
  
      const yScale = d3
        .scaleLinear()
        .domain([
          0,
          d3.max(selectedData, (d) =>
            d3.max(
              Object.keys(d)
                .filter((k) => k.match(/^\d{4}$/))
                .map((k) => +d[k])
            )
          ),
        ])
        .range([lineChartHeight, 0]);

      // Calculate tick values for every 5 years  
  const tickValues = [];  
  for (let year = 1980; year <= 2022; year += 5) {  
    tickValues.push(parseYear(year.toString()));  
  }  
  
  const xAxis = d3.axisBottom(xScale).tickValues(tickValues).tickFormat(d3.timeFormat("%Y"));  
  const yAxis = d3.axisLeft(yScale);  
  // Define the brush  
// Define the brush  
const brush = d3.brushX()  
  .extent([[0, 0], [lineChartWidth, lineChartHeight]])  
  .on("brush end", this.brushed);  
  
// Add the brush to the chart  
this.chart3.append("g")  
  .attr("class", "brush")  
  .call(brush);  
  
this.chart3  
  .append("g")  
  .attr("transform", "translate(0," + lineChartHeight + ")")  
  .call(xAxis);  
  
this.chart3.append("g").call(yAxis);  
  // Draw lines  
  const line = d3  
    .line()  
    .x((d) => xScale(parseYear(d.year)))  
    .y((d) => yScale(d.value));  
    
  selectedData.forEach((countryData, index) => {  
    const country = countryData.Country;  
    const data = Object.keys(countryData)  
      .filter((k) => k.match(/^\d{4}$/))  
      .map((k) => ({ year: k, value: +countryData[k] }));  
    
    const path = this.chart3  
      .append("path")  
      .datum(data)  
      .attr("fill", "none")  
      .attr("stroke", this.colors(index))  
      .attr("stroke-width", 1.5)  
      .attr("class", "line")  
      .attr("d", line)  
      .attr("title", country); // Move title attribute directly to the path  
    
    // Get the total length of the path  
    const totalLength = path.node().getTotalLength();  
    
    path  
      .attr("stroke-dasharray", totalLength + " " + totalLength)  
      .attr("stroke-dashoffset", totalLength)  
      .transition()  
      .duration(2000)  
      .attr("stroke-dashoffset", 0);  
    
    this.chart3  
      .selectAll(".dot" + index) // Unique class for each country  
      .data(data)  
      .enter()  
      .append("circle")  
      .attr("class", "dot" + index)  
      .attr("cx", (d) => xScale(parseYear(d.year)))  
      .attr("cy", (d) => yScale(d.value))  
      .attr("r", 3)  
      .attr("fill", this.colors(index))  
      .attr("opacity", 0)  
      .transition()  
      .duration(2000)  
      .attr("opacity", 1);  
  });  
   
    
      
      // Add legend
      const legend = this.chart3
        .selectAll(".legend")
        .data(this.countries)
        .enter()
        .append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => "translate(0," + i * 20 + ")");
  
      legend
        .append("rect")
        .attr("x", lineChartWidth - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", (d, i) => this.colors(i));
  
      legend
        .append("text")
        .attr("x", lineChartWidth - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text((d) => d);
    }

// Brushing function  
 brushed(event) {  
  const selection = event.selection;  
  if (selection === null) return; // If no selection, return  
  
  const [x0, x1] = selection.map(xScale.invert, xScale); // Get the selected range in the domain  
  
  // Update the xScale domain based on the brush selection  
  xScale.domain([x0, x1]);  
  
  // Redraw the axes with the updated scale  
  this.chart3.select(".x-axis").call(xAxis);  
  this.chart3.select(".y-axis").call(yAxis);  
  
  // Redraw the lines with the updated scale  
  this.chart3.selectAll(".line")  
    .attr("d", line);  
  
  // Redraw the circles with the updated scale  
  selectedData.forEach((countryData, index) => {  
    this.chart3.selectAll(".dot" + index)  
      .attr("cx", (d) => xScale(parseYear(d.year)))  
      .attr("cy", (d) => yScale(d.value));  
  });  
}  

  /** render world map of country */
  renderMap(world) {
    // Get the screen width
    var width = window.innerWidth;
    var height = 300;
    

    var projection = d3
      .geoNaturalEarth1()
      .scale(100)
      .translate([width / 2, height / 2]);

    var path = d3.geoPath().projection(projection);

    // Create a mapping between country names and GDP values
    var gdpMap = {};
    this.data.forEach((country) => {
      gdpMap[country.Country] = country[this.selectedYear]; // Change this to the desired year
    });

    // Extract and filter GDP values
    var gdpValues = Object.values(gdpMap)
      .map((value) => parseFloat(value))
      .filter((value) => !isNaN(value));

    // Create color scale based on GDP values
    var colorScale = d3
      .scaleSequential(d3.interpolateYlGnBu)
      .domain([d3.min(gdpValues), d3.max(gdpValues)]); // Ensure higher values are brighter

    // Append SVG element
    this.chart1 = d3
      .select("#chart1")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    // Load world map data
    var countryNames = this.get_country();
    // Variable to keep track of the currently selected country  
    var selectedCountries = new Set();
    // Draw countries
    this.chart1
      .selectAll("path")
      .data(topojson.feature(world, world.objects.countries).features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("fill", function (d) {
        var names = countryNames[d.id];
        return gdpMap[names] ? colorScale(gdpMap[names]) : "none"; // Use "none" for no fill
      })
      .style("stroke", function (d) {
        var names = countryNames[d.id];
        return gdpMap[names] ? "none" : "#ccc"; // Use a light gray for stroke if no data
      })
      .style("stroke-dasharray", function (d) {
        var names = countryNames[d.id];
        return gdpMap[names] ? "0" : "3"; // Apply dashed stroke only if no data
      })
      .on("click", function(event, d) {  
        var names = countryNames[d.id];  
        var countryPath = d3.select(this);  
      
        // Toggle the country's selection  
        if (selectedCountries.has(names)) {  
            selectedCountries.delete(names);  
            countryPath.attr("fill", gdpMap[names] ? colorScale(gdpMap[names]) : "none");  
        } else {  
            selectedCountries.add(names);  
            countryPath.attr("fill", "orange"); // or any color you prefer for highlighting  
        }  
        
        var countries = [...selectedCountries]

        updateCountries(countries)
        updateLineChart()

  

    })  
    .on("mouseover", function (event, d) {
        var names = countryNames[d.id];
        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip
          .html("Country: " + names + "<br>GDP: " + gdpMap[names])
          .style("left", event.pageX + "px")
          .style("top", event.pageY - 28 + "px");
      })
      .on("mouseout", function (event, d) {
        tooltip.transition().duration(500).style("opacity", 0);
      });

    // Tooltip for hover effect
    var tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    // Append a group element for the legend
    var legendWidth = 300;
    var legendHeight = 10;

    var legend = this.chart1
      .append("g")
      .attr("class", "legend")
      .attr(
        "transform",
        "translate(" + (width - legendWidth) / 2 + "," + (height - 30) + ")"
      );

    // Create a gradient for the legend
    var defs = this.chart1.append("defs");

    var linearGradient = defs
      .append("linearGradient")
      .attr("id", "linear-gradient");

    linearGradient
      .selectAll("stop")
      .data(d3.range(0, 1.1, 0.1))
      .enter()
      .append("stop")
      .attr("offset", (d) => d)
      .attr("stop-color", (d) =>
        colorScale(
          d3.min(gdpValues) + d * (d3.max(gdpValues) - d3.min(gdpValues))
        )
      );

    // Draw the rectangle and fill with gradient
    legend
      .append("rect")
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .style("fill", "url(#linear-gradient)");

    // Create a scale for the legend
    var xScale = d3
      .scaleLinear()
      .domain([d3.min(gdpValues), d3.max(gdpValues)])
      .range([0, legendWidth]);

    // Add an axis for the legend
    var xAxis = d3.axisBottom(xScale).ticks(5).tickSize(legendHeight);

    legend
      .append("g")
      .attr("transform", "translate(0," + legendHeight + ")")
      .call(xAxis)
      .select(".domain")
      .remove();
   
    // Handle window resize
    window.addEventListener("resize", () => {
      // Update the width
      width = window.innerWidth;
      // Update the projection translation
      projection.translate([width / 2, height / 2]);
      // Update the SVG width
      d3.select("svg").attr("width", width);
      // Update paths
      d3.selectAll("path").attr("d", path);
      // Update the legend position
      legend.attr(
        "transform",
        "translate(" + (width - legendWidth) / 2 + "," + (height - 30) + ")"
      );
    });
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
    this.chart4 = d3
      .select("#chart4")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Create color scale
    var colorScale = d3.scaleSequential(d3.interpolateRdBu).domain([-1, 1]); // Adjust domain based on correlation values

    // Create heatmap rectangles
    this.chart4
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
    var legend = this.chart4
      .append("g")
      .attr("class", "legend")
      .attr(
        "transform",
        "translate(" +
          (width - legendWidth) +
          "," +
          (height - legendHeight) +
          ")"
      );

    var legendScale = d3.scaleLinear().domain([-1, 1]).range([0, legendWidth]);

    var legendAxis = d3
      .axisBottom(legendScale)
      .ticks(5)
      .tickFormat(d3.format(".1f"));

    legend
      .append("g")
      .attr("class", "legend-axis")
      .attr("transform", "translate(0," + legendHeight + ")")
      .call(legendAxis);

    // Add labels to heatmap cells
    this.chart4
      .selectAll(".cell-label")
      .data(correlationMatrix)
      .enter()
      .append("g")
      .attr("class", "cell-label")
      .selectAll(".label")
      .data((d, i) => d.map((value, j) => ({ value, i, j })))
      .enter()
      .append("text")
      .attr("class", "label")
      .attr("x", (d) => (d.j + 0.5) * (width / years.length))
      .attr("y", (d) => (d.i + 0.5) * (height / years.length))
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .style("fill", "black")
      .text((d) => d3.format(".2f")(d.value));
  }

  //create a bar chat
  createBarChart() {
    let top10 = this.top10CountryHighestGdp();
    const margin = { top: 20, right: 20, bottom: 40, left: 140 };
    const width = 500 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    // Create an SVG container
    this.chart2 = d3
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
        d3.max(top10, (d) => parseFloat(d[this.selectedYear].toString().replace(/,/g, ""))),
      ])
      .range([0, width]);

    const y = d3
      .scaleBand()
      .domain(top10.map((d) => d.Country))
      .range([0, height])
      .padding(0.1);

    this.chart2
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
    this.chart2
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
    this.chart2
      .selectAll(".bar")
      .data(top10)
      .enter()
      .append("rect")
      .transition()  // for animation
      .duration(1000)
      .attr("class", "bar")
      .attr("x", x(0))
      .attr("y", (d) => y(d.Country))
      .attr("width", (d) => x(parseFloat(d[year].toString().replace(/,/g, ""))))
      .attr("height", y.bandwidth());
  }

  clearChart() {
    this.chart1.selectAll("*").remove();
    this.chart2.selectAll("*").remove();
    this.chart3.selectAll("*").remove();
    this.chart4.selectAll("*").remove();
  }



  // Call the createHistogram function
}
