import { describe, it, expect } from 'vitest';
import {
  validateSessionId,
  sanitizeString,
  validateCity,
  normalizeCity,
} from '../../server/security';

describe('validateSessionId', () => {
  it('accepts valid UUID format', () => {
    expect(validateSessionId('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    expect(validateSessionId('6ba7b810-9dad-11d1-80b4-00c04fd430c8')).toBe(true);
  });

  it('accepts legacy alphanumeric session IDs', () => {
    expect(validateSessionId('user123')).toBe(true);
    expect(validateSessionId('session_abc-123')).toBe(true);
    expect(validateSessionId('a')).toBe(true);
  });

  it('rejects invalid session IDs', () => {
    expect(validateSessionId('')).toBe(false);
    expect(validateSessionId('invalid uuid format')).toBe(false);
    expect(validateSessionId('<script>alert(1)</script>')).toBe(false);
    expect(validateSessionId('a'.repeat(101))).toBe(false);
  });

  it('rejects session IDs with special characters', () => {
    expect(validateSessionId('session;drop table')).toBe(false);
    expect(validateSessionId('session<script>')).toBe(false);
  });
});

describe('sanitizeString', () => {
  it('removes HTML tags', () => {
    expect(sanitizeString('<script>alert(1)</script>')).toBe('alert(1)');
    expect(sanitizeString('<div>Hello</div>')).toBe('Hello');
    expect(sanitizeString('<img src="x" onerror="alert(1)">')).toBe('');
  });

  it('removes event handlers', () => {
    expect(sanitizeString('onclick=alert(1)')).toBe('alert(1)');
    expect(sanitizeString('onload=malicious()')).toBe('malicious()');
    expect(sanitizeString('ONMOUSEOVER=bad()')).toBe('bad()');
  });

  it('removes javascript: URIs', () => {
    expect(sanitizeString('javascript:alert(1)')).toBe('alert(1)');
    expect(sanitizeString('JAVASCRIPT:void(0)')).toBe('void(0)');
  });

  it('removes data: URIs', () => {
    expect(sanitizeString('data:text/html,<script>alert(1)</script>')).toBe('text/html,alert(1)');
  });

  it('truncates to max length', () => {
    const longString = 'a'.repeat(3000);
    expect(sanitizeString(longString).length).toBe(2000);
    expect(sanitizeString(longString, 100).length).toBe(100);
  });

  it('trims whitespace', () => {
    expect(sanitizeString('  hello world  ')).toBe('hello world');
  });

  it('returns empty string for non-string input', () => {
    expect(sanitizeString(null as any)).toBe('');
    expect(sanitizeString(undefined as any)).toBe('');
    expect(sanitizeString(123 as any)).toBe('');
  });

  it('preserves normal text', () => {
    expect(sanitizeString('Hello, how are you?')).toBe('Hello, how are you?');
    expect(sanitizeString('Tokyo trip in 2025!')).toBe('Tokyo trip in 2025!');
  });
});

describe('validateCity', () => {
  it('accepts valid cities', () => {
    expect(validateCity('Tokyo')).toBe(true);
    expect(validateCity('Osaka')).toBe(true);
    expect(validateCity('Kyoto')).toBe(true);
    expect(validateCity('Hokkaido')).toBe(true);
    expect(validateCity('Fukuoka')).toBe(true);
    expect(validateCity('Okinawa')).toBe(true);
    expect(validateCity('Nagoya')).toBe(true);
    expect(validateCity('Hiroshima')).toBe(true);
    expect(validateCity('Nara')).toBe(true);
    expect(validateCity('Yokohama')).toBe(true);
  });

  it('accepts lowercase city names', () => {
    expect(validateCity('tokyo')).toBe(true);
    expect(validateCity('osaka')).toBe(true);
    expect(validateCity('KYOTO')).toBe(true);
  });

  it('rejects invalid cities', () => {
    expect(validateCity('InvalidCity')).toBe(false);
    expect(validateCity('Paris')).toBe(false);
    expect(validateCity('')).toBe(false);
  });
});

describe('normalizeCity', () => {
  it('normalizes lowercase to proper case', () => {
    expect(normalizeCity('tokyo')).toBe('Tokyo');
    expect(normalizeCity('osaka')).toBe('Osaka');
    expect(normalizeCity('kyoto')).toBe('Kyoto');
  });

  it('normalizes uppercase to proper case', () => {
    expect(normalizeCity('TOKYO')).toBe('Tokyo');
    expect(normalizeCity('OSAKA')).toBe('Osaka');
  });

  it('preserves already proper case', () => {
    expect(normalizeCity('Tokyo')).toBe('Tokyo');
    expect(normalizeCity('Osaka')).toBe('Osaka');
  });

  it('returns original for unknown cities', () => {
    expect(normalizeCity('Paris')).toBe('Paris');
    expect(normalizeCity('unknown')).toBe('unknown');
  });
});
