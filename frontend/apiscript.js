// Google Maps API
let map;
let service;
let infowindow;

function initMap() {
    if (typeof google === 'undefined' || !google.maps) {
        console.log("Google Maps API no se ha cargado correctamente.");
        return;
    }
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 15,
        center: { lat: 25.6513, lng: -100.2896 },
    });

    // Intentar obtener la ubicación del usuario
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
                map.setCenter(userLocation);

                // 📌 Agregar marcador en la ubicación del usuario
                new google.maps.Marker({
                    position: userLocation,
                    map: map,
                    title: "Tu ubicación",
                    icon: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                });

                // Buscar lugares cercanos
                buscarLugares(userLocation);
            },
            () => {
                console.error("No se pudo obtener la ubicación del usuario.");
                buscarLugares({ lat: 25.6513, lng: -100.2896 }); // Ubicación predeterminada
            }
        );
    } else {
        console.error("Geolocalización no es compatible con este navegador.");
        buscarLugares({ lat: 25.6513, lng: -100.2896 }); // Ubicación predeterminada
    }
}

function buscarLugares(location) {
    const request = {
        location: location,
        radius: 2000, // 📌 Radio de búsqueda en metros (2 km)
        type: ["restaurant"], // 📌 Cambia este tipo según lo que quieras buscar
    };

    service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, mostrarLugares);
}

function mostrarLugares(results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
        results.forEach((lugar) => {
            crearMarcador(lugar);
        });
    } else {
        console.error("No se encontraron lugares cercanos:", status);
    }
}

function crearMarcador(lugar) {
    const marker = new google.maps.Marker({
        position: lugar.geometry.location,
        map: map,
        title: lugar.name,
    });

    const infoWindow = new google.maps.InfoWindow({
        content: `<strong>${lugar.name}</strong><br>${lugar.vicinity}`,
    });

    marker.addListener("click", () => {
        infoWindow.open(map, marker);
    });
}
