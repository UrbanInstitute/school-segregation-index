mapboxgl.accessToken = 'pk.eyJ1IjoidXJiYW5pbnN0aXR1dGUiLCJhIjoiTEJUbmNDcyJ9.mbuZTy4hI_PWXw3C3UFbDQ';

var map = new mapboxgl.Map({
	container: 'mapContainer',
	style: 'mapbox://styles/urbaninstitute/ckaycex1c07uq1ipe0tin2xni',
	center: DEFAULT_MAP_CENTER,
	zoom: DEFAULT_MAP_ZOOM,
	minZoom: 6
});


var svgMap = d3.select("#mapDotSvgContainer").append("svg")

svgMap.attr("height", 500).attr("width",500)

schoolDotMarker = svgMap.append("circle")
	.style("fill","#ec008b")
	.style("stroke","#fff")

//show +/- zoom arrows (and a compass, hidden in CSS)
map.addControl(new mapboxgl.NavigationControl());

map.on("zoom", function(){
	schoolDotMarker.style("opacity",0)
})

map.on("click","schooldistricts-fill", function(e){
    var district = getSchoolData().filter(function(o){ return o.districtId == e.features[0].id && o.level == getLevel() })
    if(district.length == 0){
    	return false
    }
	var districtId = e.features[0].id
	// console.log(districtId)

	if(districtId != getActiveDistrict()){
		setActiveDistrict(e.features[0].id, getLevel(), false, "mapclick")
	}
})

var hoveredDist  = false;
let isTransitioning = false;

map.on('mousemove', 'schooldistricts-fill', function(e) {
    var district = getSchoolData().filter(function(o){ return o.districtId == e.features[0].id && o.level == getLevel() })
    if(district.length == 0){
    	d3.select("#mapContainer").classed("noDistrict", true)
    	return false
    }
	if(isTransitioning){
		return false
	}
	d3.select("#mapContainer").classed("noDistrict", false)

	if(+e.features[0].id == +d3.select(".dot.explore").data()[0].districtId){
		if (hoveredDist) {
			map.setFeatureState(
				hoveredDist,
				{ active: false }
			);
		}
		hoveredDist = false;

		return false;
	}
	if (e.features.length > 0) {
		if (hoveredDist) {
			map.setFeatureState(
				hoveredDist,
				{ active: false }
			);
		}
		hoveredDist = e.features[0];
		map.setFeatureState(
			e.features[0],
			{ active: true }
		);
	}
});

map.on('mouseleave', 'schooldistricts-fill', function(e) {
	if (hoveredDist) {
		map.setFeatureState(
			hoveredDist,
			{ active: false }
		);
	}
	hoveredDist = false;
	d3.select("#mapContainer").classed("noDistrict", false)
});



//get layernames for selected level and school type
function getActiveLayers(){
	var level = getLevel(),
		schoolTypes = getSchoolTypes(),
		activeLayers = []
	
	for(var i = 0; i < schoolTypes.length; i++){
		activeLayers.push("lvl_" + level + "_" + schoolTypes[i])
	}
	return activeLayers
}

//mouseover function for school dots
function hoverOnSchool(e){
	var school = e.features[0]
	//do not trigger mouseevents on schools outside of selected district
	if(+school.properties.districtId != +getActiveDistrict()){
		return false
	}
	if(getActiveLayers().indexOf(e.features[0].layer.id) == -1){
		return false;
	}
	setActiveSchool(school.properties, "maphover")
}
function clickOnSchool(e){
	var school = e.features[0]
	//do not trigger mouseevents on schools outside of selected district
	if(+school.properties.districtId != +getActiveDistrict()){
		return false
	}
	if(getActiveLayers().indexOf(e.features[0].layer.id) == -1){
		return false;
	}
	setActiveSchool(school.properties, "mapclick")
}

