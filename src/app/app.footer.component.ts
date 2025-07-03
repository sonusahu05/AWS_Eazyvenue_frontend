import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './app.footer.component.html'
})
export class AppFooterComponent {
  // SSR-safe: new Date() works in both browser and server environments
  currentYear: number = new Date().getFullYear();
}
