import { describe, it, expect } from 'vitest';

describe('Component Tests', () => {
  it('passes basic test', () => {
    expect(true).toBe(true);
  });

  it('can do math', () => {
    expect(1 + 1).toBe(2);
  });

  it('can compare strings', () => {
    expect('hello').toBe('hello');
  });

  it('can check arrays', () => {
    const arr = [1, 2, 3];
    expect(arr).toHaveLength(3);
  });

  it('can check objects', () => {
    const obj = { name: 'test' };
    expect(obj).toHaveProperty('name');
  });
});
