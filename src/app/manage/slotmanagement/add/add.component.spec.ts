import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddVenueSlotManagementComponent } from './add.component';

describe('AddVenueSlotManagementComponent', () => {
  let component: AddVenueSlotManagementComponent;
  let fixture: ComponentFixture<AddVenueSlotManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddVenueSlotManagementComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddVenueSlotManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
