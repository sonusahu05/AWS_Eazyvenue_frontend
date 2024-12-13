import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeV3Component } from './home-v3.component';

describe('HomeV3Component', () => {
  let component: HomeV3Component;
  let fixture: ComponentFixture<HomeV3Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HomeV3Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeV3Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
