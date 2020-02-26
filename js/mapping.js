var dispatch = d3.dispatch("changeDistrict");

mapboxgl.accessToken = 'pk.eyJ1IjoidXJiYW5pbnN0aXR1dGUiLCJhIjoiTEJUbmNDcyJ9.mbuZTy4hI_PWXw3C3UFbDQ';
var map = new mapboxgl.Map({
container: 'mapContainer',
style: 'mapbox://styles/urbaninstitute/ck73statu2fma1imj9clsur8a',
center: [-73.938, 40.688],
zoom: 9,
minZoom: 6
});



map.on("load", function(e){

// var s = map.getSource("urbaninstitute.19we1533")
// console.log(s)
// 3620580
// map.on("mousemove", "schooldistricts", function(e){

// map.addSource('test', {
// 'type': 'vector',
// 'url':
// 'mapbox://urbaninstitute.19we1533;'
// });
 
// The feature-state dependent fill-opacity expression will render the hover effect
// when a feature's hover state is set to true.
// map.addLayer({
// 'id': 'fills2',
// 'type': 'fill',
// 'source': 'mapbox://urbaninstitute.19we1533',
// 'layout': {},
// 'paint': {
// 'fill-color': '#627BC1',
// 'fill-opacity': [
// 'case',
// ['boolean', ['feature-state', 'active'], false],
// 1,
// 0.5
// ]
// }
// });
 
// map.addLayer({
// 'id': 'state-borders',
// 'type': 'line',
// 'source': 'states',
// 'layout': {},
// 'paint': {
// 'line-color': '#627BC1',
// 'line-width': 2
// }
// });


// mapboxgl.clearStorage()
// console.log(map.getStyle().layers)



var geoid = 3620580
// // // console.log(map)
var f = map.queryRenderedFeatures({layer: "schooldistricts-fill"}).filter(function(o){
	return o.id == geoid
})[0]

map.setFeatureState(
f,
{ "active": true })


var fs = map.queryRenderedFeatures({layer: "schooldistricts-stroke"}).filter(function(o){
	return o.id == geoid
})[0]

map.setFeatureState(
fs,
{ "active": true })
// dispatch.call("changeDistrict", this, "foo")


d3.csv("data/mapping/schoolDistricts/boundaries/boundaries.csv").then(function(boundaries){
	// console.log(boundaries)
	// dispatch.call("changeDistrict", this, "foo")
	dispatch.on("changeDistrict", function(districtId){
		// console.log(districtId, boundaries)
		var boundary = boundaries.filter(function(o){ return o.geoid == districtId})[0]
		
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


		geoid = boundary["geoid"]

		map.setLayoutProperty('schooldistricts-fill', 'visibility', 'none');




		map.fitBounds([
		[boundary.lon1, boundary.lat1],
		[boundary.lon2, boundary.lat2],
		],
		{
			"padding": {"top": 10, "bottom":25, "left": 10, "right": 10},
			"duration": 4000,
			"essential": true,
			"minZoom": 0
		});





setTimeout(function(){
	map.setLayoutProperty('schooldistricts-fill', 'visibility', 'visible');
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
		
},3000)
		




		// setTimeout(function(){ 
		// 	console.log("foo")

		// var f2 = map.queryRenderedFeatures({layer: "schooldistricts"}).filter(function(o){
		// 	return o.id == geoid
		// })

		// for(var i = 0; i < f2.length; i++){
		// 			map.setFeatureState(f2[i], { "active": true })
		// }



		//  }, 0);




	})
})


// map.on('click', function(e) {
// 	console.log(e)
// // set bbox as 5px reactangle area around clicked point
// var bbox = [
// [e.point.x - 5, e.point.y - 5],
// [e.point.x + 5, e.point.y + 5]
// ];
// var features = map.queryRenderedFeatures(bbox, {
// layers: ['lvl_1_tps']
// });

// console.log(features)

// })
map.on("mouseover", ["lvl_1_tps", "lvl_1_private"], function(e){
	console.log(e)
})

//  f = map.queryRenderedFeatures({layer: "schooldistricts", filter : 

//  	[
//         "boolean",
//         // red is higher when feature.properties.temperature is higher
//         ["get", "type"],
//         // green is always zero
//         "Feature"
//     ]

// })






// console.log(map.getFeatureState(
// { "source": "composite", "sourceLayer":"schooldistricts", id: 3402790 }))

// console.log(map.getFeatureState(
// { "source": "composite", "sourceLayer":"schooldistricts", id: 3620580 }))


// console.log(f)


// // console.log(map)
// })
})
 