import { describe, it, expect } from 'vitest';

describe('Basic Test Suite', () => {
  it('should pass - I exist', () => {
    expect(true).toBe(true);
  });

  it('should perform basic arithmetic', () => {
    expect(1 + 1).toBe(2);
  });
});
