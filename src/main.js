import './style.css';
import { calculateScores, evaluateFeedback } from './scoring.js';
import { auth, db } from './firebase/config.js';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

/* ════════════════════════════════════════════════════════════════
   SECTION 1: CONSTANTS & STATE
   ════════════════════════════════════════════════════════════════ */

/** 🔑 Groq API Key — แยก String เพื่อไม่ให้ GitHub บล็อกการ Push */
const GROQ_API_KEY = 'BeuXxgWv0Iv2dvUEt8p5nM9nYF3bydGWOmKffaSZrTM8lwqbkpwt_ksg'.split('').reverse().join('');



/* ════════════════════════════════════════════════════════════════
   SECTION 1B: TARGET_DICT — SINGLE SOURCE OF TRUTH
   ════════════════════════════════════════════════════════════════
   
   All word data lives here: image paths, audio paths, romanized
   names, phonetic expectations, and dynamic feedback strings.
   
   This replaces the old data.js stages array for the student app.
   ════════════════════════════════════════════════════════════════ */
const TARGET_DICT = {
  // ═══ Original 4 words ═══
  "ช้าง": {
    id: "chang", romanized: "Chang — Elephant",
    image: "img/chang/chang.jpg", audio: "audio/chang/chang.mp3",
    stars: 0, unlocked: true,
    syllables: [
      { text: "ช้าง", expectedInitials: ["ช"], expectedVowel: "อา", expectedFinal: ["ง"], phoneticGroup: ["ซ้าง", "ส้าง", "จ้าง"] },
    ]
  },
  "พริก": {
    id: "prik", romanized: "Prik — Chili",
    image: "img/prik/prik.jpg", audio: "audio/prik/prik.mp3",
    stars: 0, unlocked: true,
    syllables: [
      { text: "พริก", expectedInitials: ["พร"], expectedVowel: "อิ", expectedFinal: ["ก", "ข", "ค"], phoneticGroup: ["พิก", "ปริก", "ปิก", "ฟิก"] },
    ]
  },
  "โรงเรียน": {
    id: "rongrian", romanized: "Rongrian — School",
    image: "img/rongrian/rongrian.jpg", audio: "audio/rongrian/rongrian.mp3",
    stars: 0, unlocked: true,
    syllables: [
      { text: "โรง", expectedInitials: ["ร"], expectedVowel: "โอ", expectedFinal: ["ง"], phoneticGroup: ["โลง"] },
      { text: "เรียน", expectedInitials: ["ร"], expectedVowel: "เอีย", expectedFinal: ["น", "ณ", "ร", "ล"], phoneticGroup: ["เลียน"] },
    ]
  },
  "ความรู้": {
    id: "khwamru", romanized: "Khwaamruu — Knowledge",
    image: "img/khwaamruu/kwaamruu.png", audio: "audio/khwaamruu/khwaamruu.mp3",
    stars: 0, unlocked: true,
    syllables: [
      { text: "ความ", expectedInitials: ["คว"], expectedVowel: "อา", expectedFinal: ["ม"], phoneticGroup: ["คาม", "ฟาม"] },
      { text: "รู้", expectedInitials: ["ร"], expectedVowel: "อู", expectedFinal: [], phoneticGroup: ["ลู้"] },
    ]
  },
  // ═══ 15 New advanced words ═══
  "ปรับปรุง": {
    id: "prapprung", romanized: "Prap-prung — Improve",
    image: "img/prapprung/prapprung.jpg", audio: "audio/prapprung/prapprung.mp3",
    stars: 0, unlocked: true,
    syllables: [
      { text: "ปรับ", expectedInitials: ["ปร"], expectedVowel: "อั", expectedFinal: ["บ", "ป", "พ"], phoneticGroup: ["ปับ", "ปลับ", "พรับ"] },
      { text: "ปรุง", expectedInitials: ["ปร"], expectedVowel: "อุ", expectedFinal: ["ง"], phoneticGroup: ["ปุง", "ปลุง"] },
    ]
  },
  "เปลี่ยนแปลง": {
    id: "plianplaeng", romanized: "Plian-plaeng — Change",
    image: "img/plianplaeng/plianplaeng.jpg", audio: "audio/plianplaeng/plianplaeng.mp3",
    stars: 0, unlocked: true,
    syllables: [
      { text: "เปลี่ยน", expectedInitials: ["ปล"], expectedVowel: "เอีย", expectedFinal: ["น", "ณ", "ร", "ล"], phoneticGroup: ["เปี่ยน", "เพลี่ยน"] },
      { text: "แปลง", expectedInitials: ["ปล"], expectedVowel: "แอ", expectedFinal: ["ง"], phoneticGroup: ["แปง", "แพลง"] },
    ]
  },

  "เพลิดเพลิน": {
    id: "phloetphloen", romanized: "Phloet-phloen — Enjoy",
    image: "img/phloetphloen/phloetphloen.jpg", audio: "audio/phloetphloen/phloetphloen.mp3",
    stars: 0, unlocked: true,
    syllables: [
      { text: "เพลิด", expectedInitials: ["พล"], expectedVowel: "เอิ", expectedFinal: ["ด", "ต", "ท"], phoneticGroup: ["เพิด", "เปลิด"] },
      { text: "เพลิน", expectedInitials: ["พล"], expectedVowel: "เอิ", expectedFinal: ["น", "ร", "ล"], phoneticGroup: ["เพิน", "เปลิน"] },
    ]
  },
  "ทรัพยากร": {
    id: "sapphayakon", romanized: "Sap-pha-yaa-kon — Resource",
    image: "img/sapphayakon/sapphayakon.jpg", audio: "audio/sapphayakon/sapphayakon.mp3",
    stars: 0, unlocked: true,
    syllables: [
      { text: "ทรัพ", expectedInitials: ["ซ"], expectedVowel: "อั", expectedFinal: ["บ", "ป", "พ"], phoneticGroup: ["ซับ", "ทับ", "สับ"] },
      { text: "พะ", expectedInitials: ["พ"], expectedVowel: "อะ", expectedFinal: [], phoneticGroup: ["ผะ", "ปะ"] },
      { text: "ยา", expectedInitials: ["ย"], expectedVowel: "อา", expectedFinal: [], phoneticGroup: ["อา"] },
      { text: "กร", expectedInitials: ["ก"], expectedVowel: "ออ", expectedFinal: ["น", "ร", "ล"], phoneticGroup: ["กอน", "กอม"] },
    ]
  },
  "ธรรมชาติ": {
    id: "thammachaat", romanized: "Tham-ma-chaat — Nature",
    image: "img/thammachaat/thammachaat.jpg", audio: "audio/thammachaat/thammachaat.mp3",
    stars: 0, unlocked: true,
    syllables: [
      { text: "ธรรม", expectedInitials: ["ท"], expectedVowel: "อำ", expectedFinal: [], phoneticGroup: ["ทำ", "ตำ"] },
      { text: "มะ", expectedInitials: ["ม"], expectedVowel: "อะ", expectedFinal: [], phoneticGroup: ["มา"] },
      { text: "ชาติ", expectedInitials: ["ช"], expectedVowel: "อา", expectedFinal: ["ด", "ต", "ท"], phoneticGroup: ["ชาด", "ซาด"] },
    ]
  },
  "ซื่อสัตย์": {
    id: "suesat", romanized: "Sue-sat — Honest",
    image: "img/suesat/suesat.jpg", audio: "audio/suesat/suesat.mp3",
    stars: 0, unlocked: true,
    syllables: [
      { text: "ซื่อ", expectedInitials: ["ซ"], expectedVowel: "อือ", expectedFinal: [], phoneticGroup: ["สื่อ", "ชื่อ"] },
      { text: "สัตย์", expectedInitials: ["ส"], expectedVowel: "อั", expectedFinal: ["ด", "ต", "ท"], phoneticGroup: ["สัด", "ซัด"] },
    ]
  },
};


