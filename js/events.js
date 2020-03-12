var dispatch = d3.dispatch("changeDistrict","changeLevel","changeSchool","changeSchoolTypes","active","resized","reset");

function bindGlobalData(milwaukeeData, schoolData, mapData, allDistrictData){
  d3.select("#schoolDataContainer").datum(schoolData)
  d3.select("#allDistrictDataContainer").datum(allDistrictData)
}



function setActiveDistrict(districtId, level, schoolId){
  // if(getActiveDistrict() == districtId){ return false }
  d3.select("#activeDistrict").datum(districtId)
  d3.select("#activeLevel").datum(level)

  // var level = (typeof level == "undefined") ? getLevel() : level;

  var district = getSchoolData().filter(function(o){ return o.districtId == districtId && o.level == level })
  
  dispatch.call("changeLevel", null, level)
  dispatch.call("changeDistrict", null, districtId, level, schoolId)
}
function setActiveSchool(school, oldDistrictId){
  d3.select("#activeSchool").datum(school.schoolId)
  dispatch.call("changeSchool", null, school, oldDistrictId)
}
function setLevel(level){
  
  dispatch.call("changeLevel", null, level)
}
function setSchoolTypes(schoolTypes){

  dispatch.call("changeSchoolTypes", null, schoolTypes)
}



function updateChooseText(section){

	d3.select("#narrativeChooseSchoolText").html(function(d){
	if(typeof(d) == "undefined") return false
	else if(section == 1) {
	return d.schoolName + " is a " + ALL_SCHOOL_TYPES_FULL[d.type] + " school in " + d.displayCity + ", where " + d3.format(".1f")(d.minority_percent * 100) + " percent of its " + ALL_LEVELS[d.level].toLowerCase() + " students are Black or Hispanic."
	}
	else if(section == 2){
	return d.schoolName + " is in " + d.distName + ", where " + d3.format(".1f")(d.M * 100) + " percent of " + ALL_LEVELS[d.level].toLowerCase() + " students are Black or Hispanic."

	}
	else if(section == 3 || section == 4){
		var compareText = (d.compareMedian == "above") ? "larger" : "smaller"
		return "Among the " + d3.format(".0f")(d.totalSchools) + " " + ALL_LEVELS[d.level].toLowerCase() + "s in " + d.distName + ", " + d.schoolName + " enrolls a " + compareText + " share of Black or Hispanic students than most."
	}
	else if(section == 5){
		return d.schoolName + " has an SCI value of " + d3.format(".1%")(d.sci) + " and enrolls " + d3.format(".0f")(d.pop) + " students. If " + d.schoolName+ "&rsquo;s racial composition were replaced with the district&rsquo;s, segregation in " + d.distName + " would fall " + d3.format(".1f")(d.sci *100) + " percent."
	}
	else{
		return ""
	}
})
      


}


