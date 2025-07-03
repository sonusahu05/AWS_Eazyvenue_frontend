import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubcategoryEditComponent } from './edit.component';

describe('SubcategoryEditComponent', () => {
  let component: SubcategoryEditComponent;
  let fixture: ComponentFixture<SubcategoryEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubcategoryEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubcategoryEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
