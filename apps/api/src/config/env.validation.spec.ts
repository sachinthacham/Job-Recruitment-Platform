import { validateEnv } from './env.validation';

const validConfig = {
  NODE_ENV: 'development',
  APP_PORT: '3000',
  DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
  REDIS_HOST: 'localhost',
  REDIS_PORT: '6379',
  JWT_ACCESS_SECRET: 'a'.repeat(20),
  JWT_REFRESH_SECRET: 'b'.repeat(20),
};

describe('validateEnv', () => {
  it('returns the validated config when all required variables are present', () => {
    const result = validateEnv(validConfig);

    expect(result.APP_PORT).toBe(3000);
    expect(result.REDIS_PORT).toBe(6379);
  });

  it('throws when a required variable is missing', () => {
    const { DATABASE_URL, ...rest } = validConfig;
    void DATABASE_URL;

    expect(() => validateEnv(rest)).toThrow(
      /Invalid environment configuration/,
    );
  });

  it('throws when APP_PORT is out of range', () => {
    expect(() => validateEnv({ ...validConfig, APP_PORT: '99999' })).toThrow(
      /Invalid environment configuration/,
    );
  });

  it('throws when a JWT secret is too short', () => {
    expect(() =>
      validateEnv({ ...validConfig, JWT_ACCESS_SECRET: 'short' }),
    ).toThrow(/JWT_ACCESS_SECRET/);
  });

  it('throws when NODE_ENV is not a recognized value', () => {
    expect(() => validateEnv({ ...validConfig, NODE_ENV: 'staging' })).toThrow(
      /Invalid environment configuration/,
    );
  });
});
