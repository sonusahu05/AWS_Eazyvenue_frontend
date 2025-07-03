import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubcategoryAddComponent } from './add.component';

describe('SubcategoryAddComponent', () => {
  let component: SubcategoryAddComponent;
  let fixture: ComponentFixture<SubcategoryAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubcategoryAddComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubcategoryAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
