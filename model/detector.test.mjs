import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { analyzeMessage } from '../lib/detector.mjs';

const weights = JSON.parse(readFileSync(new URL('../public/detector-model.json', import.meta.url)));
const cases = [
  ['call', 'Never share your OTP with anyone.', 'clear'],
  ['call', 'A digital arrest is a scam. Hang up.', 'clear'],
  ['call', 'They asked me to read out my OTP.', 'risk'],
  ['call', 'They won’t ask for your bank PIN, but the caller told me to read out my OTP.', 'risk'],
  ['call', 'See you at lunch tomorrow.', 'clear'],
  ['call', 'Keep this between us.', 'review'],
  ['sms', 'Your OTP is 000000. Do not share this code.', 'clear'],
  ['sms', 'Your account will be suspended. Enter your verification code at this link.', 'risk'],
  ['sms', 'Your order is ready for pickup tomorrow.', 'clear'],
  ['sms', 'Here is the link.', 'review'],
  ['call', 'अपना ओटीपी किसी से साझा न करें।', 'clear'],
  ['call', 'कॉल करने वाले ने मुझसे ओटीपी माँगा।', 'risk'],
  ['sms', 'आपका खाता बंद हो जाएगा। इस लिंक पर अपना ओटीपी दर्ज करें।', 'risk'],
  ['call', 'OTP mat batao.', 'clear'],
  ['call', 'Caller ne kaha ki OTP batao.', 'risk'],
];

for (const [mode, message, expectation] of cases) {
  assert.equal(analyzeMessage(message, mode, weights).level, expectation, message);
}
console.log(`Passed ${cases.length} behavioral checks`);