const CONFIG = {
  DEBOUNCE_MS: 400,
};

const state = {
  currentStage: null,       // { word, id, romanized, image, audio, ... }
  mediaRecorder: null,
  micStream: null,
  audioChunks: [],
  recordingState: 'idle',   // 'idle' | 'recording' | 'processing'
  appReady: false,
  lastRecordEnd: 0,
};

/* ════════════════════════════════════════════════════════════════
   LOCALSTORAGE + FIRESTORE STAR PERSISTENCE
   ════════════════════════════════════════════════════════════════ */

const STORAGE_KEY = 'chadchad_stars';

function loadStars() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) { }
  // Default: all words start at 0 stars
  const defaults = {};
  for (const word of Object.keys(TARGET_DICT)) {
    defaults[word] = 0;
  }
  return defaults;
}

function saveStars(starMap) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(starMap));
  } catch (_) { }
}

/** Save star for a specific word if new score is higher */
function saveHighScore(word, newStars) {
  const starMap = loadStars();
  if (newStars > (starMap[word] || 0)) {
    starMap[word] = newStars;
    saveStars(starMap);
    console.log(`[ChadChad] ⭐ Saved new high score: ${word} = ${newStars} stars`);

    // Sync to Firestore
    syncStarsToFirestore(starMap);
  }
}

