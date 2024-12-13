import {Component} from '@angular/core';
import {SelectItem} from 'primeng/api';
import {AppMainComponent} from './app.main.component';

@Component({
    selector: 'app-rightpanel',
    templateUrl: './app.rightpanel.component.html'
})
export class AppRightpanelComponent{

    amount: SelectItem[];

    selectedAmount: any;

    constructor(public appMain: AppMainComponent) {
        this.amount = [
            {label: '*****24', value: {id: 1, name: '*****24', code: 'A1'}},
            {label: '*****75', value: {id: 2, name: '*****75', code: 'A2'}}
        ];
    }
}
