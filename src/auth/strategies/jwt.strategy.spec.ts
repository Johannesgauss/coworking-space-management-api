import { JwtStrategy } from './jwt.strategy';

jest.mock('passport-jwt', () => {
  return {
    Strategy: class MockStrategy {
      constructor() {}
    },
    ExtractJwt: {
      fromAuthHeaderAsBearerToken: jest.fn().mockReturnValue(() => 'mock-token'),
    },
  };
});

jest.mock('@nestjs/passport', () => {
  return {
    PassportStrategy: (strategyClass: any) => strategyClass,
  };
});

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(() => {
    strategy = new JwtStrategy();
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should validate and return payload sub and role', async () => {
      const payload = { sub: 'user-123', role: 'ADMIN' };
      const result = await strategy.validate(payload);

      expect(result).toEqual({ id: 'user-123', role: 'ADMIN' });
    });
  });
});
