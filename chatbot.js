let KB=[];
let DRUGS=[];

const CATEGORIES=["孕期與嬰兒", "兒童青少年", "成人體位", "肥胖與健康", "安全減重", "飲食與活動", "心理與維持", "藥物與手術", "高齡體重管理"];
const OFFICIAL='https://health99.hpa.gov.tw/health99/HealthEducation/Detail/8681?nodeId=12';
const EMERGENCY=['胸痛','呼吸困難','喘不過氣','昏倒','昏厥','意識不清','抽搐','吐血','黑便','持續嘔吐','吐不停'];
function norm(s){return(s||'').toLowerCase().replace(/[\s，。！？、：；,.!?;:()（）\-_/]/g,'');}
function esc(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));}
function msg(t,me=false){const c=document.getElementById('chat'),w=document.createElement('div');w.className='msg '+(me?'me':'bot');if(!me){const f=document.createElement('div');f.className='face';f.textContent='聊';w.appendChild(f)}const b=document.createElement('div');b.className='bubble';b.textContent=t;w.appendChild(b);c.appendChild(w);c.scrollTop=c.scrollHeight;}
function factCard(item){const c=document.getElementById('chat'),d=document.createElement('div');d.className='factCard';d.innerHTML='<div class="factTitle">📖 2024 冊子重點</div><div class="factBody">'+esc(item.core)+'</div><div class="sourceQ"><b>對應官方 '+esc(item.id)+'</b><span>｜'+esc(item.cat)+'</span><a href="'+OFFICIAL+'" target="_blank" rel="noopener">查看國健署原始資料</a></div>';c.appendChild(d);}
function actionCard(t){const c=document.getElementById('chat'),d=document.createElement('div');d.className='actionCard';d.innerHTML='<div class="actionTitle">你可以先這樣做</div><div class="actionBody">'+esc(t)+'</div>';c.appendChild(d);}
function relatedFor(item){const n=parseInt(item.id.slice(1));let arr=[];for(let delta of [-2,-1,1,2,3]){const q=n+delta;if(q>=1&&q<=KB.length){const x=KB[q-1];if(x.cat===item.cat)arr.push(x)}}if(arr.length<3){for(const x of KB){if(x.cat===item.cat&&x.id!==item.id&&!arr.some(y=>y.id===x.id))arr.push(x);if(arr.length>=3)break}}return arr.slice(0,3);}
function pills(items){const c=document.getElementById('chat'),box=document.createElement('div');box.className='pills';items.forEach(x=>{const b=document.createElement('button');b.className='pill';b.textContent=x.id+' '+x.title;b.onclick=()=>show(x,true);box.appendChild(b)});c.appendChild(box);c.scrollTop=c.scrollHeight;}

function drugPanel(){
 const c=document.getElementById('chat'),d=document.createElement('div');
 d.className='drugPanel';
 d.innerHTML='<div class="drugPanelTitle">💊 台灣核准的長期減重藥物</div>'+
 '<div class="drugPanelSub">依臺大醫院 2026 年 5 月資料整理。點選藥物可看簡要介紹。該資料指出目前這 5 種皆無健保給付，需經醫師評估後自費使用。</div>'+
 '<div class="drugGrid">'+DRUGS.map(x=>'<button class="drugCard" data-drug="'+x.id+'"><div class="drugName">'+x.title+'</div><div class="drugMeta">'+x.route+'</div></button>').join('')+'</div>'+
 '<div class="drugWarn"><b>共同提醒：</b>懷孕或哺乳期間不建議使用減重輔助藥物；減重藥仍需搭配飲食、活動與長期追蹤。</div>';
 c.appendChild(d);
 d.querySelectorAll('[data-drug]').forEach(b=>b.onclick=()=>showDrug(b.dataset.drug,true));
 c.scrollTop=c.scrollHeight;
}
function showDrug(id,echo=false){
 const drug=DRUGS.find(x=>x.id===id); if(!drug)return;
 if(echo)msg(drug.title,true);
 msg('可以，這一種我幫你整理成重點。');
 const c=document.getElementById('chat'),d=document.createElement('div'); d.className='drugDetail';
 d.innerHTML='<h3>'+drug.title+'</h3>'+
 '<p><span class="drugLabel">使用方式：</span>'+drug.route+'</p>'+
 '<p><span class="drugLabel">主要作用：</span>'+drug.mechanism+'</p>'+
 '<p><span class="drugLabel">常見副作用：</span>'+drug.common+'</p>'+
 '<p><span class="drugLabel">重要注意事項：</span>'+drug.caution+'</p>'+
 '<div class="sourceQ"><b>藥物更新資料</b><span>｜臺大醫院健康電子報 2026-05</span><a href="https://epaper.ntuh.gov.tw/health/202605/project_3.html" target="_blank" rel="noopener">查看原始資料</a></div>'+
 '<div class="drugWarn">若你是想問「我適不適合用這個藥」或「我該用多少劑量」，這個問題比較需要依個人狀況判斷，建議和醫師討論會比較合適。</div>';
 c.appendChild(d);
 const qs=[KB.find(x=>x.id==='Q118'),KB.find(x=>x.id==='Q120'),KB.find(x=>x.id==='Q119')];
 pills(qs);
 c.scrollTop=c.scrollHeight;
}
function matchDrug(raw){
 const s=norm(raw);
 return DRUGS.find(d=>d.names.some(n=>s.includes(norm(n))))||null;
}

