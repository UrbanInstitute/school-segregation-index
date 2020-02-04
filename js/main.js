const exploreDotPopScalar = .2;
const uniformDotSize = 5;
const M = 0.763666397;

function getLevel(){
	var levelButton = d3.select(".schoolLevelButton.active")
	if(levelButton.classed("l1")) return 1
	else if(levelButton.classed("l2")) return 2
	else return 3
}
function updateDistrict(schools){
	schools.forEach(function(d,i){
		d.rank = i
	})
	d3.selectAll("svg").remove()
	d3.selectAll("table").remove()

	d3.select("#exploreDistrictName").text(schools[0]["gleaname"])
	buildExploreScatter(schools)
	// buildExploreSciBar(schools)
	// buildExploreSchoolTypeSummary(schools)
	// buildSchoolList(schools)
}


function buildSchoolList(schools){
	var topTen = schools.slice(0,10)
	console.log(topTen)
	var table = d3.select("#exploreSciTable").append("table")
	var head = table.append("tr")
	head.append("th")
	head.append("th").text("School name")
	head.append("th").text("SCI")
	head.append("th").text("Population")
	head.append("th").text("Minority population")

	var tr = table
	.selectAll("tr")
	.data(topTen)
		.enter()
		.append("tr")


	var type = tr.append("td")
	type.classed("charter", function(d){ return d.charter })
	      .classed("magnet", function(d){ return d.magnet })
	      .classed("private", function(d){ return d.private })
	      .classed("tps", function(d){ return d.tps })

	tr.append("td")
		.text(function(d){ return d.school})
	tr.append("td")
		.text(function(d){ return d.sci})
	tr.append("td")
		.text(function(d){ return d3.format(",")(d.population)})
	tr.append("td")
		.text(function(d){ return d3.format(",")(d.minorityRaw)})

}

function buildExploreSchoolTypeSummary(schools){
	var magnetTotal = schools.filter(function(d){
		return d.magnet
	})
	.map(function(d){
		return d.sci
	})
	.reduce(function(total, value){
		return total + value;
	},0)

	var charterTotal = schools.filter(function(d){
		return d.charter
	})
	.map(function(d){
		return d.sci
	})
	.reduce(function(total, value){
		return total + value;
	},0)

	var tpsTotal = schools.filter(function(d){
		return d.tps
	})
	.map(function(d){
		return d.sci
	})
	.reduce(function(total, value){
		return total + value;
	},0)

	var privateTotal = schools.filter(function(d){
		return d.private
	})
	.map(function(d){
		return d.sci
	})
	.reduce(function(total, value){
		return total + value;
	},0)

	var totalSci = magnetTotal + charterTotal + tpsTotal + privateTotal;

	console.log(magnetTotal, charterTotal, tpsTotal, privateTotal, magnetTotal + charterTotal + tpsTotal + privateTotal)

	var width = 600;

	var svg = d3.select("#exploreSchoolTypeSummary")
		.append("svg")
		.attr("height", 50)
		.attr("width", 600)

	svg.append("rect")
		.attr("class", "explore schoolSummary tps")
		.attr("x",0)
		.attr("y",0)
		.attr("height", 50)
		.attr("width", width * tpsTotal/totalSci)

	svg.append("rect")
		.attr("class", "explore schoolSummary private")
		.attr("x",width * tpsTotal/totalSci	)
		.attr("y",0)
		.attr("height", 50)
		.attr("width", width * privateTotal/totalSci)

	svg.append("rect")
		.attr("class", "explore schoolSummary charter")
		.attr("x",width * tpsTotal/totalSci	+ width * privateTotal/totalSci)
		.attr("y",0)
		.attr("height", 50)
		.attr("width", width * charterTotal/totalSci)

	svg.append("rect")
		.attr("class", "explore schoolSummary magnet")
		.attr("x",width * tpsTotal/totalSci	+ width * privateTotal/totalSci + width * charterTotal/totalSci)
		.attr("y",0)
		.attr("height", 50)
		.attr("width", width * magnetTotal/totalSci)

}

