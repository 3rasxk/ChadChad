/**
 * Thai Phonetic Scoring Engine — Strict 1-to-1 Syllable Mapping
 *
 * Words are defined as arrays of syllables. Each syllable has 4 components:
 * initial, vowel, final, tone — each with target, group, and feedback.
 *
 * The 4 UI bars show the AVERAGE score across all syllables for each dimension.
 *
 * Target Words: ช้าง, พริก, โรงเรียน, ความรู้
 *
 * Scoring tiers per component (The 100/70/0 Rule):
 *   100% = Exact phoneme match (or both empty/null)
 *    70% = In phoneticGroup (close sound)
 *     0% = Completely different sound
 *
 * Star Rating:
 *   ★★★ = totalAverage >= 90%
 *   ★★☆ = totalAverage >= 70%
 *   ★☆☆ = totalAverage < 70%
 */

/* ════════════════════════════════════════════════════════════════
   TARGET PHONETIC DICTIONARY — MULTI-SYLLABLE
   ════════════════════════════════════════════════════════════════ */

const TARGET_DICT = {
  'ช้าง': {
    syllables: [
      {
        initial: { target: 'ช', group: ['ช', 'ซ', 'ส', 'ศ', 'ษ'], feedback: 'ลองออกเสียง ช.ช้าง ให้ชัดขึ้น' },
        vowel: { target: 'า', group: ['า', 'ั'], feedback: 'ลองออกเสียง สระอา ให้ชัดขึ้น' },
        final: { target: 'ง', group: ['ง', 'น', 'ม'], feedback: 'ลองออกเสียง แม่กง ให้ชัดขึ้น' },
        tone: { target: '้', group: ['้', '๊', '๋'], feedback: 'ลองออกเสียง ไม้โท ให้ชัดขึ้น' },
      },
    ],
  },
  'พริก': {
    syllables: [
      {
        initial: { target: 'พร', group: ['พร', 'พ', 'ผ', 'ป', 'ปร'], feedback: 'ลองออกเสียง พ.พาน ควบกับ ร.เรือ ให้ชัดขึ้น' },
        vowel: { target: 'ิ', group: ['ิ', 'ี', 'ึ'], feedback: 'ลองออกเสียง สระอิ ให้ชัดขึ้น' },
        final: { target: 'ก', group: ['ก', 'ค', 'ข', 'ด', 'ต'], feedback: 'ลองออกเสียง แม่กก ให้ชัดขึ้น' },
        tone: { target: null, group: ['่'], feedback: 'ลองออกเสียง เสียงสามัญ ให้ชัดขึ้น' },
      },
    ],
  },
  'โรงเรียน': {
    syllables: [
      { // โรง
        initial: { target: 'ร', group: ['ล'], feedback: "ลองออกเสียง ร.เรือ ให้ชัดขึ้น" },
        vowel: { target: 'โ', group: ['อ'], feedback: "ลองออกเสียง สระโอ ให้ชัดขึ้น" },
        final: { target: 'ง', group: ['น', 'ม'], feedback: "ลองออกเสียง แม่กง ให้ชัดขึ้น" },
        tone: { target: null, group: [], feedback: '' },
      },
      { // เรียน
        initial: { target: 'ร', group: ['ล'], feedback: "ลองออกเสียง ร.เรือ ให้ชัดขึ้น" },
        vowel: { target: 'เ-ีย', group: ['เ', 'ี', 'เ-ี'], feedback: "ลองออกเสียง สระเอีย ให้ชัดขึ้น" },
        final: { target: 'น', group: ['ง', 'ม'], feedback: "ลองออกเสียง แม่กน ให้ชัดขึ้น" },
        tone: { target: null, group: [], feedback: 'ลองออกเสียง เสียงสามัญ ให้ชัดขึ้น' },
      },
    ],
  },
  'ความรู้': {
    syllables: [
      { // ความ
        initial: { target: 'คว', group: ['ค', 'ฟ', 'พ'], feedback: "ลองออกเสียง ค.ควาย ควบกับ ว.แหวน ให้ชัดขึ้น" },
        vowel: { target: 'า', group: ['ะ'], feedback: "ลองออกเสียง สระอา ให้ชัดขึ้น" },
        final: { target: 'ม', group: ['น', 'ง'], feedback: "ลองออกเสียง แม่กม ให้ชัดขึ้น" },
        tone: { target: null, group: [], feedback: '' },
      },
      { // รู้
        initial: { target: 'ร', group: ['ล'], feedback: "ลองออกเสียง ร.เรือ ให้ชัดขึ้น" },
        vowel: { target: 'ู', group: ['ุ'], feedback: "ลองออกเสียง สระอู ให้ชัดขึ้น" },
        final: { target: null, group: [], feedback: 'ไม่ต้องออกเสียงตัวสะกด' },
        tone: { target: '้', group: ['๊', '๋'], feedback: "ลองออกเสียง ไม้โท ให้ชัดขึ้น" },
      },
    ],
  },
  'ปรับปรุง': { syllables: [
    { initial: { target: 'ปร', group: ['ป', 'ปล', 'พร'], feedback: 'ลองออกเสียง ป ควบ ร ให้ชัดขึ้น' },
      vowel: { target: 'ั', group: ['ะ'], feedback: 'ลองออกเสียง สระอะ ให้ชัดขึ้น' },
      final: { target: 'บ', group: ['ป', 'พ'], feedback: 'ลองออกเสียง แม่กบ ให้ชัดขึ้น' },
      tone: { target: null, group: [], feedback: '' } },
    { initial: { target: 'ปร', group: ['ป', 'ปล', 'พร'], feedback: 'ลองออกเสียง ป ควบ ร ให้ชัดขึ้น' },
      vowel: { target: 'ุ', group: ['ู'], feedback: 'ลองออกเสียง สระอุ ให้ชัดขึ้น' },
      final: { target: 'ง', group: ['น', 'ม'], feedback: 'ลองออกเสียง แม่กง ให้ชัดขึ้น' },
      tone: { target: null, group: [], feedback: '' } },
  ]},
  'เปลี่ยนแปลง': { syllables: [
    { initial: { target: 'ปล', group: ['ป', 'พล'], feedback: 'ลองออกเสียง ป ควบ ล ให้ชัดขึ้น' },
      vowel: { target: 'เ-ีย', group: ['เ', 'ี'], feedback: 'ลองออกเสียง สระเอีย ให้ชัดขึ้น' },
      final: { target: 'น', group: ['ง', 'ม'], feedback: 'ลองออกเสียง แม่กน ให้ชัดขึ้น' },
      tone: { target: '่', group: ['้'], feedback: 'ลองออกเสียง ไม้เอก ให้ชัดขึ้น' } },
    { initial: { target: 'ปล', group: ['ป', 'พล'], feedback: 'ลองออกเสียง ป ควบ ล ให้ชัดขึ้น' },
      vowel: { target: 'แ', group: ['เ'], feedback: 'ลองออกเสียง สระแอ ให้ชัดขึ้น' },
      final: { target: 'ง', group: ['น', 'ม'], feedback: 'ลองออกเสียง แม่กง ให้ชัดขึ้น' },
      tone: { target: null, group: [], feedback: '' } },
  ]},

  'เพลิดเพลิน': { syllables: [
    { initial: { target: 'พล', group: ['พ', 'ปล', 'ป'], feedback: 'ลองออกเสียง พ ควบ ล ให้ชัดขึ้น' },
      vowel: { target: 'เ', group: ['ิ'], feedback: 'ลองออกเสียง สระเอิ ให้ชัดขึ้น' },
      final: { target: 'ด', group: ['ต', 'ท'], feedback: 'ลองออกเสียง แม่กด ให้ชัดขึ้น' },
      tone: { target: null, group: [], feedback: '' } },
    { initial: { target: 'พล', group: ['พ', 'ปล', 'ป'], feedback: 'ลองออกเสียง พ ควบ ล ให้ชัดขึ้น' },
      vowel: { target: 'เ', group: ['ิ'], feedback: 'ลองออกเสียง สระเอิ ให้ชัดขึ้น' },
      final: { target: 'น', group: ['ง', 'ม'], feedback: 'ลองออกเสียง แม่กน ให้ชัดขึ้น' },
      tone: { target: null, group: [], feedback: '' } },
  ]},
  'ทรัพยากร': { syllables: [
    { initial: { target: 'ซ', group: ['ส', 'ท'], feedback: 'ลองออกเสียง ซ.โซ่ (ทร=ซ) ให้ชัดขึ้น' },
      vowel: { target: 'ั', group: ['ะ'], feedback: 'ลองออกเสียง สระอะ ให้ชัดขึ้น' },
      final: { target: 'บ', group: ['ป', 'พ'], feedback: 'ลองออกเสียง แม่กบ ให้ชัดขึ้น' },
      tone: { target: null, group: [], feedback: '' } },
    { initial: { target: 'พ', group: ['ผ', 'ป'], feedback: 'ลองออกเสียง พ.พาน ให้ชัดขึ้น' },
      vowel: { target: 'ะ', group: ['ั'], feedback: 'ลองออกเสียง สระอะ ให้ชัดขึ้น' },
      final: { target: '', group: [], feedback: '' },
      tone: { target: null, group: [], feedback: '' } },
    { initial: { target: 'ย', group: ['อ'], feedback: 'ลองออกเสียง ย.ยักษ์ ให้ชัดขึ้น' },
      vowel: { target: 'า', group: ['ะ'], feedback: 'ลองออกเสียง สระอา ให้ชัดขึ้น' },
      final: { target: '', group: [], feedback: '' },
      tone: { target: null, group: [], feedback: '' } },
    { initial: { target: 'ก', group: ['ค', 'ข'], feedback: 'ลองออกเสียง ก.ไก่ ให้ชัดขึ้น' },
      vowel: { target: 'อ', group: ['า'], feedback: 'ลองออกเสียง สระออ ให้ชัดขึ้น' },
      final: { target: 'น', group: ['ง', 'ม'], feedback: 'ลองออกเสียง แม่กน ให้ชัดขึ้น' },
      tone: { target: null, group: [], feedback: '' } },
  ]},
  'ธรรมชาติ': { syllables: [
    { initial: { target: 'ท', group: ['ต', 'ธ'], feedback: 'ลองออกเสียง ท.ทหาร ให้ชัดขึ้น' },
      vowel: { target: 'า', group: ['ะ'], feedback: 'ลองออกเสียง สระอำ ให้ชัดขึ้น' },
      final: { target: 'ม', group: ['น', 'ง'], feedback: 'ลองออกเสียง แม่กม ให้ชัดขึ้น' },
      tone: { target: null, group: [], feedback: '' } },
    { initial: { target: 'ม', group: ['น'], feedback: 'ลองออกเสียง ม.ม้า ให้ชัดขึ้น' },
      vowel: { target: 'ะ', group: ['ั'], feedback: 'ลองออกเสียง สระอะ ให้ชัดขึ้น' },
      final: { target: '', group: [], feedback: '' },
      tone: { target: null, group: [], feedback: '' } },
    { initial: { target: 'ช', group: ['ซ', 'ส'], feedback: 'ลองออกเสียง ช.ช้าง ให้ชัดขึ้น' },
      vowel: { target: 'า', group: ['ะ'], feedback: 'ลองออกเสียง สระอา ให้ชัดขึ้น' },
      final: { target: 'ด', group: ['ต', 'ท'], feedback: 'ลองออกเสียง แม่กด ให้ชัดขึ้น' },
      tone: { target: null, group: [], feedback: '' } },
  ]},
  'ซื่อสัตย์': { syllables: [
    { initial: { target: 'ซ', group: ['ส', 'ช'], feedback: 'ลองออกเสียง ซ.โซ่ ให้ชัดขึ้น' },
      vowel: { target: 'ื', group: ['ึ', 'ู'], feedback: 'ลองออกเสียง สระอือ ให้ชัดขึ้น' },
      final: { target: '', group: [], feedback: '' },
      tone: { target: '่', group: ['้'], feedback: 'ลองออกเสียง ไม้เอก ให้ชัดขึ้น' } },
    { initial: { target: 'ส', group: ['ซ', 'ศ'], feedback: 'ลองออกเสียง ส.เสือ ให้ชัดขึ้น' },
      vowel: { target: 'ั', group: ['ะ'], feedback: 'ลองออกเสียง สระอะ ให้ชัดขึ้น' },
      final: { target: 'ด', group: ['ต', 'ท'], feedback: 'ลองออกเสียง แม่กด ให้ชัดขึ้น' },
      tone: { target: null, group: [], feedback: '' } },
  ]},
};

