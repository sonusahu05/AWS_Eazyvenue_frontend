import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactUsListComponent } from './list.component';

describe('ContactUsListComponent', () => {
  let component: ContactUsListComponent;
  let fixture: ComponentFixture<ContactUsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContactUsListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactUsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
