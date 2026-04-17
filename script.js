/* ════════════════════════════════════════════
   CIT Student Guide — Shared JavaScript
   ════════════════════════════════════════════ */

// ── Scroll to top (Classes & Skills pages) ──
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const area = document.getElementById('main-area');
    if (area) area.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── Map tab switching (Map page only) ──
let currentBuilding = 'ib';
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

function zoomIn() {
    const area = document.querySelector('.map-image-area');
    const rect = area.getBoundingClientRect();
    const midX = rect.width / 2;
    const midY = rect.height / 2;
    const newScale = Math.min(MAX_SCALE, scale * 1.25);
    originX = midX - (midX - originX) * (newScale / scale);
    originY = midY - (midY - originY) * (newScale / scale);
    scale = newScale;
    clampPan();
    applyTransform();
}

function zoomOut() {
    const area = document.querySelector('.map-image-area');
    const rect = area.getBoundingClientRect();
    const midX = rect.width / 2;
    const midY = rect.height / 2;
    const newScale = Math.max(MIN_SCALE, scale * 0.8);
    originX = midX - (midX - originX) * (newScale / scale);
    originY = midY - (midY - originY) * (newScale / scale);
    scale = newScale;
    clampPan();
    applyTransform();
}

document.addEventListener('DOMContentLoaded', () => {
    // Load default prof on profs page
    const sel = document.getElementById('prof-select');
    if (sel) {
        const params = new URLSearchParams(window.location.search);
        const profParam = params.get('prof');
        if (profParam && sel.querySelector(`option[value="${profParam}"]`)) {
            sel.value = profParam;
        }
        loadProf(sel.value);
    }

    // Map setup
    renderMap();
    const area = document.querySelector('.map-image-area');
    if (!area) return;

    area.addEventListener('dragstart', (e) => e.preventDefault());

    area.addEventListener('wheel', (e) => {
        e.preventDefault();
        const rect = area.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale * delta));
        originX = mouseX - (mouseX - originX) * (newScale / scale);
        originY = mouseY - (mouseY - originY) * (newScale / scale);
        scale = newScale;
        clampPan();
        applyTransform();
    }, { passive: false });

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
        background: "Prof. Stephen has over 20 years of experience in the world of computer information and technology. He was a co-owner " +
            "of one of the earliest tech businesses in Lethbridge and has since turned his passion for running the 'techy' side of his " +
            "business into a passion for teaching those skills.",
        description: "Stephen teaches a variety of CIT courses focused on Computer Programing and Networking. He has decades of " +
            "experience with computer programing, and this gives him a unique talent with those skills is evident in his teaching",
        classes: ["CIT 1154 - Computer Programing I-III", "CIT 1158 - Computer Networking II-III"],
        office:
            `
                <table style="border: 1px solid black;">
                            <tr>
                                <th style="width: 5%;">Hours</th>
                                <th>Monday</th>
                                <th>Tuesday</th>
                                <th>Wednesday</th>
                                <th>Thursday</th>
                                <th>Friday</th>
                            </tr>
                            <tr>
                                <td>8:00</td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td rowspan="4">CIT-2259-L01 <br>IB2133</td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>8:30</td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>9:00</td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>9:30</td>
                                <td></td>
                                <td rowspan="4">CIT-1156-C01</td>
                                <td></td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>10:00</td>
                                <td></td>
                                <td rowspan="4">CIT-2259-L02 <br>CE1365</td>
                                <td></td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>10:30</td>
                                <td></td>
                                <td></td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>11:00</td>
                                <td></td>
                                <td rowspan="4">CIT-2259-L02 <br>IB2133</td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>11:30</td>
                                <td></td>
                                <td rowspan="3"></td>
                                <td rowspan="4">CIT-1156-C01 <br>IB2131</td>
                            </tr>
                            <tr>
                                <td>12:00</td>
                                <td></td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>12:30</td>
                                <td></td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>13:00</td>
                                <td></td>
                                <td rowspan="4">CIT-1156-C02</td>
                                <td rowspan="2">CIT-2259-C01 <br>CE1365</td>
                                <td rowspan="4">CIT-1156-C02 <br>IB2131</td>
                            </tr>
                            <tr>
                                <td>13:30</td>
                                <td></td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>14:00</td>
                                <td></td>
                                <td></td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>14:30</td>
                                <td></td>
                                <td></td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>15:00</td>
                                <td></td>
                                <td rowspan="2" colspan="3">Student Office Hours</td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>15:30</td>
                                <td></td>
                                <td></td>
                            </tr>
                </table> 
            `
    },
    tim: {
        name: "Timothy Frantz",
        email: "timothy.frantz@lethpolytech.ca",
        img: "images/tim.jpg",
        background: "Timothy Frantz has been an instructor for the CIT program since 2016. Tim’s teaching philosophy is enabling his students to succeed, in school and in their careers. " +
            "He has taught a variety of courses to students in multiple programs for the past 30 years, all while being a partner in an IT Consulting firm, a licensed Property Manager, a " +
            "gourmet food and spice creator and entrepreneur, and an active member of the Lethbridge Kinsmen. Tim’s primary focus in his own life is his family, including seven very grown " +
            "children and 7.5 grandchildren. If the weather outside is decent, you will find him on a golf course, or travelling to tropical beaches, often in Mexico.",
        description: "Timothy teaches Database design and UX usability and design. His experience as a teacher and in the industry gives him a unique perspective and unique real-world lessons to teach.",
        classes: ["CIT 2268 - UX usability and design", "CIT 1163 - Database Management Systems"],
        office: 
            `
                <table style="border: 1px solid black;">
                            <tr>
                                <th style="width: 5%;">Hours</th>
                                <th>Monday</th>
                                <th>Tuesday</th>
                                <th>Wednesday</th>
                                <th>Thursday</th>
                                <th>Friday</th>
                            </tr>
                            <tr>
                                <td>8:00</td>
                                <td rowspan="3">CIT-2268-C01 <br>IB2111</td>
                                <td></td>
                                <td rowspan="3">CIT-2268-C01 <br>IB2111</td>
                                <td></td>
                                <td rowspan="6">CIT-2276-L01 <br>IB2111</td>
                            </tr>
                            <tr>
                                <td>8:30</td>
                                <td></td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>9:00</td>
                                <td></td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>9:30</td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>10:00</td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>10:30</td>
                                <td rowspan="2">Office Hours</td>
                                <td></td>
                                <td rowspan="4">CIT-1163-C01 <br>IB2131</td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>11:00</td>
                                <td rowspan="3">CIT-2268-C02 <br>IB2111</td>
                                <td rowspan="3">CIT-2268-C02 <br>IB2111</td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>11:30</td>
                                <td></td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>12:00</td>
                                <td rowspan="4">CIT-1163-C01 <br>IB2131</td>
                                <td rowspan="6">CIT-2276-L02 <br>IB2111</td>
                            </tr>
                            <tr>
                                <td>12:30</td>
                                <td></td>
                                <td></td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>13:00</td>
                                <td rowspan="4">CIT-2276-C01 <br>CE1365</td>
                                <td rowspan="2" colspan="2">Office Hours</td>

                            </tr>
                            <tr>
                                <td>13:30</td>
                            </tr>
                            <tr>
                                <td>14:00</td>
                                <td rowspan="4">CIT-1163-C02 <br>IB2131</td>
                                <td rowspan="4">CIT-1163-C02 <br>IB2131</td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>14:30</td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>15:00</td>
                                <td></td>
                                <td></td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>15:30</td>
                                <td></td>
                                <td></td>
                                <td></td>
                            </tr>
                        </table>
            `
    },
    shoja: {
        name: "Shoja Mazidi",
        email: "shoja.mazidi@lethpolytech.ca",
        img: "images/shoja.png",
        background: "Prof. Mazidi has a background in electrical engineering and has a passion for that side of computer science.",
        description: "Prof. Mazidi focuses on the more technical side of the industry, with his lesions focusing on the fundamental" + 
        " backbones that allow this industry to work.",
        classes: ["CIT 1152 - Computer Mathamatics", "CIT 1158 - Computer Networking I"],
        office:
            `
            <table style="border: 1px solid black;">
                            <tr>
                                <th style="width: 5%;">Hours</th>
                                <th>Monday</th>
                                <th>Tuesday</th>
                                <th>Wednesday</th>
                                <th>Thursday</th>
                                <th>Friday</th>
                            </tr>
                            <tr>
                                <td>8:00</td>
                                <td rowspan="3">CIT-1158-C01 <br>IB1133</td>
                                <td></td>
                                <td rowspan="5">CIT-1158-L01 <br>IB2133</td>
                                <td></td>
                                <td rowspan="5">CIT-1158-L03 <br>IB2133</td>
                            </tr>
                            <tr>
                                <td>8:30</td>
                                <td></td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>9:00</td>
                                <td></td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>9:30</td>
                                <td rowspan="3">CIT-1158 <br>IB1133</td>
                                <td rowspan="4">CIT-2263 C01 <br>IB2133</td>
                            </tr>
                            <tr>
                                <td>10:00</td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>10:30</td>
                                <td rowspan="2">Office Hours</td>
                                <td></td>
                                <td rowspan="2">Office Hours</td>
                            </tr>
                            <tr>
                                <td>11:00</td>
                                <td>Office Hours</td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>11:30</td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>12:00</td>
                                <td rowspan="4">CIT-2263-C02 <br>IB2133</td>
                                <td rowspan="2">Practicum Office Hour</td>
                                <td></td>
                                <td></td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>12:30</td>
                                <td rowspan="5">CIT-1158-L02 <br>IB2133</td>
                                <td></td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>13:00</td>
                                <td></td>
                                <td></td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>13:30</td>
                                <td></td>
                                <td></td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>14:00</td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>14:30</td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>15:00</td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>15:30</td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                            </tr>
                        </table>
            `
    }
};

