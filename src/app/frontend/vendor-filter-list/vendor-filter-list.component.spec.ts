import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorFilterListComponent } from './vendor-filter-list.component';

describe('VendorFilterListComponent', () => {
  let component: VendorFilterListComponent;
  let fixture: ComponentFixture<VendorFilterListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VendorFilterListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VendorFilterListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
