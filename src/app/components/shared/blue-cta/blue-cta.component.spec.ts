import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlueCtaComponent } from './blue-cta.component';

describe('BlueCtaComponent', () => {
  let component: BlueCtaComponent;
  let fixture: ComponentFixture<BlueCtaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BlueCtaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BlueCtaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
