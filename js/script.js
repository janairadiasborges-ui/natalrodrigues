const FONTE = '<!DOCTYPE html>\n' + document.documentElement.outerHTML;
const EMBUTIDO = window.CONFIG_SORTEIO || null;
const $ = s => document.querySelector(s);
const reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;

const M = 99991;
function inv(a){ let [t,nt,r,nr] = [0,1,M,a]; while(nr){ const q = Math.floor(r/nr); [t,nt] = [nt,t-q*nt]; [r,nr] = [nr,r-q*nr]; } return (t%M+M)%M; }
function sal(N){ return Math.max(1, Math.floor(M*0.1/(N*N))); }
function codificar(g, r, cfg){
  const N = cfg.n.length, s = rnd(sal(N));
  const p = (s*N + g)*N + r;
  return String((p*cfg.a + cfg.k) % M).padStart(5,'0');
}
function decodificar(txt, cfg){
  const c = parseInt(String(txt).replace(/\D/g,''), 10);
  if (isNaN(c) || c >= M || !cfg) return null;
  const N = cfg.n.length;
  const p = (((c - cfg.k) % M + M) % M) * inv(cfg.a) % M;
  if (p >= sal(N)*N*N) return null;
  const r = p % N, g = Math.floor(p / N) % N;
  if (g === r) return null;
  return { g, r };
}
const guardar = { ler(k){ try { return localStorage.getItem(k); } catch(e){ return null; } }, gravar(k,v){ try { localStorage.setItem(k,v); } catch(e){} }, apagar(k){ try { localStorage.removeItem(k); } catch(e){} } };

function rnd(n){ const a = new Uint32Array(1); crypto.getRandomValues(a); return a[0] % n; }
function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=rnd(i+1); [a[i],a[j]]=[a[j],a[i]]; } return a; }
function fmtDate(d){ if(!d) return ''; const [y,m,da]=d.split('-'); return `${da}/${m}/${y}`; }
function esc(s){ return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
async function copiar(txt){
  try { await navigator.clipboard.writeText(txt); return true; }
  catch(e){
    const t=document.createElement('textarea'); t.value=txt; t.style.position='fixed'; t.style.opacity='0';
    document.body.appendChild(t); t.select(); let ok=false; try{ ok=document.execCommand('copy'); }catch(_){}
    t.remove(); return ok;
  }
}
function flash(btn, txt){ const o=btn.textContent; btn.textContent=txt; setTimeout(()=>btn.textContent=o,1600); }
function diasAte(iso){
  const [y,m,d] = iso.split('-').map(Number);
  const alvo = new Date(y, m-1, d); const hoje = new Date(); hoje.setHours(0,0,0,0);
  return Math.round((alvo - hoje) / 86400000);
}
function contagem(iso, rotulo){
  const el = $('#count');
  if (!iso){ el.classList.add('hidden'); return; }
  const n = diasAte(iso);
  el.classList.remove('hidden');
  if (n > 1) el.innerHTML = `Faltam <b>${n}</b> dias para ${rotulo}`;
  else if (n === 1) el.innerHTML = `<b>Amanhã</b> é ${rotulo.replace(/^o |^a /,'')}!`;
  else if (n === 0) el.innerHTML = `<b>Hoje</b> é dia de ${rotulo.replace(/^o |^a /,'')}!`;
  else el.classList.add('hidden');
}
function natalISO(){ const h=new Date(); let y=h.getFullYear(); if (h.getMonth()===11 && h.getDate()>25) y++; return `${y}-12-25`; }
function titulo(e){ const resto = e.replace(/^amigo\s+secreto\s*(da|de|do|-|–)?\s*/i,'').trim(); return resto || e; }
function aplicarCabecalho(cfg){
  document.title = cfg.e;
  $('#titulo').textContent = titulo(cfg.e);
  contagem(cfg.d || natalISO(), cfg.d ? 'a troca de presentes' : 'o Natal');
}

(function(){
  const box = $('#stars');
  for (let i=0;i<70;i++){
    const s = document.createElement('div'); s.className='star-dot';
    s.style.cssText = `left:${Math.random()*100}%;top:${Math.random()*60}%;animation-delay:-${Math.random()*3}s;animation-duration:${2+Math.random()*3}s;transform:scale(${.6+Math.random()})`;
    box.appendChild(s);
  }
})();

function montarLuzes(){
  const svg = $('#lights'); const w = innerWidth; const passo = w < 560 ? 56 : 72;
  const cores = ['#ff4d4d','#ffd54a','#4ee08a','#5ec8ff','#ff8ad8'];
  svg.setAttribute('viewBox', `0 0 ${w} 60`);
  let fio = '', bulbos = '';
  for (let x=0, i=0; x<w+passo; x+=passo, i++){
    const meio = x + passo/2;
    fio += `M${x} 4 Q${meio} 34 ${x+passo} 4 `;
    const cor = cores[i % cores.length];
    bulbos += `<g transform="translate(${meio} 19)"><rect x="-3" y="-2" width="6" height="6" rx="1" fill="#2b3a33"/>
      <ellipse class="bulb" cx="0" cy="12" rx="5.5" ry="9" fill="${cor}" color="${cor}" style="animation-delay:${(i%5)*.3}s"/></g>`;
  }
  svg.innerHTML = `<path d="${fio}" stroke="#2b3a33" stroke-width="2" fill="none"/>${bulbos}`;
}
montarLuzes(); addEventListener('resize', montarLuzes);

const neve = (function(){
  const c = $('#snow'), x = c.getContext('2d');
  let flocos = [], W, H, t = 0;
  function tam(){ W = c.width = innerWidth; H = c.height = innerHeight; }
  function novo(topo){ const r = Math.random()*2.6 + .8; return { x: Math.random()*W, y: topo ? -10 : Math.random()*H, r, vy: r*.35 + .25, f: Math.random()*Math.PI*2, a: .45 + Math.random()*.5 }; }
  tam(); for (let i=0;i<(innerWidth < 560 ? 90 : 160);i++) flocos.push(novo(false));
  addEventListener('resize', tam);
  function frame(){
    t += .01; x.clearRect(0,0,W,H);
    const vento = Math.sin(t) * .6;
    for (const p of flocos){
      p.y += p.vy; p.f += .02; p.x += Math.sin(p.f) * .4 + vento * (p.r/3);
      if (p.y > H + 5){ Object.assign(p, novo(true)); }
      if (p.x > W + 5) p.x = -5; if (p.x < -5) p.x = W + 5;
      x.beginPath(); x.arc(p.x, p.y, p.r, 0, Math.PI*2); x.fillStyle = `rgba(255,255,255,${p.a})`; x.fill();
    }
    if (flocos.length > 400) flocos.splice(0, flocos.length - 400);
    requestAnimationFrame(frame);
  }
  if (!reduz) frame();
  return { rajada(){ for (let i=0;i<120;i++){ const p = novo(true); p.y = -Math.random()*200; flocos.push(p); } } };
})();

function mostrarAba(qual){
  document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('on', x.dataset.tab===qual));
  $('#tab-part').classList.toggle('hidden', qual!=='part');
  $('#tab-org').classList.toggle('hidden', qual!=='org');
}
document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>mostrarAba(b.dataset.tab));