function show(item,fromBrowse=false){if(fromBrowse)msg(item.title,true);msg(item.soft);factCard(item);actionCard(item.action);if(item.id==='Q118')drugPanel();pills(relatedFor(item));document.getElementById('chat').scrollTop=document.getElementById('chat').scrollHeight;}
function parseHW(raw){let s=raw.replace(/,/g,'.'),h=null,w=null,mh=s.match(/(?:身高)?\s*(\d{3}(?:\.\d+)?)\s*(?:公分|cm|CM)/),mw=s.match(/(?:體重)?\s*(\d{2,3}(?:\.\d+)?)\s*(?:公斤|kg|KG)/);if(mh)h=+mh[1];if(mw)w=+mw[1];if(!h||!w){let p=s.match(/(1\d{2}(?:\.\d+)?)\s*[\/、,，\s]+\s*(\d{2,3}(?:\.\d+)?)/);if(p){h=+p[1];w=+p[2]}}return h&&w&&h>=120&&h<=230&&w>=25&&w<=300?{h,w}:null;}
function bmiReply(h,w){const bmi=w/Math.pow(h/100,2);let cls,next;if(bmi<18.5){cls='體重過輕';next='這時候不是再往下減，而是先確認營養與健康狀況。'}else if(bmi<24){cls='健康體位';next='如果腰圍偏大或健檢有三高，仍可以把腹部脂肪與代謝風險一起看。'}else if(bmi<27){cls='過重';next='可以先從能長期維持的飲食與活動調整開始。'}else{cls='肥胖';next='建議再搭配腰圍與相關疾病一起評估，而不是只看 BMI。'}msg(`我幫你算：${h} 公分、${w} 公斤，BMI 約 ${bmi.toFixed(1)}，依台灣成人標準屬於「${cls}」。\n\n${next}`);show(KB[43]);}

function intentRoute(raw){
  const s=norm(raw);

  if (/(網路|網購|代購).*(減重藥|減肥藥|瘦瘦針|藥物|藥)|(減重藥|減肥藥|瘦瘦針|藥物|藥).*(網路|網購|代購)/.test(s))
    return KB.find(x=>x.id==='Q119');

  if (/(長者|老人|高齡|65歲|70歲|75歲|80歲).*(減重藥|減肥藥|瘦瘦針|藥物)|(減重藥|減肥藥|瘦瘦針).*(長者|老人|高齡)/.test(s))
    return KB.find(x=>x.id==='Q137');

  if (/(利尿劑|瀉藥)/.test(s))
    return KB.find(x=>x.id==='Q121');

  if (/(減重藥|減肥藥|瘦瘦針|glp1|glp-1).*(不用控制|不用節制|想吃什麼|亂吃|飲食)|(不用控制|不用節制|想吃什麼|亂吃).*(減重藥|減肥藥|瘦瘦針)/.test(s))
    return KB.find(x=>x.id==='Q120');

  if (/((吃.*藥|服藥|藥物|哪些藥|什麼藥).*(變胖|變重|體重增加|增加體重)|(變胖|變重|體重增加).*(吃.*藥|服藥|藥物|哪些藥|什麼藥))/.test(s))
    return KB.find(x=>x.id==='Q63');

  if (/(核准.*(藥|藥物)|核准的藥|核准藥物|有哪些.*減重藥|哪些.*減重藥|有哪些.*減肥藥|肥胖.*藥物|減肥藥|減重藥|瘦瘦針|glp1|glp-1|wegovy|口服減重藥|藥物治療)/.test(s))
    return KB.find(x=>x.id==='Q118');

  return null;
}

