import{a as e,c as t,h as n,l as r,n as i,s as a,t as o}from"./config-C-jM1Y5x.js";var s=e=>document.getElementById(e),c=[`ช้าง`,`พริก`,`โรงเรียน`,`ความรู้`,`ปรับปรุง`,`เปลี่ยนแปลง`,`เพลิดเพลิน`,`ทรัพยากร`,`ธรรมชาติ`,`ซื่อสัตย์`];function l(e){document.querySelectorAll(`.admin-view`).forEach(e=>e.classList.add(`hidden`));let t=s(e);t&&(t.classList.remove(`hidden`),t.style.animation=`none`,t.offsetHeight,t.style.animation=``)}async function u(){let n=s(`students-table-body`),r=s(`empty-state`);if(n)try{let a=await e(t(i,`students`)),o=[];a.forEach(e=>{o.push({id:e.id,...e.data()})}),o.sort((e,t)=>(t.total_score||0)-(e.total_score||0)),s(`stat-students`).textContent=o.length,s(`student-count-badge`).textContent=`${o.length} คน`;let l=o.filter(e=>e.stars_per_word&&Object.values(e.stars_per_word).some(e=>e>0)).length;if(s(`stat-active`).textContent=l,o.length>0){let e=o.map(e=>e.total_score||0),t=e.reduce((e,t)=>e+t,0)/e.length,n=Math.max(...e);Math.min(...e),s(`stat-avg-score`).textContent=Math.round(t),s(`stat-highest`).textContent=n;let r=e.filter(e=>e>=20).length,i=e.filter(e=>e>=10&&e<20).length,a=e.filter(e=>e<10).length,c=o.length;s(`dist-high-count`).textContent=`${r} คน (${Math.round(r/c*100)}%)`,s(`dist-mid-count`).textContent=`${i} คน (${Math.round(i/c*100)}%)`,s(`dist-low-count`).textContent=`${a} คน (${Math.round(a/c*100)}%)`,requestAnimationFrame(()=>{s(`dist-high-bar`).style.width=`${Math.max(r/c*100,r>0?8:0)}%`,s(`dist-mid-bar`).style.width=`${Math.max(i/c*100,i>0?8:0)}%`,s(`dist-low-bar`).style.width=`${Math.max(a/c*100,a>0?8:0)}%`}),d(o)}else s(`stat-avg-score`).textContent=`0`,s(`stat-highest`).textContent=`0`;if(o.length===0){n.innerHTML=``,r.classList.remove(`hidden`);return}r.classList.add(`hidden`),n.innerHTML=o.map((e,t)=>{let n=e.stars_per_word||{},r=c.map(e=>{let t=n[e]||0,r=3-t;return`<span class="inline-flex items-center justify-between gap-1 text-[10px] px-2 py-0.5 rounded border border-transparent w-[90px] ${t>=3?`bg-emerald-50 text-emerald-600 border-emerald-100`:t>=1?`bg-amber-50 text-amber-600 border-amber-100`:`bg-slate-50 text-slate-400 border-slate-100`}"><span class="font-medium truncate">${e}</span><span class="shrink-0">${`⭐`.repeat(t)}${`<span class="opacity-20 grayscale">⭐</span>`.repeat(r)}</span></span>`}).join(``);return`
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
    `}).join(``),console.log(`[Admin] 📋 Loaded ${o.length} students`)}catch(e){console.error(`[Admin] ❌ Failed to load students:`,e),n.innerHTML=`
      <tr>
        <td colspan="4" class="px-6 py-8 text-center text-red-400 text-sm">
          ❌ ไม่สามารถโหลดข้อมูลนักเรียนได้: ${e.message}
        </td>
      </tr>
    `}}function d(e){let t=s(`word-analytics`);t&&(t.innerHTML=[...c.map(t=>{let n=0,r=0,i=0;e.forEach(e=>{let a=e.stars_per_word?.[t]||0;a>0&&(r++,n+=a,a>=3&&i++)});let a=r>0?n/r:0;return{word:t,practiced:r,avgStars:a,perfect:i,totalStudents:e.length}})].sort((e,t)=>e.avgStars-t.avgStars).map(e=>{e.totalStudents>0&&e.practiced/e.totalStudents*100;let t=e.avgStars/3*100,n=e.avgStars>=2.5?`ง่าย`:e.avgStars>=1.5?`ปานกลาง`:e.avgStars>0?`ยาก`:`ยังไม่มีข้อมูล`,r=e.avgStars>=2.5?`text-emerald-600 bg-emerald-50`:e.avgStars>=1.5?`text-amber-600 bg-amber-50`:e.avgStars>0?`text-rose-600 bg-rose-50`:`text-slate-400 bg-slate-50`;return`
      <div class="grid py-3 border-b border-slate-50 last:border-0 items-center min-w-[500px]" style="grid-template-columns: 7rem 1fr 5rem 5rem 5.5rem;">
        <span class="text-sm font-semibold text-slate-700 truncate pr-2">${e.word}</span>
        <div class="px-2">
          <div class="h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div class="h-full rounded-full bg-gradient-to-r from-indigo-400 to-indigo-500 transition-all duration-1000" style="width: ${t}%"></div>
          </div>
        </div>
        <span class="text-sm text-slate-500 text-right tabular-nums pr-4">${e.avgStars.toFixed(1)} ⭐</span>
        <span class="text-xs text-slate-500 text-right tabular-nums pr-4">${e.practiced}/${e.totalStudents}</span>
        <div class="flex justify-center">
          <span class="text-[10px] px-2 py-0.5 rounded-full font-medium text-center whitespace-nowrap min-w-[4.5rem] ${r}">${n}</span>
        </div>
      </div>
    `}).join(``))}function f(){let e=s(`btn-logout`);e&&e.addEventListener(`click`,async e=>{e.preventDefault();try{await n(o),console.log(`[Admin] ✅ Logged out`)}catch(e){console.error(`[Admin] Logout error:`,e)}window.location.href=`../login/login.html`})}function p(){let n=s(`btn-reset-stars`);n&&n.addEventListener(`click`,async o=>{if(o.preventDefault(),confirm(`⚠️ ยืนยันการรีเซ็ตคะแนนดาวของนักเรียน "ทุกคน" หรือไม่?\\nการกระทำนี้ไม่สามารถย้อนกลับได้`))try{n.style.opacity=`0.5`,n.style.pointerEvents=`none`;let o=await e(t(i,`students`)),s=[];o.forEach(e=>{let t=r(i,`students`,e.id);s.push(a(t,{stars_per_word:{},total_score:0}))}),await Promise.all(s),alert(`✅ รีเซ็ตคะแนนนักเรียนทุกคนสำเร็จ!`),u()}catch(e){console.error(`[Admin] Reset stars error:`,e),alert(`เกิดข้อผิดพลาดในการรีเซ็ตคะแนน`)}finally{n.style.opacity=`1`,n.style.pointerEvents=`auto`}})}function m(){f(),p(),l(`view-dashboard`),u()}document.addEventListener(`DOMContentLoaded`,m);