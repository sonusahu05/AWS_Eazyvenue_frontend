import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewsLetterListComponent } from './list.component';

describe('NewsLetterListComponent', () => {
  let component: NewsLetterListComponent;
  let fixture: ComponentFixture<NewsLetterListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewsLetterListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewsLetterListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
