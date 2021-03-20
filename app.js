let routes, markers = [];
let marker, infoWindow, map, route;

function getRoutes(lat,lon,distance) {
	$.get('https://www.mountainproject.com/data/get-routes-for-lat-lon?lat= ' + lat + '&lon=' + lon + '&maxDistance=' + distance + '&minDiff=5.6&maxDiff=5.15&key=your_key', function(response) {
		console.log('inside getroutes function');
		console.log(response);
		routes = []
		for (let i = 0; i < response.routes.length; i++) {
			route = {
				name: response.routes[i].name,
				latitude: response.routes[i].latitude,
				longitude: response.routes[i].longitude,
				url: response.routes[i].url,
				rating: response.routes[i].rating,
				location: response.routes[i].location[2]
			}
			routes.push(route);
		}
		$('#maptitle').text('Viewing ' + routes.length + ' routes at Latitude ' + (Math.round(lat * 100) / 100) + ', Longitude ' + (Math.round(lon * 100) / 100));
	});
};

function addMarkers() {
	console.log('inside addMarkers function');
	for (let i = 0; i < routes.length; i++) {
		let name = routes[i].name;
		let rating = routes[i].rating;
		let lat = routes[i].latitude;
		let lon = routes[i].longitude;
		let url = routes[i].url;
		console.log(url);
		let location = routes[i].location;
		infoWindow = new google.maps.InfoWindow();
		marker = new google.maps.Marker({
			position: new google.maps.LatLng(lat,lon),
			map: map,
			title: name
		});
		marker.addListener('click', function(map, marker) {
			return function() {
				//clear any current highlight
				for (let i = 0; i < routes.length; i++) {
					$("#row" + i).removeClass("is-selected");
				}
				let infoWindowContent = `
				<div id="content">
		        	<div id="siteNotice">
		        	</div>
		        	<h1 id="firstHeading" class="firstHeading">${name} ${rating}</h1>
		        	<div id="bodyContent">
			        	<p>Location: ${location}</p>
			        	<p><a href="${url}" target="_blank">View on Mountain Project</a></p>
		        	</div>
		        </div
				`;
				infoWindow.setContent(infoWindowContent);
		      	infoWindow.open(map, marker);
		      	$("#row" + i).addClass("is-selected");
	      	}	
        }(map, marker));
		markers.push(marker);
	}	
};

function printRoutes() {
	console.log('inside printRoutes function');
	$('#climblist').html('');
	for (let i = 0; i < routes.length; i++) {
		let routeRowInTable = `
		<tr id="row${i}">
			<td>${routes[i].name}</td>
			<td>${routes[i].rating}</td>
			<td>${routes[i].location}</t>	
		</tr>	
		`;
		$('#climblist').append(routeRowInTable);
	}
};

function initializeMap() {
	console.log('inside initializeMap function');
	map = new google.maps.Map(document.getElementById('map'), {
		zoom: 6,
		center: new google.maps.LatLng(37.762241,-122.402706),
		mapTypeId: 'terrain'
	});
	getRoutes(37.762241,-122.402706,100); //default looking for climbs around the bay area
	setTimeout(addMarkers,1000);
	setTimeout(printRoutes,1000);

	//adding event listener for find climbs button
	$('#findclimbs').on('click', function(event) {
		event.preventDefault();
		deleteMarkers();
		$("#errorfield").text("Distance from point to search for climbs (miles, max 200)");
		let newLat = $('#lat').val();
		console.log(newLat);
		let newLon = $('#lon').val();
		let newRadius = $('#radius').val();
		if (newLat == '' || newLon == '' || newRadius == '') {
			$("#errorfield").text("Please fill out all 3 values.");
		} else {
			getRoutes(newLat,newLon,newRadius);
			setTimeout(addMarkers,1000);
			setTimeout(printRoutes,1000);
			map.setCenter(new google.maps.LatLng(newLat,newLon));
		}
	});

	//adding event listener for find climbs for you button
	$('#findclimbsforyou').on('click', function(event) {
		event.preventDefault();
		deleteMarkers();
		$("#errorfield").text("Distance from point to search for climbs (miles, max 200)");
		let userLat, userLon;
		navigator.geolocation.getCurrentPosition(function(position) {
			userLat = position.coords.latitude;
			userLon = position.coords.longitude;
			getRoutes(userLat,userLon,100); //using 100 miles as default
			setTimeout(addMarkers,1000);
			setTimeout(printRoutes,1000);
			map.setCenter(new google.maps.LatLng(userLat,userLon));
		});	
	});

};

function deleteMarkers() {
	for (let i = 0; i < markers.length; i++) {
		markers[i].setMap(null);
	}
	markers = [];
}

initializeMap();