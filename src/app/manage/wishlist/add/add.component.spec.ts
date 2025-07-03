import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WishlistAddComponent } from './add.component';

describe('WishlistAddComponent', () => {
  let component: WishlistAddComponent;
  let fixture: ComponentFixture<WishlistAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WishlistAddComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WishlistAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
