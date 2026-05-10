import '../style.css';
import { auth, db } from '../firebase/config.js';
import { signOut } from 'firebase/auth';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';

/* ════════════════════════════════════════════════════════════════
   DOM HELPERS
   ════════════════════════════════════════════════════════════════ */

const $ = (id) => document.getElementById(id);

// All vocabulary words in the system
const WORD_LIST = ['ช้าง', 'พริก', 'โรงเรียน', 'ความรู้', 'ปรับปรุง', 'เปลี่ยนแปลง', 'เพลิดเพลิน', 'ทรัพยากร', 'ธรรมชาติ', 'ซื่อสัตย์'];

/* ════════════════════════════════════════════════════════════════
   VIEW MANAGEMENT
   ════════════════════════════════════════════════════════════════ */

function showView(viewId) {
  document.querySelectorAll('.admin-view').forEach((v) => v.classList.add('hidden'));
  const view = $(viewId);
  if (view) {
    view.classList.remove('hidden');
    view.style.animation = 'none';
    view.offsetHeight;
    view.style.animation = '';
  }
}

/* ════════════════════════════════════════════════════════════════
   STUDENT TABLE + ANALYTICS — fetch from Firestore
   ════════════════════════════════════════════════════════════════ */

async function loadStudents() {
  const tbody = $('students-table-body');
  const emptyState = $('empty-state');
  if (!tbody) return;

  try {
    const snapshot = await getDocs(collection(db, 'students'));

    const students = [];
    snapshot.forEach((docSnap) => {
      students.push({ id: docSnap.id, ...docSnap.data() });
    });

    // Sort by total_score descending
    students.sort((a, b) => (b.total_score || 0) - (a.total_score || 0));

    // ── Basic Stats ──
    $('stat-students').textContent = students.length;
    $('student-count-badge').textContent = `${students.length} คน`;

    // Count students who have practiced (have stars_per_word)
    const activePracticers = students.filter(s => s.stars_per_word && Object.values(s.stars_per_word).some(v => v > 0)).length;
    $('stat-active').textContent = activePracticers;

    if (students.length > 0) {
      const scores = students.map((s) => s.total_score || 0);
      const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
      const highest = Math.max(...scores);
      const lowest = Math.min(...scores);

      $('stat-avg-score').textContent = Math.round(avg);
      $('stat-highest').textContent = highest;

      // ── Score Distribution ──
      const highCount = scores.filter((s) => s >= 20).length;
      const midCount = scores.filter((s) => s >= 10 && s < 20).length;
      const lowCount = scores.filter((s) => s < 10).length;
      const total = students.length;

      $('dist-high-count').textContent = `${highCount} คน (${Math.round((highCount / total) * 100)}%)`;
      $('dist-mid-count').textContent = `${midCount} คน (${Math.round((midCount / total) * 100)}%)`;
      $('dist-low-count').textContent = `${lowCount} คน (${Math.round((lowCount / total) * 100)}%)`;

      requestAnimationFrame(() => {
        $('dist-high-bar').style.width = `${Math.max((highCount / total) * 100, highCount > 0 ? 8 : 0)}%`;
        $('dist-mid-bar').style.width = `${Math.max((midCount / total) * 100, midCount > 0 ? 8 : 0)}%`;
        $('dist-low-bar').style.width = `${Math.max((lowCount / total) * 100, lowCount > 0 ? 8 : 0)}%`;
      });

      // ── Per-Word Analytics ──
      renderWordAnalytics(students);
    } else {
      $('stat-avg-score').textContent = '0';
      $('stat-highest').textContent = '0';
    }

    // ── Render Table ──
    if (students.length === 0) {
      tbody.innerHTML = '';
      emptyState.classList.remove('hidden');
      return;
    }

    emptyState.classList.add('hidden');
    tbody.innerHTML = students.map((s, i) => {
      // Build per-word stars display
      const starsPerWord = s.stars_per_word || {};
      const wordStarsHTML = WORD_LIST.map(w => {
        const wStars = starsPerWord[w] || 0;
        const emptyStars = 3 - wStars;
        return `<span class="inline-flex items-center justify-between gap-1 text-[10px] px-2 py-0.5 rounded border border-transparent w-[90px] ${
          wStars >= 3 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
          wStars >= 1 ? 'bg-amber-50 text-amber-600 border-amber-100' :
          'bg-slate-50 text-slate-400 border-slate-100'
        }"><span class="font-medium truncate">${w}</span><span class="shrink-0">${'⭐'.repeat(wStars)}${'<span class="opacity-20 grayscale">⭐</span>'.repeat(emptyStars)}</span></span>`;
      }).join('');

      return `
      <tr class="table-row border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
        <td class="px-6 py-4 text-slate-400 font-light">${i + 1}</td>
        <td class="px-6 py-4">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
              ${(s.name || '?').charAt(0).toUpperCase()}
            </div>
            <div>
              <span class="font-medium text-slate-700 block">${s.name || 'ไม่ระบุชื่อ'}</span>
              <span class="text-xs text-slate-400">${s.email || '-'}</span>
            </div>
          </div>
        </td>
        <td class="px-6 py-4">
          <div class="flex flex-wrap gap-1">${wordStarsHTML}</div>
        </td>
        <td class="px-6 py-4 text-right">
          <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
            (s.total_score || 0) >= 20 ? 'bg-emerald-50 text-emerald-700' :
            (s.total_score || 0) >= 10 ? 'bg-amber-50 text-amber-700' :
            'bg-slate-100 text-slate-500'
          }">
            ⭐ ${s.total_score || 0}
          </span>
        </td>
      </tr>
    `}).join('');

    console.log(`[Admin] 📋 Loaded ${students.length} students`);

  } catch (err) {
    console.error('[Admin] ❌ Failed to load students:', err);
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="px-6 py-8 text-center text-red-400 text-sm">
          ❌ ไม่สามารถโหลดข้อมูลนักเรียนได้: ${err.message}
        </td>
      </tr>
    `;
  }
}

/* ════════════════════════════════════════════════════════════════
   PER-WORD ANALYTICS
   ════════════════════════════════════════════════════════════════ */

function renderWordAnalytics(students) {
  const container = $('word-analytics');
  if (!container) return;

  const wordStats = WORD_LIST.map(word => {
    let totalStars = 0;
    let practiced = 0;
    let perfect = 0;

    students.forEach(s => {
      const stars = s.stars_per_word?.[word] || 0;
      if (stars > 0) {
        practiced++;
        totalStars += stars;
        if (stars >= 3) perfect++;
      }
    });

    const avgStars = practiced > 0 ? (totalStars / practiced) : 0;
    return { word, practiced, avgStars, perfect, totalStudents: students.length };
  });

  // Sort by avg stars ascending (hardest first)
  const sorted = [...wordStats].sort((a, b) => a.avgStars - b.avgStars);

  container.innerHTML = sorted.map(ws => {
    const pct = ws.totalStudents > 0 ? (ws.practiced / ws.totalStudents) * 100 : 0;
    const starPct = (ws.avgStars / 3) * 100;
    const difficulty = ws.avgStars >= 2.5 ? 'ง่าย' : ws.avgStars >= 1.5 ? 'ปานกลาง' : ws.avgStars > 0 ? 'ยาก' : 'ยังไม่มีข้อมูล';
    const diffColor = ws.avgStars >= 2.5 ? 'text-emerald-600 bg-emerald-50' : ws.avgStars >= 1.5 ? 'text-amber-600 bg-amber-50' : ws.avgStars > 0 ? 'text-rose-600 bg-rose-50' : 'text-slate-400 bg-slate-50';

    return `
      <div class="grid py-3 border-b border-slate-50 last:border-0 items-center min-w-[500px]" style="grid-template-columns: 7rem 1fr 5rem 5rem 5.5rem;">
        <span class="text-sm font-semibold text-slate-700 truncate pr-2">${ws.word}</span>
        <div class="px-2">
          <div class="h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div class="h-full rounded-full bg-gradient-to-r from-indigo-400 to-indigo-500 transition-all duration-1000" style="width: ${starPct}%"></div>
          </div>
        </div>
        <span class="text-sm text-slate-500 text-right tabular-nums pr-4">${ws.avgStars.toFixed(1)} ⭐</span>
        <span class="text-xs text-slate-500 text-right tabular-nums pr-4">${ws.practiced}/${ws.totalStudents}</span>
        <div class="flex justify-center">
          <span class="text-[10px] px-2 py-0.5 rounded-full font-medium text-center whitespace-nowrap min-w-[4.5rem] ${diffColor}">${difficulty}</span>
        </div>
      </div>
    `;
  }).join('');
}

/* ════════════════════════════════════════════════════════════════
   LOGOUT — sign out and redirect to login
   ════════════════════════════════════════════════════════════════ */

function setupLogout() {
  const btn = $('btn-logout');
  if (!btn) return;

  btn.addEventListener('click', async (e) => {
    e.preventDefault();
    try {
      await signOut(auth);
      console.log('[Admin] ✅ Logged out');
    } catch (err) {
      console.error('[Admin] Logout error:', err);
    }
    window.location.href = '../login/login.html';
  });
}

function setupResetStars() {
  const btn = $('btn-reset-stars');
  if (!btn) return;

  btn.addEventListener('click', async (e) => {
    e.preventDefault();
    if (!confirm('⚠️ ยืนยันการรีเซ็ตคะแนนดาวของนักเรียน "ทุกคน" หรือไม่?\\nการกระทำนี้ไม่สามารถย้อนกลับได้')) return;
    
    try {
      btn.style.opacity = '0.5';
      btn.style.pointerEvents = 'none';
      
      const snapshot = await getDocs(collection(db, 'students'));
      const updatePromises = [];
      snapshot.forEach((docSnap) => {
        const ref = doc(db, 'students', docSnap.id);
        updatePromises.push(updateDoc(ref, {
          stars_per_word: {},
          total_score: 0
        }));
      });
      
      await Promise.all(updatePromises);
      alert('✅ รีเซ็ตคะแนนนักเรียนทุกคนสำเร็จ!');
      loadStudents(); // Reload the table
    } catch (err) {
      console.error('[Admin] Reset stars error:', err);
      alert('เกิดข้อผิดพลาดในการรีเซ็ตคะแนน');
    } finally {
      btn.style.opacity = '1';
      btn.style.pointerEvents = 'auto';
    }
  });
}

/* ════════════════════════════════════════════════════════════════
   INIT
   ════════════════════════════════════════════════════════════════ */

function init() {
  setupLogout();
  setupResetStars();
  showView('view-dashboard');
  loadStudents();
}

document.addEventListener('DOMContentLoaded', init);