function loadProf(value) {
    const prof = profData[value];

    // If blank option selected, reset to defaults
    if (!prof) {
        document.getElementById('prof-bg-text').textContent = "";
        document.getElementById('prof-desc').textContent = "";
        document.getElementById('prof-email').textContent = "";
        document.getElementById('prof-classes').innerHTML = "<li><a href='classes.html'>(Classes taught...)</a></li>";
        document.querySelector('.prof-img img').src = "data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=";
        document.querySelector('.prof-schedule-box').innerHTML = "(No Schedule Available)";
        return;
    }

    // Update each element
    document.getElementById('prof-bg-text').textContent = prof.background;
    document.getElementById('prof-desc').textContent = prof.description;
    document.getElementById('prof-email').textContent = prof.email;
    document.querySelector('.prof-img img').src = prof.img;

    // Build the classes list
    const classesList = document.getElementById('prof-classes');
    classesList.innerHTML = prof.classes
        .map(c => `<li><a href="classes.html">${c}</a></li>`)
        .join('');

    // Render the office hours table
    const box = document.querySelector('.prof-schedule-box');
    box.innerHTML = prof.office ?? "(No Schedule Available)";
}

// ── Footer link visited state (All pages) ──
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


// - Skills link visited state -
document.querySelectorAll('.skills-box a').forEach(link => {
    // On page load, check if this link was previously clicked
    if (localStorage.getItem(link.href)) {
        link.style.fontWeight = 'normal';
    }

    // On click, save it and make it normal
    link.addEventListener('click', function () {
        localStorage.setItem(this.href, 'visited');
        this.style.fontWeight = 'bold';
        this.style.fontStyle = 'italic'; // Optional: also make it italic to show it's been visited
    });
});