function setupChooseVis(districtData, schoolId, districtDatum){
districtData.sort(function(a, b){ return (a.minority_percent < b.minority_percent) ? -1 : 1 })

// gChoose = d3.select("#narrativeChooseSchoolChartContainer svg g")
var textDatum = districtData.filter(function(o){ return o.schoolId == schoolId})[0]
textDatum["M"] = districtDatum["M"]
// console.log(districtDatum)
textDatum["totalSchools"] = districtData.length
d3.select("#narrativeChooseSchoolText").datum(textDatum)

var section = +SECTION_INDEX()

updateChooseText(section)

d3.select("#narrativeChooseSchoolChartContainer svg g")
.transition()
.style("opacity", 0)
.on("end", function(d,i){
	var offset = window.innerWidth - d3.select("#narrativeVizContainer svg").node().getBoundingClientRect().right
	d3.select("#narrativeChooseSchoolChartContainer").style("right", offset + "px")
	d3.select(this).remove()

	var x = getVX("choose");
	var y = getVY("choose", 1, districtData);
	var vH = getVHeight("choose", -1)
	var vW = getVWidth("choose")
	var vMargins = getVMargins("choose")
	var chartPos = getRelativeChartPositions("choose")


	var gChoose = d3.select("#narrativeChooseSchoolChartContainer svg").append("g")
	
	gChoose.style("opacity",0)
	.attr("transform", "translate(" + vMargins.left + ",0)")
	.transition()
	.style("opacity",1)
	



	var districtMedian = districtDatum.M //replace with info from mapped distrits JSON

	var lineY2;
	if(section < 2) lineY2 = chartPos.y1
	else if(section == 2) lineY2 = chartPos.y2
	else lineY2 = chartPos.y3

	gChoose
	.append("line")
	.attr("class", "choose medianLine narrative")
	.attr("x1", x(districtMedian))
	.attr("x2", x(districtMedian))
	.attr("y1", chartPos.y1)
	.attr("y2", lineY2)

	var axisOpacity;
	if(section < 4) axisOpacity = 0
	else axisOpacity = 1;


	gChoose.append("g")
	.attr("class", "v choose y axis")
	.attr("transform", "translate(" + vMargins.left + ",0)")
	.style("opacity", axisOpacity)
	.call(d3.axisLeft(y).tickSize([-vW + vMargins.left]).tickFormat(d3.format(".1%")).tickPadding(10))



  gChoose.append("text")
    .attr("class", "yaxis axis label y main choose")
    .attr("x",0)
    .attr("y", vMargins.top + 20)
    .text("Segregation Contribution Index")
    .style("opacity",axisOpacity)



	gChoose.append("g")
	.attr("class", "narrative v choose x axis")
	.attr("transform", "translate(0," + (getVHeight("narrative",1)) + ")")
	.call(d3.axisBottom(x)
	.tickFormat(d3.format(".0%"))
	.tickSizeOuter(0)
	);


	var gTranslate;
	if(section < 2) gTranslate = function(d){ return "translate(" + (x(d) - 50) + "," + (height + 200) + ")" }
	else if(section < 4) gTranslate = function(d){ return "translate(" + (x(d) - 50) + "," + chartPos.lowM + ")" }
	else gTranslate = function(d){ return "translate(" + (x(d) + 10) + "," + chartPos.highM + ")"}

	var avgGChoose = gChoose.append("g")
	.attr("class", "choose medianTextG narrative")
	.datum(districtMedian)
	.attr("transform", gTranslate)

	avgGChoose.append("text")
	.attr("class", "choose districtAverage label")
	.text("District Average")
	.attr("x",0)
	.attr("y",0)

	avgGChoose.append("text")

	.attr("class", "choose districtAverage value")
	.text(d3.format(".0%")(districtMedian) + " Black or Hispanic")
	.attr("x",0)
	.attr("y",20)


	var lollipopY2;
	if(section < 4) lollipopY2 = function(d){ return y(0) } 
	else if(section == 4) lollipopY2 = function(d){ return y(d.normSci)}
	else lollipopY2 = function(d){ return y(d.sci) }



	gChoose.selectAll(".lollipop.narrative.choose")
	.data(districtData)
	.enter().append("line")
	.attr("x1", function(d) { return x(d.minority_percent); })
	.attr("x2", function(d) { return x(d.minority_percent); })
	.attr("y1", function(d){ return y(0) })
	.attr("y2", lollipopY2)
	.attr("class",function(d){
	return d.type + " sid_" + d.schoolId;
	})
	.classed("lollipop narrative choose",true)
	.classed("belowMedian", function(d){
	return d.compareMedian == "below"
	})
	.classed("aboveMedian", function(d){
	return d.compareMedian == "above"
	})
	.classed("highlight", function(d){
	return d.schoolId == schoolId
	})



	var dotY;
	if(section < 4) dotY = function(d){ return chartPos.dot } 
	else if(section == 4) dotY = function(d){ return y(d.normSci)}
	else dotY = function(d){ return y(d.sci) }


	var dotR;
	if(section < 3) dotR = function(d){ return (d.schoolId == schoolId) ? getFixedR(false)  : 0; }
	else if(section < 5) dotR = function(d){ return getFixedR(false) }
	else dotR = function(d){ return NARRATIVE_DOT_SCALAR*Math.sqrt(d.pop)}
	gChoose.selectAll(".dot.narrative.choose")
	.data(districtData)
	.enter().append("circle")
	.attr("r", dotR)
	.attr("cx", function(d) { return x(d.minority_percent); })
	.attr("cy", dotY)
	.attr("class",function(d){
	return d.type + " sid_" + d.schoolId;
	})
	.classed("dot narrative choose",true)
	.classed("belowMedian", function(d){
	return d.compareMedian == "below"
	})
	.classed("aboveMedian", function(d){
	return d.compareMedian == "above"
	})
	.classed("highlight", function(d){
	return d.schoolId == schoolId
	})
	.style("opacity", function(d){
	return (d.schoolId == schoolId || section > 2) ? 1 : V_SHOW_DOT_OPACITY;
	})




})

	d3.selectAll(".choose-lvl").remove()


    // activeDot = d3.select(".dot.choose.highlight")
    // activeLine = d3.select(".lollipop.choose.highlight")

    // adClone = activeDot.node().cloneNode(true)
    // alClone = activeLine.node().cloneNode(true)

    // d3.select(adClone).classed("beeHide", true).datum(activeDot.datum())
    // d3.select(alClone).classed("beeHide", true).datum(activeLine.datum())
    
    
    // activeDot.node().parentNode.appendChild(adClone)
    // activeDot.node().parentNode.appendChild(alClone)




    var school = districtData.filter(function(o){ return o.schoolId == schoolId})[0]
    
    d3.select("#narrativeChooseSchoolName").text(school.schoolName)

    var levels = school.allLevels.split(" ")


    for(var i = 0; i < levels.length; i++){
      var lvl = levels[i]
      d3.select("#narrativeChooseSchoolButtons").append("div")
        .attr("class", function(){
          if(levels.indexOf(getLevel()) == -1 && i == 0){
            return "active choose-lvl"
          }else{
            return (lvl == getLevel()) ? "active choose-lvl" : "choose-lvl"
          }
        })
        .attr("data-lvl",lvl)

        .text(ALL_LEVELS[+lvl])
        .on("click", function(){

          var level = d3.select(this).attr("data-lvl")
          if(level == getLevel()) return false
          setActiveDistrict(getActiveDistrict(), level)
        })
    }



}



