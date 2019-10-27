import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {

  constructor(
  private http: HttpClient
  ){}

  timeIntervals: number = 24
  cityForecast: array

  getCityWeather(lat: number, lon: number){

    const BASEURL = 'https://api.darksky.net/forecast'
    const PROXYCORS = 'https://cors-anywhere.herokuapp.com'
    const APIKEY = 'c7e919996d611be09f8ae915710226e8'
    const latlon = lat + ',' + lon
    const params = '?units=si&extend=hourly'

    return this.http.get( PROXYCORS + '/' + BASEURL + '/' + APIKEY + '/' + latlon + params )

  }

  /**
   * Converts raw data from forecast API into an object compatible with this app.
   * Creates an array with the forecast of the requested city divided in days represented as objects like you can see above.
   */
   preMapDays(forecastRawData: array){

     forecastRawData.forEach( (forecastPerCertainHours, key) => {

       // If it is the first hours interval forecast.
       if(key === 0){
         this.createNewForecastDay(forecastPerCertainHours, key)
         return false
       }

       // Prepares all values that will be shown in the forecast view.
       const localDate = new Date(forecastPerCertainHours.time)
       const formatedDate = (localDate.getMonth() + 1) + '/' + localDate.getDate()
       const stateCode = this.getStateFilteredCode(forecastPerCertainHours.icon)
       const temperature = Math.round(forecastPerCertainHours.temperature)
       const windSpeed = Math.round(forecastPerCertainHours.windSpeed * 1.609344)
       const windDirection = Math.round(forecastPerCertainHours.windBearing)
       const precipitation = Math.round(forecastPerCertainHours.precipProbability)

       this.cityForecast.forEach( (forecastDay, key) => {

         // If the hours interval forecast of a particular day exists, then keeps filling up.
         if(forecastDay['date'] === formatedDate) {
           forecastDay.state.hourly.push(stateCode)
           forecastDay.air.hourly.push(temperature)
           forecastDay.windspeed.hourly.push(windSpeed)
           forecastDay.winddirection.hourly.push(windDirection)
           forecastDay.rain.hourly.push(precipitation)
           forecastDay = this.calcDisplay(forecastDay)
         // If not, then creates a new one.
         }else if (forecastDay['date'] !== formatedDate) {
           // "cityForecast.length < 5" don't want to show more than 5 days forecast.
           if(key === cityForecast.length - 1 && cityForecast.length < 5){
             this.createNewForecastDay(forecastPerCertainHours)
           }
         }

       } )

     } )

     return this.cityForecast

   }

   /**
    * Creates a new day forecast object.
    */
   createNewForecastDay(hourForecast: object, key: number){

     // Prepares all values that will be shown in the forecast view.
     const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
     const localDate = new Date(hourForecast.time)
     const initialSetHours = localDate.getHours()
     const timeInterval = this.getTimeInterval(initialSetHours)
     const formatedDate = (localDate.getMonth() + 1) + '/' + localDate.getDate()
     const stateCode = this.getStateFilteredCode(hourForecast.icon)
     const temperature = Math.round(hourForecast.temperature)
     const windSpeed = Math.round(hourForecast.windSpeed * 1.609344)
     const windDirection = Math.round(hourForecast.windBearing)
     const precipitation = Math.round(hourForecast.precipProbability)

     // Defining and creating the day forecast object.
     const firstDay = {
       'timeInterval': timeInterval,
       'state': { 'display' : 0, 'hourly' : [stateCode]},
       'day' : key === 0 ? 'Today' : days[localDate.getDay()],
       'date' : formatedDate,
       'air' : { 'display' : [], 'hourly' : [temperature]},
       'windspeed' : { 'display' : 0, 'hourly' : [windSpeed]},
       'winddirection' : { 'display' : 0, 'hourly' : [windDirection] },
       'rain' : { 'display' : 0, 'hourly' : [precipitation]}
     }

     // Gets the correct display values for each case.
     firstDay = this.calcDisplay(firstDay)

     this.cityForecast.push(firstDay)

   }

   /**
    * Gets the correct display values for each case.
    */
   calcDisplay(forecastDay: object){

     for (let property in forecastDay) {

       if(typeof forecastDay[property] == 'object'){

         if('display' in forecastDay[property]){

           // If the property is air then calculates min and max temperature.
           if(property == 'air'){

             forecastDay[property].display = [];

             const minTemp = Math.min(...forecastDay[property].hourly)
             const maxTemp = Math.max(...forecastDay[property].hourly)

             forecastDay[property].display.push(minTemp)
             forecastDay[property].display.push(maxTemp)

           }
           else{

             // For the rest of the properties calculates the average value.
             const total = forecastDay[property].hourly.reduce( (acc, value) => acc + value )

             const avg = total / forecastDay[property].hourly.length

             forecastDay[property].display = Math.round(avg)

           }

         }

       }

     }

     return forecastDay;

   }

   /**
    * Prepares and maps an object for the manipulation in the view.
    */
   initMapDays() {

     this.cityWeather.forEach( (day, key) => {

       day.stateName = this.getStateClassname(day.state.display);
       day.timeIntervalName = this.getTimeIntervalClass(day.timeInterval);
       day.periodTime = '';
       day.periodName = '';
       day.airTemp = day.air.display;
       day.windSpeedNum = day.windspeed.display;
       day.windDirectionDeg = day.winddirection.display;
       day.rainProb = day.rain.display;
       day.periodHidden = 'slice__data--hidden';
       day.units = {
         temperature : '°C',
         speed : 'km/h',
         length : 'm',
         time : 's',
         percentage : '%'
       }

     } )

   }

   /**
    * Simplifies the icon of the sky state to show.
    */
   getStateFilteredCode(iconName: string){

     let stateCode: number;

     if( iconName === 'clear-day' )
       stateCode = 1
     else if( iconName === 'partly-cloudy-day' )
       stateCode = 2
     else if( iconName === 'cloudy' || iconName === 'fog' )
       stateCode = 3
     else if( iconName === 'rain' || iconName === 'snow' || iconName === 'sleet' || iconName === 'hail' )
       stateCode = 4
     else if( iconName === 'thunderstorm' || iconName === 'wind' || iconName === 'tornado' )
       stateCode = 5
     else if( iconName === 'clear-night' )
       stateCode = 6
     else if( iconName === 'partly-cloudy-night' )
       stateCode = 7

    return stateCode

   }

   /**
    * Returns the correspondant class name for the sky state.
    */
   getStateClassname(state: number) {

     var stateClassName = 'slice--state-'

     switch(state) {
       case 1: stateClassName += 'sunny'; break;
       case 2: stateClassName += 'partlycloudy'; break;
       case 3: stateClassName += 'cloudy'; break;
       case 4: stateClassName += 'rain'; break;
       case 5: stateClassName += 'thunders'; break;
       case 6: stateClassName += 'clearnight'; break;
       case 7: stateClassName += 'partlycloudynight'; break;
     }

     return stateClassName

   }

   /**
    * Returns the correspondant time interval code for the layout.
    */
   getTimeInterval(initialSetHours: number){

     let timeInterval: number

     switch(initialSetHours) {

       case 0: timeInterval = 24; break;
       case 1: timeInterval = 23; break;
       case 2: timeInterval = 22; break;
       case 3: timeInterval = 21; break;
       case 4: timeInterval = 20; break;
       case 5: timeInterval = 19; break;
       case 6: timeInterval = 18; break;
       case 7: timeInterval = 17; break;
       case 8: timeInterval = 16; break;
       case 9: timeInterval = 15; break;
       case 10: timeInterval = 14; break;
       case 11: timeInterval = 13; break;
       case 12: timeInterval = 12; break;
       case 13: timeInterval = 11; break;
       case 14: timeInterval = 10; break;
       case 15: timeInterval = 9; break;
       case 16: timeInterval = 8; break;
       case 17: timeInterval = 7; break;
       case 18: timeInterval = 6; break;
       case 19: timeInterval = 5; break;
       case 20: timeInterval = 4; break;
       case 21: timeInterval = 3; break;
       case 22: timeInterval = 2; break;
       case 23: timeInterval = 1; break;

     }

     return timeInterval

   }


}
