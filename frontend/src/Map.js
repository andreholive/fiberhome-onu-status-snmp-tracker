import React, {useState, useCallback, useEffect} from 'react'
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { Marker } from '@react-google-maps/api';
import { InfoWindow } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '100%'
};


function Map({pos, marks}) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: "AIzaSyCf59kdGonDy8VR8mXWT590VjxNRPeqYeY"
  })
  

  const [map, setMap] = useState(null);
  const [infos, setInfos] = useState([]);
  console.log(pos)
    
  const onLoad = useCallback(function callback(map) {
    setMap(map);
  }, []);

  function addInfo(data){
    setInfos((infos) => [...infos, data]);
  }
  const house = "m 13.1487 5.4437 L 11.7965 4.2495 V 1.1059 a 0.3686 0.3686 90 0 0 -0.3686 -0.3686 H 9.9533 a 0.3686 0.3686 90 0 0 -0.3686 0.3686 V 2.2964 L 7.2525 0.2373 C 7.1078 0.1062 6.8321 0 6.6355 0 s -0.4714 0.1062 -0.6161 0.2373 l -5.8982 5.207 A 0.4209 0.4209 90 0 0 0 5.7185 a 0.4295 0.4295 90 0 0 0.0942 0.2468 L 0.5875 6.5134 a 0.4871 0.4871 90 0 0 0.2765 0.1221 a 0.4993 0.4993 90 0 0 0.2463 -0.0947 l 0.3663 -0.3226 V 11.0592 a 0.7373 0.7373 90 0 0 0.7373 0.7373 H 11.0592 a 0.7373 0.7373 90 0 0 0.7373 -0.7373 V 6.218 l 0.3666 0.3226 A 0.5055 0.5055 90 0 0 12.41 6.6355 a 0.4813 0.4813 90 0 0 0.2735 -0.1223 l 0.4933 -0.5486 A 0.4986 0.4986 90 0 0 13.271 5.7183 A 0.4838 0.4838 90 0 0 13.1487 5.4437 Z M 6.6355 4.055 a 1.4746 1.4746 90 1 1 -1.4746 1.4746 A 1.4746 1.4746 90 0 1 6.6355 4.055 Z M 9.216 10.3219 H 4.055 a 0.3686 0.3686 90 0 1 -0.3686 -0.3686 a 2.2118 2.2118 90 0 1 2.2118 -2.2118 h 1.4746 a 2.2118 2.2118 90 0 1 2.2118 2.2118 A 0.3686 0.3686 90 0 1 9.216 10.3219 Z"
  const caixa = "m 18.56 0.28 h -16.64 c -1.0604 0 -1.92 0.8596 -1.92 1.92 v 20 c 0 1.0604 0.8596 1.92 1.92 1.92 h 16.64 c 1.0604 0 1.92 -0.8596 1.92 -1.92 v -20 c 0 -1.0604 -0.8596 -1.92 -1.92 -1.92 z M 8.96 15.64 h -6.4 v -3.84 H 8.96 V 15.64 Z m 0 -6.4 h -6.4 v -3.84 h 6.4 v 3.84 z m 8.96 6.4 h -6.4 v -3.84 h 6.4 V 15.64 Z m 0 -6.4 h -6.4 v -3.84 h 6.4 v 3.84 z"

  function getClientIcon(client){
    const obj = {
        path:house,
        fillColor: "red",
        fillOpacity: 0.9,
        scale: 2,
        strokeWeight: 0
      }
      if(client.onu_data?.status == 1){
          obj.fillColor = "green"
      }
      return obj;
  }

  return isLoaded ? (
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={pos}
        zoom={15}
        onLoad={onLoad}
      >
    {infos.map(info => (
        <InfoWindow
        key={info.id}
        position={{lat: parseFloat(info.latitude), lng: parseFloat(info.longitude)}}
      >
        <>
        <div>
        {info.cliente.razao}
        </div>
        <div>
        {info.onu_data.optical?.rxPower.value}
        </div>
        </>
      </InfoWindow>
    ))}
    
    <Marker
        position={pos}
        clickable={true}
        icon={{
            path:caixa,
            fillColor: "000000",
            fillOpacity: 0.9,
            scale: 1,
            strokeWeight: 0
          }}
    />
    {marks.map(mark => (
        <Marker 
        key={mark.id}
        icon={getClientIcon(mark)}
        position={{lat: parseFloat(mark.latitude), lng: parseFloat(mark.longitude)}}
        onClick={() => {addInfo(mark)}}
        />
    ))}
      </GoogleMap>
  ) : <></>
}

export default React.memo(Map);

