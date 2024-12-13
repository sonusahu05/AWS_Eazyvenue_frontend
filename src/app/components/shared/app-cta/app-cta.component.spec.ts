import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppCtaComponent } from './app-cta.component';

describe('AppCtaComponent', () => {
  let component: AppCtaComponent;
  let fixture: ComponentFixture<AppCtaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppCtaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppCtaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
