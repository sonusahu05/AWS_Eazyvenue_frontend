import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmitListingsComponent } from './submit-listings.component';

describe('SubmitListingsComponent', () => {
  let component: SubmitListingsComponent;
  let fixture: ComponentFixture<SubmitListingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubmitListingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubmitListingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
