const cityInput=document.querySelector('.city-input')
const searchBtn=document.querySelector('.search-btn')
const notFoundSection=document.querySelector('.not-found')
const searchCitySection=document.querySelector('.search-city')
const weatherInfoSection=document.querySelector('.weather-info')
const countryTxt=document.querySelector('.country-txt')
const tempTxt=document.querySelector('.temp-txt')
const conditionTxt=document.querySelector('.condition-txt')
const humidityTxt=document.querySelector('.humidity-value-txt')
const windValueTxt=document.querySelector('.wind-value-txt')
const weatherSummaryImg=document.querySelector('.weather-summary-img')
const currentDateTxt=document.querySelector('.current-date-txt')
const forecastItemsConatiner=document.querySelector('.forecast-items-conatiner')




const API_KEY = "d1845658f92b31c64bd94f06f7188c9c";



searchBtn.addEventListener('click',()=>{
    if(cityInput.value.trim()!=''){
      updateWatherInfo(cityInput.value);
        cityInput.value='';
        cityInput.blur()
    }
})
cityInput.addEventListener('keydown',(event)=>{
    if(event.key=='Enter'&&
    cityInput.value.trim()!=''
    ){
      updateWatherInfo(cityInput.value);
        cityInput.value='';
        cityInput.blur()
    }
    console.log(event)
})

async function getfectchData(endpoint,city){
const apiUrl=`https://api.openweathermap.org/data/2.5/${endpoint}?q=${city}&appid=${API_KEY}&units=metric`
const response=await fetch(apiUrl);
return response.json();
}

function getWeatherIcon(id){
if(id<=232) return 'thunderstorm.svg'
if(id >= 300 && id <= 321) return 'drizzle.svg'
if(id >= 500 && id <= 531) return 'rain.svg'
if(id >= 600 && id <= 622) return 'snow.svg'
if(id >= 701 && id <= 781) return 'atmosphere.svg'
if(id<=800 ) return 'clear.svg'
else return 'clouds.svg'

}

function getCuurentDate(){
    const currDate=new Date()
    const options={
        weekday:'short',
        day:'2-digit',
        month:'short'
    }
    return currDate.toLocaleDateString('en-GB',options)
}
async function updateWatherInfo(city){
    const weatherData=await getfectchData('weather',city);
    if(weatherData.cod!=200){
        showDisplaySection(notFoundSection);
        suggestionsContainer.style.display = 'none';
        return;
    }

    const{
        name,
        main:{temp,humidity },
        weather:[{id,main}],
        wind:{speed}
    }=weatherData

    countryTxt.textContent=name;
    tempTxt.textContent= Math.round(temp)+'°C';
    conditionTxt.textContent=main
    humidityTxt.textContent=humidity+'%'
    windValueTxt.textContent=speed+'M/s';
    weatherSummaryImg.src=`./assets/weather/${getWeatherIcon(id)}`;
    currentDateTxt.textContent=getCuurentDate();
    await updateForecastInfo(city)


    showDisplaySection(weatherInfoSection);
    suggestionsContainer.style.display = 'none';
}
async function updateForecastInfo(city){
    const forecastData=await getfectchData('forecast',city)
    const timtaken='12:00:00'
    const todayDate=new Date().toISOString().split('T')[0]
    forecastItemsConatiner.innerHTML=''
  forecastData.list.forEach(forecastWeather=>{
    if(forecastWeather.dt_txt.includes(timtaken)&&
    !forecastWeather.dt_txt.includes(todayDate)){

        updateForecastItems(forecastWeather)
    }

  })
}

function updateForecastItems(weatherData){
    console.log(weatherData)
    const {
        dt_txt:date,
        weather:[{id}],
        main:{temp}

    }=weatherData
    const dateTaken=new Date(date)
    const dateoption={
        day:'2-digit',
        month:'short'
    }
    const dateresult=dateTaken.toLocaleDateString('en-US',dateoption)

    const forecastItem =`
    <div class="forecast-item">
    <h5 class="forecast-item-date regular-txt">${dateresult}</h5>
    <img src="./assets/weather/${getWeatherIcon(id)}" class="forecast-item-img"></img>
    <h5 class="forecast-item-temp">${Math.round(temp)}°C</h5>
    </div>
    `
    forecastItemsConatiner.insertAdjacentHTML('beforeend',forecastItem)

}





const suggestionsContainer = document.querySelector('.suggestions-container');

// Event listener for input to get suggestions
cityInput.addEventListener('input', async function() {
    const query = cityInput.value.trim();
    if (query.length > 0) { // Start showing suggestions after 3 characters
        const suggestions = await getCitySuggestions(query);
        displaySuggestions(suggestions);
    } else {
        suggestionsContainer.style.display = 'none';
    }
});

// Fetch city suggestions from an API (You can use a public API like GeoDB Cities API)
async function getCitySuggestions(query) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/find?q=${query}&appid=${API_KEY}&limit=50`;
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data.list.map(item => `${item.name}, ${item.sys.country}`);
    } catch (error) {
        console.error('Error fetching city suggestions:', error);
        return [];
    }
}


// Display the fetched suggestions
function displaySuggestions(suggestions) {
    suggestionsContainer.innerHTML = '';
    if (suggestions.length === 0) {
        suggestionsContainer.style.display = 'none';
        return;
    }
    
    suggestions.forEach(city => {
        const suggestionItem = document.createElement('div');
        suggestionItem.classList.add('suggestion-item');
        suggestionItem.textContent = city;
        suggestionsContainer.appendChild(suggestionItem);
        
        
        suggestionItem.addEventListener('click', function() {
            cityInput.value = city;
            suggestionsContainer.style.display = 'none';
            updateWatherInfo(city); // Trigger search with selected city
        });
    });
    
    suggestionsContainer.style.display = 'block'; // Show the container
}


function showDisplaySection(section){
[weatherInfoSection,searchCitySection,notFoundSection].forEach(section=>section.style.display='none')
section.style.display='flex'
}