/* ════════════════════════════════════════════════════════════════
   DYNAMIC THAI PHONETIC PARSER
   ════════════════════════════════════════════════════════════════ */

/**
 * Splits a Thai string into syllable chunks.
 * Optimized for ช้าง, พริก, โรงเรียน, ความรู้
 */
function splitThaiSyllables(text) {
  // Clean whitespace
  let s = text.replace(/\s+/g, '');
  // Boundary before prefix vowels
  s = s.replace(/([เแโใไ])/g, '-$1');
  // Boundary between final consonant and next initial (งมนกบด -> ก-ฮ)
  s = s.replace(/([งมนกบด])([ก-ฮ])/g, '$1-$2');
  // Clean leading dashes
  s = s.replace(/^-+/, '');
  return s.split('-').filter(Boolean);
}

/**
 * Parses a single syllable chunk into { i, v, f, t }.
 */
function parseThaiSyllable(syl) {
  let i = '', v = '', f = '', t = null;
  const tones = ['่', '้', '๊', '๋'];
  const clusters = ['คว', 'พร', 'ปร', 'ปล', 'พล', 'คล', 'ขว', 'ขร', 'คร', 'ตร', 'กล', 'กร', 'ตล', 'ผล'];

  // Extract tone
  for (const char of syl) {
    if (tones.includes(char)) {
      t = char;
      break;
    }
  }
  let text = syl.replace(/[่้๊๋]/g, '');

  // Extract prefix vowel
  let prefix = '';
  if (['เ', 'แ', 'โ', 'ใ', 'ไ'].includes(text[0])) {
    prefix = text[0];
    text = text.slice(1);
  }

  // Extract initial consonant(s)
  if (text.length >= 2 && clusters.includes(text.substring(0, 2))) {
    i = text.substring(0, 2);
    text = text.slice(2);
  } else if (text.length >= 1) {
    i = text.substring(0, 1);
    text = text.slice(1);
  }

  // Extract vowel
  if (prefix === 'เ' && (text.startsWith('ีย') || text.startsWith('ีย'))) {
    v = 'เ-ีย';
    text = text.slice(2);
  } else if (prefix === 'เ' && text.startsWith('ี') && text[1] === 'ย') {
    v = 'เ-ีย';
    text = text.slice(2);
  } else if (prefix) {
    v = prefix;
  }

  if (!v) {
    const vowelMatch = text.match(/^[าิีึืุูัะ]+/);
    if (vowelMatch) {
      v = vowelMatch[0];
      text = text.slice(v.length);
    }
  }

  // The rest is final consonant
  f = text;

  return { i, v, f, t };
}

