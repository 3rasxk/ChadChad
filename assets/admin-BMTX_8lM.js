import{a as e,c as t,m as n,n as r,t as i}from"./config-CIpbnUll.js";var a=e=>document.getElementById(e),o=[`ช้าง`,`พริก`,`โรงเรียน`,`ความรู้`,`ปรับปรุง`,`เปลี่ยนแปลง`,`เพลิดเพลิน`,`ทรัพยากร`,`ธรรมชาติ`,`ซื่อสัตย์`];function s(e){document.querySelectorAll(`.admin-view`).forEach(e=>e.classList.add(`hidden`));let t=a(e);t&&(t.classList.remove(`hidden`),t.style.animation=`none`,t.offsetHeight,t.style.animation=``)}async function c(){let n=a(`students-table-body`),i=a(`empty-state`);if(n)try{let s=await e(t(r,`students`)),c=[];s.forEach(e=>{c.push({id:e.id,...e.data()})}),c.sort((e,t)=>(t.total_score||0)-(e.total_score||0)),a(`stat-students`).textContent=c.length,a(`student-count-badge`).textContent=`${c.length} คน`;let u=c.filter(e=>e.stars_per_word&&Object.values(e.stars_per_word).some(e=>e>0)).length;if(a(`stat-active`).textContent=u,c.length>0){let e=c.map(e=>e.total_score||0),t=e.reduce((e,t)=>e+t,0)/e.length,n=Math.max(...e);Math.min(...e),a(`stat-avg-score`).textContent=Math.round(t),a(`stat-highest`).textContent=n;let r=e.filter(e=>e>=20).length,i=e.filter(e=>e>=10&&e<20).length,o=e.filter(e=>e<10).length,s=c.length;a(`dist-high-count`).textContent=`${r} คน (${Math.round(r/s*100)}%)`,a(`dist-mid-count`).textContent=`${i} คน (${Math.round(i/s*100)}%)`,a(`dist-low-count`).textContent=`${o} คน (${Math.round(o/s*100)}%)`,requestAnimationFrame(()=>{a(`dist-high-bar`).style.width=`${Math.max(r/s*100,r>0?8:0)}%`,a(`dist-mid-bar`).style.width=`${Math.max(i/s*100,i>0?8:0)}%`,a(`dist-low-bar`).style.width=`${Math.max(o/s*100,o>0?8:0)}%`}),l(c)}else a(`stat-avg-score`).textContent=`0`,a(`stat-highest`).textContent=`0`;if(c.length===0){n.innerHTML=``,i.classList.remove(`hidden`);return}i.classList.add(`hidden`),n.innerHTML=c.map((e,t)=>{let n=e.stars_per_word||{},r=o.map(e=>{let t=n[e]||0;return`<span class="inline-flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded ${t>=3?`bg-emerald-50 text-emerald-600`:t>=1?`bg-amber-50 text-amber-600`:`bg-slate-50 text-slate-300`}">${e} ${`⭐`.repeat(t)}</span>`}).join(` `);return`
      <tr class="table-row border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
        <td class="px-6 py-4 text-slate-400 font-light">${t+1}</td>
        <td class="px-6 py-4">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
              ${(e.name||`?`).charAt(0).toUpperCase()}
            </div>
            <div>
              <span class="font-medium text-slate-700 block">${e.name||`ไม่ระบุชื่อ`}</span>
              <span class="text-xs text-slate-400">${e.email||`-`}</span>
            </div>
          </div>
        </td>
        <td class="px-6 py-4">
          <div class="flex flex-wrap gap-1">${r}</div>
        </td>
        <td class="px-6 py-4 text-right">
          <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${(e.total_score||0)>=20?`bg-emerald-50 text-emerald-700`:(e.total_score||0)>=10?`bg-amber-50 text-amber-700`:`bg-slate-100 text-slate-500`}">
            ⭐ ${e.total_score||0}
          </span>
        </td>
      </tr>
    `}).join(``),console.log(`[Admin] 📋 Loaded ${c.length} students`)}catch(e){console.error(`[Admin] ❌ Failed to load students:`,e),n.innerHTML=`
      <tr>
        <td colspan="4" class="px-6 py-8 text-center text-red-400 text-sm">
          ❌ ไม่สามารถโหลดข้อมูลนักเรียนได้: ${e.message}
        </td>
      </tr>
    `}}function l(e){let t=a(`word-analytics`);t&&(t.innerHTML=[...o.map(t=>{let n=0,r=0,i=0;e.forEach(e=>{let a=e.stars_per_word?.[t]||0;a>0&&(r++,n+=a,a>=3&&i++)});let a=r>0?n/r:0;return{word:t,practiced:r,avgStars:a,perfect:i,totalStudents:e.length}})].sort((e,t)=>e.avgStars-t.avgStars).map(e=>{e.totalStudents>0&&e.practiced/e.totalStudents*100;let t=e.avgStars/3*100,n=e.avgStars>=2.5?`ง่าย`:e.avgStars>=1.5?`ปานกลาง`:e.avgStars>0?`ยาก`:`ยังไม่มีข้อมูล`,r=e.avgStars>=2.5?`text-emerald-600 bg-emerald-50`:e.avgStars>=1.5?`text-amber-600 bg-amber-50`:e.avgStars>0?`text-rose-600 bg-rose-50`:`text-slate-400 bg-slate-50`;return`
      <div class="grid py-3 border-b border-slate-50 last:border-0 items-center" style="grid-template-columns: 7rem 1fr 5rem 5rem 5.5rem;">
        <span class="text-base font-semibold text-slate-700 truncate">${e.word}</span>
        <div class="px-2">
          <div class="h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div class="h-full rounded-full bg-gradient-to-r from-indigo-400 to-indigo-500 transition-all duration-1000" style="width: ${t}%"></div>
          </div>
        </div>
        <span class="text-sm text-slate-500 text-right tabular-nums">${e.avgStars.toFixed(1)} ⭐</span>
        <span class="text-xs text-slate-500 text-right tabular-nums">${e.practiced}/${e.totalStudents} คน</span>
        <span class="text-xs px-2 py-0.5 rounded-full font-medium text-center ${r}">${n}</span>
      </div>
    `}).join(``))}function u(){let e=a(`btn-logout`);e&&e.addEventListener(`click`,async e=>{e.preventDefault();try{await n(i),console.log(`[Admin] ✅ Logged out`)}catch(e){console.error(`[Admin] Logout error:`,e)}window.location.href=`../login/login.html`})}function d(){u(),s(`view-dashboard`),c()}document.addEventListener(`DOMContentLoaded`,d);