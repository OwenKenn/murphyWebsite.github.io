/* ════════════════════════════════════════════
   CIT Student Guide — Shared JavaScript
   ════════════════════════════════════════════ */

// ── Scroll to top (Classes & Skills pages) ──
function scrollToTop() {
    const area = document.getElementById('main-area');
    if (area) area.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── Map tab switching (Map page only) ──
let currentBuilding = 'full';
let currentTab = 'floorplan';

function selectMapTab(el) {
    document.querySelectorAll('.map-tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
    currentTab = el.dataset.tab;
    renderMap();
}

function loadBuildingMap() {
    currentBuilding = document.getElementById('building-select').value;
    renderMap();
}

function renderMap() {
    const img = document.querySelector('.map-image-area img');
    if (!currentBuilding) {
        img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
        img.alt = 'Select a building';
        return;
    }
    img.src = `maps/${currentBuilding}_${currentTab}.png`;
    img.alt = `${currentBuilding}-${currentTab} map`;

    // Reset pan/zoom whenever a new map loads
    resetTransform();
}

// ── Pan & Zoom ──
let scale = 1;
let originX = 0;
let originY = 0;
let isPanning = false;
let startX = 0;
let startY = 0;

const MIN_SCALE = 1;
const MAX_SCALE = 5;

function resetTransform() {
    scale = 1;
    originX = 0;
    originY = 0;
    const img = document.querySelector('.map-image-area img');
    if (img) {
        img.style.transform = 'none';
        img.style.transformOrigin = '0 0';
        img.style.cursor = 'default';
    }
}

function applyTransform() {
    const img = document.querySelector('.map-image-area img');
    if (!img) return;
    img.style.transformOrigin = '0 0';
    img.style.transform = `translate(${originX}px, ${originY}px) scale(${scale})`;
    img.style.cursor = isPanning ? 'grabbing' : (scale > 1 ? 'grab' : 'default');
}

function clampPan() {
    const area = document.querySelector('.map-image-area');
    if (!area) return;
    const areaW = area.clientWidth;
    const areaH = area.clientHeight;
    originX = Math.min(0, Math.max(originX, areaW - areaW * scale));
    originY = Math.min(0, Math.max(originY, areaH - areaH * scale));
}

document.addEventListener('DOMContentLoaded', () => {
    renderMap();
    const area = document.querySelector('.map-image-area');
    if (!area) return;

    area.addEventListener('dragstart', (e) => e.preventDefault());

    // Scroll to zoom
    area.addEventListener('wheel', (e) => {
        e.preventDefault();

        const rect = area.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale * delta));

        // Zoom toward mouse cursor
        originX = mouseX - (mouseX - originX) * (newScale / scale);
        originY = mouseY - (mouseY - originY) * (newScale / scale);
        scale = newScale;

        clampPan();
        applyTransform();
    }, { passive: false });

    // Mouse drag to pan
    area.addEventListener('mousedown', (e) => {
        if (scale <= 1) return;
        isPanning = true;
        startX = e.clientX - originX;
        startY = e.clientY - originY;
        applyTransform();
    });

    document.addEventListener('mousemove', (e) => {
        if (!isPanning) return;
        originX = e.clientX - startX;
        originY = e.clientY - startY;
        clampPan();
        applyTransform();
    });

    document.addEventListener('mouseup', () => {
        if (!isPanning) return;
        isPanning = false;
        applyTransform();
    });

    // Touch support (mobile)
    let lastTouchDist = null;

    area.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1 && scale > 1) {
            isPanning = true;
            startX = e.touches[0].clientX - originX;
            startY = e.touches[0].clientY - originY;
        }
        if (e.touches.length === 2) {
            lastTouchDist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
        }
    }, { passive: true });

    area.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (e.touches.length === 1 && isPanning) {
            originX = e.touches[0].clientX - startX;
            originY = e.touches[0].clientY - startY;
            clampPan();
            applyTransform();
        }
        if (e.touches.length === 2 && lastTouchDist !== null) {
            const dist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            const rect = area.getBoundingClientRect();
            const midX = ((e.touches[0].clientX + e.touches[1].clientX) / 2) - rect.left;
            const midY = ((e.touches[0].clientY + e.touches[1].clientY) / 2) - rect.top;
            const delta = dist / lastTouchDist;
            const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale * delta));

            originX = midX - (midX - originX) * (newScale / scale);
            originY = midY - (midY - originY) * (newScale / scale);
            scale = newScale;
            lastTouchDist = dist;

            clampPan();
            applyTransform();
        }
    }, { passive: false });

    area.addEventListener('touchend', () => {
        isPanning = false;
        lastTouchDist = null;
    });
});

