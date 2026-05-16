import { TestBed } from '@angular/core/testing';

import { Parametre } from './parametre';

describe('Parametre', () => {
  let service: Parametre;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Parametre);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
