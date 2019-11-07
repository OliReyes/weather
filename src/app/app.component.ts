import { Component, OnInit } from '@angular/core'
import { WeatherService } from './weather.service'
import { CitiesService } from './cities.service'
import { TimezoneService } from './timezone.service'
import { FormControl } from '@angular/forms'
import { Observable } from 'rxjs'
import { map, startWith } from 'rxjs/operators'

export interface Language {
  name: string;
  code: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  cityWeather: Array<any> = []
  timeIntervals: number = 24

  languages: Array<Language> = [
    {name: 'Spanish', code: 'es'},
    {name: 'French', code: 'fr'},
    {name: 'Arabic', code: 'ar'},
    {name: 'English', code: 'en'}
  ]

  myControl = new FormControl()
  options: Array<object>
  filteredOptions: Array<object>

  optionSelectedLat: number = 40.4165
  optionSelectedLng: number = -3.70256

  constructor(
    private weatherService: WeatherService,
    private citiesService: CitiesService,
    private timezoneService: TimezoneService
  ){}

  ngOnInit(){

    this.loadCityWeather(this.optionSelectedLat, this.optionSelectedLng)

    // this.filteredOptions = this.myControl.valueChanges
    //   .pipe(
    //     startWith(''),
    //     map( value => this._filter(value) )
    //   )

    this.myControl.valueChanges.subscribe( value => {

      if( typeof value === 'string' ){

        const filterValue = value.toLowerCase()

        this.citiesService.getCitiesStats(filterValue).subscribe( cities => {

          let citiesTyped: any = cities

          this.options = citiesTyped.geonames

          this.filteredOptions = this.options.filter(option => {

            let optionTyped: any = option

            return optionTyped.name.toLowerCase().startsWith(filterValue)

          } )

        } )

      }

    } )

  }

  // private _filter(value: string): string[] {
  //
  //   const filterValue = value.toLowerCase()
  //
  //   this.citiesService.getCitiesStats(filterValue).subscribe( cities => {
  //
  //     this.options = cities.geonames
  //
  //   } )
  //
  //   return this.options.filter(option => option.name.toLowerCase().includes(filterValue))
  //
  // }

  changeCity(event){

    this.optionSelectedLat = event.option.value.lat
    this.optionSelectedLng = event.option.value.lng

    this.loadCityWeather(this.optionSelectedLat, this.optionSelectedLng)

  }

  displayCity(option: any){

    if( option !== null ){
      return option.name
    }

  }

  loadCityWeather(lat :number, lon: number, language: string = 'en'){

    this.weatherService.getCityWeather(lat, lon, language).subscribe( forecastRawData => {

      let newForecastRawData: any = forecastRawData

      console.log(newForecastRawData)

      this.timezoneService.getCityTimeZone(lat, lon).subscribe( timeZoneItem => {

        let currentTimeZone = new Date(timeZoneItem.time)

        this.weatherService.setCurrentTimeZone(currentTimeZone)

        this.cityWeather = this.weatherService.mapDays(newForecastRawData.hourly.data)

      } )

    } )

  }

  /**
   * Returns a array that allows to create many hover divs as intervals.
   */
  getNumberOfIntervals(timeIntervals: number) {

    let intervals: Array<any> = []

    for(let i = 0; i <= timeIntervals - 1; ++i ){
      intervals.push(i);
    }

    return intervals

  }


  /**
   * Changes the values of the forecast information for a particular slice (day).
   */
  updateSlice(event, forecastDay, index) {

    forecastDay.stateName = this.weatherService.getStateClassname(forecastDay.state.hourly[index])
    forecastDay.periodTime = this.weatherService.getTimePeriod(index, forecastDay.timeInterval)
    forecastDay.periodHidden = ''
    forecastDay.periodName = this.weatherService.getPeriodClassname(index)
    forecastDay.airTemp = forecastDay.air.hourly[index]
    forecastDay.windSpeedNum = forecastDay.windspeed.hourly[index]
    forecastDay.windDirectionDeg = forecastDay.winddirection.hourly[index]
    forecastDay.rainProb = forecastDay.rain.hourly[index]

  }

  /**
   * Set back the default and average values of the forecast information for a particular slice (day).
   */
  sliceBackToDisplay(event, forecastDay) {

    forecastDay.stateName = this.weatherService.getStateClassname(forecastDay.state.display)
    forecastDay.periodTime = ''
    forecastDay.periodName = ''
    forecastDay.periodHidden = 'slice__data--hidden'
    forecastDay.airTemp = forecastDay.air.display
    forecastDay.windSpeedNum = forecastDay.windspeed.display
    forecastDay.windDirectionDeg = forecastDay.winddirection.display
    forecastDay.rainProb = forecastDay.rain.display

  }

  changeLanguage($event){

    const languageCodeSelected = $event.value

    this.loadCityWeather(this.optionSelectedLat, this.optionSelectedLng, languageCodeSelected)

  }

}
