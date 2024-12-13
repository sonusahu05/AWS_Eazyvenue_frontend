import { TestBed } from '@angular/core/testing';

import { AgentHelperService } from './agent-helper.service';

describe('AgentHelperService', () => {
  let service: AgentHelperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AgentHelperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
