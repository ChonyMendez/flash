// Función para obtener las coordenadas de una dirección
function obtenerCoordenadas(direccion, callback) {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: direccion }, function (results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
            const lat = results[0].geometry.location.lat();
            const lng = results[0].geometry.location.lng();
            callback({ lat, lng });
        } else {
            callback(null);
        }
    });
}

// Función para calcular la distancia entre dos coordenadas en kilómetros
function calcularDistancia(origen, destino) {
    const lat1 = origen.lat;
    const lon1 = origen.lng;
    const lat2 = destino.lat;
    const lon2 = destino.lng;
    const radlat1 = Math.PI * lat1 / 180;
    const radlat2 = Math.PI * lat2 / 180;
    const theta = lon1 - lon2;
    const radtheta = Math.PI * theta / 180;
    let dist = Math.sin(radlat1) * Math.sin(radlat2) +
               Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    dist = Math.acos(dist);
    dist = dist * 180 / Math.PI;
    dist = dist * 60 * 1.1515;
    dist = dist * 1.609344; // Convertir a kilómetros
    return dist;
}

// Inicializa el autocompletado de direcciones de Google Places
function initAutocomplete() {
    var inputOrigen = document.getElementById('direccion_origen');
    var inputDestino = document.getElementById('direccion_destino');

    var autocompleteOptions = {
        types: ["geocode", "establishment"], // Permitir autocompletado de direcciones y lugares
        componentRestrictions: { country: "ar" } // Restringir resultados a Argentina (cambia esto según tu ubicación)
    };

    var autocompleteOrigen = new google.maps.places.Autocomplete(inputOrigen, autocompleteOptions);
    var autocompleteDestino = new google.maps.places.Autocomplete(inputDestino, autocompleteOptions);
}

document.addEventListener("DOMContentLoaded", function () {
    initAutocomplete();

    // Añadir un evento al botón "Calcular Tarifa"
    document.getElementById("calcularTarifa").addEventListener("click", function () {
        actualizarEstimacionTarifa();
    });

    // Función para obtener el valor de un campo del formulario
    const getFieldValue = (id) => {
        return document.querySelector(`#${id}`).value;
    };

    // Actualizar la estimación de tarifa
    function actualizarEstimacionTarifa() {
        const direccionOrigen = getFieldValue("direccion_origen");
        const direccionDestino = getFieldValue("direccion_destino");

        if (direccionOrigen && direccionDestino) {
            obtenerCoordenadas(direccionOrigen, function (coordenadasOrigen) {
                if (!coordenadasOrigen) {
                    return;
                }

                obtenerCoordenadas(direccionDestino, function (coordenadasDestino) {
                    if (!coordenadasDestino) {
                        return;
                    }

                    // Calcular la distancia entre las coordenadas
                    const distancia = calcularDistancia(coordenadasOrigen, coordenadasDestino);
                    const tarifaBase = 250; // Tarifa base en dólares
                    const tarifaPorKilometro = 100; // Tarifa por kilómetro en dólares

                    // Calcular el precio del envío
                    const precio = tarifaBase + distancia * tarifaPorKilometro;

                    // Actualizar la estimación de tarifa en el formulario
                    const tarifaElement = document.getElementById("tarifa");
                    tarifaElement.textContent = precio.toFixed(2);

                    // Actualizar la distancia y el precio en el mensaje de WhatsApp
                    const distanciaElement = document.getElementById("distancia");
                    distanciaElement.textContent = distancia.toFixed(2) + " km";
                    const precioElement = document.getElementById("precio");
                    precioElement.textContent = "$" + precio.toFixed(2);
                });
            });
        }
    }
});

document.addEventListener("DOMContentLoaded", function () {
    initAutocomplete();

    // Añadir un evento al botón "Enviar por WhatsApp"
    document.getElementById("enviarWhatsApp").addEventListener("click", function () {
        enviarWhatsApp();
    });

    // Función para obtener el valor de un campo del formulario
    const getFieldValue = (id) => {
        return document.querySelector(`#${id}`).value;
    };

    // Formatear el mensaje de WhatsApp
    function formatearMensajeWhatsApp() {
        const cliente = getFieldValue("cliente");
        const direccionOrigen = getFieldValue("direccion_origen");
        const direccionDestino = getFieldValue("direccion_destino");
        const distancia = document.getElementById("distancia").textContent;
        const precio = document.getElementById("precio").textContent;
        const fecha = getFieldValue("fecha");
        const hora = getFieldValue("hora");

        const message = `
              *_FLASH PACK_*%0A
              *Low Cost*%0A%0A
              *Origen del Envío*%0A%0A
              *Nombre y Apellido / Empresa*%0A${cliente}%0A
              *Dirección de Origen*%0A${direccionOrigen}%0A%0A
              *Destino del Envío*%0A%0A
              *Dirección de Destino*%0A${direccionDestino}%0A
              *Distancia*: ${distancia}%0A
              *Precio*: ${precio}%0A
              *Fecha de Retiro*: ${fecha}%0A
              *Hora de Retiro*: ${hora}%0A
            `;

        return message;
    }

    // Función para enviar el mensaje por WhatsApp
    function enviarWhatsApp() {
        const message = formatearMensajeWhatsApp();
        const telefono = "543513498469"; // Ingresa el número de WhatsApp válido aquí

        window.open(`https://api.whatsapp.com/send?phone=${telefono}&text=${message}`);
    }
});
