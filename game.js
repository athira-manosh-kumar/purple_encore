const icons=['⭐','💜','🎵','🎤','🎟️','💎'];
const stages=[{name:'Practice room',type:0,target:18,moves:24},{name:'Rooftop rehearsal',type:1,target:22,moves:25},{name:'First spotlight',type:2,target:26,moves:26},{name:'Under the stars',type:4,target:30,moves:28},{name:'The grand encore',type:1,target:36,moves:30}];
const $=id=>document.getElementById(id);let board=[],level=0,moves=0,score=0,collected=0,selected=null,busy=false,finished=false,sound=false,audio=null,revision=0;
const delay=ms=>new Promise(r=>setTimeout(r,ms));const random=()=>({type:Math.floor(Math.random()*6),special:null});
function matches(b=board){const groups=[];for(let r=0;r<8;r++){for(let c=0;c<8;){let end=c+1;while(end<8&&b[r*8+c]&&b[r*8+end]?.type===b[r*8+c].type)end++;if(end-c>=3)groups.push(Array.from({length:end-c},(_,j)=>r*8+c+j));c=end;}}for(let c=0;c<8;c++){for(let r=0;r<8;){let end=r+1;while(end<8&&b[r*8+c]&&b[end*8+c]?.type===b[r*8+c].type)end++;if(end-r>=3)groups.push(Array.from({length:end-r},(_,j)=>(r+j)*8+c));r=end;}}return groups;}
function adjacent(a,b){return Number.isInteger(a)&&Number.isInteger(b)&&a>=0&&b>=0&&a<64&&b<64&&(Math.abs(a-b)===8||(Math.floor(a/8)===Math.floor(b/8)&&Math.abs(a-b)===1));}
function possible(){for(let i=0;i<64;i++)for(const j of [i+1,i+8]){if(!adjacent(i,j))continue;if(board[i].special==='color'||board[j].special==='color')return[i,j];[board[i],board[j]]=[board[j],board[i]];const ok=matches().length;[board[i],board[j]]=[board[j],board[i]];if(ok)return[i,j];}return null;}
function fresh(){do{board=[];for(let i=0;i<64;i++){let t;do{t=random();}while((i%8>=2&&board[i-1].type===t.type&&board[i-2].type===t.type)||(i>=16&&board[i-8].type===t.type&&board[i-16].type===t.type));board.push(t);}}while(!possible());}
let lastCollected=0;
function updateStats(){
 const stage=stages[level],remaining=Math.max(0,stage.target-collected);
 $('moves').textContent=moves;$('score').textContent=score.toLocaleString();
 $('goal').textContent=`${Math.min(collected,stage.target)} / ${stage.target}`;
 $('targetIcon').className='token token-'+stage.type;
 $('goalLabel').textContent=`Collect ${stage.target} ${['stars','hearts','notes','microphones','tickets','gems'][stage.type]}`;
 $('remaining').textContent=remaining?`${remaining} left to collect`:'Target complete!';
 $('progress').style.width=Math.min(100,collected/stage.target*100)+'%';
 if(collected>lastCollected&&!reducedMotion()&&$('targetIcon').animate){$('targetIcon').animate([{transform:'scale(1)'},{transform:'scale(1.2)'},{transform:'scale(1)'}],{duration:260,easing:'ease-out'});$('goal').animate([{color:'#fff5b1'},{color:'#f5edff'}],{duration:400});}lastCollected=collected;
 $('restart').disabled=busy;$('hint').disabled=busy||finished;
}
function render(){
 const grid=$('board');
 if(!grid.children.length){
  for(let i=0;i<64;i++){
   const b=document.createElement('button');b.dataset.index=i;b.setAttribute('role','gridcell');
   const art=document.createElement('span');art.className='token';art.setAttribute('aria-hidden','true');b.appendChild(art);
   b.onclick=()=>{if(performance.now()<suppressClickUntil)return;choose(i);};
   b.onkeydown=e=>{const offsets={ArrowLeft:-1,ArrowRight:1,ArrowUp:-8,ArrowDown:8};if(e.key in offsets){const j=i+offsets[e.key];if(adjacent(i,j)){e.preventDefault();grid.children[j].focus();}}};
   grid.appendChild(b);
  }
 }
 board.forEach((tile,i)=>{
  const b=grid.children[i];b.className='tile t'+tile.type+(selected===i?' selected':'');b.dataset.special=tile.special||'';b.children[0].className='token token-'+tile.type;
  b.setAttribute('aria-label',`${['star','heart','note','microphone','ticket','gem'][tile.type]}, row ${Math.floor(i/8)+1}, column ${i%8+1}${tile.special?', '+tile.special+' power-up':''}`);
  b.setAttribute('aria-selected',String(selected===i));b.setAttribute('aria-disabled',String(busy||finished));
 });
 grid.setAttribute('aria-busy',String(busy));updateStats();
}
const reducedMotion=()=>window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
async function animateSwap(a,b){
 if(reducedMotion())return;
 const first=$('board').children[a],second=$('board').children[b];
 if(!first.animate)return;
 const x=first.getBoundingClientRect(),y=second.getBoundingClientRect();
 const options={duration:170,easing:'cubic-bezier(.2,.7,.25,1)'};
 await Promise.all([first.animate([{transform:'translate(0,0)'},{transform:`translate(${y.x-x.x}px,${y.y-x.y}px)`}],options).finished,second.animate([{transform:'translate(0,0)'},{transform:`translate(${x.x-y.x}px,${x.y-y.y}px)`}],options).finished]);
}
async function animateFall(previous){
 if(reducedMotion())return;
 const animations=[];
 board.forEach((tile,i)=>{const old=previous.indexOf(tile);if(old===i)return;const el=$('board').children[i];if(!el.animate)return;const rect=el.getBoundingClientRect();const gap=parseFloat(window.getComputedStyle?.($('board')).rowGap)||5;const dy=old<0?-(Math.floor(i/8)+1)*(rect.height+gap):(Math.floor(old/8)-Math.floor(i/8))*(rect.height+gap);
 animations.push(el.animate([{transform:`translateY(${dy}px)`,opacity:old<0?0:1},{transform:'translateY(0)',opacity:1}],{duration:240,easing:'cubic-bezier(.2,.65,.3,1)'}).finished);
 });await Promise.all(animations);
}
let gesture=null,suppressClickUntil=0;
$('board').addEventListener('pointerdown',e=>{
 if(busy||finished||e.button!==0)return;const tile=e.target.closest('.tile');if(!tile)return;
 gesture={i:Number(tile.dataset.index),x:e.clientX,y:e.clientY,id:e.pointerId};tile.classList.add('pressed');tile.setPointerCapture?.(e.pointerId);
});
function releaseGesture(){
 if(!gesture)return;const el=$('board').children[gesture.i];el.classList.remove('pressed');el.children[0].style.transform='';
}
$('board').addEventListener('pointermove',e=>{
 if(!gesture||e.pointerId!==gesture.id||busy)return;
 const dx=e.clientX-gesture.x,dy=e.clientY-gesture.y,el=$('board').children[gesture.i];
 const x=Math.max(-12,Math.min(12,dx)),y=Math.max(-12,Math.min(12,dy));
 el.children[0].style.transform=`translate(${x}px,${y}px) scale(1.08)`;
});
$('board').addEventListener('pointerup',e=>{
 if(!gesture||e.pointerId!==gesture.id)return;const g=gesture;releaseGesture();gesture=null;
 const dx=e.clientX-g.x,dy=e.clientY-g.y;if(Math.max(Math.abs(dx),Math.abs(dy))<14)return;
 suppressClickUntil=performance.now()+350;
 const j=g.i+(Math.abs(dx)>Math.abs(dy)?(dx>0?1:-1):(dy>0?8:-8));
 if(!busy&&!finished&&adjacent(g.i,j))swap(g.i,j);
});
$('board').addEventListener('pointercancel',()=>{releaseGesture();gesture=null;});
function start(n=level){lastCollected=0;revision++;level=n;moves=stages[n].moves;score=0;collected=0;selected=null;busy=false;finished=false;fresh();$('venue').textContent=stages[n].name;$('levelLabel').textContent='LEVEL '+String(n+1).padStart(2,'0');$('goalLabel').textContent='COLLECT '+['STARS','HEARTS','NOTES','MICS','TICKETS','GEMS'][stages[n].type];$('levels').innerHTML=stages.map((s,i)=>`<li class="${i===n?'active':''}"><span>${i<n?'✓':i+1}</span>${s.name}</li>`).join('');$('feedback').textContent='Swipe or tap to find your first match.';render();}
function chime(chain){if(!sound||!audio)return;const t=audio.currentTime;[0,4,7].forEach((step,i)=>{const o=audio.createOscillator(),g=audio.createGain();o.type='sine';o.frequency.value=261.63*Math.pow(2,(step+Math.min(chain,4)*2)/12);g.gain.setValueAtTime(0,t+i*.045);g.gain.linearRampToValueAtTime(.035,t+i*.045+.02);g.gain.exponentialRampToValueAtTime(.0001,t+i*.045+.25);o.connect(g);g.connect(audio.destination);o.start(t+i*.045);o.stop(t+i*.045+.28);});}
async function choose(i){if(busy||finished)return;if(selected===null){selected=i;render();return;}if(selected===i){selected=null;render();return;}if(!adjacent(selected,i)){selected=i;render();return;}return swap(selected,i);}
async function swap(a,b){if(busy||finished||!adjacent(a,b))throw Error('Choose two neighboring tiles on an active board.');const run=revision;busy=true;selected=null;render();await animateSwap(a,b);if(run!==revision)return;[board[a],board[b]]=[board[b],board[a]];let groups=matches(),forced=new Set();if(board[a].special==='color'||board[b].special==='color'){const color=board[a].special==='color'?board[b].type:board[a].type;board.forEach((t,i)=>{if(t.type===color)forced.add(i);});forced.add(a);forced.add(b);}render();if(!groups.length&&!forced.size){await animateSwap(a,b);if(run!==revision)return;[board[a],board[b]]=[board[b],board[a]];busy=false;$('feedback').textContent='Find a match of 3. That swap costs no move.';render();return;}moves--;let chain=0;while(groups.length||forced.size){chain++;let cleared=new Set([...groups.flat(),...forced]),specials=new Map();for(const group of groups){if(group.length>=4){const index=group.includes(b)?b:group.includes(a)?a:group[Math.floor(group.length/2)];if(!board[index].special)specials.set(index,group.length>=5?'color':'row');}}const triggered=new Set();let changed=true;while(changed){changed=false;for(const i of [...cleared]){if(triggered.has(i))continue;triggered.add(i);const t=board[i];if(t.special==='row'){for(let j=Math.floor(i/8)*8;j<Math.floor(i/8)*8+8;j++){if(!cleared.has(j)){cleared.add(j);changed=true;}}}if(t.special==='color'){board.forEach((x,j)=>{if(x.type===t.type&&!cleared.has(j)){cleared.add(j);changed=true;}});}}}for(const i of specials.keys())cleared.delete(i);for(const i of cleared){if(board[i].type===stages[level].type)collected++;$('board').children[i]?.classList.add('clearing');}score+=cleared.size*50*chain;chime(chain);$('feedback').textContent=chain>1?`${chain}× harmony! Keep the magic going.`:specials.size?'Encore! A special tile is ready.':'A little spark of magic.';updateStats();await delay(reducedMotion()?0:140);if(run!==revision)return;const previous=board.slice();for(const i of cleared)board[i]=null;for(const[i,s]of specials)board[i].special=s;for(let c=0;c<8;c++){const column=[];for(let r=7;r>=0;r--)if(board[r*8+c])column.push(board[r*8+c]);while(column.length<8)column.push(random());for(let r=7;r>=0;r--)board[r*8+c]=column[7-r];}render();await animateFall(previous);if(run!==revision)return;groups=matches();forced=new Set();}busy=false;if(collected>=stages[level].target||moves<=0){finished=true;render();end(collected>=stages[level].target);}else{if(!possible()){fresh();$('feedback').textContent='A fresh rhythm! The board has been reshuffled.';}render();}return state();}
function end(won){$('resultEyebrow').textContent=won?'STAGE COMPLETE':'ONE MORE REHEARSAL';$('resultTitle').textContent=won?(level===4?'What an encore!':'You lit it up!'):'Find your rhythm.';$('resultText').textContent=won?`${score.toLocaleString()} points. ${level===4?'You brought every stage to life. Ready for another tour?':'Your next stage is waiting.'}`:'You’re out of moves. Try a fresh board and make the most of special matches.';$('continue').textContent=won?(level===4?'Play again':'Next stage'):'Try again';$('continue').onclick=()=>{$('result').close();start(won?(level+1)%5:level);};$('result').showModal();}
function state(){return{level:level+1,venue:stages[level].name,moves,score,collected,target:stages[level].target,busy,finished,board:board.map(t=>({...t}))};}
$('restart').onclick=()=>{if(busy)return;$('result').close();start();};$('hint').onclick=()=>{if(busy||finished)return;const pair=possible();if(pair){pair.forEach(i=>$('board').children[i].classList.add('hinted'));setTimeout(()=>document.querySelectorAll('.hinted').forEach(x=>x.classList.remove('hinted')),1600);}};$('sound').onclick=()=>{sound=!sound;if(sound){audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();chime(1);}$('sound').textContent=sound?'Sound on':'Sound off';$('sound').setAttribute('aria-pressed',String(sound));};$('result').addEventListener('cancel',e=>e.preventDefault());start();
if(document.modelContext?.registerTool){for(const tool of [{name:'read_game_state',description:'Read the current puzzle board, goals, and remaining moves.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute:()=>state()},{name:'swap_game_tiles',description:'Swap two adjacent tiles by their zero-based indices (0 to 63). A valid match consumes one move.',inputSchema:{type:'object',properties:{a:{type:'integer',minimum:0,maximum:63},b:{type:'integer',minimum:0,maximum:63}},required:['a','b'],additionalProperties:false},annotations:{readOnlyHint:false},execute:async({a,b})=>{if(!Number.isInteger(a)||!Number.isInteger(b))throw Error('Indices must be integers.');return await swap(a,b);}}]){try{Promise.resolve(document.modelContext.registerTool(tool)).catch(()=>{});}catch{}}}
