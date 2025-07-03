import { Component, ElementRef, AfterViewInit, Input, NgModule, ViewChild, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';

@Component({
    selector: 'app-code',
    template: `
        <pre [ngClass]="'language-' + lang"><code #code><ng-content></ng-content>
</code></pre>
    `,
    styleUrls: ['./app.code.component.scss']
})
export class AppCodeComponent implements AfterViewInit {

    @Input() lang = 'markup';

    @ViewChild('code') codeViewChild: ElementRef;

    constructor(public el: ElementRef, @Inject(PLATFORM_ID) private platformId: Object) { }

    ngAfterViewInit() {
        // SSR-compatible syntax highlighting
        if (isPlatformBrowser(this.platformId) && window['Prism']) {
            window['Prism'].highlightElement(this.codeViewChild.nativeElement);
        }
        
        // Note: Prism.js highlighting is browser-only, protected with platform check for SSR compatibility
    }
}

@NgModule({
    imports: [CommonModule],
    exports: [AppCodeComponent],
    declarations: [AppCodeComponent]
})
export class AppCodeModule { }