function buildExploreSciBar(data){

console.log(data)

	var margin = {top: 20, right: 20, bottom: 30, left: 50},
	    width = 600 - margin.left - margin.right,
	    height = 500 - margin.top - margin.bottom;

	// parse the date / time


	// append the svg obgect to the body of the page
	// appends a 'group' element to 'svg'
	// moves the 'group' element to the top left margin
	var svg = d3.select("#exploreSciBar").append("svg")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
	  .append("g")
	    .attr("transform",
	          "translate(" + margin.left + "," + margin.top + ")");

	// Get the data

	  // format the data




var x = d3.scaleLinear()
	.rangeRound([width,0])
	// .padding(0.1);

var y = d3.scaleLinear()
	.rangeRound([height, 0]);

	x.domain([d3.max(data, function (d) {
				return d.rank;
			}),0]);

	y.domain([0, d3.max(data, function (d) {
				return d.sci;
			})]);

	svg.append("g")
	.attr("transform", "translate(0," + height + ")")
	.call(d3.axisBottom(x))

	svg.append("g")
	.call(d3.axisLeft(y))


	svg.selectAll(".bar")
	.data(data)
	.enter().append("rect")
	      .classed("bar",true)
	      .classed("explore",true)
	      .classed("charter", function(d){ return d.charter })
	      .classed("magnet", function(d){ return d.magnet })
	      .classed("private", function(d){ return d.private })
	      .classed("tps", function(d){ return d.tps })
	.attr("x", function (d) {
		return x(d.rank);
	})
	.attr("y", function (d) {
		return y(d.sci);
	})
	.attr("width", Math.max(1, .8*width/x.domain()[0]))
	.attr("height", function (d) {
		return height - y(d.sci);
	});



}
function buildExploreScatter(data){
	// set the dimensions and margins of the graph
	var margin = {top: 20, right: 20, bottom: 30, left: 50},
	    width = 600 - margin.left - margin.right,
	    height = 500 - margin.top - margin.bottom;

	// parse the date / time

	// set the ranges
	var x = d3.scaleLinear().range([0, width]);
	var y = d3.scaleLinear().range([height, 0]);

	// append the svg obgect to the body of the page
	// appends a 'group' element to 'svg'
	// moves the 'group' element to the top left margin
	var svg = d3.select("#exploreScatter").append("svg")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
	  .append("g")
	    .attr("transform",
	          "translate(" + margin.left + "," + margin.top + ")");

	// Get the data

	  // format the data
	  // data.forEach(function(d) {
	  //     d.sci = +d.SCI_sys;
	  //     d.minority = +d.minority_school/+d.population_school;
	  //     d.population = +d.population_school;
	  //     d.charter = d.charter == "Yes";
	  //     d.magnet = d.magnet == "Yes";
	  //     d.private = d.private == "1";
	  //     d.tps = d.tps == "1";
	  // });

	  // Scale the range of the data
	  x.domain(d3.extent(data, function(d) { return d.minority; }));
	  y.domain([0, d3.max(data, function(d) { return d.sci; })]);

	      
	  // Add the scatterplot


	  svg.selectAll("lollipop")
	      .data(data)
	    .enter().append("line")
	      // .attr("r", function(d){ return exploreDotPopScalar*Math.sqrt(d.population)})
	      .attr("x1", function(d) { return x(d.minority); })
	      .attr("x2", function(d) { return x(d.minority); })
	      .attr("y1", function(d) { return y(0); })
	      .attr("y2", function(d) { return y(d.sci); })
	      .classed("lollipop",true)
	      .classed("explore",true)
	      // .classed("charter", function(d){ return d.charter })
	      // .classed("magnet", function(d){ return d.magnet })
	      // .classed("private", function(d){ return d.private })
	      // .classed("tps", function(d){ return d.tps })

	  svg.selectAll("dot")
	      .data(data)
	    .enter().append("circle")
	      .attr("r", function(d){ return exploreDotPopScalar*Math.sqrt(d.population)})
	      .attr("cx", function(d) { return x(d.minority); })
	      .attr("cy", function(d) { return y(d.sci); })
	      .classed("dot",true)
	      .style("fill", function(d,i){
	      	if(d.minority < M) return "#55b748"
	      	else return "#1696d2"
	      })
	      // .classed("explore",true)
	      // .classed("charter", function(d){ return d.charter })
	      // .classed("magnet", function(d){ return d.magnet })
	      // .classed("private", function(d){ return d.private })
	      // .classed("tps", function(d){ return d.tps })


	  // Add the X Axis
	  svg.append("g")
	      .attr("transform", "translate(0," + height + ")")
	      .call(d3.axisBottom(x));

	  // Add the Y Axis
	  svg.append("g")
	  	.attr("class","y axis")
	      .call(d3.axisLeft(y));


}


function scaleExploreDots(byPop){
	if(byPop){
		d3.selectAll(".explore.dot")
			.transition()
			.attr("r", function(d){ return exploreDotPopScalar*Math.sqrt(d.population)})
	}else{
		d3.selectAll(".explore.dot")
			.transition()
			.attr("r", uniformDotSize)
	}
}

