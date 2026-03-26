/* ════════════════════════════════════════════
   CIT Student Guide — Shared JavaScript
   ════════════════════════════════════════════ */

// ── Header squish on scroll ──
/*
const mainArea = document.getElementById('main-area');
const mainHeader = document.getElementById('main-header');

if (mainArea && mainHeader) {
    mainArea.addEventListener('scroll', () => {
        mainHeader.classList.toggle('squished', mainArea.scrollTop > 30);
    });
}
*/

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
// Professor data
const profData = {
    graham: {
        name: "Steven Graham",
        email: "steven.graham@lethpolytech.ca",
        img: "images/graham.jpg",
        background: "Prof. Steven has over 20 years of experience in...",
        description: "Steven teaches a variety of CIT courses focused on...",
        classes: ["CIT 1100 - Intro to Programming", "CIT 2200 - Web Development"]
    },
    tim: {
        name: "Tim ...",
        email: "tim.______@lethpolytech.ca",
        img: "images/TestImage.png",
        background: "Prof. Tim's background includes...",
        description: "Tim specializes in...",
        classes: ["CIT 1500 - Networking", "CIT 2400 - Database Systems"]
    },
    patel: {
        name: "Shoja...",
        email: "Shoja.____@lethpolytech.ca",
        img: "images/shoja.jpg",
        background: "Prof. Shoja has a background in...",
        description: "Prof. Shoja focuses on...",
        classes: ["CIT 1300 - Computer Mathamatics", "CIT 2600 - Computer Networking"]
    }
};

function loadProf(value) {
    const prof = profData[value];

    // If blank option selected, reset to defaults
    if (!prof) {
        document.getElementById('prof-name-heading').textContent = "(Professor's Name)";
        document.getElementById('prof-bg-text').textContent = "(A description of the professor's background)";
        document.getElementById('prof-desc').textContent = "(Professor description)";
        document.getElementById('prof-email').textContent = "_____._____@lethpolytech.ca";
        document.getElementById('prof-classes').innerHTML = "<li><a href='classes.html'>(A class taught)</a></li>";
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