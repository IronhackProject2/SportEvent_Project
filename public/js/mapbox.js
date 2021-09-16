mapboxgl.accessToken = 'pk.eyJ1IjoiaGFubmVzY2hvIiwiYSI6ImNrdGxjN3FnYzAwYWMyb3Iwa3U2cnFuNnQifQ.2_I4UhdaZZDZFqPpI1eCjw';

const center = [document.querySelector('#hiddenLon').innerHTML, document.querySelector('#hiddenLat').innerHTML]; //[13.4532321, 52.5331092]
const coords = JSON.parse(document.querySelector('#hiddenPositions').innerHTML);
const title = document.querySelector(".title").outerText;
const titles = [];
document.querySelectorAll(".title").forEach(el=> titles.push(el.outerText));

console.log(document.querySelectorAll(".title"));
const map = new mapboxgl.Map({
	
	container: 'map', // container ID
	style: 'mapbox://styles/mapbox/streets-v11', // style URL
	center: center, // starting position [lng, lat]
	zoom: 9 // starting zoom
});


coords.forEach(function (coord, i) {
	new mapboxgl.Marker({
		color: 'blue',
		draggable: false,
	}).setLngLat(coord)
	.setPopup(new mapboxgl.Popup().setHTML(`<h2>${titles[i]}</h2>`))
	.addTo(map)
})

const marker = new mapboxgl.Marker({
	color: 'red',
	draggable: false
}).setLngLat(center)
.setPopup(new mapboxgl.Popup().setHTML(`<h2>${title}</h2>`))
.addTo(map)

const nav = new mapboxgl.NavigationControl();

map.addControl(nav, 'top-left');

const popup = new mapboxgl.Popup({
	closeButton: true
});


// const addMarker = event => {
// 	new mapboxgl.Marker({
// 		color: 'red',
// 		draggable: true
// 	})
// 		.setLngLat(event.lngLat)
// 		.addTo(map)
// 		.on('dragend', event => console.log(event.target._lngLat))
// }

// map.on('click', addMarker)

// popup.setLngLat(center)
// 	.setHTML('<h1>Hello 👋</h1>')
// 	.setMaxWidth('200px')
// 	.addTo(map)

//     new mapboxgl.Marker({
//         color: 'red'
//     }).setLngLat(center)
//     .addTo(map)