import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorCompareComponent } from './vendor-compare.component';

describe('VendorCompareComponent', () => {
  let component: VendorCompareComponent;
  let fixture: ComponentFixture<VendorCompareComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VendorCompareComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VendorCompareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
