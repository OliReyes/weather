import { Injectable } from '@angular/core'
import { HttpClient, HttpParams  } from '@angular/common/http'

@Injectable({
  providedIn: 'root'
})
export class WeatherService {

  constructor(
  private http: HttpClient
  ){}

  timeIntervals: number = 24
  cityForecast: Array<any> = []
  language: string
  currentTimeZone: Date

  getCityWeather(lat: number, lon: number, lang: string = 'en'){

    this.language = lang

    const BASEURL = 'https://api.darksky.net/forecast'
    const PROXYCORS = 'https://cors-anywhere.herokuapp.com'
    const APIKEY = 'c7e919996d611be09f8ae915710226e8'
    const latlon = lat + ',' + lon
    let params = new HttpParams()

    params = params.set('units', 'ca').set('extend', 'hourly').set('lang', lang)

    return this.http.get( PROXYCORS + '/' + BASEURL + '/' + APIKEY + '/' + latlon, { params } )

  }

  /**
   * Set the current time zone of the city (date and time).
   */
  setCurrentTimeZone(currentTimeZone: Date){

    this.currentTimeZone = currentTimeZone

  }

  /**
   * Converts raw data from forecast API into an object compatible with this app.
   * Creates an array with the forecast of the requested city divided in days represented as objects like you can see above.
   */
   preMapDays(forecastRawData: Array<any>){

     this.cityForecast = []

     forecastRawData.forEach( (forecastPerCertainHours, key) => {

       // If it is the first hours interval forecast.
       if(key === 0){
         forecastPerCertainHours.time = this.currentTimeZone.getTime()
         this.createNewForecastDay(forecastPerCertainHours, key)
         return false
       }

       this.currentTimeZone.setHours( this.currentTimeZone.getHours() + 1 )
       this.currentTimeZone.setMinutes(0)
       this.currentTimeZone.setSeconds(0)

       // Prepares all values that will be shown in the forecast view.
       const localDate: Date = this.currentTimeZone
       const formatedDate: string = (localDate.getMonth() + 1) + '/' + localDate.getDate()
       const stateCode: number = this.getStateFilteredCode(forecastPerCertainHours.icon)
       const temperature: number = Math.round(forecastPerCertainHours.temperature)
       const windSpeed: number = Math.round(forecastPerCertainHours.windSpeed)
       const windDirection: number = Math.round(forecastPerCertainHours.windBearing)
       const precipitation: number = Math.round(forecastPerCertainHours.precipProbability * 100)
       const summary: string = forecastPerCertainHours.summary

       this.cityForecast.forEach( (forecastDay, key2) => {

         // If the hours interval forecast of a particular day exists, then keeps filling up.
         if(forecastDay['date'] === formatedDate) {
           forecastDay.state.hourly.push(stateCode)
           forecastDay.air.hourly.push(temperature)
           forecastDay.windspeed.hourly.push(windSpeed)
           forecastDay.winddirection.hourly.push(windDirection)
           forecastDay.rain.hourly.push(precipitation)
           forecastDay.summary.hourly.push(summary)
           forecastDay = this.calcDisplay(forecastDay)
         // If not, then creates a new one.
         }else if (forecastDay['date'] !== formatedDate) {
           // "cityForecast.length < 5" don't want to show more than 5 days forecast.
           if(key2 === this.cityForecast.length - 1 && this.cityForecast.length < 5){
             this.createNewForecastDay(forecastPerCertainHours, key)
           }
         }

       } )

     } )

   }

