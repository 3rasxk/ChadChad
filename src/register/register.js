// ════════════════════════════════════════════════════════════════
// register.js — Firebase Auth: สร้างบัญชีใหม่
// ════════════════════════════════════════════════════════════════

// ── นำเข้า Tailwind CSS (จำเป็นเพื่อให้ Vite ประมวลผล styles) ──
import '../style.css';

// ── นำเข้า Firebase SDK ──
import { auth, db } from '../firebase/config.js';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

// ════════════════════════════════════════════════════════════════
// DOM Helpers
// ════════════════════════════════════════════════════════════════

const $ = (id) => document.getElementById(id);

/** แสดงข้อความ error ใน #register-error element */
function showError(msg) {
  const el = $('register-error');
  const successEl = $('register-success');
  if (successEl) successEl.classList.add('hidden');
  if (!el) return;
  el.textContent = msg;
  el.classList.remove('hidden');
  console.error('❌ Register Error:', msg);
}

/** แสดงข้อความ success */
function showSuccess(msg) {
  const el = $('register-success');
  const errorEl = $('register-error');
  if (errorEl) errorEl.classList.add('hidden');
  if (!el) return;
  el.textContent = msg;
  el.classList.remove('hidden');
}

/** ซ่อนข้อความ error & success */
function hideMessages() {
  $('register-error')?.classList.add('hidden');
  $('register-success')?.classList.add('hidden');
}

/** เปิด/ปิด loading state */
function setLoading(on) {
  $('register-loading')?.classList.toggle('hidden', !on);
  const btnSubmit = $('btn-submit-register');
  const btnBack = $('btn-back-login');
  if (btnSubmit) { btnSubmit.disabled = on; btnSubmit.style.opacity = on ? '0.6' : ''; }
  if (btnBack) { btnBack.disabled = on; btnBack.style.opacity = on ? '0.6' : ''; }
}

// ════════════════════════════════════════════════════════════════
// Event Listeners
// ════════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {

  const registerForm = document.getElementById('register-form');
  const btnBackLogin = document.getElementById('btn-back-login');

  // ────────────────────────────────────────────────────────────
  // 1. กลับไปหน้า Login
  // ────────────────────────────────────────────────────────────
  btnBackLogin.addEventListener('click', () => {
    window.location.href = '../login/login.html';
  });

  // ────────────────────────────────────────────────────────────
  // 2. สมัครสมาชิกใหม่
  // ────────────────────────────────────────────────────────────
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideMessages();

    const name     = $('reg-name').value.trim();
    const email    = $('reg-email').value.trim();
    const password = $('reg-password').value;
    const confirm  = $('reg-confirm-password').value;

    // ── Validation ──
    if (!name || !email || !password || !confirm) {
      showError('กรุณากรอกข้อมูลให้ครบทุกช่อง');
      return;
    }

    if (password.length < 6) {
      showError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      return;
    }

    if (password !== confirm) {
      showError('รหัสผ่านไม่ตรงกัน กรุณากรอกใหม่');
      return;
    }

    // ── สร้างบัญชี ──
    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);

      // อัพเดทชื่อผู้ใช้
      await updateProfile(result.user, { displayName: name });

      // สร้าง document นักเรียนใน Firestore (ไม่ block การสมัครถ้า rules บล็อก)
      try {
        const userRef = doc(db, 'students', result.user.email);
        await setDoc(userRef, {
          uid: result.user.uid,
          email: result.user.email,
          name: name,
          total_score: 0,
          createdAt: serverTimestamp(),
        });
        console.log('✅ สร้าง student document สำเร็จ:', result.user.email);
      } catch (fsErr) {
        console.warn('⚠️ Firestore write skipped (ตรวจสอบ Rules):', fsErr.message);
      }

      console.log('✅ สมัครสมาชิกสำเร็จ:', result.user.email);
      showSuccess('สมัครสมาชิกสำเร็จ! กำลังไปหน้าเข้าสู่ระบบ...');

      // รอ 1.5 วินาทีแล้วกลับไปหน้า login
      setTimeout(() => {
        window.location.href = '../login/login.html';
      }, 1500);

    } catch (error) {
      console.error('Register error:', error);
      setLoading(false);

      const messages = {
        'auth/email-already-in-use': 'อีเมลนี้ถูกใช้งานแล้ว',
        'auth/weak-password': 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร',
        'auth/invalid-email': 'รูปแบบอีเมลไม่ถูกต้อง',
        'auth/too-many-requests': 'ลองหลายครั้งเกินไป กรุณารอสักครู่',
      };
      showError(messages[error.code] || 'เกิดข้อผิดพลาดในการสมัครสมาชิก');
    }
  });
});
