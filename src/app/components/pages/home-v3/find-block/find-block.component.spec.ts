import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FindBlockComponent } from './find-block.component';

describe('FindBlockComponent', () => {
  let component: FindBlockComponent;
  let fixture: ComponentFixture<FindBlockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FindBlockComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FindBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
