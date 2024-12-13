import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListingDetailsV1Component } from './listing-details-v1.component';

describe('ListingDetailsV1Component', () => {
  let component: ListingDetailsV1Component;
  let fixture: ComponentFixture<ListingDetailsV1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListingDetailsV1Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListingDetailsV1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
