import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListingDetailsV3Component } from './listing-details-v3.component';

describe('ListingDetailsV3Component', () => {
  let component: ListingDetailsV3Component;
  let fixture: ComponentFixture<ListingDetailsV3Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListingDetailsV3Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListingDetailsV3Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
