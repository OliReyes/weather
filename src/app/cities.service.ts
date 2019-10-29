import { Injectable } from '@angular/core'
import { HttpClient, HttpParams  } from '@angular/common/http'

@Injectable({
  providedIn: 'root'
})
export class CitiesService {

  constructor(
  private http: HttpClient
  ){}

  getCitiesStats(query: string){

    const PROXYCORS = 'https://cors-platinum.herokuapp.com'
    const BASEURL = 'http://api.geonames.org/searchJSON'
    const USERNAME = 'olimitch7'
    let params = new HttpParams()
    params = params.set('q', query).set('maxRows', '5').set('username', USERNAME)

    return this.http.get( PROXYCORS + '/' + BASEURL, { params } )

  }

}
