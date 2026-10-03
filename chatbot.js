let KB=[];
let DRUGS=[];

const STATE={pendingIntent:null,height:null,weight:null,sex:null,waist:null};
const BROAD_KEYS=new Set(['減重','減肥','肥胖','體重','飲食','運動','健康','藥物','手術','兒童','青少年','長者','老人','血糖','血脂','血壓','水腫','腰圍','心理','精神科','過重']);

const BUILD_VERSION='20261003-6';

const CATEGORIES=["孕期與嬰兒", "兒童青少年", "成人體位", "肥胖與健康", "安全減重", "飲食與活動", "心理與維持", "藥物與手術", "高齡體重管理"];
const OFFICIAL='https://health99.hpa.gov.tw/health99/HealthEducation/Detail/8681?nodeId=12';
const EMERGENCY=['胸痛','呼吸困難','喘不過氣','昏倒','昏厥','意識不清','抽搐','吐血','黑便','持續嘔吐','吐不停'];
function normalizeNumberText(s){
  return String(s||'')
    .replace(/[０-９]/g,ch=>String.fromCharCode(ch.charCodeAt(0)-0xFEE0))
    .replace(/．/g,'.')
    .replace(/，/g,',')
    .replace(/：/g,':');
}
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


const GENERIC_SOFTS=new Set([
  '孩子還在長大，這題不能直接套成人標準。',
  '這個問題很常見，先別急著用『胖不胖』評價孩子。',
  '兒少體重管理的重點，通常不是叫孩子硬撐著少吃。',
  '先不用追求完美，找到做得久的方法更重要。',
  '不用先把生活過得像訓練營，這題其實可以很務實。',
  '這類問題最容易被網路一句話講死，但其實要看整體。',
  '有些風險早期沒有感覺，但還是可以提早處理。',
  '這也是為什麼體重管理不只是外觀問題。',
  '這題比較值得看『健康影響』，不只是公斤數。',
  '這不是『想瘦就用』的工具，需要把效益和風險一起看。',
  '減重如果只剩自責，通常很難走得久。',
  '這題其實很重要，因為能不能維持往往比一開始瘦多快更關鍵。',
  '治療方式很多，但適不適合還是要回到個人狀況。',
  '這題已經進入治療層次，不能只看網路心得。',
  '這題不能只看體重機上的一個數字。',
  '這不只是意志力問題，很多人都會卡在這裡。',
  '這題不能只用成人減重思維處理。',
  '到了高齡，體重不是越輕越好，肌肉和功能更重要。',
  '長輩的體重管理要比年輕人多看一層：營養和肌力。'
]);

const LEAD_OVERRIDES={
  Q44:'如果你是想知道自己算不算過重或肥胖，可以先看 BMI，再搭配腰圍一起判讀。',
  Q45:'體重一樣，不代表腹部脂肪一樣；腰圍就是用來補足 BMI 看不到的這一塊。',
  Q46:'體脂率可以當參考，但比起單次數字，更值得看同一種量測方式下的長期變化。',
  Q47:'如果體重是在短時間內突然上升，先別急著當成「變胖」，也要留意是不是水分增加。',
  Q48:'如果是想追蹤體重，固定在相近條件下量，比找一個「絕對最準」的時間更重要。',
  Q49:'家人都比較胖，不代表體重完全由基因決定；遺傳和家庭生活環境都會影響。',
  Q50:'抽血正常是好事，但不代表肥胖相關風險就完全不存在。',
  Q62:'短時間突然變重，不一定只是吃多了；如果伴隨水腫或其他症狀，更要留意。',
  Q65:'減重目標不用一開始就訂得很大，能持續做到、健康指標有改善更重要。',
  Q72:'一天該吃多少不能只看一個固定數字，需求會隨身高、體重、活動量和健康狀況而變。',
  Q76:'外食不是一定不能減重，真正容易出問題的是份量、油鹽糖和飲料常常一起增加。',
  Q80:'運動不用一次做很久；先看一週累積多少活動量，會比只盯每天更實際。',
  Q84:'「喝水也會胖」通常不是水本身讓脂肪增加，真正要分清楚的是水分變化和脂肪增加。',
  Q92:'睡眠和作息亂時，體重管理確實會更辛苦，因為它也會影響食慾和活動。',
  Q108:'如果已經很努力但體重卡住，先別急著把飲食再砍更低；體重本來就會有波動和平台期。',
  Q118:'如果你想了解台灣目前有哪些核准的減重藥，可以直接從藥物類型和使用方式來看。',
  Q122:'做過減重手術後通常仍可以懷孕，但時機和營養狀況很重要。',
  Q132:'長輩不能只用「越瘦越好」來看體重，還要一起看肌肉、營養和日常功能。',
  Q135:'長輩減重後如果明顯沒力，確實要想到肌肉可能也跟著流失。',
  Q138:'肌少肥胖不是單純「胖又沒肌肉」而已，重點是脂肪過多同時合併肌肉量或功能不足。'
};

