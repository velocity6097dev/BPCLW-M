/* ══════════════════════════════════════════════
   INIT
   ══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', ()=>{
  reIcons();
  applyTopbarLogo();
  setDefaultDates();
  loadLocal();
  updateHeaderInfo();
  ['cert','receipt','extra'].forEach(renderSlot);
  updateInvoiceNo();
  recalc();
});
