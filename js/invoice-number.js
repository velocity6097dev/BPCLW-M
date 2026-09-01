/* ══════════════════════════════════════════════
   LOGO — applies BPCL_LOGO_URL to the header badge; falls back to the
   default flame + wordmark mark if the URL is empty or fails to load.
   ══════════════════════════════════════════════ */
function applyTopbarLogo(){
  const url = BPCL_LOGO_URL.trim();
  const img = $('topbarLogoImg');
  const icon = $('topbarFallbackIcon');
  const word = $('topbarFallbackWordmark');
  if(!img) return;
  if(!url){ img.style.display = 'none'; return; }
  img.onload = ()=>{
    img.style.display = 'block';
    if(icon) icon.style.display = 'none';
    if(word) word.style.display = 'none';
  };
  img.onerror = ()=>{
    img.style.display = 'none';
    if(icon) icon.style.display = '';
    if(word) word.style.display = '';
  };
  img.src = url;
}

/* ── Header stays static: "BPCL W&M Reimbursement" / "Stamping Fee Invoice Generator" ── */
function updateHeaderInfo(){ /* intentionally static — header no longer mirrors form fields */ }

/* ── Invoice number: DD + Mon (e.g. "Aug") + YY + dealer code + a
   per-day sequence number, max 16 chars ── e.g. 04Aug2611993401
   Budget: date 7 + dealer 6 + seq 2(+) = 15-16. No room left for the machine
   serial once dealer code takes its full 6 chars — it stays a required
   field and still prints on the invoice, just isn't part of the number.
   The sequence is a "01, 02, 03…" counter that resets to 01 automatically
   whenever the Invoice Date changes to a day that hasn't been used yet on
   this device — so today's invoices always read 01, 02, 03… and tomorrow
   starts back at 01, with no chance of two invoices sharing the same
   date+sequence. It only advances once per NEW invoice (on first
   generation, or after Reset) — retyping fields while filling the form
   doesn't burn through numbers. ── */
let currentInvSeq = null;
function cleanAlnum(s){ return (s||'').toUpperCase().replace(/[^A-Z0-9]/g,''); }
function todayISO(){ return new Date().toISOString().slice(0,10); }
function nextInvSeq(){
  // Bucketed by the invoice date actually on the form (falls back to today),
  // so the counter — and therefore the printed "01, 02…" — resets the moment
  // the date changes, and never repeats for a date already used.
  const dateKey = $('invoiceDate').value || todayISO();
  let stored = null;
  try{ stored = JSON.parse(localStorage.getItem(INV_SEQ_KEY) || 'null'); }catch(e){ stored = null; }
  const seq = (stored && stored.date === dateKey) ? stored.seq + 1 : 1;
  localStorage.setItem(INV_SEQ_KEY, JSON.stringify({ date: dateKey, seq }));
  return String(seq).padStart(2,'0');
}
function ensureInvSeq(){
  if(currentInvSeq === null) currentInvSeq = nextInvSeq();
  return currentInvSeq;
}
function onInvoiceNoManualEdit(){ $('invoiceNo')._userEdited = true; }
function updateInvoiceNo(){
  const inv = $('invoiceNo');
  if(inv._userEdited) return;
  const dateVal = $('invoiceDate').value;
  if(!dateVal) return;
  const [y,m,d] = dateVal.split('-');
  const mon = MONTH_ABBR[parseInt(m,10)-1] || '';
  const dateStr = `${d}${mon}${y.slice(-2)}`;               // e.g. 04Aug26 — 7 chars
  const dealerPart = cleanAlnum($('dealerCode').value).slice(0,6);
  const seq = ensureInvSeq();
  inv.value = `${dateStr}${dealerPart}${seq}`.slice(0,16);
}

function onGstinInput(){
  const el = $('gstin');
  el.value = el.value.toUpperCase();
  const v = el.value;
  $('panNo').value = v.length>=12 ? v.substring(2,12) : '';
  saveLocal();
}

/* ── Nozzle-based pricing ── */
let lastTotal = 0;
function recalc(){
  const nozzles = parseInt($('mpdNozzles').value) || 0;
  const rate = 1500;
  const base = nozzles * rate;
  const addl = parseFloat($('addlAmt').value) || 0;
  const total = base + addl;
  $('sbNozzles').textContent = nozzles;
  $('sbBase').textContent = rsPlain(base);
  $('sbAddl').textContent = rsPlain(addl);
  $('sbTotal').textContent = rsPlain(total);
  const liveEl = $('liveTotal');
  liveEl.textContent = rsPlain(total).replace('.00','');
  if(Math.round(total) !== Math.round(lastTotal)){
    liveEl.classList.remove('tick'); void liveEl.offsetWidth; liveEl.classList.add('tick');
  }
  lastTotal = total;
}
