import {Component, OnInit} from '@angular/core';
import {AppComponent} from './app.component';
import {AppMainComponent} from './app.main.component';

@Component({
    selector: 'app-config',
    template: `
        <div class="layout-config" [ngClass]="{'layout-config-active': appMain.configActive}" (click)="appMain.onConfigClick($event)">
            <h5>Menu Type</h5>
            <div class="p-field-radiobutton">
                <p-radioButton name="menuMode" value="horizontal" [(ngModel)]="app.menuMode" inputId="mode1"
                               (onClick)="app.menuTheme = app.topbarTheme; appMain.sidebarStatic = false; appMain.sidebarActive = false"></p-radioButton>
                <label for="mode1">Horizontal</label>
            </div>
            <div class="p-field-radiobutton">
                <p-radioButton name="menuMode" value="sidebar" [(ngModel)]="app.menuMode" inputId="mode2"></p-radioButton>
                <label for="mode2">Sidebar</label>
            </div>
            <div class="p-field-radiobutton">
                <p-radioButton name="menuMode" value="slim" [(ngModel)]="app.menuMode" inputId="mode3" (onClick)="appMain.sidebarStatic = false; appMain.sidebarActive = false"></p-radioButton>
                <label for="mode3">Slim</label>
            </div>

            <hr />

            <h5>Color Scheme</h5>
            <div class="p-field-radiobutton">
                <p-radioButton name="darkMode" value="light" [(ngModel)]="app.darkMode" inputId="darkMode1"
                                (onClick)="changeColorScheme('light')"></p-radioButton>
                <label for="darkMode1">Light</label>
            </div>
            <div class="p-field-radiobutton">
                <p-radioButton name="darkMode" value="dark" [(ngModel)]="app.darkMode" inputId="darkMode2"
                                (onClick)="changeColorScheme('dark')"></p-radioButton>
                <label for="darkMode2">Dark</label>
            </div>

            <hr />

            <div *ngIf="app.menuMode === 'horizontal'">
                <h5>Topbar and Menu Mode </h5>
                <div class="p-field-radiobutton">
                    <p-radioButton name="topbarTheme" value="light" [disabled]="app.darkMode ==='dark'" [(ngModel)]="app.topbarTheme" inputId="topbarTheme1" (onClick)="onChangeTopbar($event,'light')"></p-radioButton>
                    <label for="topbarTheme1">Light</label>
                </div>
                <div class="p-field-radiobutton">
                    <p-radioButton name="topbarTheme" value="dark" [disabled]="app.darkMode ==='dark'" [(ngModel)]="app.topbarTheme" inputId="topbarTheme2" (onClick)="onChangeTopbar($event,'dark')"></p-radioButton>
                    <label for="topbarTheme2">Dark</label>
                </div>

                <hr />
            </div>

            <div *ngIf="app.menuMode !== 'horizontal'">
                <h5>Topbar Mode </h5>
                <div class="p-field-radiobutton">
                    <p-radioButton name="topbarTheme" value="light" [disabled]="app.darkMode ==='dark'" [(ngModel)]="app.topbarTheme" inputId="topbarTheme1"></p-radioButton>
                    <label for="topbarTheme1">Light</label>
                </div>
                <div class="p-field-radiobutton">
                    <p-radioButton name="topbarTheme" value="dark" [disabled]="app.darkMode ==='dark'" [(ngModel)]="app.topbarTheme" inputId="topbarTheme2"></p-radioButton>
                    <label for="topbarTheme2">Dark</label>
                </div>

                <hr />
            </div>

            <div *ngIf="app.menuMode !== 'horizontal'">
                <h5>Menu Mode </h5>
                <div class="p-field-radiobutton">
                    <p-radioButton name="menuTheme" value="light" [disabled]="app.darkMode ==='dark'" [(ngModel)]="app.menuTheme" inputId="menuTheme1"></p-radioButton>
                    <label for="menuTheme1">Light</label>
                </div>
                <div class="p-field-radiobutton">
                    <p-radioButton name="menuTheme" value="dark" [disabled]="app.darkMode ==='dark'" [(ngModel)]="app.menuTheme" inputId="menuTheme2"></p-radioButton>
                    <label for="menuTheme1">Dark</label>
                </div>

                <hr />
            </div>

            <h5>Ripple Effect</h5>
            <p-inputSwitch [ngModel]="app.ripple" (onChange)="appMain.onRippleChange($event)"></p-inputSwitch>

            <hr />

            <h5>Input Background</h5>
            <div class="p-field-radiobutton">
                <p-radioButton name="inputStyle" value="outlined" [(ngModel)]="app.inputStyle" inputId="inputStyle1"></p-radioButton>
                <label for="inputStyle1">Outlined</label>
            </div>
            <div class="p-field-radiobutton">
                <p-radioButton name="inputStyle" value="filled" [(ngModel)]="app.inputStyle" inputId="inputStyle2"></p-radioButton>
                <label for="inputStyle2">Filled</label>
            </div>

            <hr />

            <h5>Theme Colors</h5>
            <div class="layout-themes">
                <div *ngFor="let t of themes">
                    <a style="cursor: pointer" (click)="changeTheme(t.name)" [ngStyle]="{'background-color': t.color}">
                    </a>
                </div>
            </div>
        </div>
    `
})
export class AppConfigComponent implements OnInit {

