import{t as e}from"./data-BftlPpws.js";var t=Object.keys(e).map(t=>({id:e[t].id||Date.now().toString(),word:t,image:`../`+e[t].image,audio:`../`+e[t].audioListen})),n={students:124,avgAge:8.5,totalWords:t.length},r={labels:[`จันทร์`,`อังคาร`,`พุธ`,`พฤหัสฯ`,`ศุกร์`,`เสาร์`,`อาทิตย์`],data:[45,52,38,65,48,85,92]},i=[{word:`ช้าง`,score:`95%`},{word:`ปลา`,score:`92%`},{word:`แมว`,score:`89%`}],a=[{word:`ความรู้`,score:`42%`},{word:`โรงเรียน`,score:`48%`},{word:`พริก`,score:`55%`}];document.addEventListener(`DOMContentLoaded`,()=>{o()});function o(){document.getElementById(`stat-students`).textContent=n.students,document.getElementById(`stat-age`).textContent=n.avgAge,s(),c(),l(`list-high-success`,i,`text-emerald-500`,`bg-emerald-400`),l(`list-high-failure`,a,`text-rose-500`,`bg-rose-400`),u(),document.getElementById(`addWordForm`).addEventListener(`submit`,d)}function s(){document.getElementById(`stat-words`).textContent=t.length}function c(){let e=document.getElementById(`trainingChart`).getContext(`2d`),t=e.createLinearGradient(0,0,0,400);t.addColorStop(0,`rgba(99, 102, 241, 0.5)`),t.addColorStop(1,`rgba(99, 102, 241, 0.0)`),new Chart(e,{type:`line`,data:{labels:r.labels,datasets:[{label:`จำนวนการฝึกออกเสียง (ครั้ง)`,data:r.data,borderColor:`#6366f1`,backgroundColor:t,borderWidth:3,pointBackgroundColor:`#ffffff`,pointBorderColor:`#6366f1`,pointBorderWidth:2,pointRadius:4,pointHoverRadius:6,fill:!0,tension:.4}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!1}},scales:{y:{beginAtZero:!0,grid:{color:`#f1f5f9`,drawBorder:!1}},x:{grid:{display:!1,drawBorder:!1}}}}})}function l(e,t,n,r){let i=document.getElementById(e);i.innerHTML=t.map(e=>`
    <li class="block mb-4 last:mb-0">
      <div class="flex justify-between items-center text-sm font-semibold mb-1 text-slate-700">
        <span>${e.word}</span>
        <span class="${n}">${e.score}</span>
      </div>
      <div class="w-full bg-slate-100 rounded-full h-2">
        <div class="${r} h-2 rounded-full" style="width: ${e.score}"></div>
      </div>
    </li>
  `).join(``)}function u(){let e=document.getElementById(`words-table-body`);if(t.length===0){e.innerHTML=`<tr><td colspan="4" class="py-8 text-center text-slate-500">ไม่มีคำศัพท์ในระบบ</td></tr>`;return}e.innerHTML=t.map((e,t)=>`
    <tr class="border-b border-slate-100 hover:bg-slate-50 transition-colors">
      <td class="py-4 px-6">
        <div class="w-16 h-12 rounded-lg bg-slate-200 overflow-hidden shadow-sm">
          <img src="${e.image}" alt="${e.word}" class="w-full h-full object-cover">
        </div>
      </td>
      <td class="py-4 px-6 font-medium text-slate-800 text-lg">${e.word}</td>
      <td class="py-4 px-6">
        <audio controls class="h-8 w-48">
          <source src="${e.audio}" type="audio/mpeg">
        </audio>
      </td>
      <td class="py-4 px-6 text-center">
        <button onclick="window.deleteWord('${e.id}')" class="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-2 rounded-lg transition-colors" title="ลบ">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
        </button>
      </td>
    </tr>
  `).join(``)}window.deleteWord=function(e){confirm(`คุณแน่ใจหรือไม่ที่จะลบคำศัพท์นี้?`)&&(t=t.filter(t=>t.id!==e),u(),s())};function d(e){e.preventDefault();let n=document.getElementById(`inputWord`).value,r=document.getElementById(`inputImage`).files[0],i=document.getElementById(`inputAudio`).files[0];if(!n||!r||!i){alert(`กรุณากรอกข้อมูลให้ครบถ้วน`);return}let a={id:Date.now().toString(),word:n,image:URL.createObjectURL(r),audio:URL.createObjectURL(i)};t.push(a),document.getElementById(`addWordForm`).reset(),document.getElementById(`addWordModal`).classList.add(`hidden`),u(),s()}