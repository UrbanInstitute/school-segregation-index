var dispatch = d3.dispatch("changeDistrict","changeLevel","changeSchool","changeSchoolTypes");

function bindGlobalData(milwaukeeData, schoolData, mapData, allDistrictData){
  d3.select("#schoolDataContainer").datum(schoolData)
  d3.select("#allDistrictDataContainer").datum(allDistrictData)
}



function setActiveDistrict(districtId){
  // if(getActiveDistrict() == districtId){ return false }
  d3.select("#activeDistrict").datum(districtId)

  var level = getLevel()

  var district = getSchoolData().filter(function(o){ return o.districtId == districtId && o.level == level })




  dispatch.call("changeDistrict", null, districtId)
}
function setActiveSchool(schoolId, oldDistrictId){
	d3.select("#activeSchool").datum(schoolId)
  dispatch.call("changeSchool", null, schoolId, oldDistrictId)
}
function setLevel(level){
  d3.select("#activeLevel").datum(level)
  dispatch.call("changeLevel", null, level)
}
function setSchoolTypes(schoolTypes){

  dispatch.call("changeSchoolTypes", null, schoolTypes)
}


function updateExploreV(schools, district){
		svg = d3.select("#exploreVChartContainer").select("svg g"),
		vW = getVWidth("explore"),
    	vMargins = getVMargins("explore"),
    	vDuration = 2000,
    	dotCount = d3.selectAll(".explore.dot").nodes().length

    var x = getVX("explore");
    var y = getVY("explore", 1, schools);



	d3.selectAll(".explore.dot")
		.transition()
		.duration(vDuration/2)
		.style("opacity",0)
		.on("end", function(){
			d3.select(this).remove()
		})

	d3.selectAll(".explore.lollipop")
		.transition()
		.duration(vDuration/2)
		.style("opacity",0)
		.on("end", function(d,i){
			d3.select(this).remove()
			
			if(i == (dotCount-1)){

					svg
        .selectAll(".lollipop.explore")
        .data(schools)
      .enter().append("line")
        .attr("x1", function(d) { return x(d.minority_percent); })
        .attr("x2", function(d) { return x(d.minority_percent); })
        .attr("y1", function(d){ return y(0) })
        .attr("y2", function(d){ return y(d.sci) })
        .attr("class",function(d){
          return d.type + " sid_" + d.schoolId;
        })
        .classed("lollipop explore",true)
        .classed("belowMedian", function(d){
          return d.compareMedian == "below"
        })
        .classed("aboveMedian", function(d){
          return d.compareMedian == "above"
        })
        .style("opacity",0)
        .transition()
        .duration(vDuration/2)
        .style("opacity", function(d){
        	return (getSchoolTypes().indexOf(d.type) == -1) ? V_HIDE_DOT_OPACITY : V_SHOW_DOT_OPACITY;
        })

        svg.selectAll(".dot.explore")
        .data(schools)
      .enter().append("circle")
        .attr("r", function(d){return NARRATIVE_DOT_SCALAR*Math.sqrt(d.pop)})
        .attr("cx", function(d) { return x(d.minority_percent); })
        .attr("cy", function(d) { return y(d.sci); })
        .attr("class",function(d){
          return d.type + " sid_" + d.schoolId;
        })
        .classed("dot explore",true)
        .classed("belowMedian", function(d){
          return d.compareMedian == "below"
        })
        .classed("aboveMedian", function(d){
          return d.compareMedian == "above"
        })
        .style("opacity",0)
        .transition()
        .duration(vDuration/2)
        .style("opacity", function(d){
        	return (getSchoolTypes().indexOf(d.type) == -1) ? V_HIDE_DOT_OPACITY : V_SHOW_DOT_OPACITY;
        })

			}


		})


    svg.select(".v.explore.y.axis")
    .transition()
    .duration(vDuration)
  .call(d3.axisLeft(y).tickSize([-vW + vMargins.left]).tickFormat(d3.format(".1%")).tickPadding(10))


}
function updateExploreBars(d){
	var percent = d3.format(".0%")
	var numeric = d3.format(".0f")

	console.log(d)

	d3.selectAll(".districtNameText").text(d.districtName)

	d3.select("#breakdownsubPercent").text(percent(d.M))

	d3.select(".bblPercent.under").text(percent(d.belowPop))
	d3.select(".bblNumber.under").text(numeric(d.belowSchools))
	d3.select(".breakdownRaceBar.under")
		.transition()
			.style("width", function(){
				return (d.belowPop*d3.select(".breakdownRaceBarContainer").node().getBoundingClientRect().width - 2) + "px"
			})

	d3.select(".bblPercent.over").text(percent(d.abovePop))
	d3.select(".bblNumber.over").text(numeric(d.aboveSchools))
	d3.select(".breakdownRaceBar.over")
		.transition()
			.style("width", function(){
				return (d.abovePop*d3.select(".breakdownRaceBarContainer").node().getBoundingClientRect().width - 2) + "px"
			})

	var sci, pop;
	ALL_SCHOOL_TYPES.forEach(function(schoolType){
		sci = d[schoolType]["sci"]
		pop = d[schoolType]["pop"]
		barW = d3.select(".breakdownTypeBarContainer").node().getBoundingClientRect().width

		if(sci == 0 || pop == 0){
			d3.select(".breakdownNoSchools." + schoolType).classed("hide", false)
			d3.selectAll(".subBar." + schoolType).classed("hide", true)
		}else{
			d3.select(".breakdownNoSchools." + schoolType).classed("hide", true)
			d3.select(".subLabel.sci." + schoolType + " span").text(percent(sci))
			d3.select(".subLabel.pop." + schoolType + " span").text(percent(pop))
			d3.selectAll(".subBar.sci." + schoolType)
				.classed("hide", false)
				.transition()
				.style("width", ((sci * barW) ) + "px")
			d3.selectAll(".subBar.pop." + schoolType)
				.classed("hide", false)
				.transition()
				.style("width", ((pop * barW) ) + "px")
		}

	})
}