function conversationLead(item){
  if(LEAD_OVERRIDES[item.id]) return LEAD_OVERRIDES[item.id];

  const soft=String(item.soft||'').trim();
  if(soft && !GENERIC_SOFTS.has(soft)) return soft;

  const title=String(item.title||'這個問題').replace(/[？?]\s*$/,'');
  return '如果你是在問「'+title+'」，我先直接說重點。';
}

function show(item,fromBrowse=false){
  if(fromBrowse)msg(item.title,true);
  if(item.id==='Q44') STATE.pendingIntent='body';
  msg(conversationLead(item));
  factCard(item);
  actionCard(item.action);
  if(item.id==='Q118')drugPanel();
  pills(relatedFor(item));
  document.getElementById('chat').scrollTop=document.getElementById('chat').scrollHeight;
}

function parseMeasurements(raw){
  const s=normalizeNumberText(raw).trim();
  const compact=s.replace(/\s+/g,'');
  let h=null,w=null,waist=null,sex=null;

  // 性別：腰圍切點需分男性／女性。
  const female=/(女性|女生|女)(?!性化)/.test(s);
  const male=/(男性|男生|男)/.test(s);
  if(female&&!male) sex='F';
  else if(male&&!female) sex='M';

  // 腰圍：腰圍85、腰圍 85 cm、腰围85。
  const mwc=s.match(/腰[圍围]\s*[:：]?\s*(\d{2,3}(?:\.\d+)?)\s*(?:cm|公分|厘米)?/i);
  if(mwc) waist=Number(mwc[1]);

  // 最常見：身高170，體重80 / 身高170 體重80
  let pair=compact.match(/身高[:：]?(\d{2,3}(?:\.\d+)?)(?:公分|cm|厘米)?[,，、;；]?體重[:：]?(\d{2,3}(?:\.\d+)?)(?:公斤|kg|千克)?/i);
  if(pair){
    h=Number(pair[1]);
    w=Number(pair[2]);
  }

  // 反過來：體重80，身高170
  if(!h&&!w){
    pair=compact.match(/體重[:：]?(\d{2,3}(?:\.\d+)?)(?:公斤|kg|千克)?[,，、;；]?身高[:：]?(\d{2,3}(?:\.\d+)?)(?:公分|cm|厘米)?/i);
    if(pair){
      w=Number(pair[1]);
      h=Number(pair[2]);
    }
  }

  // 有單位但沒標籤
  if(!h){
    let m=s.match(/(\d{2,3}(?:\.\d+)?)\s*(?:cm|公分|厘米)/i);
    if(m) h=Number(m[1]);
  }
  if(!h){
    let m=s.match(/(1(?:\.\d{1,2})?)\s*(?:m|公尺|米)(?!m)/i);
    if(m) h=Number(m[1])*100;
  }
  if(!w){
    let m=s.match(/(\d{2,3}(?:\.\d+)?)\s*(?:kg|公斤|千克)/i);
    if(m) w=Number(m[1]);
  }

  // 有標籤但沒單位
  if(!h){
    let m=s.match(/身高\s*[:：]?\s*(\d{2,3}(?:\.\d+)?)/i);
    if(m) h=Number(m[1]);
  }
  if(!w){
    let m=s.match(/體重\s*[:：]?\s*(\d{2,3}(?:\.\d+)?)/i);
    if(m) w=Number(m[1]);
  }

  // 170/80、170 80、170,80；若句子有腰圍/性別也可辨識。
  if(!h&&!w&&!/(血壓|bp)/i.test(s)){
    const bodyContext=STATE.pendingIntent==='body'||/(身高|體重|腰[圍围]|bmi|公分|公斤|kg|男性|女性|男生|女生)/i.test(s);
    const pairAnywhere=s.match(/(?:^|[，,、;\s])\s*(1\d{2}(?:\.\d+)?)\s*[\/、,，\s]+\s*(\d{2,3}(?:\.\d+)?)\s*(?:$|[，,、;\s])/);
    if(pairAnywhere&&bodyContext){
      h=Number(pairAnywhere[1]);
      w=Number(pairAnywhere[2]);
    }else{
      const pairOnly=s.match(/^\s*(1\d{2}(?:\.\d+)?)\s*[\/、,，\s]+\s*(\d{2,3}(?:\.\d+)?)\s*$/);
      if(pairOnly){
        h=Number(pairOnly[1]);
        w=Number(pairOnly[2]);
      }
    }
  }

  // 體位評估流程中，可下一句只打一個數字。
  if(STATE.pendingIntent==='body'&&!h&&!w&&!waist&&/^\s*\d{2,3}(?:\.\d+)?\s*$/.test(s)){
    const n=Number(s.trim());
    if(!STATE.height&&n>=120&&n<=230) h=n;
    else if(!STATE.weight&&n>=25&&n<=300) w=n;
    else if(!STATE.waist&&n>=40&&n<=200) waist=n;
  }

  if(!(h>=120&&h<=230)) h=null;
  if(!(w>=25&&w<=300)) w=null;
  if(!(waist>=40&&waist<=200)) waist=null;
  return {h,w,waist,sex};
}

