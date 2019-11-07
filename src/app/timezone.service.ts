import { Injectable } from '@angular/core'
import { HttpClient, HttpParams  } from '@angular/common/http'

@Injectable({
  providedIn: 'root'
})
export class TimezoneService {

  constructor(
  private http: HttpClient
  ){}

  getCityTimeZone(lat: number, lon: number){

    const BASEURL = 'http://api.geonames.org/timezoneJSON'
    const PROXYCORS = 'https://cors-anywhere.herokuapp.com'
    const USERNAME = 'olimitch7'
    let params = new HttpParams()
    params = params.set('lat', lat).set('lng', lon).set('username', USERNAME)

    return this.http.get( PROXYCORS + '/' + BASEURL, { params } )

  }

}
