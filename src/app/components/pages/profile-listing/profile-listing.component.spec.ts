import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileListingComponent } from './profile-listing.component';

describe('ProfileListingComponent', () => {
  let component: ProfileListingComponent;
  let fixture: ComponentFixture<ProfileListingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProfileListingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
