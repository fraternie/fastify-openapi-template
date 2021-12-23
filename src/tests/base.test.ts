import { BaseService } from '../services/base.service';

describe('test base service', () => {
  it('should test base service', () => {
    BaseService.base({
      env: { count: 2 },
    });
  });
});
