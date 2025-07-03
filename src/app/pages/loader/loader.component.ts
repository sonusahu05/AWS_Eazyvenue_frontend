// my-loader.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { LoaderService } from '../../services/loader.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss']
})
export class LoaderComponent implements OnInit, OnDestroy {

  loading: boolean;
  private loadingSubscription: Subscription;

  constructor(private loaderService: LoaderService) {
    // Initialize subscription in constructor for immediate loading state
    this.loadingSubscription = this.loaderService.isLoading.subscribe((v) => {
      this.loading = v;
    });
  }

  ngOnInit() {
    // Component initialization logic can go here if needed
  }

  ngOnDestroy() {
    // Clean up subscription to prevent memory leaks
    if (this.loadingSubscription) {
      this.loadingSubscription.unsubscribe();
    }
  }

}