function lerNomes(){ return $('#nomes').value.split('\n').map(s=>s.trim()).filter(Boolean); }
$('#nomes').addEventListener('input',()=>{ const n=lerNomes().length; $('#contagem').textContent = n + (n===1?' participante':' participantes'); });
$('#data').addEventListener('change', e => contagem(e.target.value || natalISO(), e.target.value ? 'a troca de presentes' : 'o Natal'));

function sortear(n, proib){
  for(let t=0;t<20000;t++){
    const p = shuffle([...Array(n).keys()]);
    let ok = true;
    for(let i=0;i<n;i++){ if(p[i]===i || proib.has(i+'-'+p[i])){ ok=false; break; } }
    if(ok) return p;
  }
  return null;
}

let envios = [], cfgNovo = null, baixado = false;

function baseAtual(){ return $('#base').value.trim().replace(/[#?].*$/,'').replace(/\/index\.html$/,'').replace(/\/+$/,''); }
function mensagem(e){
  const ev = cfgNovo;
  let txt = `🎄 *${ev.e}*\n\nOi, ${e.nome}! Chegou a hora de descobrir quem você tirou no amigo secreto. O sorteio é online e a troca vai ser presencial, com todo mundo junto!\n\n1️⃣ Entre no site: ${baseAtual()}\n2️⃣ Digite seu código secreto: *${e.code}*\n\nO código é só seu, não mostre para ninguém!`;
  if (ev.d) txt += `\n\n📅 Data da troca: ${fmtDate(ev.d)}`;
  if (ev.l) txt += `${ev.d ? '\n' : '\n\n'}📍 Local: ${ev.l}`;
  return txt;
}
function pronto(){ return baixado && !!baseAtual(); }
function atualizarLista(){
  const ok = pronto(), eb = $('#errBase');
  eb.textContent = !baixado ? 'Primeiro baixe o site pronto (passo 1).' : (!baseAtual() ? 'Cole o endereço do site (passo 3) para liberar o envio.' : '');
  eb.style.display = ok ? 'none' : 'block';
  $('#st1').classList.toggle('done', baixado);
  document.querySelectorAll('#lista .item').forEach((it,i)=>{
    const a = it.querySelector('a'), btn = it.querySelector('button');
    a.href = ok ? `https://wa.me/?text=${encodeURIComponent(mensagem(envios[i]))}` : '#';
    a.classList.toggle('off', !ok); btn.disabled = !ok;
  });
  guardar.gravar('as_base', $('#base').value.trim());
  guardar.gravar('as_baixado', baixado ? String(cfgNovo.k) : '');
}
$('#base').addEventListener('input', atualizarLista);
$('#btnConferir').onclick = ev => { ev.preventDefault(); if (!baseAtual()){ $('#base').focus(); return; } open(baseAtual() + '/', '_blank'); };

function salvarOrg(){ guardar.gravar('as_org', JSON.stringify({ cfg: cfgNovo, envios })); }

function mostrarResultado(){
  const lista = $('#lista'); lista.innerHTML = '';
  envios.forEach((e, k)=>{
    const it = document.createElement('div'); it.className = 'item' + (e.enviado ? ' sent' : ''); it.style.animationDelay = (k*60)+'ms';
    const status = () => `Código <b class="cod">${e.code}</b> · ${e.enviado ? 'enviado ✓' : 'ainda não enviado'}`;
    it.innerHTML = `<div class="nm">${esc(e.nome)}<small>${status()}</small></div>
      <button class="btn ghost sm">Copiar mensagem</button>
      <a class="btn wa sm" target="_blank" rel="noopener">WhatsApp</a>`;
    const marcar = () => { e.enviado = true; it.classList.add('sent'); it.querySelector('small').innerHTML = status(); salvarOrg(); };
    it.querySelector('button').onclick = async ev2 => { if (!pronto()) return; await copiar(mensagem(e)); flash(ev2.target,'Copiado!'); marcar(); };
    it.querySelector('a').addEventListener('click', ev2 => { if (!pronto()){ ev2.preventDefault(); return; } marcar(); });
    lista.appendChild(it);
  });
  atualizarLista();
  $('#form').classList.add('hidden');
  $('#resultado').classList.remove('hidden');
}

$('#btnGerar').onclick = () => {
  const err = $('#errOrg'); err.style.display='none';
  const fail = m => { err.textContent = m; err.style.display = 'block'; };
  const nomes = lerNomes();
  if (nomes.length < 3) return fail('Coloque pelo menos 3 participantes, um nome por linha.');
  if (nomes.length > 99) return fail('O limite é de 99 participantes.');
  const low = nomes.map(n=>n.toLowerCase());
  const dupIdx = low.findIndex((n,i)=>low.indexOf(n)!==i);
  if (dupIdx >= 0) return fail(`O nome "${nomes[dupIdx]}" aparece duas vezes. Diferencie, por exemplo "Ana Paula" e "Ana Clara".`);

  const proib = new Set();
  for (const linha of $('#restr').value.split('\n').map(s=>s.trim()).filter(Boolean)){
    const partes = linha.split(/\s+x\s+|\s*[,;\/]\s*/i).map(s=>s.trim()).filter(Boolean);
    if (partes.length < 2) return fail(`Não entendi a restrição "${linha}". Use o formato: Ana x João`);
    const idx = [];
    for (const p of partes){
      const i = low.indexOf(p.toLowerCase());
      if (i < 0) return fail(`"${p}" (em quem não pode tirar quem) não está na lista de participantes. Confira se está escrito igual.`);
      idx.push(i);
    }
    for (const a of idx) for (const b of idx) if (a!==b) proib.add(a+'-'+b);
  }

  const p = sortear(nomes.length, proib);
  if (!p) return fail('Não deu para fazer um sorteio com essas restrições. Tente remover alguma.');

  cfgNovo = {
    e: $('#evento').value.trim() || 'Amigo Secreto Família Rodrigues',
    d: $('#data').value, l: $('#local').value.trim(), m: $('#msg').value.trim(),
    n: nomes, a: 2 + rnd(M - 3), k: rnd(M)
  };
  envios = nomes.map((nome,i)=>({ nome, code: codificar(i, p[i], cfgNovo), enviado: false }));
  baixado = false;
  salvarOrg();
  mostrarResultado();
  neve.rajada();
  window.scrollTo({top:0,behavior:'smooth'});
};

$('#btnBaixar').onclick = e => {
  const json = JSON.stringify(cfgNovo).replace(/</g,'\\u003c');
  const html = FONTE.replace('/*CFG*/' + 'null' + '/*FIM*/', () => '/*CFG*/' + json + '/*FIM*/');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([html], {type:'text/html'}));
  a.download = 'index.html'; document.body.appendChild(a); a.click(); a.remove();
  baixado = true; atualizarLista();
  flash(e.target, 'Baixado ✓');
};
$('#btnCopiarTodos').onclick = async e => {
  if (!pronto()) return;
  await copiar(`Site: ${baseAtual()}\n\n` + envios.map(x=>`${x.nome}: ${x.code}`).join('\n'));
  flash(e.target,'Copiado!');
};
$('#btnRefazer').onclick = () => {
  if (!confirm('Fazer um novo sorteio? Os códigos que você já mandou vão deixar de valer e você vai precisar subir o site de novo.')) return;
  guardar.apagar('as_org');
  $('#resultado').classList.add('hidden'); $('#form').classList.remove('hidden');
};

const GIFT = `<svg class="gift idle" id="gift" viewBox="0 0 120 130" aria-hidden="true">
  <g class="rays" fill="#ffd54a" opacity=".5">
    ${Array.from({length:12},(_,i)=>`<polygon points="60,60 56,-10 64,-10" transform="rotate(${i*30} 60 60)" opacity=".35"/>`).join('')}
  </g>
  <rect x="18" y="62" width="84" height="60" rx="6" fill="#c0282b"/>
  <rect x="54" y="62" width="12" height="60" fill="#e2b55a"/>
  <g class="lid">
    <rect x="12" y="46" width="96" height="20" rx="5" fill="#d23a3c"/>
    <rect x="54" y="46" width="12" height="20" fill="#e2b55a"/>
    <path d="M60 46c-10-18-34-18-30-4 3 9 20 6 30 4zM60 46c10-18 34-18 30-4-3 9-20 6-30 4z" fill="none" stroke="#e2b55a" stroke-width="6" stroke-linejoin="round"/>
  </g>
</svg>`;

const CONFIG = EMBUTIDO;
const SUB = $('#subtitulo').textContent;

function abrir(code){
  const par = decodificar(code, CONFIG);
  if (!par) return false;
  const d = CONFIG;
  aplicarCabecalho(d);
  $('#subtitulo').textContent = 'Seu sorteio pessoal';
  $('#home').classList.add('hidden');
  const r = $('#reveal'); r.classList.remove('hidden');
  r.innerHTML = `${GIFT}
    <div class="hello">Olá, ${esc(d.n[par.g])}!</div>
    <p class="sub" style="margin-top:8px">Pronto para descobrir quem você tirou?<br>Confira se ninguém está olhando a sua tela.</p>
    <div id="area" class="hidden">
      <div class="label">Você tirou</div>
      <div class="slot" id="slot">...</div>
    </div>
    <button class="btn big block" id="btnSortear" style="max-width:360px">🎁 Sortear meu amigo secreto</button>
    <p class="sub" id="naoSou" style="margin-top:14px;font-size:13px">Não é você? <a href="#" id="voltar">Digite outro código</a></p>
    <div id="depois"></div>`;
  $('#btnSortear').onclick = () => girar(d, par);
  $('#voltar').onclick = ev => { ev.preventDefault(); history.replaceState(null,'',location.pathname); r.classList.add('hidden'); $('#home').classList.remove('hidden'); mostrarAba('part'); $('#codigo').value=''; $('#subtitulo').textContent = SUB; };
  window.scrollTo({top:0});
  return true;
}

function girar(d, par){
  $('#btnSortear').remove(); $('#naoSou').remove();
  $('#area').classList.remove('hidden');
  const gift = $('#gift'); gift.classList.remove('idle'); gift.classList.add('shake');
  document.body.classList.add('party');
  const outros = d.n.filter((_,i)=>i!==par.g);
  const slot = $('#slot'); slot.classList.add('spin');
  let t = 0; const steps = 32; let ult = -1;
  const tick = () => {
    if (t >= steps){
      slot.classList.remove('spin'); slot.textContent = d.n[par.r]; slot.classList.add('won');
      gift.classList.remove('shake'); gift.classList.add('open');
      confete(); neve.rajada(); fim(d);
      setTimeout(()=>document.body.classList.remove('party'), 4000);
      return;
    }
    let k; do { k = rnd(outros.length); } while (outros.length>1 && k===ult); ult = k;
    slot.textContent = outros[k]; t++;
    setTimeout(tick, 45 + t*t*0.33);
  };
  tick();
}

function fim(d){
  let pills = '';
  if (d.d) pills += `<span class="pill">📅 ${fmtDate(d.d)}</span>`;
  if (d.l) pills += `<span class="pill">📍 ${esc(d.l)}</span>`;
  $('#depois').innerHTML = `<div class="fade">
    ${pills ? `<div class="info">${pills}</div>` : ''}
    ${d.m ? `<p class="msg">“${esc(d.m)}”</p>` : ''}
    <p class="secret">Shhh… agora é segredo até o dia da troca. Não conte para ninguém!</p>
  </div>`;
}

function confete(){
  if (reduz) return;
  const c = $('#confetti'), x = c.getContext('2d');
  c.width = innerWidth; c.height = innerHeight;
  const alvo = $('#slot').getBoundingClientRect();
  const ox = alvo.left + alvo.width/2, oy = alvo.top + alvo.height/2;
  const cores = ['#c0282b','#e2b55a','#1f8f4e','#ffffff','#ff6b6b','#5ec8ff'];
  const ps = Array.from({length:220},()=>({
    x: ox + (Math.random()-.5)*140, y: oy,
    vx: (Math.random()-.5)*16, vy: -Math.random()*15-4,
    w: 6+Math.random()*7, h: 4+Math.random()*4, a: Math.random()*6, va: (Math.random()-.5)*.3,
    cor: cores[rnd(cores.length)], estrela: Math.random() < .2
  }));
  const ini = performance.now();
  (function frame(now){
    x.clearRect(0,0,c.width,c.height);
    ps.forEach(p=>{ p.vy += .32; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.a += p.va;
      x.save(); x.translate(p.x,p.y); x.rotate(p.a); x.fillStyle = p.cor;
      if (p.estrela){ x.beginPath(); for(let i=0;i<10;i++){ const r = i%2 ? 3 : 7; const an = i*Math.PI/5; x.lineTo(Math.cos(an)*r, Math.sin(an)*r); } x.closePath(); x.fill(); }
      else x.fillRect(-p.w/2,-p.h/2,p.w,p.h);
      x.restore(); });
    if (now - ini < 5000) requestAnimationFrame(frame); else x.clearRect(0,0,c.width,c.height);
  })(ini);
}

function tentarCodigo(){
  const e = $('#errPart'), v = $('#codigo').value;
  if (v.length < 5){ e.textContent = 'O código tem 5 números.'; e.style.display = 'block'; return; }
  if (!CONFIG){ e.textContent = 'Este site ainda não tem o sorteio. Avise o organizador: ele precisa subir no site o arquivo baixado depois do sorteio.'; e.style.display = 'block'; return; }
  if (abrir(v)) e.style.display = 'none';
  else { e.textContent = 'Código não encontrado. Confira os 5 números que você recebeu.'; e.style.display = 'block'; }
}
$('#btnAbrir').onclick = tentarCodigo;
$('#codigo').addEventListener('keydown', e => { if (e.key === 'Enter') tentarCodigo(); });
$('#codigo').addEventListener('input', e => { e.target.value = e.target.value.replace(/\D/g,'').slice(0,5); });

function abrirHash(){
  const m = decodeURIComponent(location.hash).match(/^#\s*(\d{5})\b/);
  if (!m) return;
  $('#home').classList.remove('hidden');
  if (abrir(m[1])) return;
  mostrarAba('part'); $('#codigo').value = m[1]; tentarCodigo();
}

function restaurarOrg(){
  const salvo = guardar.ler('as_org');
  if (!salvo) return false;
  try {
    const o = JSON.parse(salvo);
    if (EMBUTIDO && o.cfg.k !== EMBUTIDO.k) return false;
    cfgNovo = o.cfg; envios = o.envios;
    baixado = !!EMBUTIDO || guardar.ler('as_baixado') === String(cfgNovo.k);
    $('#base').value = guardar.ler('as_base') || '';
    mostrarResultado();
    return true;
  } catch(e){ return false; }
}

const ehOrganizador = restaurarOrg();
if (EMBUTIDO){
  aplicarCabecalho(EMBUTIDO);
  if (ehOrganizador){
    $('#tabs').classList.remove('hidden');
    if (!$('#base').value) $('#base').value = location.origin + location.pathname;
    atualizarLista();
  }
  mostrarAba('part');
} else {
  $('#tabs').classList.remove('hidden');
  contagem(natalISO(), 'o Natal');
  if (!$('#base').value && /^https?:/.test(location.protocol)) $('#base').value = location.origin + location.pathname;
  if (ehOrganizador) atualizarLista();
  mostrarAba(ehOrganizador || location.protocol === 'file:' ? 'org' : 'part');
}
abrirHash();
addEventListener('hashchange', abrirHash);
