// ════════════════════════════════════════════════════════════════
// login.js — Firebase Auth: Login + Register + Google
// ════════════════════════════════════════════════════════════════

// ── นำเข้า Tailwind CSS (จำเป็นเพื่อให้ Vite ประมวลผล styles) ──
import '../style.css';

// ── นำเข้า Firebase SDK ──
import { auth, db, googleProvider } from '../firebase/config.js';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

// ════════════════════════════════════════════════════════════════
// ฟังก์ชันช่วย: ตรวจสอบและสร้าง document นักเรียนใน Firestore
// ════════════════════════════════════════════════════════════════

async function checkAndCreateUser(user) {
  try {
    const userRef = doc(db, 'students', user.email);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        name: user.displayName || 'นักเรียน',
        total_score: 0,
        createdAt: serverTimestamp(),
      });
      console.log('✅ สร้าง student document ใหม่:', user.uid);
    } else {
      console.log('📄 student document มีอยู่แล้ว:', user.uid);
    }
  } catch (err) {
    console.warn('⚠️ Firestore error (ตรวจสอบ Rules):', err.message);
  }
}

// ════════════════════════════════════════════════════════════════
// DOM Helpers — แสดง error ใน UI (ไม่ใช้ popup)
// ════════════════════════════════════════════════════════════════

const $ = (id) => document.getElementById(id);

/** แสดงข้อความ error ใน #login-error element */
function showError(msg) {
  const el = $('login-error');
  if (!el) return;
  el.textContent = msg;
  el.classList.remove('hidden');
  console.error('❌ Login Error:', msg);
}

/** ซ่อนข้อความ error */
function hideError() {
  const el = $('login-error');
  if (el) el.classList.add('hidden');
}

/** เปิด/ปิด loading state */
function setLoading(on) {
  $('login-loading')?.classList.toggle('hidden', !on);
  const btnLogin = $('btn-login');
  const btnGoogle = $('btn-google');
  const btnRegister = $('btn-register');
  if (btnLogin) { btnLogin.disabled = on; btnLogin.style.opacity = on ? '0.6' : ''; }
  if (btnGoogle) { btnGoogle.disabled = on; btnGoogle.style.opacity = on ? '0.6' : ''; }
  if (btnRegister) { btnRegister.disabled = on; btnRegister.style.opacity = on ? '0.6' : ''; }
}

// ════════════════════════════════════════════════════════════════
// Event Listeners
// ════════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {

  const btnGoogle   = document.getElementById('btn-google');
  const loginForm   = document.getElementById('login-form');
  const btnRegister = document.getElementById('btn-register');
  const emailInput  = document.getElementById('email');
  const passInput   = document.getElementById('password');

  // ────────────────────────────────────────────────────────────
  // 1. เข้าสู่ระบบด้วย Google
  // ────────────────────────────────────────────────────────────
  btnGoogle.addEventListener('click', async () => {
    hideError();
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await checkAndCreateUser(result.user);
      window.location.href = '../index.html';
    } catch (error) {
      console.error('Google login error:', error);
      setLoading(false);

      if (error.code === 'auth/popup-closed-by-user') {
        showError('คุณปิดหน้าต่าง Google ก่อนเข้าสู่ระบบ');
      } else if (error.code !== 'auth/cancelled-popup-request') {
        showError('เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วย Google');
      }
    }
  });

  // ────────────────────────────────────────────────────────────
  // 2. เข้าสู่ระบบด้วย Email/Password
  // ────────────────────────────────────────────────────────────
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError();

    const email    = emailInput.value.trim();
    const password = passInput.value;

    if (!email || !password) {
      showError('กรุณากรอกอีเมลและรหัสผ่าน');
      return;
    }

    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Login สำเร็จ:', result.user.email);
      await checkAndCreateUser(result.user);
      window.location.href = '../index.html';
    } catch (error) {
      console.error('Email login error:', error);
      setLoading(false);

      const messages = {
        'auth/user-not-found': 'ไม่พบบัญชีนี้ กรุณาตรวจสอบอีเมล',
        'auth/wrong-password': 'รหัสผ่านไม่ถูกต้อง',
        'auth/invalid-email': 'รูปแบบอีเมลไม่ถูกต้อง',
        'auth/invalid-credential': 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
        'auth/too-many-requests': 'ลองเข้าสู่ระบบหลายครั้งเกินไป กรุณารอสักครู่',
      };
      showError(messages[error.code] || 'เกิดข้อผิดพลาด กรุณาลองอีกครั้ง');
    }
  });

  // ────────────────────────────────────────────────────────────
  // 3. ไปหน้าสมัครสมาชิก
  // ────────────────────────────────────────────────────────────
  btnRegister.addEventListener('click', () => {
    window.location.href = '../register/register.html';
  });

  // ────────────────────────────────────────────────────────────
  // 4. ไปหน้าผู้ดูแลระบบ (Admin)
  // ────────────────────────────────────────────────────────────
  const btnAdmin = document.getElementById('btn-admin');
  if (btnAdmin) {
    btnAdmin.addEventListener('click', () => {
      window.location.href = '../admin/admin.html';
    });
  }
});
