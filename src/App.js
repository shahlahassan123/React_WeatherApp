import React, {useEffect, useRef, useState} from 'react'
import './App.css'
import axios from 'axios'


const apiKey = "AIzaSyB_00bhCEW8YJ-WU_FX5RbEd-L8gz9tSiw";
const mapApiJs = 'https://maps.googleapis.com/maps/api/js';
const weatherAPIKey = "53bec188b46263d28647a2f2a324fc2c";



// load google map api js in the script tag

function loadAsyncScript(src) {
  return new Promise(resolve => {
    const script = document.createElement("script");
    Object.assign(script, {
      type: "text/javascript",
      async: true,
      src
    })
    script.addEventListener("load", () => resolve(script));
    document.head.appendChild(script);
  })
}

const extractAddress = (place, setCity, setCountry) => {

  place.address_components.forEach(component => {
    console.log("compoenent", component)
    const types = component.types;
    console.log("Types", types)
    const value = component.long_name;
    console.log("value", value)

    if (types.includes("locality")) {
      setCity(value);
    }

    if (types.includes("country")) {
      setCountry(value);
    }

  });


  
}


function App() {

  const searchInput = useRef(null);
 
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [weather, setWeather] = useState({});

  // init gmap script
  const initMapScript = () => {
    // if script already loaded
    if(window.google) {
      return Promise.resolve();
    }
    const src = `${mapApiJs}?key=${apiKey}&libraries=places&v=weekly`;
    return loadAsyncScript(src);
  }

  // do something on address change
  const onChangeAddress = (autocomplete) => {
    const place = autocomplete.getPlace();
    console.log("Place", autocomplete)
    extractAddress(place, setCity,setCountry);
  
  }


  // init autocomplete
  const initAutocomplete = () => {
    if (!searchInput.current) return;
    const autocomplete = new window.google.maps.places.Autocomplete(searchInput.current);
    console.log("Autocomplete", autocomplete)
    autocomplete.setFields(["address_component"]);
    autocomplete.addListener("place_changed", () => {
      onChangeAddress(autocomplete)


    });
  }

  
  
  


  // load map script after mounted
  useEffect(() => {
    initMapScript().then(() => initAutocomplete())
    //fetch open weather api after getting city and country
    if(city && country){
      axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city},${country}&appid=${weatherAPIKey}&units=imperial`).then(
        data => setWeather(data.data)
      )

    }
  }, [city, country]);


console.log("Weather", weather)


  return (
    <div className="App">
      <div>
        <div className="search">
          <input ref={searchInput} type="text" placeholder="Search city...."/>
        </div>
        {weather.weather && weather.weather.length>0 ?
          <div className='weatherData' >
            <div className='temp' style={{fontSize : "1rem", fontWeight : "500"}}>
            <img src={`https://openweathermap.org/img/wn/${weather?.weather[0].icon}@2x.png`} alt="Weather icon"></img>
              <p>Temperature : {weather.main.temp} F</p> 
              <p>Temperature Feels Like : {weather.main.feels_like} F</p> 
              <p>Humidity : {weather.main.humidity} %</p>
              <p>Wind Speed : {weather.wind.speed} miles/hour</p>

            </div>
          </div> :
          ""
          }

        

       

      </div>
    </div>
  )
}

export default App