/**
 * Parses any Thai transcript into its core components.
 */
export function parseThaiWord(text) {
  const chunks = splitThaiSyllables(text);
  return chunks.map(parseThaiSyllable);
}

/* ════════════════════════════════════════════════════════════════
   100/70/0 SCORING HELPERS
   ════════════════════════════════════════════════════════════════ */

/**
 * Score a single component: 100 (exact), 70 (in group), 0 (miss).
 * Strips dashes from expected vowels before comparison.
 */
function score100_70_0(userVal, targetDef) {
  const user = userVal || '';
  const expected = targetDef.target || '';

  // Exact match (including both empty/null)
  if (user === expected) return 100;

  // For vowels with dashes (เ-ีย): strip and recompare
  const cleanExpected = expected.replace(/-/g, '');
  if (cleanExpected !== expected && user === cleanExpected) return 100;

  // In group → 70%
  if (targetDef.group && targetDef.group.length > 0) {
    for (const g of targetDef.group) {
      const cleanG = g.replace(/-/g, '');
      if (user === g || user === cleanG) return 70;
    }
  }

  // Both empty → 100%
  if (expected === '' && user === '') return 100;

  // Target empty but user added sound → 70%
  if (expected === '' && user !== '') return 70;

  return 0;
}

/** Score tone: 100 (exact), 70 (in group or adjacent), 0 (miss). */
function scoreTone(userTone, toneDef) {
  const user = userTone || null;
  const expected = toneDef.target || null;

  if (user === expected) return 100;
  if (user && toneDef.group && toneDef.group.includes(user)) return 70;

  const TONES = [null, '่', '้', '๊', '๋'];
  const aIdx = TONES.indexOf(user);
  const eIdx = TONES.indexOf(expected);
  if (aIdx >= 0 && eIdx >= 0 && Math.abs(aIdx - eIdx) === 1) return 70;

  return 0;
}

