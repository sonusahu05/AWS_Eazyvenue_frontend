import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlogRightComponent } from './blog-right.component';

describe('BlogRightComponent', () => {
  let component: BlogRightComponent;
  let fixture: ComponentFixture<BlogRightComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BlogRightComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BlogRightComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