   /**
    * Creates a new day forecast object.
    */
   createNewForecastDay(hourForecast: any, key: number){

     // Prepares all values that will be shown in the forecast view.

     let days: Array<string>
     let today: string

     if( this.language === 'en' ){
       days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
       today = 'Today'
     }
     else if( this.language === 'es' ){
       days = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado']
       today = 'Hoy'
     }
     else if( this.language === 'fr' ){
       days = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi']
       today = 'Aujourd\'hui'
     }
     else if( this.language === 'ar' ){
       days = ['السَّبْت', 'الجُمُعة', 'الخَميس', 'الأرْبِعاء', 'الثُّلاثاء', 'الاثْنين', 'الأحَد'].reverse()
       today = 'اليوم'
     }

     const localDate: Date = this.currentTimeZone
     const initialSetHours: number = localDate.getHours()
     const timeInterval: number = this.getTimeInterval(initialSetHours)
     const formatedDate: string = (localDate.getMonth() + 1) + '/' + localDate.getDate()
     const stateCode: number = this.getStateFilteredCode(hourForecast.icon)
     const temperature: number = Math.round(hourForecast.temperature)
     const windSpeed: number = Math.round(hourForecast.windSpeed)
     const windDirection: number = Math.round(hourForecast.windBearing)
     const precipitation: number = Math.round(hourForecast.precipProbability * 100)
     const summary: string = hourForecast.summary

     // Defining and creating the day forecast object.
     let firstDay = {
       'timeInterval': timeInterval,
       'state': { 'display' : 0, 'hourly' : [stateCode]},
       'summary': { 'display' : 'Uknown', 'hourly' : [summary]},
       'day' : key === 0 ? today : days[localDate.getDay()],
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
   calcDisplay(forecastDay: any){

     for (let property in forecastDay) {

       if(typeof forecastDay[property] == 'object'){

         if('display' in forecastDay[property]){

           // If the property is air then calculates min and max temperature.
           if(property === 'air'){

             forecastDay[property].display = [];

             const minTemp = Math.min(...forecastDay[property].hourly)
             const maxTemp = Math.max(...forecastDay[property].hourly)

             forecastDay[property].display.push(minTemp)
             forecastDay[property].display.push(maxTemp)

           }
           else if(property === 'summary'){

             let moreRepeatedSummary = this.getMoreRepeatedValue(forecastDay[property].hourly)

             if(moreRepeatedSummary != null)
               forecastDay[property].display = moreRepeatedSummary

           }
           else if(property === 'state'){

             let moreRepeatedState = this.getMoreRepeatedValue(forecastDay[property].hourly)

             if(moreRepeatedState != null)
               forecastDay[property].display = moreRepeatedState

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

   getMoreRepeatedValue(array: Array<any>){

     if(array.length === 0)
        return null

    let modeMap = {}
    let maxEl = array[0], maxCount = 1

    for(let i = 0; i < array.length; i++){

        let el = array[i]

        if(modeMap[el] == null)
            modeMap[el] = 1
        else
            modeMap[el]++

        if(modeMap[el] > maxCount)
        {
            maxEl = el
            maxCount = modeMap[el]
        }

    }

    return maxEl

   }

   /**
    * Prepares and maps an object for the manipulation in the view.
    */
   mapDays(data: Array<any>) {

     this.preMapDays(data)

     this.cityForecast.forEach( (day, key) => {

       day.stateName = this.getStateClassname(day.state.display)
       day.stateSummary = day.summary.display
       day.timeIntervalName = this.getTimeIntervalClass(day.timeInterval)
       day.periodTime = ''
       day.periodName = ''
       day.airTemp = day.air.display
       day.windSpeedNum = day.windspeed.display
       day.windDirectionDeg = 0
       day.rainProb = day.rain.display
       day.periodHidden = 'slice__data--hidden'
       day.units = {
         temperature : '°C',
         speed : 'km/h',
         length : 'm',
         time : 's',
         percentage : '%'
       }

     } )

     return this.cityForecast

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

   /**
    * Returns the correspondant class name for the layout depending on the interval.
    */
   getTimeIntervalClass(timeInterval: number){

     let timeIntervalClass: string

     switch(timeInterval) {

       case 24 : timeIntervalClass = 'slice__hover__sub--00'; break;
       case 23 : timeIntervalClass = 'slice__hover__sub--01'; break;
       case 22 : timeIntervalClass = 'slice__hover__sub--02'; break;
       case 21 : timeIntervalClass = 'slice__hover__sub--03'; break;
       case 20 : timeIntervalClass = 'slice__hover__sub--04'; break;
       case 19 : timeIntervalClass = 'slice__hover__sub--05'; break;
       case 18 : timeIntervalClass = 'slice__hover__sub--06'; break;
       case 17 : timeIntervalClass = 'slice__hover__sub--07'; break;
       case 16 : timeIntervalClass = 'slice__hover__sub--08'; break;
       case 15 : timeIntervalClass = 'slice__hover__sub--09'; break;
       case 14 : timeIntervalClass = 'slice__hover__sub--10'; break;
       case 13 : timeIntervalClass = 'slice__hover__sub--11'; break;
       case 12 : timeIntervalClass = 'slice__hover__sub--12'; break;
       case 11 : timeIntervalClass = 'slice__hover__sub--13'; break;
       case 10 : timeIntervalClass = 'slice__hover__sub--14'; break;
       case 9 : timeIntervalClass = 'slice__hover__sub--15'; break;
       case 8 : timeIntervalClass = 'slice__hover__sub--16'; break;
       case 7 : timeIntervalClass = 'slice__hover__sub--17'; break;
       case 6 : timeIntervalClass = 'slice__hover__sub--18'; break;
       case 5 : timeIntervalClass = 'slice__hover__sub--19'; break;
       case 4 : timeIntervalClass = 'slice__hover__sub--20'; break;
       case 3 : timeIntervalClass = 'slice__hover__sub--21'; break;
       case 2 : timeIntervalClass = 'slice__hover__sub--22'; break;
       case 1 : timeIntervalClass = 'slice__hover__sub--23'; break;

     }

     return timeIntervalClass

   }

   /**
    * Computes the time interval to show when hover a day forecast slice.
    */
   getTimePeriod(period: number, indivTimeInterval: number) {

     const possibilites = this.getIntervalsPossibilities(this.timeIntervals)
     const interval = 24/this.timeIntervals
     const newPeriod = possibilites[indivTimeInterval - 1][period]

     if( ((newPeriod + 1) * interval) === 24 )
      return newPeriod * interval + ':00 - ' + '00:00'
     else
      return newPeriod * interval + ':00 - ' + (newPeriod + 1) * interval + ':00'

   }

   /**
    * Depending on the time of the day and interval returns all possible divisions in the slice.
    */
   getIntervalsPossibilities(interval: number){

     let possibilites: Array<any> = [];
     // EXAMPLE:
     // var possibilites = [
     //   [7],
     //   [6,7],
     //   [5,6,7],
     //   [4,5,6,7],
     //   [3,4,5,6,7],
     //   [2,3,4,5,6,7,],
     //   [1,2,3,4,5,6,7],
     //   [0,1,2,3,4,5,6,7]
     // ];

     for(let i = 0;i <= interval - 1;++i){

       possibilites.unshift( [] );

       for(let i2 = i;i2 <= interval - 1;i2++){

         possibilites[0].push(i2);

       }

     }

     return possibilites

   }

   /**
    * Returns the correspondant class name for a given period.
    */
   getPeriodClassname(timeperiod: number) {

     return 'slice--period-' + (timeperiod + 1)

   };


}
