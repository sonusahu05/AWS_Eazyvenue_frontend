import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleAgentComponent } from './single-agent.component';

describe('SingleAgentComponent', () => {
  let component: SingleAgentComponent;
  let fixture: ComponentFixture<SingleAgentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SingleAgentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SingleAgentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
