import bcrypt from 'bcryptjs';

// Clean character set avoiding ambiguous characters (0, O, 1, I, L)
const CODE_CHARS = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';

export function generateTrackingCode(): string {
  const part1 = Array.from({ length: 4 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join('');
  const part2 = Array.from({ length: 3 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join('');
  return `HB-${part1}-${part2}`;
}

export function generateAccessPin(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function hashPin(pin: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(pin, salt);
}

export async function verifyPin(pin: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pin, hash);
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function formatDate(date: Date | string, locale: 'pt' | 'en' = 'pt'): string {
  const d = new Date(date);
  return d.toLocaleDateString(locale === 'pt' ? 'pt-MZ' : 'en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
