import { Component } from '@angular/core';
import {AppComponent} from '../app.component';

@Component({
  selector: 'app-notfound',
  templateUrl: './app.notfound.component.html',
})
export class AppNotfoundComponent {
    constructor(public app: AppComponent) {}
}