function toggleSchoolType(show, schoolType){
	if(!show){
		console.log(show, schoolType)
		d3.selectAll(".explore." + schoolType)
			.transition()
			.style("opacity", 1)
		d3.select(".schoolTypeButton." + schoolType).classed("active", true)
	}else{
		d3.selectAll(".explore." + schoolType)
			.transition()
			.style("opacity", 0)
		d3.select(".schoolTypeButton." + schoolType).classed("active", false)
	}
}


function updateExploreScatter(){

}


function init(){
	d3.csv("data.csv")
	    // .row(function(d) { return {key: d.key, value: +d.value}; })
	    .then(function(data){
	    		  data.forEach(function(d) {
	      d.sci = +d.SCI_sys;
	      d.minority = +d.minority_school/+d.population_school;
	      d.minorityRaw = +d.minority_school
	      d.population = +d.population_school;
	      d.charter = d.charter == "Yes";
	      d.magnet = d.magnet == "Yes";
	      d.private = d.private == "1";
	      d.tps = d.tps == "1";
	      d.school = d.school_name;
	      d.district = d.gleaname;
	      d.level = +d.level
	  });
	    		  return data
	    })
	    .then(function(data) {
	    	const districtNames = [...new Set(data.map(item => item.gleaname))];



d3.selectAll(".schoolLevelButton")
	.on("click", function(){

		var level;
		if(d3.select(this).classed("l1")) level = 1
		else if(d3.select(this).classed("l2")) level = 2
		else level = 3

		console.log(level)

		d3.selectAll(".schoolLevelButton").classed("active", false)
		d3.select(this).classed("active", true)
		var districtName = d3.select("#exploreDistrictName").text()

		var schools = data.filter(function(o){
			return o.district == districtName && o.level == level
		})
		.sort(function(a, b){
			return b.sci - a.sci
		})
		updateDistrict(schools)
	})

	    	// console.log(districtNames, "foo");

			$( "#districtName" ).autocomplete({
				source: districtNames,
				select: function(event, ui){
					// console.log(ui.item.value)
					var districtName = ui.item.value
					var level = getLevel();
					var schools = data.filter(function(o){
						return o.district == districtName && o.level == level
					})
					.sort(function(a, b){
						return b.sci - a.sci
					})
					updateDistrict(schools)
				}
			});

			var initSchools = data.filter(function(o){
				return o.district == "Milwaukee School District" && o.level == 2
			})
			.sort(function(a, b){
				return b.sci - a.sci
			})
			console.log(initSchools)
			updateDistrict(initSchools)
	    	
	    });




	d3.select(".scaleByPop")
		.on("click", function(){
			if(d3.select(this).classed("byPop")){
				scaleExploreDots(false)
				d3.select(this).text("Scale dots by population")
				d3.select(this).classed("byPop",false)
			}else{
				scaleExploreDots(true)
				d3.select(this).text("Uniform dot size")
				d3.select(this).classed("byPop",true)
			}
		})

	d3.selectAll(".schoolTypeButton")
		.on("click", function(){

			var schoolType = d3.select(this).attr("data-schoolType")
			var active = d3.select(this).classed("active")
			toggleSchoolType(active, schoolType)	
			
		})









	d3.select("#gogogo").on("click",function(){

		var margin = {top: 20, right: 20, bottom: 30, left: 50},
			    width = 600 - margin.left - margin.right,
			    height = 500 - margin.top - margin.bottom;

			// parse the date / time

			// set the ranges
			var y = d3.scaleLinear().range([height, 0]);


			// Get the data

			  // format the data
			  // data.forEach(function(d) {
			  //     d.sci = +d.SCI_sys;
			  //     d.minority = +d.minority_school/+d.population_school;
			  //     d.population = +d.population_school;
			  //     d.charter = d.charter == "Yes";
			  //     d.magnet = d.magnet == "Yes";
			  //     d.private = d.private == "1";
			  //     d.tps = d.tps == "1";
			  // });

			  // Scale the range of the data
			  y.domain([0, 1]);

			      
			  // Add the scatterplot

			  d3.selectAll(".dot")
			  	.transition()
			  	.duration(300)
			  	.style("opacity",0)


			  d3.select(".y.axis")
			  	// .transition()
			  	// .delay(300)
			  	// .duration(1000)
			  	.call(d3.axisLeft(y))

			  var totalY = 0;
			  var prevY = false;

  			  var totalY2 = 0;
			  var prevY2 = false;

			  var totalYL = 0;
			  var prevYL = false;

  			  var totalY2L = 0;
			  var prevY2L = false;

  			  var totalYR = 0;
			  var prevYR = false;

  			  var totalY2R = 0;
			  var prevY2R = false;

			  var returnVal, returnVal2, returnValL, returnVal2L, returnValR, returnVal2R;

			  d3.selectAll(".lollipop")
			  	  .transition()
			  	  .duration(700)
			  	  .style("stroke", function(d,i){
			  	  	if(d.minority < M){
			  	  		return "#55b748"
			  	  	}else{
			  	  		return "#1696d2"
			  	  	}
			  	  })
			      .transition()
			      .duration(1000)
			      .attr("y2", function(d) { return y(d.sci); })
			      .transition()
			      .delay(function(d,i){ return (171 - i) * 3})
			      .duration(1400)
			      
			      .attr("y1", function(d,i){
			      	if(prevY == false){
			      		prevY = true;
			      		totalY = d.sci
			      		return y(0);
			      	}else{
			      		prevY = d.sci
			      		totalY += d.sci
			      		returnVal = totalY
			      		// totalY += prevY
			      		return y(returnVal)
			      	}
			      	// totalY += 
			      	// return totalY

			      	// console.log(i)

			      })
			      .attr("y2", function(d,i){
			      	// console.log(d.sci)
			      	if(prevY2 == false){
			      		console.log(i,d)
			      		prevY2 = true;
			      		totalY2 = d.sci;
			      		return y(d.sci);
			      	}else{
			      		prevY2 = d.sci
			      		returnVal2 = totalY2
			      		totalY2 += prevY2
			      		return y(returnVal2)
			      	}
			      })
  			      .attr("x1", 200)
  			      .attr("x2", 200)
  			      .style("stroke-width", "3px")
  			      .transition()
  			      .delay(function(d,i){ return 800 - (171 - i)*3})
					.style("stroke-width", "60px")	
			      .attr("x2", function(d,i){
		      	if(d.minority < M){
			      		return 200
			      	}else{
			      		return 400
			      	}
			      })
			      .attr("x1", function(d,i){
			      	if(d.minority < M){
			      		return 200
			      	}else{
			      		return 400
			      	}
			      })
			      .attr("x2", function(d,i){
		      	if(d.minority < M){
			      		return 200
			      	}else{
			      		return 400
			      	}
			      })
			      .transition()
			      .delay(function(d,i){ return i})
			      .attr("y1", function(d,i){
			      	if(d.minority < M){
				      	if(prevYL == false){
				      		prevYL = true;
				      		totalYL = d.sci
				      		return y(0);
				      	}else{
				      		prevYL = d.sci
				      		totalYL += d.sci
				      		returnValL = totalYL
				      		// totalY += prevY
				      		return y(returnValL)
				      	}
				     }else{
				      	if(prevYR == false){
				      		prevYR = true;
				      		totalYR = d.sci
				      		return y(0);
				      	}else{
				      		prevYR = d.sci
				      		totalYR += d.sci
				      		returnValR = totalYR
				      		// totalY += prevY
				      		return y(returnValR)
				      	}

				     }
			      	// totalY += 
			      	// return totalY

			      	// console.log(i)

			      })
			      .attr("y2", function(d,i){
			      	if(d.minority < M){
				      	if(prevY2L == false){
				      		console.log(i,d)
				      		prevY2L = true;
				      		totalY2L = d.sci;
				      		return y(d.sci);
				      	}else{
				      		prevY2L = d.sci
				      		returnVal2L = totalY2L
				      		totalY2L += prevY2L
				      		return y(returnVal2L)
				      	}
				     }else{
				      	if(prevY2R == false){
				      		console.log(i,d)
				      		prevY2R = true;
				      		totalY2R = d.sci;
				      		return y(d.sci);
				      	}else{
				      		prevY2R = d.sci
				      		returnVal2R = totalY2R
				      		totalY2R += prevY2R
				      		return y(returnVal2R)
				      	}

				     }
			      })
			      // .attr("x1",10)
			      // .attr("x2",10)
			      // .classed("charter", function(d){ return d.charter })
			      // .classed("magnet", function(d){ return d.magnet })
			      // .classed("private", function(d){ return d.private })
			      // .classed("tps", function(d){ return d.tps })


function getRandomColor() {
  // var letters = '0123456789ABCDEF';
  // var color = '#';
  // for (var i = 0; i < 6; i++) {
  //   color += letters[Math.floor(Math.random() * 16)];
  // }
  return "red";
}


			  // // Add the X Axis
			  // svg.append("g")
			  //     .attr("transform", "translate(0," + height + ")")
			  //     .call(d3.axisBottom(x));

			  // // Add the Y Axis
			  // svg.append("g")
			  //     .call(d3.axisLeft(y));



	})





}

init()