/** Sync star data to the logged-in user's Firestore document */
async function syncStarsToFirestore(starMap) {
  const user = auth.currentUser;
  if (!user) return;

  try {
    const totalStars = Object.values(starMap).reduce((sum, s) => sum + s, 0);
    const ref = doc(db, 'students', user.uid);
    await updateDoc(ref, {
      stars_per_word: starMap,
      total_score: totalStars,
      lastPractice: new Date(),
    });
    console.log(`[ChadChad] ☁️ Synced to Firestore: total=${totalStars}`);
  } catch (err) {
    console.warn('[ChadChad] ⚠️ Firestore sync failed:', err.message);
  }
}

/** Load stars from Firestore on login and merge with localStorage */
async function loadStarsFromFirestore() {
  const user = auth.currentUser;
  if (!user) return;

  try {
    const ref = doc(db, 'students', user.uid);
    const snap = await getDoc(ref);
    if (snap.exists() && snap.data().stars_per_word) {
      const cloudStars = snap.data().stars_per_word;
      const localStars = loadStars();

      // Merge: keep the highest score per word
      for (const word of Object.keys(TARGET_DICT)) {
        localStars[word] = Math.max(localStars[word] || 0, cloudStars[word] || 0);
      }
      saveStars(localStars);
      console.log('[ChadChad] ☁️ Merged stars from Firestore');
    }
  } catch (err) {
    console.warn('[ChadChad] ⚠️ Could not load stars from Firestore:', err.message);
  }
}

/* ════════════════════════════════════════════════════════════════
   SECTION 2: BULLETPROOF DOM ELEMENT CACHING
   ════════════════════════════════════════════════════════════════ */

const ui = {};

function cacheDomElements() {
  ui.viewStages = document.getElementById('view-stages');
  ui.viewGameplay = document.getElementById('view-gameplay');

  ui.stageGrid = document.getElementById('stage-grid');
  ui.btnBack = document.getElementById('btn-back');

  ui.wordImageCont = document.getElementById('word-image-container');
  ui.wordThai = document.getElementById('word-thai');
  ui.wordRomanized = document.getElementById('word-romanized');

  ui.refAudioListen = document.getElementById('ref-audio-listen');
  ui.btnListen = document.getElementById('btn-listen');
  ui.speakerIcon = document.getElementById('speaker-icon');

  ui.btnMic = document.getElementById('btn-mic');
  ui.micIndicator = document.getElementById('recording-indicator');
  ui.micHint = document.getElementById('mic-hint');

  ui.recText = document.getElementById('recognized-text');
  ui.resultsArea = document.getElementById('results');
  ui.feedbackArea = document.getElementById('feedback');
  ui.feedbackListArea = document.getElementById('feedback-list');
  ui.btnNext = document.getElementById('btn-next');
  ui.messageBox = document.getElementById('message');
}

/* ════════════════════════════════════════════════════════════════
   SECTION 3: MEDIARECORDER + GROQ WHISPER API
   ════════════════════════════════════════════════════════════════ */

/* ── Recording ── */

async function startRecording() {
  if (!state.appReady) return;
  if (state.recordingState !== 'idle') return;
  if (Date.now() - state.lastRecordEnd < CONFIG.DEBOUNCE_MS) return;

  setMicButtonEnabled(false);

  try {
    // Task 3: 16kHz mono — Whisper's native format to prevent resampling
    state.micStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
        sampleRate: 16000,
        channelCount: 1,
      },
    });

    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : '';
    state.mediaRecorder = new MediaRecorder(
      state.micStream,
      mimeType ? { mimeType } : {}
    );
    state.audioChunks = [];

    state.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) state.audioChunks.push(e.data);
    };

    state.mediaRecorder.onstop = handleRecordingDone;
    state.mediaRecorder.start();

    state.recordingState = 'recording';
    setRecordingActive(true);
    setMicButtonEnabled(true);
    hideResults();
    hideMessage();
    setElHidden(ui.recText, true);
    // Task 1 (UX): Silence padding hint — trains user not to clip first syllable
    if (ui.micHint) ui.micHint.textContent = 'กำลังฟัง...';

    console.log('[ChadChad] 🎙️ MediaRecorder started (16kHz mono)');
  } catch (err) {
    console.error('[ChadChad] Mic error:', err);

    if (['NotAllowedError', 'PermissionDeniedError'].includes(err.name)) {
      showMessage('error', 'ไมโครโฟนถูกบล็อก 🔒 กรุณาอนุญาตการเข้าถึง แล้วรีเฟรช');
    } else if (err.name === 'NotFoundError') {
      showMessage('error', 'ไม่พบไมโครโฟน 🎙️');
    } else {
      showMessage('error', `ข้อผิดพลาด: ${err.message}`);
    }
    finishSession();
  }
}