/* ════════════════════════════════════════════════════════════════
   MAIN SCORING FUNCTION — Strict 1-to-1 Syllable Mapping
   ════════════════════════════════════════════════════════════════ */

/**
 * Scores a transcript against a target word.
 *
 * 1. Looks up transcript in PARSED_TRANSCRIPTS.
 *    If NOT found → all scores = 0%.
 * 2. Loops through target syllables 1-to-1 with user syllables.
 * 3. Scores each component (I, V, F, T) with 100/70/0 rule.
 * 4. ONLY pushes feedback when score < 100.
 * 5. Averages across syllables for each dimension.
 */
export function calculateScores(transcript, targetWord) {
  const ZERO = {
    consonantScore: 0, vowelScore: 0, finalScore: 0, toneScore: 0,
    overallScore: 0, stars: 0, feedbackList: [],
  };

  if (!transcript || typeof transcript !== 'string' || transcript === '-') {
    return ZERO;
  }

  const entry = TARGET_DICT[targetWord];
  if (!entry) {
    const isMatch = transcript === targetWord;
    const s = isMatch ? 100 : 0;
    return {
      consonantScore: s, vowelScore: s, finalScore: s, toneScore: s,
      overallScore: s, stars: s === 100 ? 3 : 0, feedbackList: [],
    };
  }

  // ── Step 1: Get user syllables from dynamic parser ──
  const userSyllables = parseThaiWord(transcript);

  if (userSyllables.length === 0) {
    console.log(`[Scoring] ❌ Failed to parse transcript: "${transcript}" → 0%`);
    return ZERO;
  }

  const targetSyllables = entry.syllables;
  const syllableCount = targetSyllables.length;

  if (userSyllables.length > targetSyllables.length + 1) {
    return {
      ...ZERO,
      feedbackList: ["หนูพูดคำอื่นปนมาด้วย ลองพูดแค่คำว่า " + targetWord + " คำเดียวนะลูก"]
    };
  }

  console.log(`[Scoring] ✅ Parsed: "${transcript}" →`, userSyllables);

  // ── Step 2: Accumulators ──
  let totalInitial = 0;
  let totalVowel = 0;
  let totalFinal = 0;
  let totalTone = 0;
  const feedbackList = [];

  // ── Step 3: Strict 1-to-1 syllable loop ──
  for (let k = 0; k < syllableCount; k++) {
    const tgt = targetSyllables[k];
    const usr = userSyllables[k] || { i: '', v: '', f: '', t: null };

    // Score Initial
    const iScore = score100_70_0(usr.i, tgt.initial);
    totalInitial += iScore;
    if (iScore < 100 && tgt.initial.feedback) {
      feedbackList.push(tgt.initial.feedback);
    }

    // Score Vowel
    const vScore = score100_70_0(usr.v, tgt.vowel);
    totalVowel += vScore;
    if (vScore < 100 && tgt.vowel.feedback) {
      feedbackList.push(tgt.vowel.feedback);
    }

    // Score Final
    const fScore = score100_70_0(usr.f, tgt.final);
    totalFinal += fScore;
    if (fScore < 100 && tgt.final.feedback) {
      feedbackList.push(tgt.final.feedback);
    }

    // Score Tone
    const tScore = scoreTone(usr.t, tgt.tone);
    totalTone += tScore;
    if (tScore < 100 && tgt.tone.feedback) {
      feedbackList.push(tgt.tone.feedback);
    }
  }

  // ── Step 4: Average across syllables ──
  const consonantScore = Math.round(totalInitial / syllableCount);
  const vowelScore = Math.round(totalVowel / syllableCount);
  const finalScore = Math.round(totalFinal / syllableCount);
  const toneScore = Math.round(totalTone / syllableCount);

  const overallScore = Math.round(
    (consonantScore + vowelScore + finalScore + toneScore) / 4
  );

  // ── Star rating ──
  let stars = 1;
  if (overallScore >= 90) stars = 3;
  else if (overallScore >= 70) stars = 2;

  return {
    consonantScore, vowelScore, finalScore, toneScore,
    overallScore, stars, feedbackList,
  };
}

