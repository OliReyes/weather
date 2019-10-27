import { Component, OnInit } from '@angular/core';
import { WeatherService } from './weather.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  cityWeather: array = []
  timeIntervals: number = 24

  constructor(
    private weatherService: WeatherService
  ){}

  ngOnInit(){
    this.loadCityWeather(40.4165, -3.70256)
  }

  loadCityWeather(lat :number, lon: number){

    this.weatherService.getCityWeather(lat, lon).subscribe( ( { hourly: { data } } ) => {

      this.cityWeather = this.weatherService.mapDays(data)

      console.log(this.cityWeather)

    } )

  }

  /**
   * Returns a array that allows to create many hover divs as intervals.
   */
  getNumberOfIntervals(timeIntervals: number) {

    let intervals: array = []

    for(let i = 0; i <= timeIntervals - 1; ++i ){
      intervals.push(i);
    }

    return intervals

  }


  /**
   * Changes the values of the forecast information for a particular slice (day).
   */
  updateSlice(index, forecastDay) {

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
  sliceBackToDisplay(ev, forecastDay) {

    forecastDay.stateName = this.weatherService.getStateClassname(forecastDay.state.display)
    forecastDay.periodTime = ''
    forecastDay.periodName = ''
    forecastDay.periodHidden = 'slice__data--hidden'
    forecastDay.airTemp = forecastDay.air.display
    forecastDay.windSpeedNum = forecastDay.windspeed.display
    forecastDay.windDirectionDeg = forecastDay.winddirection.display
    forecastDay.rainProb = forecastDay.rain.display

  }

}