function score(raw,it){const s=norm(raw);let n=0, t=norm(it.title);if(s===t)n+=100;if(s.includes(t)||t.includes(s))n+=16;it.keys.forEach(k=>{const x=norm(k);if(x&&s.includes(x))n+=Math.max(5,x.length*2)}); // bigram overlap
for(let i=0;i<s.length-1;i++){const g=s.slice(i,i+2);if(t.includes(g))n+=.7}return n;}
function searchKB(raw){return KB.map(x=>[score(raw,x),x]).sort((a,b)=>b[0]-a[0]);}
function ask(text){const inp=document.getElementById('q'),raw=(text||inp.value).trim();if(!raw)return;inp.value='';msg(raw,true);if(EMERGENCY.some(k=>raw.includes(k))){msg('你提到的情況可能需要立即醫療評估。這個衛教工具不適合處理急症；若目前有胸痛、嚴重呼吸困難、昏厥、意識改變、抽搐或持續嘔吐，請立即就醫。');return;}const hw=parseHW(raw);if(hw){bmiReply(hw.h,hw.w);return;}const matchedDrug=matchDrug(raw);if(matchedDrug){showDrug(matchedDrug.id);return;}const routed=intentRoute(raw);if(routed){show(routed);return;}const ranked=searchKB(raw);if(ranked[0][0]>=5){show(ranked[0][1]);return;}msg('這個問題比較需要依個人狀況判斷，建議和醫師討論會比較合適。');}
function renderCats(){const el=document.getElementById('catlist');CATEGORIES.forEach((cat,i)=>{const b=document.createElement('button');b.className='catbtn';b.textContent=cat;b.onclick=()=>{document.querySelectorAll('.catbtn').forEach(x=>x.classList.remove('active'));b.classList.add('active');renderList(cat,document.getElementById('sideSearch').value)};el.appendChild(b)});}
function renderList(cat=null,term=''){const list=document.getElementById('questionList');list.style.display='block';list.innerHTML='';const t=norm(term);let arr=KB.filter(x=>(!cat||x.cat===cat)&&(!t||norm(x.title+' '+x.keys.join(' ')).includes(t)));if(!arr.length){list.innerHTML='<div style="padding:8px;font-size:12px;color:#7a898f">沒有找到相符題目</div>';return;}arr.forEach(x=>{const b=document.createElement('button');b.className='qitem';b.innerHTML='<span class="qid">'+x.id+'</span>'+esc(x.title);b.onclick=()=>show(x,true);list.appendChild(b)});}

async function loadData(){
  const [kbResponse, drugResponse] = await Promise.all([
    fetch('data/obesity_139.json'),
    fetch('data/medications.json')
  ]);

  if(!kbResponse.ok) throw new Error('無法載入 obesity_139.json');
  if(!drugResponse.ok) throw new Error('無法載入 medications.json');

  KB = await kbResponse.json();
  DRUGS = await drugResponse.json();
}

function bindUI(){
  document.getElementById('send').onclick=()=>ask();
  document.getElementById('q').addEventListener('keydown',e=>{if(e.key==='Enter')ask()});
  document.querySelectorAll('.starter').forEach(b=>b.onclick=()=>ask(b.dataset.text));

  document.getElementById('browseBtn').onclick=()=>{
    document.getElementById('questionList').style.display='block';
    renderList(null,document.getElementById('sideSearch').value);
  };

  document.getElementById('sideSearch').addEventListener('input',e=>renderList(null,e.target.value));
}

async function init(){
  try{
    await loadData();
    bindUI();
    renderCats();

    msg('嗨，這一版把 2024 國健署冊子的 Q1 到 Q139 都拆成獨立題目了。\n\n你可以直接用生活化的方式問，也可以按左邊「瀏覽完整 139 題」慢慢看。每則回答下方都會標示對應的官方 Q 編號。');
    pills([KB[43],KB[64],KB[117]]);
  }catch(error){
    console.error(error);
    const chat=document.getElementById('chat');
    if(chat){
      chat.innerHTML='<div style="padding:20px;line-height:1.7;color:#8a3d3d"><b>資料載入失敗。</b><br>若你是直接雙擊 index.html 開啟，部分瀏覽器會阻擋 JSON 載入。請使用 GitHub Pages，或依 README 的方式啟動本機預覽伺服器。</div>';
    }
  }
}

init();
