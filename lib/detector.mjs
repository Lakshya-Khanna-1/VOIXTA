const proof = [
  ['code', /\b(?:one[- ]time (?:password|code)|otp|passcode|upi pin|bank pin|verification code|security code)\b|ओटीपी|पिन|वेरिफिकेशन कोड/iu],
  ['money', /\b(?:transfer|refund|processing fee|registration fee|fine|payment|pay|paise|paisa|pese|rak[a-z]*m)\b|भुगतान|जुर्माना|पैसे|रकम|फीस|ट्रांसफ़र/iu],
  ['link', /(?:https?:\/\/|www\.)[^\s]+|\b(?:link|attachment|qr code|screen shar\w*|remote access)\b|लिंक|क्यूआर|स्क्रीन शेयर/iu],
  ['threat', /\b(?:arrest|warrant|account (?:is |will be )?(?:blocked|suspended|frozen)|legal action|digital custody|giraft[a-z]*)\b|गिरफ़्तार|गिरफ्तार|वारंट|खाता बंद|कानूनी कार्रवाई/iu],
  ['secrecy', /\b(?:keep this between us|don['’]?t tell|do not tell|tell no one|stay on (?:the |this )?call|kisi ko (?:mat|nahi) bat[a-z]*)\b|किसी को मत बत|गुप्त रख|कॉल मत काट|फ़ोन मत काट/iu],
];

const asks = /\b(?:ask(?:ed|s|ing)?|request(?:ed|s)?|send|tell|read(?: out)?|share|confirm|give|need|demand(?:ed|s)?|pay|transfer|enter|click|tap|open|install|bata(?:o|iye|na|ne)?|bhej(?:o|iye|na|ne)?|bhar(?:o|iye|na)?|maang(?:a|e|i)?|karo|dijiye)\b|माँग|मांग|भेज|बताइ|बताओ|साझा|दर्ज|दें|अदा|करें|खोलें|दबाएं/iu;
const directReport = /\b(?:asked (?:me|us|him|her|for)|told (?:me|us|him|her) to|wants? (?:me|us) to|demanded|made (?:me|us) share|bhejne ko|dene ko|mujhse|kaha ki)\b|मुझसे|मुझे कहा|मुझे बोला|माँगा|मांगा/iu;
const protective = /\b(?:never|don['’]?t|do not|not to|shouldn['’]?t|must not|won['’]?t|will never)\s+(?:ever\s+)?(?:ask|give|share|tell|read|send|enter|click|pay|transfer|divulge|disclose)\b|\b(?:mat|nahi)\s+(?:bat\w*|bhej\w*|kar\w*|de\w*)\b|(?:साझा|शेयर|बताएं|भेजें|भुगतान)\s*(?:न करें|मत करें|मत)|(?:मत|नहीं)\s*(?:बताएं|बताइए|बताओ|भेजें|दें|करें|माँग)/iu;
const disclaimer = /\b(?:is a scam|was a scam|it['’]?s a scam|scam awareness|report(?:ing)? a scam)\b|धोखाधड़ी है|फ़्रॉड है|फ्रॉड है/iu;
const routineCode = /\b(?:your (?:login |verification |security )?(?:otp|verification code|one.time (?:password|code)) is|use (?:this|the) code to sign in)\b|आपका ओटीपी|आपका सत्यापन कोड/iu;
const everyday = /\b(?:see you|meet(?:ing)?(?: me)? at|call you back|your order (?:is ready|has arrived)|has been delivered|out for delivery|your appointment|happy birthday|take care|thanks for)\b|मिलते हैं|शुभकामनाएं|आपकी डिलीवरी|आपकी अपॉइंटमेंट/iu;
const urgency = /\b(?:urgent(?:ly)?|immediately|right now|within \d+|last chance|or else|final notice|abhi|turant|jaldi)\b|तुरंत|अभी|आखिरी मौका|वरना/iu;

export function messageFeatures(message) {
  const tokens = message.normalize('NFKC').toLowerCase()
    .replace(/(?:https?:\/\/|www\.)\S+/g, ' urltoken ')
    .replace(/\p{Nd}+/gu, '0')
    .replace(/[^\p{L}\p{M}0]+/gu, ' ').trim().split(/\s+/).filter(Boolean);
  const features = new Set(tokens);
  tokens.forEach((token, index) => {
    if (index > 0) features.add(`${tokens[index - 1]} ${token}`);
    const chars = Array.from(`^${token}$`);
    for (const length of [3, 4]) {
      for (let i = 0; i + length <= chars.length; i += 1) {
        features.add(`~${chars.slice(i, i + length).join('')}`);
      }
    }
  });
  return features;
}

export function analyzeMessage(text, channel, model) {
  const features = messageFeatures(text);
  let score = model.bias;
  for (const term of features) {
    if (Object.hasOwn(model.weights, term)) score += model.weights[term];
  }

  const clues = new Map();
  let context;
  const fragments = text.split(/(?:[.!?।;]\s+|\n+|,\s+(?=(?:but|then|however|लेकिन|फिर)\s))/iu);
  for (const fragment of fragments) {
    const evidence = proof.flatMap(([kind, pattern]) => {
      const found = fragment.match(pattern);
      return found ? [{ kind, quote: found[0] }] : [];
    });
    const has = (kind) => evidence.some((cue) => cue.kind === kind);
    const request = fragment.match(asks)?.[0];
    const safetyAdvice = protective.test(fragment);
    if (safetyAdvice || (disclaimer.test(fragment) && !directReport.test(fragment))) {
      context ??= 'advice';
      continue;
    }
    if (routineCode.test(fragment) && !directReport.test(fragment) &&
        !has('link') && !has('secrecy') && !has('threat') && !has('money')) {
      context ??= 'routine';
      continue;
    }
    for (const cue of evidence) {
      if (!clues.has(cue.kind)) clues.set(cue.kind, { ...cue, ...(request && { request }) });
    }
  }

  const evidence = [...clues.values()];
  const match = (kind) => clues.get(kind);
  const highRisk = Boolean(match('code')?.request ||
    (match('money') && (match('secrecy') || match('threat'))) ||
    (match('threat') && match('secrecy')) ||
    (match('link')?.request && (match('code') || match('threat'))) ||
    (score >= 1.5 && evidence.length >= 2 && evidence.some((cue) => cue.request)) ||
    (score >= 3 && channel === 'sms' && (match('link')?.request || (match('money')?.request && urgency.test(text)))));

  if (highRisk) return { level: 'risk', evidence, context };
  if (context && !evidence.length) return { level: 'clear', evidence, context };
  if (everyday.test(text) && !evidence.length) return { level: 'clear', evidence, context: 'routine' };
  if (evidence.length || score >= -1 || features.size < 20) return { level: 'review', evidence, context };
  return { level: 'clear', evidence, context };
}
