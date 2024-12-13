import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecentBlockComponent } from './recent-block.component';

describe('RecentBlockComponent', () => {
  let component: RecentBlockComponent;
  let fixture: ComponentFixture<RecentBlockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RecentBlockComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RecentBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
