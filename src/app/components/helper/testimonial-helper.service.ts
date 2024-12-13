import { Injectable } from '@angular/core';;
import agents from '../data/agents/agents.json';
import data from '../data/testimonials.json';

@Injectable({
  providedIn: 'root'
})
export class TestimonialHelperService {
  public testimonials = data;
  constructor() { }
  public getAuthor(items: string | any[]) {
    var elems = agents.filter((item: { id: string; }) => {
      return items.includes(item.id)
    });
    return elems;
  }
}
