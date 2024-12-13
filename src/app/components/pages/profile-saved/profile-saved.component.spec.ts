import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileSavedComponent } from './profile-saved.component';

describe('ProfileSavedComponent', () => {
  let component: ProfileSavedComponent;
  let fixture: ComponentFixture<ProfileSavedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProfileSavedComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileSavedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
