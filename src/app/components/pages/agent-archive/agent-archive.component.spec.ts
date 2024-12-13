import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentArchiveComponent } from './agent-archive.component';

describe('AgentArchiveComponent', () => {
  let component: AgentArchiveComponent;
  let fixture: ComponentFixture<AgentArchiveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AgentArchiveComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AgentArchiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
