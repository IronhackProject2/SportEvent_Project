mapboxgl.accessToken = 'pk.eyJ1IjoicHJvZC1hc3RyaSIsImEiOiJja3RlNTkydDYwNG03MnBxbnJvZmd0aWhnIn0.eSYEto_HPz1pJlwzhhboig';
const center = [document.querySelector('#hiddenX').innerHTML, document.querySelector('#hiddenY').innerHTML]; //[13.4532321, 52.5331092]
console.log('---------------------------------')
console.log (center)
console.log('---------------------------------')
const map = new mapboxgl.Map({
    //          V this is basically the id
	container: 'map', // container ID
	style: 'mapbox://styles/mapbox/streets-v11', // style URL
	center: center, // starting position [lng, lat]
	zoom: 9 // starting zoom
});

const nav = new mapboxgl.NavigationControl();
map.addControl(nav, 'top-left');

const popup = new mapboxgl.Popup({
	closeButton: true
});

// const coords = [
//     [13.001, 52],
//     [12.999, 52]
// ]


// coords.forEach(function (coord) {
// 	new mapboxgl.Marker({
//         color: 'blue',
//         draggable: true
// 	}).setLngLat(coord)
//     .addTo(map)
// })

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