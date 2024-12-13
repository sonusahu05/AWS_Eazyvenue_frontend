import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserBreadcrumbsComponent } from './user-breadcrumbs.component';

describe('UserBreadcrumbsComponent', () => {
  let component: UserBreadcrumbsComponent;
  let fixture: ComponentFixture<UserBreadcrumbsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserBreadcrumbsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserBreadcrumbsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
