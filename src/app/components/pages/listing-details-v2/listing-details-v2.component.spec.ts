import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListingDetailsV2Component } from './listing-details-v2.component';

describe('ListingDetailsV2Component', () => {
  let component: ListingDetailsV2Component;
  let fixture: ComponentFixture<ListingDetailsV2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListingDetailsV2Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListingDetailsV2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
