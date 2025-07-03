import { TestBed } from '@angular/core/testing';

import { OrderreviewService } from './orderreview.service';

describe('OrderreviewService', () => {
  let service: OrderreviewService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrderreviewService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
