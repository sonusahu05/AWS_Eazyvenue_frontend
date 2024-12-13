import { TestBed } from '@angular/core/testing';

import { ListingHelperService } from './listing-helper.service';

describe('ListingHelperService', () => {
  let service: ListingHelperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ListingHelperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
