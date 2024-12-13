import { ComponentFixture, TestBed } from '@angular/core/testing';

import { compareVenue } from './compare.component';

describe('ListingListComponent', () => {
  let component: compareVenue;
  let fixture: ComponentFixture<compareVenue>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ compareVenue ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(compareVenue);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
