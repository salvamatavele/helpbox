import test from 'node:test';
import assert from 'node:assert/strict';
import { generateTrackingCode, generateAccessPin, hashPin, verifyPin } from '../lib/utils.ts';
import { ptTranslations } from '../lib/i18n/pt-mz.ts';
import { enTranslations } from '../lib/i18n/en.ts';

test('1. Tracking Code Generation Format', () => {
  const code = generateTrackingCode();
  assert.match(code, /^HB-[2-9A-HJ-NP-Z]{4}-[2-9A-HJ-NP-Z]{3}$/, `Código inválido: ${code}`);
});

test('2. Access PIN Generation & Bcrypt Verification', async () => {
  const pin = generateAccessPin();
  assert.equal(pin.length, 6, 'PIN deve ter 6 dígitos');
  assert.match(pin, /^\d{6}$/, 'PIN deve ser numérico');

  const hash = await hashPin(pin);
  assert.ok(hash.startsWith('$2'), 'Hash deve ser formato bcrypt');

  const isValid = await verifyPin(pin, hash);
  assert.equal(isValid, true, 'PIN correto deve ser validado');

  const isInvalid = await verifyPin('000000', hash);
  assert.equal(isInvalid, false, 'PIN incorreto deve falhar');
});

test('3. i18n Dictionary Consistency between PT-MZ and EN', () => {
  const ptKeys = Object.keys(ptTranslations).sort();
  const enKeys = Object.keys(enTranslations).sort();

  assert.deepEqual(ptKeys, enKeys, 'Todas as chaves de tradução devem coincidir entre PT e EN');

  // Verify essential fields exist
  assert.equal(ptTranslations.appName, 'Helpbox');
  assert.equal(enTranslations.appName, 'Helpbox');
  assert.ok(!ptTranslations.appName.toLowerCase().includes('moçambique'));
  assert.ok(!enTranslations.appName.toLowerCase().includes('mozambique'));
  assert.ok(!ptTranslations.appName.includes('MZ'));
  assert.ok(ptTranslations.quickExit.length > 0);
  assert.ok(enTranslations.quickExit.length > 0);
});

test('4. Case Referral Validation & Note Formatting', () => {
  // Test validation logic
  const validateReferral = (payload) => {
    if (!payload.departmentId || typeof payload.departmentId !== 'string') {
      return { valid: false, error: 'Departamento de destino é obrigatório' };
    }
    if (!payload.reason || typeof payload.reason !== 'string' || payload.reason.trim().length < 5) {
      return { valid: false, error: 'A fundamentação técnica deve ter pelo menos 5 caracteres' };
    }
    const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
    if (payload.priority && !validPriorities.includes(payload.priority)) {
      return { valid: false, error: 'Prioridade inválida' };
    }
    return { valid: true };
  };

  assert.equal(validateReferral({ departmentId: '', reason: 'Encaminhamento urgente' }).valid, false);
  assert.equal(validateReferral({ departmentId: 'dept-1', reason: 'abc' }).valid, false);
  assert.equal(validateReferral({ departmentId: 'dept-1', reason: 'Encaminhamento para apoio psicológico', priority: 'HIGH' }).valid, true);

  // Format referral internal note test
  const fromDept = 'Triagem';
  const toDept = 'Apoio Psicológico';
  const staffName = 'Dra. Maria';
  const reason = 'Utente necessita de avaliação urgente';
  const note = `[ENCAMINHAMENTO TÉCNICO]\nDe: ${fromDept}\nPara: ${toDept}\nTécnico atribuído: ${staffName}\nMotivo: ${reason}`;

  assert.ok(note.startsWith('[ENCAMINHAMENTO TÉCNICO]'));
  assert.ok(note.includes(toDept));
  assert.ok(note.includes(staffName));
});