function waistAssessment(sex,waist){
  const cutoff=sex==='M'?90:80;
  const label=sex==='M'?'男性':'女性';
  const high=waist>=cutoff;
  return {
    cutoff,
    label,
    high,
    text:label+'腰圍 '+waist+' 公分，'+(high?'已達':'未達')+'腹部肥胖判讀切點（'+label+' '+(high?'≥':'<')+cutoff+' 公分）。'
  };
}

function showBodyAssessment(){
  const h=STATE.height,w=STATE.weight,sex=STATE.sex,waist=STATE.waist;
  const hasBMI=!!(h&&w);
  const hasWaist=!!(sex&&waist);

  if(hasBMI&&hasWaist){
    const bmi=w/Math.pow(h/100,2);
    let bmiClass;
    if(bmi<18.5) bmiClass='體重過輕';
    else if(bmi<24) bmiClass='健康體位';
    else if(bmi<27) bmiClass='過重';
    else bmiClass='肥胖';

    const wa=waistAssessment(sex,waist);
    let overall='';
    if(bmi>=24&&wa.high) overall='BMI 與腰圍都偏高，建議進一步留意血壓、血糖、血脂、脂肪肝與睡眠呼吸中止等肥胖相關健康風險。';
    else if(bmi<24&&wa.high) overall='BMI 雖在健康體位範圍，但腰圍已達腹部肥胖切點，仍值得留意腹部脂肪與代謝風險。';
    else if(bmi>=24&&!wa.high) overall='腰圍目前未達腹部肥胖切點，但 BMI 偏高，仍建議從整體健康風險一起評估。';
    else overall='BMI 與腰圍目前都未達過重／腹部肥胖切點，建議持續維持健康飲食與規律活動。';

    msg('我幫你一起看：\n'+h+' 公分、'+w+' 公斤，BMI 約 '+bmi.toFixed(1)+'，屬於「'+bmiClass+'」。\n'+wa.text+'\n\n'+overall);
    const q44=KB.find(x=>x.id==='Q44');
    if(q44) factCard(q44);
    pills(['Q45','Q46','Q50'].map(id=>KB.find(x=>x.id===id)).filter(Boolean));
    resetBodyState();
    return true;
  }

  if(hasBMI){
    const bmi=w/Math.pow(h/100,2);
    let cls,next;
    if(bmi<18.5){cls='體重過輕';next='這時候不建議再追求減重，反而要先確認營養與健康狀況。';}
    else if(bmi<24){cls='健康體位';next='如果腰圍偏大或健檢有三高，仍可以把腹部脂肪與代謝風險一起看。';}
    else if(bmi<27){cls='過重';next='可以先從能長期維持的飲食與活動調整開始。';}
    else{cls='肥胖';next='建議再搭配腰圍與肥胖相關疾病一起評估，而不是只看 BMI。';}

    msg('我幫你算好了：'+h+' 公分、'+w+' 公斤，BMI 約 '+bmi.toFixed(1)+'，依台灣成人標準屬於「'+cls+'」。\n\n'+next+'\n\n如果想一起看腹部肥胖，可以再輸入例如「男，腰圍92」或「女，腰圍82」。');
    const q44=KB.find(x=>x.id==='Q44');
    if(q44) factCard(q44);
    STATE.pendingIntent='body';
    return true;
  }

  if(hasWaist){
    const wa=waistAssessment(sex,waist);
    msg(wa.text+'\n\n'+(wa.high?'腰圍達切點時，建議再搭配 BMI 與代謝相關健康狀況一起評估。':'腰圍目前未達腹部肥胖切點；若能再提供身高與體重，我也可以一起計算 BMI。'));
    pills(['Q44','Q45','Q50'].map(id=>KB.find(x=>x.id===id)).filter(Boolean));
    resetBodyState();
    return true;
  }

  return false;
}

