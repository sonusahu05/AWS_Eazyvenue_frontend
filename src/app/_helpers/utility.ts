import { environment } from "../../environments/environment";
import * as moment from 'moment';
import { HttpClient, HttpHeaders, HttpRequest, HttpXhrBackend } from '@angular/common/http';

export function maxYearFunction() {
  const ageDiff = environment.ageDiff;
  const now = new Date();
  const maxYear = now.getFullYear();
  return moment({ year: maxYear - ageDiff }).format('YYYY-MM-DD');
}

export function uploadFile(data: any) {
  const httpClient = new HttpClient(new HttpXhrBackend({ build: () => new XMLHttpRequest() }));
  console.log(data);
  const uploadUrl = environment.apiUrl + "utility/upload";
  const formData = new FormData();
  formData.append('image', data);
  return httpClient.post<any>(uploadUrl, formData);
}

export default class Utility {


  readonly uploadUrl = environment.apiUrl + "utility/upload";

  static uploadFile(data: any) {
    const httpClient = new HttpClient(new HttpXhrBackend({ build: () => new XMLHttpRequest() }));
    const uploadUrl = environment.apiUrl + "utility/upload";
    const formData = new FormData();
    formData.append('image', data);
    return httpClient.post<any>(uploadUrl, formData);
  }


}