// ── Prof dropdown (Profs page only) ──
// Professor data
const profData = {
    graham: {
        name: "Stephen Graham",
        email: "stephen.graham@lethpolytech.ca",
        img: "images/stephen.jpg",
        background: "Prof. Stephen has over 20 years of experience in the world of computer information and technology. He was a co-owner of one of the earlyest tech " +
            "buisnesses in lethbridge, and has since turned his passion for running the 'techy' side of his buisness into a passion for teaching thouse skills.",
        description: "Stephen teaches a variety of CIT courses focused on...",
        classes: ["CIT 1100 - Intro to Programming", "CIT 2200 - Web Development"]
    },
    tim: {
        name: "Timothy Frantz",
        email: "timothy.frantz@lethpolytech.ca",
        img: "images/Tim.png",
        background: "Prof. Tim's background includes...",
        description: "Tim specializes in...",
        classes: ["CIT 1500 - Networking", "CIT 2400 - Database Systems"]
    },
    shoja: {
        name: "Shoja Mazidi",
        email: "shoja.mazidi@lethpolytech.ca",
        img: "images/shoja.jpg",
        background: "Prof. Shoja has a background in electrical engineering, and has a passion for that side of computer science.",
        description: "Prof. Shoja focuses on the more technical side of the industry, with his lesions focusing on the fundamental" + 
        " backbones that allow this industry to work.",
        classes: ["CIT 1300 - Computer Mathamatics", "CIT 2600 - Computer Networking"]
    }
};

function loadProf(value) {
    const prof = profData[value];
    // If blank option selected, reset to defaults
    if (!prof) {
        document.getElementById('prof-name-heading').textContent = "(Professor's Name)";
        document.getElementById('prof-bg-text').textContent = "";
        document.getElementById('prof-desc').textContent = "";
        document.getElementById('prof-email').textContent = "";
        document.getElementById('prof-classes').innerHTML = "<li><a href='classes.html'>(Classes taught...)</a></li>";
        document.querySelector('.prof-img img').src = "data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=";
        return;
     }
   

    // Update each element
    document.getElementById('prof-name-heading').textContent = prof.name;
    document.getElementById('prof-bg-text').textContent = prof.background;
    document.getElementById('prof-desc').textContent = prof.description;
    document.getElementById('prof-email').textContent = prof.email;
    document.querySelector('.prof-img img').src = prof.img;

    // Build the classes list
    const classesList = document.getElementById('prof-classes');
    classesList.innerHTML = prof.classes
        .map(c => `<li><a href="classes.html">${c}</a></li>`)
        .join('');
}

// ── Footer link visited state (All pages) ──
// Footer links start bold, become normal after click
document.querySelectorAll('footer a').forEach(link => {
    // Start bold by default
    link.style.fontWeight = 'bold';

    // On page load, check if this link was previously clicked
    if (localStorage.getItem(link.href)) {
        link.style.fontWeight = 'normal';
    }

    // On click, save it and make it normal
    link.addEventListener('click', function () {
        localStorage.setItem(this.href, 'visited');
        this.style.fontWeight = 'normal';
        this.style.fontStyle = 'italic'; // Optional: also make it italic to show it's been visited
    });
});