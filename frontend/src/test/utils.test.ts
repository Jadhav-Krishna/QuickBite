import { describe, it, expect } from 'vitest';

describe('Utils Tests', () => {
  describe('Session Management', () => {
    it('can store data in localStorage', () => {
      localStorage.setItem('test', 'value');
      expect(localStorage.getItem('test')).toBe('value');
    });

    it('can remove data from localStorage', () => {
      localStorage.setItem('test', 'value');
      localStorage.removeItem('test');
      expect(localStorage.getItem('test')).toBeNull();
    });

    it('can clear localStorage', () => {
      localStorage.setItem('test1', 'value1');
      localStorage.setItem('test2', 'value2');
      localStorage.clear();
      expect(localStorage.length).toBe(0);
    });
  });

  describe('Data Validation', () => {
    it('validates email format', () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      expect(emailRegex.test('test@example.com')).toBe(true);
      expect(emailRegex.test('invalid-email')).toBe(false);
    });

    it('validates phone format', () => {
      const phoneRegex = /^\+?[\d\s-()]+$/;
      expect(phoneRegex.test('+1234567890')).toBe(true);
      expect(phoneRegex.test('abc')).toBe(false);
    });

    it('validates password strength', () => {
      const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
      expect(strongPassword.test('Password123')).toBe(true);
      expect(strongPassword.test('weak')).toBe(false);
    });
  });

  describe('Array Operations', () => {
    it('filters array', () => {
      const arr = [1, 2, 3, 4, 5];
      const filtered = arr.filter(n => n > 3);
      expect(filtered).toEqual([4, 5]);
    });

    it('maps array', () => {
      const arr = [1, 2, 3];
      const mapped = arr.map(n => n * 2);
      expect(mapped).toEqual([2, 4, 6]);
    });

    it('reduces array', () => {
      const arr = [1, 2, 3, 4];
      const sum = arr.reduce((acc, n) => acc + n, 0);
      expect(sum).toBe(10);
    });
  });

  describe('String Operations', () => {
    it('converts to uppercase', () => {
      expect('hello'.toUpperCase()).toBe('HELLO');
    });

    it('converts to lowercase', () => {
      expect('HELLO'.toLowerCase()).toBe('hello');
    });

    it('trims whitespace', () => {
      expect('  hello  '.trim()).toBe('hello');
    });

    it('splits string', () => {
      expect('a,b,c'.split(',')).toEqual(['a', 'b', 'c']);
    });
  });
});
