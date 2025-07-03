import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
    templateUrl: './app.invoice.component.html'
})
export class AppInvoiceComponent {

    constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

    print() {
        if (isPlatformBrowser(this.platformId)) {
            window.print();
        } else {
            // In SSR, we can't print directly. Alternative: Log or provide user guidance
            console.log('Print functionality not available during server-side rendering');
            // Alternative: You could emit an event or show a message to the user
            // to use their browser's print function (Ctrl+P / Cmd+P)
        }
    }
}
