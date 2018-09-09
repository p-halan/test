/**
 * Created by pavlo.halan on 9/9/2018.
 */

define([],
    function () {

        function toggleBounce(marker) {
            if (marker.getAnimation() !== null) {
                marker.setAnimation(null);
            } else {
                marker.setAnimation(google.maps.Animation.BOUNCE);
            }
        }

        function createMarker(map, bounds, markerData){
            var marker = new google.maps.Marker({
                map: map,
                draggable: false,
                animation: google.maps.Animation.DROP,
                position: {lat: markerData.Latitude, lng: markerData.Longitude}
            });
            marker.addListener('click', toggleBounce.bind(this, marker));
            bounds.extend(marker.position);
        }

        function initMap(id, data) {
            let tileContent = document.querySelector(`#${id} .tile-content`);
            const map = new google.maps.Map(tileContent, {});
            const bounds = new google.maps.LatLngBounds();
            data.forEach((markerData) => {createMarker(map, bounds, markerData);});
            map.fitBounds(bounds);
            map.panToBounds(bounds);

        }

        return {init: initMap}

    });