function resetBodyState(){
  STATE.pendingIntent=null;
  STATE.height=null;
  STATE.weight=null;
  STATE.sex=null;
  STATE.waist=null;
}

function handleBMIInput(raw){
  const m=parseMeasurements(raw);
  const bodyMention=/(身高|體重|腰[圍围]|bmi|公分|公斤|kg|男性|女性|男生|女生)/i.test(raw)||STATE.pendingIntent==='body';

  if(!m.h&&!m.w&&!m.waist&&!m.sex) return false;
  if(!bodyMention&&!m.h&&!m.w&&!m.waist) return false;

  STATE.pendingIntent='body';
  if(m.h) STATE.height=m.h;
  if(m.w) STATE.weight=m.w;
  if(m.waist) STATE.waist=m.waist;
  if(m.sex) STATE.sex=m.sex;

  if(STATE.waist&&!STATE.sex){
    msg('收到，腰圍 '+STATE.waist+' 公分。腰圍的判讀切點男女不同，請再告訴我是男性或女性。');
    return true;
  }

  if(STATE.sex&&!STATE.waist&&!STATE.height&&!STATE.weight){
    msg('收到。再告訴我腰圍就可以，例如「腰圍85」。');
    return true;
  }

  if(showBodyAssessment()) return true;

  if(STATE.height&&!STATE.weight){
    msg('收到，身高 '+STATE.height+' 公分。再告訴我體重就可以，例如「72 公斤」或直接輸入「72」。');
    return true;
  }

  if(STATE.weight&&!STATE.height){
    msg('收到，體重 '+STATE.weight+' 公斤。再告訴我身高就可以，例如「165 公分」或直接輸入「165」。');
    return true;
  }

  return true;
}

