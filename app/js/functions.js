var map;
var infowindow;
var world_geometry;
var datasource;

function showHideCountries() {
	if(world_geometry.map) {
		world_geometry.setMap(null);
	}
	else {
		world_geometry.setMap(map);
	}
}

function createMarker(lat, lng, map, url, id) {
	var latlng = new google.maps.LatLng(lat, lng);
	var marker = new google.maps.Marker({ position: latlng, map: map });
	marker['id'] = id;
	if(url) {
		marker.addListener('click', function() {
			window.open(url);
		});
	}
	marker.addListener('rightclick', function() {
		for(var i = 0; i < datasource.length; i++)
		{
			if(datasource[i].id == this['id'])
			{
				infowindow = new google.maps.InfoWindow({
				  content: '<div class="infoWindow"><input type="button" onclick=\'removePoi("' + this["id"] + '")\' value="Remove POI"></input></div>',
				});
				infowindow.open(map, this);
			}
		}
	});
	return marker;
}
function addPoi() {
	var jqxhr = $.post( "/poi", { lat: $('#inputLat').val(), lng: $('#inputLng').val(), name:$('#inputName').val(), link:$('#inputLink').val() })
	  .done(function() { location.reload(); })
	  .fail(function() { alert( "error" ); });
}

function removePoi(id) {
	$.ajax({
		url: "/poi",
		type: 'DELETE',
		data: {"id": id},
		success: function() {
			location.reload();
		},
		fail: function(data) {
			 alert("error! seec console");
			 console.log(data);
		}
	});
}

function initMap() {
	var myLatLng = {lat: 42.71473219, lng: 25.05432129};
	map = new google.maps.Map(document.getElementById('map'), { zoom: 8, center: myLatLng });
	world_geometry = new google.maps.FusionTablesLayer({
	   query: {
		select: 'geometry',
		from: '1N2LBk4JHwWpOY4d9fobIn27lfnZ5MDy-NoqqRpk',
		where: "ISO_2DIGIT IN ('BG', 'GR', 'IT', 'GB', 'DE', 'RS', 'BE', 'RO', 'FI', 'FR')"
	  },
	  styles: [
		{ where: "ISO_2DIGIT IN ('FI', 'FR')", polygonOptions: { fillColor: "#144703", fillOpacity: ".30" }},
		{ where: "ISO_2DIGIT NOT IN ('FI', 'FR')", polygonOptions: { fillColor: "#144703", fillOpacity: ".50" } }
	  ]
	});
	
	$.getJSON( "./data/location_history.json", function( data ) {
	  datasource = data.locations;
	  $.each(datasource, function() {
		createMarker(this.lat, this.lng, map, this.link, this.id);
	  });
	});
	google.maps.event.addListener(map, "rightclick", function(event) {
		if(infowindow) {
			infowindow.setMap(null);
		}
		var lat = event.latLng.lat();
		var lng = event.latLng.lng();
		infowindow = new google.maps.InfoWindow({
		  content: '<div class="infoWindow"><strong>Add a new POI</strong><br />Name: <input type="text" name="inputName" id="inputName" value="" /> <br />Link: <input type="text" name="inputLink" id="inputLink" value="" /> <br />Latitude: <input name="inputLat" id="inputLat" type="text" value="" /><br />Longitude: <input name="inputLng" id="inputLng" type="text" value="" /><br /><input type="button" onclick="addPoi()" value="Add POI"></input></div>'
		});
		infowindow.setPosition({lat: lat, lng: lng});
		infowindow.open(map);
		setTimeout(function(){
			$('#inputLat').val(lat);
			$('#inputLng').val(lng);
		}, 50);
	});
	google.maps.event.addListener(map, "click", function(event) {
		if(infowindow) {
			infowindow.setMap(null);
		}
	});
}