mapboxgl.accessToken = 'pk.eyJ1IjoiaGFubmVzY2hvIiwiYSI6ImNrdGxjN3FnYzAwYWMyb3Iwa3U2cnFuNnQifQ.2_I4UhdaZZDZFqPpI1eCjw';

const center = [document.querySelector('#hiddenLon').innerHTML, document.querySelector('#hiddenLat').innerHTML]; //[13.4532321, 52.5331092]
const coords = JSON.parse(document.querySelector('#hiddenPositions').innerHTML);

const map = new mapboxgl.Map({
	container: 'map', // container ID
	style: 'mapbox://styles/mapbox/streets-v11', // style URL
	center: center, // starting position [lng, lat]
	zoom: 9 // starting zoom
});

if (document.querySelector(".title")) {
	// set title and href for popups
	console.log("hi");
const titles = [];
const hrefs = [];
document.querySelectorAll(".title").forEach(el=> titles.push(el.outerText));
document.querySelectorAll(".title").forEach(el=> hrefs.push(el.href.slice(el.href.indexOf('events')-1)));
const title = titles[0];
const href = hrefs[0];

coords.forEach(function (coord, i) {
	new mapboxgl.Marker({
		color: 'blue',
		draggable: false,
	}).setLngLat(coord)
	.setPopup(new mapboxgl.Popup().setHTML(`<p><a href = "${hrefs[i]}">${titles[i]}</a></p>`))
	.addTo(map)
})

const marker = new mapboxgl.Marker({
	color: 'red',
	draggable: false
}).setLngLat(center)
.setPopup(new mapboxgl.Popup().setHTML(`<p><a href = "${href}">${title}</a></p>`))
.addTo(map)

const nav = new mapboxgl.NavigationControl();

map.addControl(nav, 'top-left');

const popup = new mapboxgl.Popup({
	closeButton: true
});
} 
else {
	//set detail page map
	const detailtitle = document.querySelector(".detailtitle").innerText;

	const marker = new mapboxgl.Marker({
		color: 'red',
		draggable: false
	}).setLngLat(center)
	.setPopup(new mapboxgl.Popup().setHTML(`<h2>${detailtitle}</h2>`))
	.addTo(map)

	const nav = new mapboxgl.NavigationControl();

	map.addControl(nav, 'top-left');

	const popup = new mapboxgl.Popup({
		closeButton: true
	});
}