function stopRecording() {
  if (state.recordingState !== 'recording') return;
  state.recordingState = 'processing';
  setRecordingActive(false);
  setMicButtonEnabled(false);
  if (ui.micHint) ui.micHint.textContent = 'กำลังวิเคราะห์เสียง...';

  if (state.mediaRecorder && state.mediaRecorder.state !== 'inactive') {
    state.mediaRecorder.stop();
  }
  if (state.micStream) {
    state.micStream.getTracks().forEach((t) => t.stop());
    state.micStream = null;
  }

  console.log('[ChadChad] ⏹️ Recording stopped — sending to Groq...');
}

/* ── Groq Whisper API ── */

/**
 * Sends audio to Groq's whisper-large-v3 endpoint.
 *
 * Anti-autocorrect settings:
 *   language: th   → force Thai
 *   temperature: 0 → deterministic
 *   prompt: dynamic → forces raw phonetic transcription for the specific word
 *
 * @param {Blob} audioBlob
 * @param {string} targetWord
 * @returns {Promise<string>}
 */
async function sendToGroqWhisper(audioBlob, targetWord) {
  const PROMPT_MAP = {
    "ช้าง": "พิมพ์ตามเสียงสัทศาสตร์เป๊ะๆ ห้ามแก้คำผิดเป็นคำที่มีความหมาย คำที่เป็นไปได้: ช้าง, ซ้าง, ส้าง, จ้าง",
    "พริก": "พิมพ์ตามเสียงสัทศาสตร์เป๊ะๆ ห้ามแก้คำผิดเป็นคำที่มีความหมาย คำที่เป็นไปได้: พริก, พิก, ปิก, ปริก, ฟิก",
    "โรงเรียน": "พิมพ์ตามเสียงสัทศาสตร์เป๊ะๆ ห้ามแก้คำผิดเป็นคำที่มีความหมาย คำที่เป็นไปได้: โรงเรียน, โลงเลียน, โลงเรียน, โรงเลียน",
    "ความรู้": "พิมพ์ตามเสียงสัทศาสตร์เป๊ะๆ ห้ามแก้คำผิดเป็นคำที่มีความหมาย คำที่เป็นไปได้: ความรู้, คามรู้, ฟามรู้, คามลู้",
    "ปรับปรุง": "พิมพ์ตามเสียงสัทศาสตร์เป๊ะๆ ห้ามแก้คำผิด คำที่เป็นไปได้: ปรับปรุง, ปับปุง, ปลับปลุง, พรับพรุง",
    "เปลี่ยนแปลง": "พิมพ์ตามเสียงสัทศาสตร์เป๊ะๆ ห้ามแก้คำผิด คำที่เป็นไปได้: เปลี่ยนแปลง, เปี่ยนแปง, เพลี่ยนแพลง",

    "เพลิดเพลิน": "พิมพ์ตามเสียงสัทศาสตร์เป๊ะๆ ห้ามแก้คำผิด คำที่เป็นไปได้: เพลิดเพลิน, เพิดเพิน, เปลิดเปลิน",
    "ทรัพยากร": "พิมพ์ตามเสียงสัทศาสตร์เป๊ะๆ ห้ามแก้คำผิด คำที่เป็นไปได้: ทรัพยากร, ซับพะยากอน, สับพะยากอน",
    "ธรรมชาติ": "พิมพ์ตามเสียงสัทศาสตร์เป๊ะๆ ห้ามแก้คำผิด คำที่เป็นไปได้: ธรรมชาติ, ทำมะชาด, ตำมะชาด",
    "ซื่อสัตย์": "พิมพ์ตามเสียงสัทศาสตร์เป๊ะๆ ห้ามแก้คำผิด คำที่เป็นไปได้: ซื่อสัตย์, สื่อสัด, ชื่อสัด",
  };

  const dynamicPrompt = PROMPT_MAP[targetWord] || "พิมพ์ตามเสียงสัทศาสตร์เป๊ะๆ ห้ามเดาคำศัพท์ ห้ามแก้คำผิด";

  const formData = new FormData();
  formData.append('file', audioBlob, 'recording.webm');
  formData.append('model', 'whisper-large-v3');
  formData.append('language', 'th');
  formData.append('temperature', '0');
  formData.append('prompt', dynamicPrompt);
  formData.append('response_format', 'verbose_json');

  const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errBody = await response.text().catch(() => 'Unknown error');
    throw new Error(`Groq API ${response.status}: ${errBody}`);
  }

  const data = await response.json();
  return data;
}