function updateVoronoi(section, schools){
	var vW = getVWidth(section),
		vH = getVHeight(section),
    	vMargins = getVMargins(section),
    	x = getVX(section),
    	y = getVY(section, 1, schools),

    	svgV = null;

    if(section == "explore"){
    	svgV = d3.select("#exploreVChartContainer svg g");
    }

    d3.selectAll(".voronoi." + section).remove()

	var voronoi = d3.voronoi()
		.x(function(d) { return x(d.minority_percent); })
		.y(function(d) { return y(d.sci); })
		.extent([[vMargins.left,0], [vW, vH]]);

	var voronoiGroup = svgV.append("g")
		.attr("class", "voronoi " + section);

	voronoiGroup.selectAll("path")
		.data(voronoi.polygons(schools))
		.enter().append("path")
			.attr("d", function(d) { return d ? "M" + d.join("L") + "Z" : null; })
			.on("mouseover", function(d){
				if(section == "explore"){
					setActiveSchool(d.data)
				}
			})
}

function updateExploreV(schools, district){
		svg = d3.select("#exploreVChartContainer").select("svg g"),
		vW = getVWidth("explore"),
		vH = getVHeight("explore")
    	vMargins = getVMargins("explore"),
    	vDuration = 2000,
    	dotCount = d3.selectAll(".explore.dot").nodes().length

    var x = getVX("explore");
    var y = getVY("explore", 1, schools);

updateVoronoi("explore", schools)

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
        .attr("y2", function(d){ return y(d.sci) + NARRATIVE_DOT_SCALAR*Math.sqrt(d.pop) })
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
function updateExploreBars(d, schools){
	var percent = d3.format(".0%")
	var numeric = d3.format(".0f")

	if(schools == false){
		var schoolData = getSchoolData(),
			level = getLevel(),
			districtId = getActiveDistrict(),
			schools = schoolData.filter(function(o){ return o.districtId == districtId && o.level == level })

	}
	var sciSchools = schools.slice(0).sort(function(a,b){ return (a.sci < b.sci) ? 1 : -1})
	schools.sort(function(a,b){ return (a.pop < b.pop) ? 1 : -1})

	d3.selectAll(".mouseSubBar").remove()
	d3.select(".breakdownRaceBar.under").selectAll(".mouseSubBar")
		.data(schools.filter(function(s){ return s.compareMedian == "below" }))
		.enter().append("div")
		.attr("class", function(s){
			return "mouseSubBar under sb_" + s.schoolId + " " + s.type
		})
		.style("width", function(s){
			var W = d3.select(".breakdownRaceBarContainer").node().getBoundingClientRect().width
			return ((s.pop/d.totalPop) * W) + "px"
			// return 1;

		})
		.on("mouseover", function(s){
			setActiveSchool(s)
		})

	d3.select(".breakdownRaceBar.over").selectAll(".mouseSubBar")
		.data(schools.filter(function(s){ return s.compareMedian == "above" }))
		.enter().append("div")
		.attr("class", function(s){
			return "mouseSubBar over sb_" + s.schoolId + " " + s.type
		})
		.style("width", function(s){
			var W = d3.select(".breakdownRaceBarContainer").node().getBoundingClientRect().width
			return ((s.pop/d.totalPop) * W) + "px"
			// return 1;

		})
		.on("mouseover", function(s){
			setActiveSchool(s)
		})

	ALL_SCHOOL_TYPES.forEach(function(st){
		d3.select(".subBar.pop." + st + ".active").selectAll(".mouseSubBar")
			.data(schools.filter(function(s){ return s.type == st }))
			.enter().append("div")
			.attr("class", function(s){
				return "mouseSubBar " + st + " sb_" + s.schoolId
			})
			.style("width", function(s){
				var W = d3.select(".breakdownTypeBarContainer").node().getBoundingClientRect().width
				return ((s.pop/d.totalPop) * W) + "px"
				// return 1;
			})
			.on("mouseover", function(s){
				setActiveSchool(s)
			})
		d3.select(".subBar.sci." + st + ".active").selectAll(".mouseSubBar")
			.data(sciSchools.filter(function(s){ return s.type == st }))
			.enter().append("div")
			.attr("class", function(s){
				return "mouseSubBar " + st + " sb_" + s.schoolId
			})
			.style("width", function(s){
				var W = d3.select(".breakdownTypeBarContainer").node().getBoundingClientRect().width
				return ((s.sci/d[st]["sci"]) * W) + "px"
				// return 1;
			})
			.on("mouseover", function(s){
				setActiveSchool(s)
			})
	})








	d3.selectAll(".districtNameText").text(d.districtName)

	d3.select("#breakdownsubPercent").text(percent(d.M))

	d3.select(".bblPercent.under").text(percent(d.belowPop))
	d3.select(".bblNumber.under").text(numeric(d.belowSchools))
	d3.select(".breakdownRaceBar.under")
		.transition()
			.style("width", function(){
				return (d.belowPop*d3.select(".breakdownRaceBarContainer").node().getBoundingClientRect().width) + "px"
			})

	d3.select(".bblPercent.over").text(percent(d.abovePop))
	d3.select(".bblNumber.over").text(numeric(d.aboveSchools))
	d3.select(".breakdownRaceBar.over")
		.transition()
			.style("width", function(){
				return (d.abovePop*d3.select(".breakdownRaceBarContainer").node().getBoundingClientRect().width ) + "px"
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
function changeDistrict(districtId, level, schoolId){
	var allDistrictData = getAllDistrictData(),
		schoolData = getSchoolData(),
		// level = getLevel()
		districtKey = districtId + "_" + level;
		district = allDistrictData[districtKey],
		schools = schoolData.filter(function(o){ return o.districtId == districtId && o.level == level })


	d3.selectAll(".tt-lvl")
		.classed("active", function(){
			return +d3.select(this).attr("data-lvl") == +level
		})

	var sid = (typeof(schoolId) == "undefined") ? schools[0].schoolId : schoolId
	setupChooseVis(schools, sid, district)
	setActiveSchool(schools.filter(function(o){ return o.schoolId == sid })[0])
	d3.select("#activeSchool").datum(sid)
	updateExploreV(schools, district)
	updateExploreBars(district,schools)

}
function changeLevel(level){
	// var allDistrictData = getAllDistrictData(),
	// 	schoolData = getSchoolData(),
	// 	districtId = getActiveDistrict()
	// 	districtKey = districtId + "_" + level;
	// 	district = allDistrictData[districtKey],
	// 	schools = schoolData.filter(function(o){ return o.districtId == districtId && o.level == level })



	// updateExploreV(schools, district)
	// updateExploreBars(district,schools)



	// d3.select("#activeLevel").datum(level)
}
function changeSchool(schoolId, oldDistrictId){
	// d3.select("#activeSchool").datum(schoolId)
	d3.selectAll(".dot.explore")
		.classed("active", false)
	d3.selectAll(".lollipop.explore")
		.classed("active", false)

	var exploreDot = d3.select(".dot.explore.sid_" + schoolId)
	if(exploreDot.node() != null){
		exploreDot.classed("active", true)
		exploreDot.node().parentNode.appendChild(exploreDot.node())
	}

	var exploreLine = d3.select(".lollipop.explore.sid_" + schoolId)
	if(exploreLine.node() != null){
		exploreLine.classed("active", true)
		exploreLine.node().parentNode.appendChild(exploreLine.node())
	}

	d3.selectAll(".mouseSubBar").classed("active", false)
	d3.selectAll(".mouseSubBar.sb_" + schoolId).classed("active", true)
	var d;
	if(d3.select(".dot.explore.sid_" + schoolId).node() == null){
		d = getSchoolData().filter(function(o){ return o.schoolId == schoolId && o.level == getLevel() })[0]
	}else{
		d = d3.select(".dot.explore.sid_" + schoolId).datum()
	}
	d3.select("#tt-schoolName").text(d.schoolName)
	d3.selectAll(".tt-lvl").classed("hidden", true)

	d.allLevels.split(" ").forEach(function(l){
		d3.select(".tt-lvl.lvl" + l)
			.classed("hidden", false)
			.classed("active", (+getLevel() == +l))

	})

    d3.select(".tt-datumContainer.district .tt-datumLabel").text(d.displayCity)
    d3.select(".tt-datumContainer.district .tt-datumValue").text(
    	ALL_SCHOOL_TYPES_FULL[d.type].charAt(0).toUpperCase() + ALL_SCHOOL_TYPES_FULL[d.type].slice(1)  + " school"
    	)

	d3.select(".tt-datumContainer.sci .tt-datumValue").text(
    	d3.format(".2%")(d.sci)
    )
	d3.select(".tt-datumContainer.minority .tt-datumValue").text(
    	d3.format(".2%")(d.minority_percent)
    )
	d3.select(".tt-datumContainer.pop .tt-datumValue").text(
    	d3.format(",")(d.pop)
    )
	d3.select("#tt-hood").text("Students in this school’s surrounding area are " + d3.format(".2%")(d.neighbor_minority_percent) + " Black or Hispanic.")


}
function changeSchoolTypes(schoolTypes){
var schoolData = getSchoolData(),
	level = getLevel(),
	districtId = getActiveDistrict(),
	schools = schoolData.filter(function(o){
		return o.districtId == districtId && o.level == level && schoolTypes.indexOf(o.type) != -1;
	})


updateVoronoi("explore", schools)

  d3.select(".radioContainer.all").classed("active", schoolTypes.length == ALL_SCHOOL_TYPES.length)
  ALL_SCHOOL_TYPES.forEach(function(s){
  	d3.select(".radioContainer." + s).classed("active", (schoolTypes.indexOf(s) != -1))
  	if((schoolTypes.indexOf(s) == -1)){
  		d3.selectAll(".mouseSubBar." + s).classed("disabled", true)
  		d3.selectAll(".dot." + s)
  		 .transition()
  		 .style("opacity", V_HIDE_DOT_OPACITY)
  		d3.selectAll(".lollipop." + s)
  		 .transition()
  		 .style("opacity", V_HIDE_DOT_OPACITY)
  	}else{
  		d3.selectAll(".mouseSubBar." + s).classed("disabled", false	)
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