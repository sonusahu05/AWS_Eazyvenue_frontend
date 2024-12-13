import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BannerEditComponent } from './edit.component';

describe('BannerEditComponent', () => {
  let component: BannerEditComponent;
  let fixture: ComponentFixture<BannerEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BannerEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BannerEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
