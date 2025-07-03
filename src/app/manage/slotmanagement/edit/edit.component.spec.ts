import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditVenueSlotManagementComponent } from './edit.component';

describe('EditVenueSlotManagementComponent', () => {
  let component: EditVenueSlotManagementComponent;
  let fixture: ComponentFixture<EditVenueSlotManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditVenueSlotManagementComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditVenueSlotManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