    themes: any[];

    theme = 'purple';

    constructor(public app: AppComponent, public appMain: AppMainComponent) {
    }

    ngOnInit() {
        this.themes = [
            {name: 'blue', color: '#2c84d8'},
            {name: 'green', color: '#34B56F'},
            {name: 'orange', color: '#FF810E'},
            {name: 'turquoise', color: '#58AED3'},
            {name: 'avocado', color: '#AEC523'},
            {name: 'purple', color: '#464DF2'},
            {name: 'red', color: '#FF9B7B'},
            {name: 'yellow', color: '#FFB340'},
        ];
    }

    onChangeTopbar(event, mode) {
        this.app.menuTheme = mode;
    }

    changeColorScheme(scheme) {
        this.changeStyleSheetsColor('layout-css', 'layout-' + scheme + '.css', 1);
        this.changeStyleSheetsColor('theme-css', 'theme-' + scheme + '.css', 1);

        this.app.darkMode = scheme;
        this.app.topbarTheme = scheme;
        this.app.menuTheme = scheme;
    }

    changeTheme(theme) {
        this.theme = theme;
        this.changeStyleSheetsColor('theme-css', theme, 2);
    }

    changeStyleSheetsColor(id, value, from) {
        const element = document.getElementById(id);
        const urlTokens = element.getAttribute('href').split('/');

        if (from === 1) {           // which function invoked this function - change scheme
            urlTokens[urlTokens.length - 1] = value;
        } else if (from === 2) {       // which function invoked this function - change color
            urlTokens[urlTokens.length - 2] = value;
        }

        const newURL = urlTokens.join('/');

        this.replaceLink(element, newURL);
    }

    replaceLink(linkElement, href) {
        if (this.isIE()) {
            linkElement.setAttribute('href', href);
        } else {
            const id = linkElement.getAttribute('id');
            const cloneLinkElement = linkElement.cloneNode(true);

            cloneLinkElement.setAttribute('href', href);
            cloneLinkElement.setAttribute('id', id + '-clone');

            linkElement.parentNode.insertBefore(cloneLinkElement, linkElement.nextSibling);

            cloneLinkElement.addEventListener('load', () => {
                linkElement.remove();
                cloneLinkElement.setAttribute('id', id);
            });
        }
    }

    isIE() {
        return /(MSIE|Trident\/|Edge\/)/i.test(window.navigator.userAgent);
    }

    onConfigButtonClick(event) {
        this.appMain.configActive = !this.appMain.configActive;
        this.appMain.configClick = true;
        event.preventDefault();
    }
}
