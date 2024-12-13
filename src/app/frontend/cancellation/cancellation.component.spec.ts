import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CancellationComponent } from './cancellation.component';

describe('CancellationComponent', () => {
  let component: CancellationComponent;
  let fixture: ComponentFixture<CancellationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CancellationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CancellationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
