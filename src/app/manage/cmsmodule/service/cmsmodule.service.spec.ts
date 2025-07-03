import { TestBed } from '@angular/core/testing';

import { CmsmoduleService } from './cmsmodule.service';

describe('CmsmoduleService', () => {
  let service: CmsmoduleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CmsmoduleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