//dispatch listeners are in mapping.js, since needs to be w/in map.on("load") and d3.csv callbacks
//non map functions for event handlers are below
function changeDistrict(districtId){
	// console.log(districtId)
	// d3.select("#activeDistrict").datum(districtId)
	var allDistrictData = getAllDistrictData(),
		schoolData = getSchoolData(),
		level = getLevel()
		districtKey = districtId + "_" + level;
		district = allDistrictData[districtKey],
		schools = schoolData.filter(function(o){ return o.districtId == districtId && o.level == level })


	updateExploreV(schools, district)
	updateExploreBars(district)

}
function changeLevel(level){
	var allDistrictData = getAllDistrictData(),
		schoolData = getSchoolData(),
		districtId = getActiveDistrict()
		districtKey = districtId + "_" + level;
		district = allDistrictData[districtKey],
		schools = schoolData.filter(function(o){ return o.districtId == districtId && o.level == level })


	updateExploreV(schools, district)

	d3.selectAll(".levelButton")
		.classed("active", function(){
			return d3.select(this).attr("data-level") == level
		})
	// d3.select("#activeLevel").datum(level)
}
function changeSchool(schoolId, oldDistrictId){
	// d3.select("#activeSchool").datum(schoolId)
}
function changeSchoolTypes(schoolTypes){
  d3.select(".radioContainer.all").classed("active", schoolTypes.length == ALL_SCHOOL_TYPES.length)
  ALL_SCHOOL_TYPES.forEach(function(s){
  	d3.select(".radioContainer." + s).classed("active", (schoolTypes.indexOf(s) != -1))
  	if((schoolTypes.indexOf(s) == -1)){
  		d3.selectAll(".dot." + s)
  		 .transition()
  		 .style("opacity", V_HIDE_DOT_OPACITY)
  		d3.selectAll(".lollipop." + s)
  		 .transition()
  		 .style("opacity", V_HIDE_DOT_OPACITY)
  	}else{
  		d3.selectAll(".dot." + s)
  		 .transition()
  		 .style("opacity", V_SHOW_DOT_OPACITY)
  		d3.selectAll(".lollipop." + s)
  		 .transition()
  		 .style("opacity", V_SHOW_DOT_OPACITY)
  	}
  })
}



// dispatch.on("changeDistrict", function(districtId){
	
// })