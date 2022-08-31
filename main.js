let geocoder;
//Iniciar la carga del mapa con ele evento añadido
google.maps.event.addDomListener(window, 'load', async function(){
    const ubicacion = new Localizacion(()=>{

        
        const myLatLng = {lat: ubicacion.latitude, lng: ubicacion.longitude};

        const options = {
            center:myLatLng,
            zoom: 15
        }

        var map = document.getElementById('map');

        const mapa = new google.maps.Map(map, options);

        //Marcador del mapa
        const marcador = new google.maps.Marker({
            position: myLatLng,
            map: mapa
        });

        //Información que saldrá al elegir una direccion
        var informacion = new google.maps.InfoWindow();

        //Al dar click sobre el marcador nos mostrara la informacion
        marcador.addListener('click', function(){
            informacion.open(mapa, marcador);
        });

        
        //Inicio de Geocoder
        geocoder = new google.maps.Geocoder();

        //Evento cick que setea la posicion del marcador
        mapa.addListener("click", (e) => {
            informacion.close();
            geocode({ location: e.latLng });
            marcador.setPosition(e.latLng)
            // e.lang nos devuelve las coordenadas al dar click
            console.log("Latitud, Longitud: "+e.latLng)
        });
    
        //Request hacia Geocoder para obtener la informacion del lugar elegido
        async function geocode(request) {
            await geocoder
              .geocode(request)
              .then(async result => {
                const { results } = await result;
          
                
                var location = "";
                //Comprobar si se ha encontrado informacion o la locacion
                if(results[0].address_components){
                    location = [
                        (results[0].address_components[0] && results[0].address_components[0].short_name || ''),
                        (results[0].address_components[1] && results[0].address_components[1].short_name || ''),
                        (results[0].address_components[2] && results[0].address_components[2].short_name || ''),
                    ];
                }

                //Crear el componente que muestra la informacion
                informacion.setContent('<div><strong>'+ results[0].plus_code.compound_code + '</strong></br>'+ results[0].formatted_address+'</div>');
                informacion.open(map, marcador);

                /*
                map.setCenter(results[0].geometry.location);
                marker.setPosition(results[0].geometry.location);
                marker.setMap(map);
                responseDiv.style.display = "block";
                response.innerText = JSON.stringify(result, null, 2);
                */
                
                return results;
              });
          }
        //Final de Geocoder


        //Inicio de Autocomplete
        var autocomplete = document.getElementById('autocomplete');

        const search = new google.maps.places.Autocomplete(autocomplete);
        search.bindTo('bounds', mapa);


        // Evento que nos redirecciona al lugar elegido en autocompletar
        search.addListener('place_changed', async function(){

            informacion.close();
            marcador.setVisible(false);

            var place = await search.getPlace();

            if(!place.geometry.viewport){
                window.alert("Error al mostrar el lugar");
                return;
            }
            if(place.geometry.viewport){
                mapa.fitBounds(place.geometry.viewport);
            }
            else{
                mapa.setCenter(place.geometry.location);
                mapa.setZoom(18);
            }
            marcador.setPosition(place.geometry.location);
            // Nos devuelve las coordenadas al elegir el lugar
            console.log("Latitud: "+ marcador.getPosition().lat())
            console.log("Longitud: "+marcador.getPosition().lng())

            marcador.setVisible(true)

            var address = "";
            if(place.address_components){
                address = [
                    (place.address_components[0] && place.address_components[0].short_name || ''),
                    (place.address_components[1] && place.address_components[1].short_name || ''),
                    (place.address_components[2] && place.address_components[2].short_name || ''),
                ];
            }

            informacion.setContent('<div><strong>'+place.name + '</strong></br>'+ address+'</div>');
            informacion.open(map, marcador);
        });

    });

});