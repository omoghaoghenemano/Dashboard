/** handle data preprocessing 
 * @param data the dataset
*/
 class DataPreprocessing{
    //initialization of the data
  
    constructor(data){
        this.data = data
    }
    /** check if dataset has null values */
    handleEmptyDataPoint(){
        let isEmpty = false

        for(let i = 0; i< this.data.length; i++){
            if(this.data[i] === ''){
               isEmpty = true
               console.log("data has empty values")
            }
        }
        return isEmpty
    }

    /** render world map of country */
   renderMap(world){ 
    var width = 800;  
    var height = 600; 

    var projection = d3.geoNaturalEarth1()  
    .scale(150)  
    .translate([width / 2, height / 2]);  
    
    var path = d3.geoPath().projection(projection);
        d3.select("#chart1").append("svg")  
          .attr("width", width)  
          .attr("height", height)  
          .selectAll("path")  
          .data(topojson.feature(world, world.objects.countries).features)  
          .enter()  
          .append("path")  
          .attr("d", path);  
      }  
      
   

    statiscalAnalysis(){

    }

    

    

}