import { calculateLevel, xpToNextLevel } from '@constel/config';

describe('Gamification Config', () => {
  it('should calculate level 1 for 0 XP', () => {
    expect(calculateLevel(0)).toBe(1);
  });

  it('should calculate level 2 for 100 XP', () => {
    expect(calculateLevel(100)).toBe(2);
  });

  it('should calculate XP to next level', () => {
    expect(xpToNextLevel(50)).toBe(50);
  });
});

describe('Auth', () => {
  it('should validate email format', () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    expect(emailRegex.test('student@demo.com')).toBe(true);
    expect(emailRegex.test('invalid')).toBe(false);
  });
});
