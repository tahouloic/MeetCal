import { TestBed } from '@angular/core/testing';

import { Mess } from './mess';

describe('Mess', () => {
  let service: Mess;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Mess);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
