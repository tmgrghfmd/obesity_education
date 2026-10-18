const fs=require('fs');
const vm=require('vm');
const path=require('path');

const root=path.resolve(__dirname,'..');
const KB=JSON.parse(fs.readFileSync(path.join(root,'obesity_139.json'),'utf8'));
const DRUGS=JSON.parse(fs.readFileSync(path.join(root,'medications.json'),'utf8'));
const CASES=JSON.parse(fs.readFileSync(path.join(__dirname,'routing_cases.json'),'utf8'));

let source=fs.readFileSync(path.join(root,'chatbot.js'),'utf8');
source=source.replace('let KB=[];','var KB='+JSON.stringify(KB)+';');
source=source.replace('let DRUGS=[];','var DRUGS='+JSON.stringify(DRUGS)+';');
source=source.replace('const STATE=','var STATE=');
source=source.replace(/\ninit\(\);\s*$/,'\n');

function element(){
  return {
    className:'', textContent:'', innerHTML:'', scrollTop:0, scrollHeight:0,
    appendChild(){}, querySelectorAll(){return[];}, classList:{toggle(){},contains(){return false;},add(){},remove(){}}
  };
}
const context={
  console,
  document:{getElementById(){return element();},createElement(){return element();},querySelectorAll(){return[];}},
  fetch:async()=>{throw new Error('fetch should not run in tests');}
};
vm.createContext(context);
vm.runInContext(source,context,{filename:'chatbot.js'});

function resolveRoute(input){
  const ci=context.conversationIntentRoute(input);
  if(ci) return {type:'conversation',id:ci.id};
  if(context.isPhentermineQuery(input)) return {type:'phentermine',id:'phentermine'};
  const drug=context.matchDrug(input);
  if(drug) return {type:'drug',id:drug.id};
  const routed=context.intentRoute(input);
  if(routed) return {type:'route',id:routed.id};
  const direct=context.directKeyRoute(input);
  if(direct) return {type:'route',id:direct.id};
  const ranked=context.searchKB(input);
  if(ranked[0]&&ranked[0][0]>=10) return {type:'route',id:ranked[0][1].id};
  return {type:'none',id:null};
}

let failures=[];
for(const c of CASES){
  try{
    if(c.kind==='route'||c.kind==='conversation'||c.kind==='drug'){
      const got=resolveRoute(c.input);
      if(got.type!==c.kind||got.id!==c.expected) failures.push({case:c,got});
    }else if(c.kind==='body'){
      context.STATE.pendingIntent='body';
      const got=context.parseMeasurements(c.input);
      if(got.h!==c.expected.h||got.w!==c.expected.w) failures.push({case:c,got});
      context.STATE.pendingIntent=null;
    }else if(c.kind==='special'){
      const got=context.handleSpecialBodyAudience(c.input);
      if(got!==c.expected) failures.push({case:c,got});
    }else if(c.kind==='followupDrug'){
      context.STATE.currentDrug=c.drug;
      context.STATE.currentQuestion='Q118';
      context.STATE.currentTopic='drug';
      const got=context.handleContextFollowup(c.input);
      if(got!==c.expected) failures.push({case:c,got});
      context.STATE.currentDrug=null;
    }else if(c.kind==='followupBody'){
      context.STATE.currentTopic='body';
      context.STATE.lastBody=c.lastBody;
      const got=context.handleContextFollowup(c.input);
      if(got!==c.expected) failures.push({case:c,got});
      context.STATE.currentTopic=null;context.STATE.lastBody=null;
    }
  }catch(err){
    failures.push({case:c,error:String(err&&err.stack||err)});
  }
}
if(failures.length){
  console.error(JSON.stringify({passed:CASES.length-failures.length,total:CASES.length,failures},null,2));
  process.exit(1);
}
console.log('Routing regression: '+CASES.length+'/'+CASES.length+' passed');
