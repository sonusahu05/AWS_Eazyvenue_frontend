import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListingMapComponent } from './listing-map.component';

describe('ListingMapComponent', () => {
  let component: ListingMapComponent;
  let fixture: ComponentFixture<ListingMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListingMapComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListingMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
