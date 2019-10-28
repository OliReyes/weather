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

    const BASEURL = 'http://api.geonames.org/searchJSON'
    const PROXYCORS = 'https://cors-anywhere.herokuapp.com'
    const USERNAME = 'olimitch7'
    let params = new HttpParams()
    params = params.set('q', query).set('maxRows', '5').set('username', USERNAME)

    return this.http.get( PROXYCORS + '/' + BASEURL, { params } )

  }

}
