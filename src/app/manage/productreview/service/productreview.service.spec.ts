import { TestBed } from '@angular/core/testing';

import { ProductreviewService } from './productreview.service';

describe('ProductreviewService', () => {
  let service: ProductreviewService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductreviewService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