/* ════════════════════════════════════════════════════════════════
   FEEDBACK GENERATOR (KIDS UI) — Star-Based
   ════════════════════════════════════════════════════════════════ */

/**
 * Generates kid-friendly Thai feedback based on scores and feedbackList.
 *
 * feedbackList is now a flat array of strings (not objects).
 *
 * Stars:
 *   ★★★ = totalAverage >= 90%
 *   ★★☆ = totalAverage >= 70%
 *   ★☆☆ = totalAverage < 70%
 *   ☆☆☆ = No speech detected
 */
export function evaluateFeedback(transcript, targetWord, cScore, vScore, fScore, tScore, feedbackList) {
  // No-Speech fallback
  if (!transcript || transcript.trim().length === 0 || transcript === '-') {
    return {
      message: 'กรุณาพูดใหม่...',
      stars: 0,
      stateType: 'error',
      feedbackItems: [],
    };
  }

  const overall = Math.round((cScore + vScore + fScore + tScore) / 4);
  const adviceList = Array.isArray(feedbackList) ? feedbackList : [];

  // Star rating from overall
  let stars = 1;
  if (overall >= 90) stars = 3;
  else if (overall >= 70) stars = 2;

  // feedbackList is now a flat string array — use directly
  const feedbackItems = adviceList.filter((item) => typeof item === 'string' && item.length > 0);

  // ── Perfect (all 100) ──
  if (cScore === 100 && vScore === 100 && fScore === 100 && tScore === 100) {
    return {
      message: 'สุดยอด! ออกเสียงเป๊ะมาก 🎉',
      stars: 3,
      stateType: 'success',
      feedbackItems: [],
    };
  }

  // ── 3 Stars (>= 90%) ──
  if (stars === 3) {
    return {
      message: 'เก่งมาก! เกือบเป๊ะแล้ว ✨',
      stars: 3,
      stateType: 'success',
      feedbackItems,
    };
  }

  // ── 2 Stars (>= 70%) ──
  if (stars === 2) {
    return {
      message: 'เกือบถูกแล้วคนเก่ง! ✌️',
      stars: 2,
      stateType: 'warning',
      feedbackItems,
    };
  }

  // ── 1 Star (< 70%) ──
  return {
    message: 'ลองฟังเสียงครูใหม่นะลูก 🎤',
    stars: 1,
    stateType: 'warning',
    feedbackItems,
  };
}