//use a setTimeOut bc I'm a hack and need to wait for level
//and schooltype setters to fire
function continueLoad(){
	d3.selectAll(".loadHide").classed("loadHide", false)
	d3.select("#loadingGif")
		.transition()
		.style("display", "none")
		.on("end", function(){
			console.log("a")
			setActiveDistrict(MILWAUKEE_ID, DEFAULT_LEVEL, TAMARACK_ID, "load")		
			setActiveSchool()
		})
}
function waitForLoad(){
	console.log("waiting")
	if(map.loaded()) continueLoad()
	else setTimeout(waitForLoad, 300)
}

var boundaries;
dispatch.on("dataLoad", function(bs){
	boundaries = bs;
	//turn on mouse handlers for default layers
	defaultLayers = getActiveLayers();
	
	for (var i = 0; i < defaultLayers.length; i++){
		map.on('mouseenter', defaultLayers[i], hoverOnSchool)
		map.on('click', defaultLayers[i], clickOnSchool)		
	}
	// console.log(map.loaded())
	waitForLoad()


	// changeDistrict(MILWAUKEE_ID, DEFAULT_LEVEL, TAMARACK_ID, "load")
})

	map.on("load", function(e){
		map.resize()

		//By default, show active style for milwaukee. Don't call full dispatch event, since no need to
		//fly to locatino
		var geoid = MILWAUKEE_ID
		var f = map.queryRenderedFeatures({layer: "schooldistricts-fill"}).filter(function(o){
			return o.id == geoid
		})[0]

		var fs = map.queryRenderedFeatures({layer: "schooldistricts-stroke"}).filter(function(o){
			return o.id == geoid
		})[0]


		dispatch.on("changeDistrict", function(districtId, level, schoolId, eventType){
			if(typeof(districtId) == "undefined") return false
			console.log("c")
			map.resize()
			//handle events for non map charts (see events.js)
			changeDistrict(districtId, level, schoolId, eventType)

			//get the boundaries for the new district
			var boundary = boundaries.filter(function(o){ return o.geoid == districtId})[0]

			//hide/set inactive the currently selected district
			var f1 = map.queryRenderedFeatures({layer: "schooldistricts-fill"}).filter(function(o){
				return o.id == geoid
			})
			for(var i = 0; i < f1.length; i++){
				map.setFeatureState(f1[i], { "active": false })
			}
			var fs1 = map.queryRenderedFeatures({layer: "schooldistricts-stroke"}).filter(function(o){
				return o.id == geoid
			})
			for(var i = 0; i < fs1.length; i++){
				map.setFeatureState(fs1[i], { "active": false })
			}

			//now set new geoid
			geoid = boundary["geoid"]

			//hide overlay white layer while zooming, to get a sense
			//of movement/change in location within US
			map.setLayoutProperty('schooldistricts-fill', 'visibility', 'none');


			//Nice built in function (thanks, Mapbox!) to flyTo new location, based
			var timeOutLength;
			if(eventType == "clickLevel" || eventType == "scroll" || eventType == "load"){
				timeOutLength = 0;
			}
			else if(eventType != "mapclick"){
				timeOutLength = 3000;
				map.fitBounds(
					[
						[boundary.lon1, boundary.lat1],
						[boundary.lon2, boundary.lat2],
					],
					{
						"padding": {"top": 10, "bottom":25, "left": 10, "right": 10}, // padding around district, a bit more on bottom to accomodate logo
						"duration": 4000,
						"essential": true, // If true , then the animation is considered essential and will not be affected by prefers-reduced-motion .
						"minZoom": 0 // don't hit the minZoom 6 ceiling for the map, so for large distances the flyTo arc isn't truncated
					}
				);
			}else{
				timeOutLength = 2000;
				map.fitBounds(
					[
						[boundary.lon1, boundary.lat1],
						[boundary.lon2, boundary.lat2],
					],
					{
						"padding": {"top": 10, "bottom":25, "left": 10, "right": 10}, // padding around district, a bit more on bottom to accomodate logo
						"duration": 1000,
						"linear": true,
						"essential": true, // If true , then the animation is considered essential and will not be affected by prefers-reduced-motion .
						"minZoom": 0 // don't hit the minZoom 6 ceiling for the map, so for large distances the flyTo arc isn't truncated
					}
				);

			}
			isTransitioning = true;
			//as flyTo is finishing, set new district state to active/visible
			setTimeout(function(){
				//add the overlay layer back
				map.setLayoutProperty('schooldistricts-fill', 'visibility', 'visible');

				//show/set active the new district
				var f2 = map.queryRenderedFeatures({"source": "composite", "layer": "schooldistricts-fill"}).filter(function(o){
					return o.id == geoid
				})
				for(var i = 0; i < f2.length; i++){
					map.setFeatureState(f2[i], { "active": true })
				}
				var fs2 = map.queryRenderedFeatures({"layer": "schooldistricts-stroke"}).filter(function(o){
					return o.id == geoid
				})
				for(var i = 0; i < fs2.length; i++){
					map.setFeatureState(fs2[i], { "active": true })
				}
				isTransitioning = false;

			},timeOutLength)
		})


		//dispatch handlers for mapping events are here, since they need to be defined after
		//map has loaded. See events.js for further dispatch functions
		//(called as `changeSchpol(schoolId, oldDistrictId)`,`changeLevel(level)` etc.)
		dispatch.on("changeSchool", function(school, eventType){
			changeSchool(school.schoolId, eventType)
			var popLabel = school.hasOwnProperty("pop") ? "pop" : "population"

			var coords = map.project([school.lon, school.lat])
			
			schoolDotMarker
				.style("opacity",1)
				.attr("cx", coords.x)
				.attr("cy", coords.y)
				.attr("r", Math.sqrt(school[popLabel]) * MAP_DOT_SCALAR)
		})

		dispatch.on("changeLevel", function(level){
			//handle events for non map charts (see events.js)
			// changeLevel(level)

			//loop through all dot layers for all levels and school types
			var schoolTypes = getSchoolTypes()
			var allLevels = ["1","2","3"]
			
			for(var i = 0; i < allLevels.length; i++){
				for(var j = 0; j < ALL_SCHOOL_TYPES.length; j++){
					var layerName = "lvl_" + allLevels[i] + "_" + ALL_SCHOOL_TYPES[j]
					// If layer does not match new level, hide it completely
					//and turn off mouse events
					if(level != allLevels[i]){
						map.setPaintProperty(
							layerName,
							"circle-color",
							[
								"match",
								["get", "compareMedian"],
								["below"],
								"hsla(44, 98%, 53%,0%)",
								["above"],
								"hsla(113, 44%, 50%,0%)",
								"hsla(0, 0%, 0%,0%)"
							]
						)

						map.setPaintProperty(
							layerName,
							"circle-stroke-color",
							"rgba(255,255,255,0)"
						)

						map.off('mouseenter', layerName, hoverOnSchool)	
						map.off('click', layerName, clickOnSchool)	

					}
					//If layer matches level, but school type is not currently shown
					//set layer to low opacity and turn off mouse events
					else if(schoolTypes.indexOf(ALL_SCHOOL_TYPES[j]) == -1){
						map.setPaintProperty(
							layerName,
							"circle-color",
							[
								"match",
								["get", "compareMedian"],
								["below"],
								"hsla(44, 98%, 53%," + MAP_HIDE_DOT_OPACITY + ")",
								["above"],
								"hsla(113, 44%, 50%," + MAP_HIDE_DOT_OPACITY + ")",
								"hsla(0, 0%, 0%," + MAP_HIDE_DOT_OPACITY + ")"
							]
						)
						map.setPaintProperty(
							layerName,
							"circle-stroke-color",
							"rgba(255,255,255," + MAP_HIDE_DOT_OPACITY_STROKE + ")"
						)

						map.off('mouseenter', layerName, hoverOnSchool)	
						map.off('click', layerName, clickOnSchool)	
						//If layer matches both level and current school types, show it
						//and turn on mouse events
					}else{
						map.setPaintProperty(
							layerName,
							"circle-color",
							[
								"match",
								["get", "compareMedian"],
								["below"],
								"hsla(44, 98%, 53%," + MAP_SHOW_DOT_OPACITY + ")",
								["above"],
								"hsla(113, 44%, 50%," + MAP_SHOW_DOT_OPACITY + ")",
								"hsla(0, 0%, 0%," + MAP_SHOW_DOT_OPACITY + ")"
							]
						)

						map.setPaintProperty(
							layerName,
							"circle-stroke-color",
							"rgba(255,255,255," + MAP_SHOW_DOT_OPACITY_STROKE + ")"
						)

						map.on('mouseenter', layerName, hoverOnSchool)	
						map.on('click', layerName, clickOnSchool)	
					}

				}
			}
		})

		dispatch.on("changeSchoolTypes", function(schoolTypes){
			//handle events for non map charts (see events.js)
			changeSchoolTypes(schoolTypes)

			//loop through all dot layers for current school level. No need to loop through level
			//layers, since they are approperiatly shown/hidden in the `changeLevel` event
			var level = getLevel()
			for(var i = 0; i < ALL_SCHOOL_TYPES.length; i++){
				var schoolType = ALL_SCHOOL_TYPES[i]
				var layerName = "lvl_" + level + "_" + schoolType


				//If layer does not match schoolTypes, set to low opacity and turn off mouse events
				if(schoolTypes.indexOf(schoolType) == -1){
					map.setPaintProperty(
						layerName,
						"circle-color",
						[
							"match",
							["get", "compareMedian"],
							["below"],
							"hsla(44, 98%, 53%," + MAP_HIDE_DOT_OPACITY + ")",
							["above"],
							"hsla(113, 44%, 50%," + MAP_HIDE_DOT_OPACITY + ")",
							"hsla(0, 0%, 0%," + MAP_HIDE_DOT_OPACITY + ")"
						]
					)
					map.setPaintProperty(
						layerName,
						"circle-stroke-color",
						"rgba(255,255,255," + MAP_HIDE_DOT_OPACITY_STROKE + ")"
					)

					map.off('mouseenter', layerName, hoverOnSchool)
					map.off('click', layerName, clickOnSchool)
					//If layer matches schoolTypes, show it and turn on mouse events
				}else{
					map.setPaintProperty(
						layerName,
						"circle-color",
						[
							"match",
							["get", "compareMedian"],
							["below"],
							"hsla(44, 98%, 53%," + MAP_SHOW_DOT_OPACITY + ")",
							["above"],
							"hsla(113, 44%, 50%," + MAP_SHOW_DOT_OPACITY + ")",
							"hsla(0, 0%, 0%," + MAP_SHOW_DOT_OPACITY + ")"
						]
					)
					map.setPaintProperty(
						layerName,
						"circle-stroke-color",
						"rgba(255,255,255," + MAP_SHOW_DOT_OPACITY_STROKE + ")"
					)

					map.on('mouseenter', layerName, hoverOnSchool)	
					map.on('click', layerName, clickOnSchool)	
				}
			}
		})

		//On load, by default, set map to default values
		//This is redundantly handled by scroll events, but is neccessary if page
		//loads at bottom, on map view
		// setLevel(DEFAULT_LEVEL)
		// setSchoolTypes(ALL_SCHOOL_TYPES)
		// setActiveSchool(TAMARACK_ID)

		//District boundaries are precalculated in `scripts/mapping/schoolDistricts/get_feature_boundaries.py`
		//and stored in lightweight csv.
		//Dispatch handler inside d3 promise, in order to get district boundaries
		// console.log()

	})


