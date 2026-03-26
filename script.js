/* ════════════════════════════════════════════
   CIT Student Guide — Shared JavaScript
   ════════════════════════════════════════════ */

// ── Header squish on scroll ──
const mainArea = document.getElementById('main-area');
const mainHeader = document.getElementById('main-header');

if (mainArea && mainHeader) {
    mainArea.addEventListener('scroll', () => {
        mainHeader.classList.toggle('squished', mainArea.scrollTop > 30);
    });
}

// ── Scroll to top (Classes & Skills pages) ──
function scrollToTop() {
    const area = document.getElementById('main-area');
    if (area) area.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── Map tab switching (Map page only) ──
function selectMapTab(el) {
    document.querySelectorAll('.map-tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
}

// ── Prof dropdown (Profs page only) ──
function loadProf(val) {
    const names = { graham: 'Steven Graham', tim: 'Tim...', patel: 'Prof. Patel' };
    const heading = document.getElementById('prof-name-heading');
    if (heading) heading.textContent = names[val] || "(Professor's Name)";
}