function intentRoute(raw){
  const s=norm(raw);

  // BMI／成人體位：先處理可執行功能，不讓它落入一般文字配對。
  if(/(bmi|算.*胖|算.*體位|身高.*體重|體重.*身高|成人.*(過重|肥胖)|體位.*標準)/i.test(s))
    return KB.find(x=>x.id==='Q44');

  // 特殊族群先於一般關鍵字，避免「掉肌肉」被成人題吸走。
  if(/(長輩|老人|高齡|65歲|70歲|75歲|80歲).*(減重|變瘦|體重).*(肌肉|沒力)|(肌肉|沒力).*(長輩|老人|高齡)/.test(s))
    return KB.find(x=>x.id==='Q135');

  if(/(減重手術|代謝手術).*(懷孕|生育)|(懷孕|生育).*(減重手術|代謝手術)/.test(s))
    return KB.find(x=>x.id==='Q122');

  if(/(復胖|胖回來|體重卡住|瘦不下來|減不下來|平台期)/.test(s))
    return KB.find(x=>x.id==='Q108');

  if(!/(小孩|孩子|兒童|青少年)/.test(s) && /(睡不好|睡不夠|睡眠不足|熬夜|晚睡|作息亂)/.test(s))
    return KB.find(x=>x.id==='Q92');

  if(/(脂肪肝).*(減重|體重|肥胖)|(減重|體重|肥胖).*(脂肪肝)/.test(s))
    return KB.find(x=>x.id==='Q64');

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

function score(raw,it){
  const s=norm(raw),t=norm(it.title);
  if(!s) return 0;
  if(s===t) return 100;

  let n=0;
  if(s.length>=4 && (s.includes(t)||t.includes(s))) n+=30;

  for(const k of (it.keys||[])){
    const x=norm(k);
    if(!x||!s.includes(x)) continue;
    if(BROAD_KEYS.has(x)) n+=2;
    else n+=x.length>=4?14:10;
  }
  return n;
}

function searchKB(raw){
  return KB.map(x=>[score(raw,x),x]).sort((a,b)=>b[0]-a[0]);
}

function showCandidates(ranked){
  const items=ranked.filter(x=>x[0]>0).slice(0,3).map(x=>x[1]);
  if(!items.length) return false;
  msg('這個問法可能對應到不只一個主題。為了不要答錯，你可以選最接近的一題：');
  pills(items);
  return true;
}

function ask(text){
  const inp=document.getElementById('q');
  const raw=(text||inp.value).trim();
  if(!raw)return;
  inp.value='';
  msg(raw,true);

  if(EMERGENCY.some(k=>raw.includes(k))){
    msg('你提到的情況可能需要立即醫療評估。這個衛教工具不適合處理急症；若目前有胸痛、嚴重呼吸困難、昏厥、意識改變、抽搐或持續嘔吐，請立即就醫。');
    return;
  }

  // 先處理 BMI 實際數值；可接受同一句或分兩次輸入。
  if(handleBMIInput(raw)) return;

  const simple=norm(raw);
  if(/(想.*(算|看).*(bmi|體位|胖|肥胖|過重)|算不算肥胖|算不算胖|bmi怎麼算)/i.test(simple)){
    startIntent('BMI',false);
    return;
  }
  if(/^(我)?想(要)?(開始)?減重$|不知道怎麼開始減重|想開始減重/.test(simple)){
    startIntent('START',false);
    return;
  }

  if(STATE.pendingIntent==='body' && !/(身高|體重|腰[圍围]|bmi|公分|公斤|kg|男性|女性|男生|女生|^\s*\d{2,3}(?:\.\d+)?\s*$)/i.test(raw)){
    resetBodyState();
  }

  const matchedDrug=matchDrug(raw);
  if(matchedDrug){
    showDrug(matchedDrug.id);
    return;
  }

  const routed=intentRoute(raw);
  if(routed){
    show(routed);
    return;
  }

  const ranked=searchKB(raw);
  if(ranked[0]&&ranked[0][0]>=10){
    // 若前兩名同分，寧可讓民眾選，不要硬猜。
    if(ranked[1]&&ranked[1][0]===ranked[0][0]){
      showCandidates(ranked);
      return;
    }
    show(ranked[0][1]);
    return;
  }

  if(ranked[0]&&ranked[0][0]>0){
    showCandidates(ranked);
    return;
  }

  msg('這個問題比較需要依個人狀況判斷，建議和醫師討論會比較合適。');
}

function renderCats(){const el=document.getElementById('catlist');CATEGORIES.forEach((cat,i)=>{const b=document.createElement('button');b.className='catbtn';b.textContent=cat;b.onclick=()=>{document.querySelectorAll('.catbtn').forEach(x=>x.classList.remove('active'));b.classList.add('active');renderList(cat,document.getElementById('sideSearch').value)};el.appendChild(b)});}
function renderList(cat=null,term=''){const list=document.getElementById('questionList');list.style.display='block';list.innerHTML='';const t=norm(term);let arr=KB.filter(x=>(!cat||x.cat===cat)&&(!t||norm(x.title+' '+x.keys.join(' ')).includes(t)));if(!arr.length){list.innerHTML='<div style="padding:8px;font-size:12px;color:#7a898f">沒有找到相符題目</div>';return;}arr.forEach(x=>{const b=document.createElement('button');b.className='qitem';b.innerHTML='<span class="qid">'+x.id+'</span>'+esc(x.title);b.onclick=()=>show(x,true);list.appendChild(b)});}

async function loadData(){
  const [kbResponse, drugResponse] = await Promise.all([
    fetch('obesity_139.json?v='+BUILD_VERSION,{cache:'no-store'}),
    fetch('medications.json?v='+BUILD_VERSION,{cache:'no-store'})
  ]);

  if(!kbResponse.ok) throw new Error('無法載入 obesity_139.json');
  if(!drugResponse.ok) throw new Error('無法載入 medications.json');

  KB = await kbResponse.json();
  DRUGS = await drugResponse.json();
}

function startIntent(intent,echoUser=true){
  if(intent==='BMI'){
    if(echoUser) msg('📏 先看看自己的體位',true);
    STATE.pendingIntent='body';
    STATE.height=null;
    STATE.weight=null;
    STATE.sex=null;
    STATE.waist=null;
    msg('可以。直接輸入身高和體重，例如「身高170，體重80」或「170/80」，我會先算 BMI。\n\n如果想一起看腹部肥胖，也可以一次輸入「男，身高170，體重80，腰圍92」。');
    return;
  }

  if(intent==='START'){
    if(echoUser) msg('🥗 想開始減重',true);
    msg('可以，先不用一次把所有事情都改掉。你想先從哪一個方向開始？');
    pills(['Q65','Q72','Q80'].map(id=>KB.find(x=>x.id===id)).filter(Boolean));
    return;
  }

  if(intent==='CHILD'){
    if(echoUser) msg('🧒 小孩／青少年',true);
    msg('孩子還在成長，體位不能直接套成人標準。你比較想了解哪一件事？');
    pills(['Q7','Q15','Q20','Q42'].map(id=>KB.find(x=>x.id===id)).filter(Boolean));
    return;
  }

  if(intent==='OLDER'){
    if(echoUser) msg('👵 長輩／肌少肥胖',true);
    msg('長輩的體重管理除了公斤數，也要一起看肌肉、營養和功能。你比較想了解哪一件事？');
    pills(['Q132','Q134','Q135','Q138'].map(id=>KB.find(x=>x.id===id)).filter(Boolean));
    return;
  }

  if(/^Q\d+$/.test(intent)){
    const item=KB.find(x=>x.id===intent);
    if(item){
      if(echoUser) msg(item.title,true);
      show(item,false);
    }
  }
}

function bindUI(){
  document.getElementById('send').onclick=()=>ask();
  document.getElementById('q').addEventListener('keydown',e=>{if(e.key==='Enter')ask()});
  document.querySelectorAll('.starter').forEach(b=>b.onclick=()=>startIntent(b.dataset.intent));

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
