import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { analyzeMessage, needsContextModel } from '../lib/detector.mjs';

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
  ['sms', 'Be aware of digital arrest scams', 'clear'],
  ['sms', 'Watch out for calls that claim you are under arrest.', 'clear'],
  ['sms', 'Stay alert to fraudsters asking you to pay a fine.', 'clear'],
  ['sms', 'डिजिटल अरेस्ट की धोखाधड़ी से सावधान रहें।', 'clear'],
  ['sms', 'Digital arrest fraud se savdhan rahein.', 'clear'],
  ['sms', 'Beware of scams. Send me your OTP so I can protect your account.', 'risk'],
  ['sms', 'Be aware of scams and send me your OTP.', 'risk'],
  ['sms', 'Never share your OTP except with our agent.', 'risk'],
  ['sms', 'Be aware of digital arrest scams, text me the number.', 'review'],
  ['call', 'We have a warrant. Do not tell anyone until you pay the fine.', 'risk'],
  ['call', 'This caller says I will be arrested today.', 'review'],
];

for (const [mode, message, expectation] of cases) {
  assert.equal(analyzeMessage(message, mode, weights).level, expectation, message);
}
const screenshotCase = analyzeMessage('Be aware of digital arrest scams', 'sms', weights);
assert.equal(screenshotCase.context, 'advice');
assert.deepEqual(screenshotCase.evidence, []);
const paraphrase = 'Here is a reminder that fraudsters use fake arrest warrants to scare people.';
assert.equal(needsContextModel(paraphrase, analyzeMessage(paraphrase, 'sms', weights)), true);
assert.equal(needsContextModel('This caller asked me to send money.', analyzeMessage('This caller asked me to send money.', 'call', weights)), false);
console.log(`Passed ${cases.length} behavioral checks`);
