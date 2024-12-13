import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
const USER_API = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class BooksService {
  constructor(private http: HttpClient) { }

  getBooksList(query): Observable<any> {
    return this.http.get(USER_API+"book"+query);
  }

  getBooksLists(): Observable<any> {
    return this.http.get(USER_API+"book");
  }

  getBookDetails(id): Observable<any> {
    return this.http.get(USER_API+"book/"+id);
  }

  updateBook(id, bookData): Observable<any> {
    return this.http.put(USER_API + 'book/'+id, bookData );
  }

  addBook(bookData): Observable<any> {

    return this.http.post(USER_API + 'book', bookData );
  }

  getBook(id): Observable<any> {
    return this.http.get(USER_API+"book/"+id);
  }

}