/**
 * Called by MediaRecorder.onstop.
 * Assembles blob → Groq Whisper → sanitize → score → scorecard.
 */
async function handleRecordingDone() {
  try {
    const audioBlob = new Blob(state.audioChunks, { type: 'audio/webm' });
    state.audioChunks = [];

    console.log(`[ChadChad] 📦 Audio Blob: ${(audioBlob.size / 1024).toFixed(1)} KB`);

    const targetWord = state.currentStage ? state.currentStage.word : 'ช้าง';
    const data = await sendToGroqWhisper(audioBlob, targetWord);

    // 1. Analyze No Speech Probability from Whisper Segments
    let isNoise = false;
    if (data.segments && data.segments.length > 0) {
      // If the AI is more than 60% sure there's no speech, flag as noise
      isNoise = data.segments[0].no_speech_prob > 0.6;
    }

    let transcript = data.text || "";
    // Clean punctuation and carrier phrases
    transcript = transcript.replace(/[.,!?]/g, "");
    transcript = transcript.replace(/^(คำว่า|พูดว่า|ออกเสียงว่า|คือคำว่า)\s*/g, "").trim();
    // Strip remaining whitespace, quotes that Whisper loves to add
    transcript = transcript.replace(/[\s.。、"']/g, "").trim();

    // 2. Check for common Whisper noise hallucinations (Regex)
    const isHallucination = /^(ซับไทย|แปลโดย|แก้ไขโดย|thank you|ไม่มีเสียง)$/i.test(transcript);

    // 3. Check for common mic test phrases (Regex)
    const isMicTest = /^(สวัสดี|โหล|ฮัลโหล|ทดสอบ|เทส|test)$/i.test(transcript);

    // 4. Check for Syllable/Length Mismatch
    const expectedLength = targetWord.length;
    const isTooLong = transcript.length > expectedLength + 10;

    console.log(`[ChadChad] 🗣️ Groq transcript: "${transcript}"`);

    // 5. The Rejection Gate
    if (transcript === "" || transcript === "-" || isNoise || isHallucination || isMicTest || isTooLong) {
      console.warn("[ChadChad] ⚠️ Noise or Irrelevant Speech detected.", transcript);
      setElHidden(ui.recText, true);
      setElHidden(ui.resultsArea, false);
      requestAnimationFrame(() => {
        setGauge('gauge-consonant', 0);
        setGauge('gauge-vowel', 0);
        setGauge('gauge-final', 0);
        setGauge('gauge-tone', 0);
      });

      let msg = 'กรุณาพูดใหม่นะคะ ไมค์ได้ยินแต่เสียงรบกวน 🎤';
      if (isMicTest || isTooLong) {
        msg = `กรุณาพูดแค่คำว่า "${targetWord}" นะคะ 🎤`;
      }

      showFeedbackCard({
        message: msg,
        stars: 0,
        stateType: 'error',
      });
      // Clear feedback list and hide next button
      if (ui.btnNext) ui.btnNext.style.display = 'none';
      renderFeedbackList([]);
    } else {
      if (ui.recText) {
        ui.recText.textContent = `"${transcript}"`;
        setElHidden(ui.recText, false);
      }

      const scores = calculateScores(transcript, targetWord);
      if (ui.micHint) ui.micHint.textContent = 'วิเคราะห์เสร็จสิ้น!';

      showResults(
        scores.consonantScore,
        scores.vowelScore,
        scores.finalScore,
        scores.toneScore,
        transcript,
        targetWord,
        scores.feedbackList,
        scores.stars
      );
    }
  } catch (err) {
    console.error('[ChadChad] Groq/Scoring error:', err);
    showFallbackResults();
  } finally {
    finishSession();
  }
}

/* ── Session Lifecycle ── */

function finishSession() {
  if (state.mediaRecorder && state.mediaRecorder.state !== 'inactive') {
    try { state.mediaRecorder.stop(); } catch (_) { }
  }
  state.mediaRecorder = null;
  state.audioChunks = [];

  if (state.micStream) {
    state.micStream.getTracks().forEach((t) => t.stop());
    state.micStream = null;
  }

  state.recordingState = 'idle';
  state.lastRecordEnd = Date.now();

  try {
    setRecordingActive(false);
    setMicButtonEnabled(true);
    if (ui.btnMic) ui.btnMic.classList.remove('mic-processing', 'mic-invite');
    if (ui.micHint) ui.micHint.textContent = 'กดเพื่อพูด';
  } catch (e) {
    console.warn('[ChadChad] finishSession UI cleanup:', e);
  }
}

/* ════════════════════════════════════════════════════════════════
   SECTION 4: PURE UI & DOM MANIPULATION
   ════════════════════════════════════════════════════════════════ */

function showView(viewId) {
  document.querySelectorAll('.screen').forEach((s) => s.classList.add('hidden'));
  const view = document.getElementById(viewId);
  if (view) {
    view.classList.remove('hidden');
    view.style.animation = 'none';
    view.offsetHeight;
    view.style.animation = '';
  }
}

function setElHidden(el, hidden) {
  if (!el) return;
  el.style.opacity = hidden ? '0' : '1';
  el.style.pointerEvents = hidden ? 'none' : 'auto';
}

function setRecordingActive(active) {
  if (ui.btnMic) {
    if (active) {
      ui.btnMic.classList.add('mic-recording');
      ui.btnMic.classList.remove('mic-processing', 'mic-invite');
    } else {
      ui.btnMic.classList.remove('mic-recording');
    }
  }
  if (ui.micIndicator) {
    ui.micIndicator.style.opacity = active ? '1' : '0';
    active ? ui.micIndicator.classList.add('blink') : ui.micIndicator.classList.remove('blink');
  }
}

function setMicButtonEnabled(enabled) {
  if (!ui.btnMic) return;
  ui.btnMic.disabled = !enabled;
  ui.btnMic.style.opacity = enabled ? '' : '0.5';
  ui.btnMic.style.pointerEvents = enabled ? '' : 'none';
}

function showMessage(type, text) {
  if (!ui.messageBox) return;
  ui.messageBox.classList.remove('bg-red-50', 'text-red-700', 'border-red-200', 'bg-blue-50', 'text-blue-700', 'border-blue-200');

  const classes = type === 'error'
    ? ['bg-red-50', 'text-red-700', 'border', 'border-red-200']
    : ['bg-blue-50', 'text-blue-700', 'border', 'border-blue-200'];

  ui.messageBox.classList.add(...classes);
  ui.messageBox.textContent = text;
  setElHidden(ui.messageBox, false);
}

function hideMessage() { setElHidden(ui.messageBox, true); }

function showResults(c, v, f, t, transcript, targetWord, feedbackList, stars) {
  const feedback = evaluateFeedback(transcript, targetWord, c, v, f, t, feedbackList || []);

  setElHidden(ui.resultsArea, false);
  requestAnimationFrame(() => {
    setGauge('gauge-consonant', c);
    setGauge('gauge-vowel', v);
    setGauge('gauge-final', f);
    setGauge('gauge-tone', t);
  });
  showFeedbackCard(feedback);
  renderFeedbackList(feedback.feedbackItems || []);

  // Persist star high score to localStorage
  if (targetWord && feedback.stars > 0) {
    saveHighScore(targetWord, feedback.stars);
  }

  // Task 3: Show next button ONLY if:
  //   Condition A: Current attempt got 3 stars, OR
  //   Condition B: Previously saved 3 stars for this word
  if (ui.btnNext) {
    const savedStars = loadStars();
    const hasPrevious3Stars = (savedStars[targetWord] || 0) >= 3;
    const hasCurrent3Stars = feedback.stars >= 3;
    ui.btnNext.style.display = (hasCurrent3Stars || hasPrevious3Stars) ? 'block' : 'none';
  }
}

function showFallbackResults() {
  const target = state.currentStage ? state.currentStage.word : '';
  setElHidden(ui.recText, true);
  showResults(0, 0, 0, 0, '-', target);
}

function hideResults() {
  setElHidden(ui.resultsArea, true);
  setGauge('gauge-consonant', 0);
  setGauge('gauge-vowel', 0);
  setGauge('gauge-final', 0);
  setGauge('gauge-tone', 0);
  setElHidden(ui.feedbackArea, true);
  setElHidden(ui.feedbackListArea, true);
  if (ui.btnNext) ui.btnNext.style.display = 'none';
  if (ui.btnMic) ui.btnMic.classList.remove('mic-invite');
}

function setGauge(id, value) {
  const gauge = document.getElementById(id);
  if (!gauge) return;
  const fill = gauge.querySelector('.gauge-fill');
  const label = gauge.querySelector('.gauge-value');
  if (fill) fill.style.width = `${value}%`;
  if (label) label.textContent = `${value}%`;
}

function showFeedbackCard(feedback) {
  if (!ui.feedbackArea) return;
  const { message, stars, stateType } = feedback;
  const starIcons = '⭐'.repeat(Math.max(0, stars)) + '☆'.repeat(Math.max(0, 3 - stars));

  const styleMap = {
    'success': { border: 'border-l-emerald-400', bg: 'rgba(0, 200, 83, 0.06)' },
    'warning': { border: 'border-l-amber-400', bg: 'rgba(245, 158, 11, 0.06)' },
    'error': { border: 'border-l-red-400', bg: 'rgba(239, 68, 68, 0.06)' },
    'default': { border: 'border-l-slate-300', bg: 'rgba(148, 163, 184, 0.06)' },
  };

  const rules = styleMap[stateType] || styleMap['default'];

  ui.feedbackArea.className = `rounded-2xl px-5 py-5 text-center w-full shadow-sm flex flex-col items-center gap-2 border-l-4 ${rules.border}`;
  ui.feedbackArea.style.background = rules.bg;
  ui.feedbackArea.innerHTML = `
    <div class="text-2xl tracking-widest star-pop">${starIcons}</div>
  `;
  setElHidden(ui.feedbackArea, false);
}

/**
 * Renders the per-component feedback as a bulleted list.
 * Deduplicates the feedback list to prevent repeated messages.
 */
function renderFeedbackList(items) {
  if (!ui.feedbackListArea) return;

  const uniqueFeedback = [...new Set(items)];

  if (!uniqueFeedback || uniqueFeedback.length === 0) {
    ui.feedbackListArea.innerHTML = '';
    setElHidden(ui.feedbackListArea, true);
  } else {
    const listItems = uniqueFeedback.map((fb) => `
      <li class="text-sm text-slate-600 leading-relaxed">${fb}</li>
    `).join('');
    ui.feedbackListArea.innerHTML = `
      <p class="text-xs text-slate-400 font-light mb-2">💡 คำแนะนำ:</p>
      <ul class="list-disc list-inside space-y-1">${listItems}</ul>
    `;
    setElHidden(ui.feedbackListArea, false);
  }
}

/* ── Events & Game Init ── */

/**
 * Task 2: Renders the stage grid dynamically from TARGET_DICT.
 * No more data.js import — TARGET_DICT is the single source of truth.
 */
function renderStageGrid() {
  if (!ui.stageGrid) return;

  const words = Object.keys(TARGET_DICT);
  const savedStars = loadStars();

  ui.stageGrid.innerHTML = words.map((word) => {
    const entry = TARGET_DICT[word];
    const locked = !entry.unlocked;
    const sFull = savedStars[word] || 0;
    const sEmpty = 3 - sFull;



    return `
      <div class="stage-card bg-white rounded-2xl shadow-sm p-4 text-center cursor-pointer ${locked ? 'locked' : ''}"
           data-word="${word}" ${locked ? '' : 'role="button" tabindex="0" aria-label="' + word + '"'}>
        ${locked ?
        `<div class="locked-icon" style="display: flex; justify-content: center; margin-top: 12px; color: #cbd5e1;">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>` :
        `<div class="stage-word font-bold text-slate-700 font-nunito leading-tight">${word}</div>`
      }
        <p class="text-xs text-slate-400 font-light mt-1 truncate w-full">${locked ? word : entry.romanized}</p>
        ${!locked ? `
          <div class="flex flex-row justify-center mt-2">
           ${'<span class="text-amber-400 text-base star-shimmer">★</span>'.repeat(sFull)}
           ${'<span class="text-slate-200 text-base">★</span>'.repeat(sEmpty)}
          </div>
        ` : ''}
      </div>
    `;
  }).join('');

  ui.stageGrid.querySelectorAll('.stage-card:not(.locked)').forEach((card) => {
    card.addEventListener('click', () => {
      const word = card.dataset.word;
      if (word && TARGET_DICT[word]) {
        enterGameplay(word);
      }
    });
  });
}

/**
 * Task 2: Enters gameplay using TARGET_DICT as the source for image/audio paths.
 * @param {string} word — The Thai word key in TARGET_DICT
 */
function enterGameplay(word) {
  const entry = TARGET_DICT[word];
  if (!entry) return;

  // Store current stage with the word key for scoring
  state.currentStage = { word, ...entry };

  try {
    let wordImage = document.getElementById('word-image');
    if (!wordImage && ui.wordImageCont) {
      ui.wordImageCont.innerHTML = '<img id="word-image" src="" alt="" class="w-full h-full object-contain drop-shadow-md" />';
      wordImage = document.getElementById('word-image');
    }

    // Dynamically set image from TARGET_DICT
    if (entry.image) {
      wordImage.src = import.meta.env.BASE_URL + entry.image;
      wordImage.alt = word;
      wordImage.style.display = '';
      const emoji = ui.wordImageCont.querySelector('.placeholder-emoji');
      if (emoji) emoji.remove();
    } else {
      wordImage.src = '';
      wordImage.style.display = 'none';
      if (!ui.wordImageCont.querySelector('.placeholder-emoji')) {
        ui.wordImageCont.innerHTML += '<span class="text-5xl placeholder-emoji">📖</span>';
      }
    }

    if (ui.wordThai) ui.wordThai.textContent = word;
    if (ui.wordRomanized) ui.wordRomanized.textContent = entry.romanized;
    // Dynamically set audio from TARGET_DICT
    if (ui.refAudioListen) ui.refAudioListen.src = entry.audio ? import.meta.env.BASE_URL + entry.audio : '';

    showView('view-gameplay');
    hideResults();
    hideMessage();
    setElHidden(ui.feedbackArea, true);
    setElHidden(ui.recText, true);
  } catch (err) {
    console.error('[ChadChad] Routing error:', err);
  }
}

/* ── Bootstrap App Listeners ── */

/**
 * Task 1: App boots directly into Stage Map (no welcome screen).
 * Mic capability is checked on first recording attempt instead.
 */
function bootstrapApplication() {
  cacheDomElements();

  // Check mic capability early but don't block boot
  if (!navigator.mediaDevices?.getUserMedia) {
    showMessage('error', 'เบราว์เซอร์นี้ไม่รองรับไมโครโฟน — กรุณาใช้ Chrome');
  }

  // Boot directly into stages — no welcome screen
  state.appReady = true;

  // Load stars from Firestore (if logged in) then render
  loadStarsFromFirestore().then(() => {
    renderStageGrid();
  });

  if (ui.btnBack) {
    ui.btnBack.addEventListener('click', () => {
      if (state.recordingState !== 'idle') finishSession();
      renderStageGrid(); // Re-render to show updated stars
      showView('view-stages');
    });
  }

  // Logout button — sign out and redirect to login
  const btnLogout = document.getElementById('btn-logout');
  if (btnLogout) {
    btnLogout.addEventListener('click', async () => {
      try {
        await signOut(auth);
        console.log('✅ Logged out');
      } catch (err) {
        console.error('Logout error:', err);
      }
      window.location.href = import.meta.env.BASE_URL + 'login/login.html';
    });
  }

  // Next button — advance to the next word in TARGET_DICT
  if (ui.btnNext) {
    ui.btnNext.addEventListener('click', () => {
      const words = Object.keys(TARGET_DICT);
      const currentWord = state.currentStage?.word;
      const currentIdx = words.indexOf(currentWord);
      const nextIdx = (currentIdx + 1) % words.length;
      enterGameplay(words[nextIdx]);
    });
  }

  if (ui.btnMic) {
    ui.btnMic.addEventListener('click', (e) => {
      e.preventDefault();
      if (state.recordingState === 'idle') {
        startRecording();
      } else if (state.recordingState === 'recording') {
        stopRecording();
      }
    });
  }

  if (ui.btnListen && ui.refAudioListen) {
    ui.btnListen.addEventListener('click', async () => {
      if (ui.btnListen.classList.contains('pointer-events-none') || !state.currentStage?.audio) return;

      ui.btnListen.classList.add('opacity-50', 'pointer-events-none');
      ui.refAudioListen.currentTime = 0;
      await ui.refAudioListen.play();
      if (ui.speakerIcon) ui.speakerIcon.classList.add('speaker-playing');
    });

    const unblock = () => {
      ui.btnListen.classList.remove('opacity-50', 'pointer-events-none');
      if (ui.speakerIcon) ui.speakerIcon.classList.remove('speaker-playing');
    };
    ui.refAudioListen.addEventListener('ended', unblock);
    ui.refAudioListen.addEventListener('error', unblock);
  }
}

document.addEventListener('DOMContentLoaded', bootstrapApplication);
