/* ============================================================
   POUSADA MONTVERDE — main.js v3
   Komplexa Hotéis
   ============================================================ */

const WEBHOOK_URL = 'https://webhook.cidigitalmarketing.com/webhook/7c87bd71-6c33-437f-9073-2fae80d76d2f';
const HOTEL_NAME  = 'Pousada MontVerde';
const WA_NUMBER   = '5521996915036';
const WA_MSG      = 'Olá, tenho interesse em me hospedar na Pousada MontVerde!';
const HQ_BEDS_URL = 'https://booking.hqbeds.com.br/montverde/rooms';

// ── dataLayer GTM ──
window.dataLayer = window.dataLayer || [];
function pushLead(tipo) {
  window.dataLayer.push({
    event:      'gerar_lead',
    lead_tipo:  tipo,
    pagina:     document.title,
    url:        location.href
  });
}

// ── WEBHOOK ──
async function sendToWebhook(payload) {
  try {
    await fetch(WEBHOOK_URL, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        hotel: HOTEL_NAME,
        origem_pagina: document.title,
        url: location.href,
        timestamp: new Date().toISOString(),
        ...payload
      })
    });
  } catch(e) { console.warn('Webhook:', e); }
}

// ── HEADER SCROLL ──
const hdr = document.getElementById('hdr');
if (hdr && hdr.classList.contains('hero-mode')) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 80) { hdr.classList.add('solid'); hdr.classList.remove('hero-mode'); }
    else { hdr.classList.remove('solid'); hdr.classList.add('hero-mode'); }
  }, { passive: true });
}

// ── MOBILE MENU ──
const ham = document.getElementById('ham');
const mob = document.getElementById('mobnav');
function openMob()  { mob?.classList.add('open'); ham?.classList.add('open'); document.body.style.overflow='hidden'; ham?.setAttribute('aria-expanded','true'); }
function closeMob() { mob?.classList.remove('open'); ham?.classList.remove('open'); document.body.style.overflow=''; ham?.setAttribute('aria-expanded','false'); }
ham?.addEventListener('click', () => mob?.classList.contains('open') ? closeMob() : openMob());

// ── LAZY LOAD ──
const imgObs = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('loaded'); imgObs.unobserve(e.target); } });
}, { rootMargin: '200px' });
document.querySelectorAll('img').forEach(img => {
  if (img.complete && img.naturalWidth > 0) img.classList.add('loaded');
  else {
    img.addEventListener('load',  () => img.classList.add('loaded'), {once:true});
    img.addEventListener('error', () => img.classList.add('loaded'), {once:true});
    imgObs.observe(img);
  }
});


// ── FILTRO QUARTOS ──
function filterRooms(type, btn) {
  document.querySelectorAll('.fbtn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('#roomsGrid .rc').forEach(rc => {
    rc.style.display = (type==='all' || rc.dataset.type===type) ? '' : 'none';
  });
}

// ── FILTRO GALERIA ──
function filterGal(cat, btn) {
  document.querySelectorAll('.fbtn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.gi').forEach(item => {
    item.style.display = (cat === 'all' || item.dataset.cat === cat) ? '' : 'none';
  });
}

// ── LIGHTBOX ──
let lbCur = 0; const LB_SRCS = [];
function openLB(i) {
  lbCur=i; const lbImg=document.getElementById('lbImg'); const lbCnt=document.getElementById('lbCnt');
  if(!lbImg) return;
  lbImg.src=LB_SRCS[i]||''; if(lbCnt) lbCnt.textContent=(i+1)+' / '+LB_SRCS.length;
  document.getElementById('lb')?.classList.add('open'); document.body.style.overflow='hidden';
}
function closeLB() { document.getElementById('lb')?.classList.remove('open'); document.body.style.overflow=''; }
function navLB(d) {
  lbCur=(lbCur+d+LB_SRCS.length)%LB_SRCS.length;
  document.getElementById('lbImg').src=LB_SRCS[lbCur]||'';
  document.getElementById('lbCnt').textContent=(lbCur+1)+' / '+LB_SRCS.length;
}
document.getElementById('lb')?.addEventListener('click', e => { if(e.target===document.getElementById('lb')) closeLB(); });
document.addEventListener('keydown', e => {
  if(!document.getElementById('lb')?.classList.contains('open')) return;
  if(e.key==='Escape') closeLB(); if(e.key==='ArrowLeft') navLB(-1); if(e.key==='ArrowRight') navLB(1);
});

// ── FORMULÁRIO CONTATO ──
async function submitContact(e) {
  e.preventDefault();
  const form = e.target;
  const data = Object.fromEntries(new FormData(form));

  // GTM
  pushLead('formulario_contato');

  await sendToWebhook({ tipo: 'contato', ...data });
  form.reset();
  document.getElementById('contactOk')?.classList.add('show');
}

// ── WHATSAPP MODAL ──
(function initWaModal(){
  const html = `
    <div class="wa-modal" id="waModal" role="dialog" aria-modal="true" aria-labelledby="waModalTitle">
      <div class="wa-modal-box">
        <button class="wa-modal-close" type="button" onclick="closeWaModal()" aria-label="Fechar">&times;</button>
        <div class="wa-modal-top">
          <div class="wa-icon">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          </div>
          <div class="wa-modal-titles">
            <h4 id="waModalTitle">Fale pelo WhatsApp</h4>
            <p>Preencha para agilizar seu atendimento</p>
          </div>
        </div>
        <form class="wa-form-body" id="waForm" onsubmit="submitWaModal(event)">
          <div class="fg"><label for="wa-nome">Seu Nome *</label><input type="text" id="wa-nome" name="nome" placeholder="Nome completo" required></div>
          <div class="fg"><label for="wa-email">E-mail *</label><input type="email" id="wa-email" name="email" placeholder="seu@email.com" required></div>
          <div class="fg"><label for="wa-tel">Telefone *</label><input type="tel" id="wa-tel" name="telefone" placeholder="(21) 99999-9999" required></div>
          <button type="submit" class="wa-submit">Ir para o WhatsApp</button>
          <div class="wa-or"><span>ou</span></div>
          <a href="${HQ_BEDS_URL}" target="_blank" rel="noopener" class="wa-reserve">📅 Reservar Agora Online</a>
        </form>
      </div>
    </div>`;
  document.body.insertAdjacentHTML('beforeend', html);

  document.querySelectorAll('a[href*="wa.me/"]').forEach(link => {
    link.addEventListener('click', e => { e.preventDefault(); openWaModal(); });
  });

  document.getElementById('waModal')?.addEventListener('click', e => {
    if (e.target.id === 'waModal') closeWaModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && document.getElementById('waModal')?.classList.contains('open')) closeWaModal();
  });
})();

function openWaModal()  { document.getElementById('waModal')?.classList.add('open'); document.body.style.overflow='hidden'; }
function closeWaModal() { document.getElementById('waModal')?.classList.remove('open'); document.body.style.overflow=''; }

async function submitWaModal(e) {
  e.preventDefault();
  const form = e.target;
  const data = Object.fromEntries(new FormData(form));
  pushLead('whatsapp_modal');
  await sendToWebhook({ tipo: 'whatsapp_modal', ...data });
  form.reset();
  closeWaModal();
  window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(WA_MSG)}`, '_blank');
}

// ── TÍTULO DA ABA ao sair da página ──
const tituloOriginal = document.title;
document.addEventListener('visibilitychange', () => {
  document.title = document.hidden
    ? '👋 Volte Aqui — Estamos te esperando!'
    : tituloOriginal;
});
