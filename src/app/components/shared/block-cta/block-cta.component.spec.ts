import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlockCtaComponent } from './block-cta.component';

describe('BlockCtaComponent', () => {
  let component: BlockCtaComponent;
  let fixture: ComponentFixture<BlockCtaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BlockCtaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BlockCtaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
