import { TestBed } from '@angular/core/testing';
import { NewsLetterService } from './newsletter.service';

describe('NewsLetterService', () => {
  let service: NewsLetterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NewsLetterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
