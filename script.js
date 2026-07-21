// ==========================================
// SUPABASE CONFIGURATION - SAISIR VOS ACCÈS ICI
// ==========================================
const SUPABASE_URL = "https://hxnfcqrykmbsqqwugbxc.supabase.co";      // URL de votre projet (ex: https://xxxx.supabase.co)
const SUPABASE_ANON_KEY = "sb_publishable_9SaZgJq1R_Jo7uI3GjC0TA_9kSRZWn5"; // Clé Anon publique de votre projet

let supabaseClient = null;
let useSupabase = false;
let isAdmin = true;
let isChef = false;
let isOuvrier = false;
let currentUserProfile = null;

if (SUPABASE_URL && SUPABASE_ANON_KEY && typeof window !== 'undefined' && window.supabase) {
    if (!SUPABASE_URL.startsWith('http://') && !SUPABASE_URL.startsWith('https://')) {
        console.warn("L'URL Supabase configurée est invalide (doit commencer par http:// ou https://). Repli sur la mémoire locale.");
        useSupabase = false;
    } else {
        try {
            supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
                auth: {
                    storage: window.sessionStorage,
                    persistSession: true
                }
            });
            useSupabase = true;
            console.log("Supabase connecté avec succès (sessionStorage) !");
        } catch (e) {
            console.error("Erreur d'initialisation de Supabase :", e);
            useSupabase = false;
        }
    }
}

// Global debug overlay for errors
if (typeof window !== 'undefined') {
    window.addEventListener('error', function (e) {
        const div = document.createElement('div');
        div.style.position = 'fixed';
        div.style.bottom = '10px';
        div.style.right = '10px';
        div.style.backgroundColor = '#fee2e2';
        div.style.color = '#991b1b';
        div.style.padding = '15px';
        div.style.border = '1px solid #f87171';
        div.style.borderRadius = '5px';
        div.style.zIndex = '99999';
        div.style.fontFamily = 'monospace';
        div.style.fontSize = '12px';
        div.style.whiteSpace = 'pre-wrap';
        div.style.maxWidth = '400px';
        div.innerText = 'JS Error: ' + e.message + '\nFile: ' + e.filename + '\nLine: ' + e.lineno;
        document.body.appendChild(div);
    });

    window.addEventListener('unhandledrejection', function (e) {
        const div = document.createElement('div');
        div.style.position = 'fixed';
        div.style.bottom = '10px';
        div.style.right = '10px';
        div.style.backgroundColor = '#fee2e2';
        div.style.color = '#991b1b';
        div.style.padding = '15px';
        div.style.border = '1px solid #f87171';
        div.style.borderRadius = '5px';
        div.style.zIndex = '99999';
        div.style.fontFamily = 'monospace';
        div.style.fontSize = '12px';
        div.style.whiteSpace = 'pre-wrap';
        div.style.maxWidth = '400px';
        div.innerText = 'Promise Rejection: ' + (e.reason ? (e.reason.message || e.reason) : 'Unknown reason');
        document.body.appendChild(div);
    });
}
// ── MODALES CUSTOM ──────────────────────────────────────────────────────────
function showCustomAlert(message, type = 'info') {
    return new Promise(resolve => {
        const modal = document.getElementById('custom-alert-modal');
        const iconDiv = document.getElementById('custom-alert-icon');
        const msgEl = document.getElementById('custom-alert-message');
        const btnOk = document.getElementById('btn-custom-alert-ok');
        const titleEl = document.getElementById('custom-alert-title');
        
        if (!modal) {
            window._nativeAlert(message);
            resolve();
            return;
        }

        msgEl.textContent = message;
        
        let iconHtml = '';
        let iconColor = '';
        let title = '';

        if (type === 'error') {
            iconColor = 'var(--danger)';
            title = 'Erreur';
            iconHtml = `<svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="${iconColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
            btnOk.style.background = 'var(--danger)';
        } else if (type === 'success') {
            iconColor = 'var(--success)';
            title = 'Succès';
            iconHtml = `<svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="${iconColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
            btnOk.style.background = 'var(--success)';
        } else {
            iconColor = 'var(--accent)';
            title = 'Information';
            iconHtml = `<svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="${iconColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
            btnOk.style.background = 'var(--accent)';
        }

        iconDiv.style.color = iconColor;
        iconDiv.innerHTML = iconHtml;
        titleEl.textContent = title;

        modal.style.display = 'flex';
        btnOk.focus();

        let autoCloseTimeout;

        const close = () => {
            modal.style.display = 'none';
            btnOk.removeEventListener('click', close);
            const btnCloseCross = document.getElementById('btn-custom-alert-close');
            if (btnCloseCross) btnCloseCross.removeEventListener('click', close);
            if (autoCloseTimeout) clearTimeout(autoCloseTimeout);
            resolve();
        };

        btnOk.addEventListener('click', close);
        
        const btnCloseCross = document.getElementById('btn-custom-alert-close');
        if (btnCloseCross) btnCloseCross.addEventListener('click', close);

        // Auto-close success alerts after 2 seconds
        if (type === 'success') {
            autoCloseTimeout = setTimeout(() => {
                close();
            }, 2000);
        }
    });
}

function showCustomConfirm(message) {
    return new Promise(resolve => {
        const modal = document.getElementById('custom-confirm-modal');
        const msgEl = document.getElementById('custom-confirm-message');
        const btnOk = document.getElementById('btn-custom-confirm-ok');
        const btnCancel = document.getElementById('btn-custom-confirm-cancel');
        
        if (!modal) {
            resolve(window._nativeConfirm(message));
            return;
        }

        msgEl.textContent = message;
        modal.style.display = 'flex';
        
        const cleanup = () => {
            modal.style.display = 'none';
            btnOk.removeEventListener('click', onOk);
            btnCancel.removeEventListener('click', onCancel);
        };

        const onOk = () => { cleanup(); resolve(true); };
        const onCancel = () => { cleanup(); resolve(false); };

        btnOk.addEventListener('click', onOk);
        btnCancel.addEventListener('click', onCancel);
    });
}

// Override global alert
window._nativeAlert = window.alert;
window.alert = (msg) => {
    let type = 'info';
    if (msg && msg.toString().toLowerCase().includes('erreur')) type = 'error';
    if (msg && msg.toString().toLowerCase().includes('succès')) type = 'success';
    if (msg && msg.toString().toLowerCase().includes('succes')) type = 'success';
    showCustomAlert(msg, type);
};
window._nativeConfirm = window.confirm;
// ─────────────────────────────────────────────────────────────────────────────

// BTP Admin Scheduling System State
let users = [
    { id: '8e1eab40-a6b6-4f47-b33b-3f45e56f663b', firstname: 'Jules', lastname: 'Marcon', role: 'Propriétaire', type: 'Employé', status: 'Actif', phone: '06 12 34 56 78' },
    { id: 'u2', firstname: 'Marc', lastname: 'Lambert', role: 'Conducteur de travaux', type: 'Employé', status: 'Actif', phone: '06 98 76 54 32' },
    { id: '6491e99c-2b99-4cd0-a771-fd57021a94ba', firstname: 'Luc', lastname: 'Petit', role: 'Chef de chantier', type: 'Employé', status: 'Actif', phone: '06 45 89 23 11' },
    { id: 'cedbd55d-7fa3-47d9-8453-97cf81c4d756', firstname: 'Pierre', lastname: 'Dubois', role: 'Compagnon', type: 'Employé', status: 'Actif', phone: '06 77 12 99 88' },
    { id: 'u5', firstname: 'Thomas', lastname: 'Moreau', role: 'Compagnon', type: 'Employé', status: 'Actif', phone: '07 55 33 22 11' },
    { id: 'u6', firstname: 'Sarah', lastname: 'Diallo', role: 'Compagnon', type: 'Employé', status: 'Actif', phone: '06 88 44 22 99' },
    { id: 'u7', firstname: 'Michel', lastname: 'Giraud', role: 'Compagnon', type: 'Employé', status: 'Passif', phone: '06 11 00 22 33' }
];

// Restore user images from localStorage (survives page refresh)
(function() {
    const savedImages = JSON.parse(localStorage.getItem('user_images') || '{}');
    users.forEach(u => { if (savedImages[u.id]) u.image = savedImages[u.id]; });
})();

let entreprises = [];

let chantiers = [
    { id: 'c1', name: 'Exemple de chantier', client: 'Mon client préféré', entreprise: 'BTP Construction', address: '1 rue des chantiers 75005 Paris', status: 'Ouvert', budgetHours: 120, workedHours: 92.5 },
    { id: 'c2', name: 'Rénovation Villa Cap d\'Antibes', client: 'M. Martin', entreprise: 'Rénov & Co', address: 'Avenue des Fleurs 06600 Antibes', status: 'Ouvert', budgetHours: 350, workedHours: 112 },
    { id: 'c3', name: 'Ravalement de façade Crèche Municipale', client: 'Mairie de Paris', entreprise: 'BTP Construction', address: '14 boulevard Saint-Germain 75006 Paris', status: 'Ouvert', budgetHours: 80, workedHours: 15 },
    { id: 'c4', name: 'Extension Bureaux BTP', client: 'SCI Horizon', entreprise: 'Métal Bat', address: '45 rue de l\'Industrie 92100 Boulogne-Billancourt', status: 'Ouvert', budgetHours: 500, workedHours: 385 }
];

// Foreman delegations for worker interim
let delegations = JSON.parse(localStorage.getItem('foreman_delegations')) || [];

// Restore chantier images from localStorage (survives page refresh)
(function() {
    const savedImages = JSON.parse(localStorage.getItem('chantier_images') || '{}');
    chantiers.forEach(ch => { if (savedImages[ch.id]) ch.image = savedImages[ch.id]; });
})();


// Planning allocations: { chantierId: { userId: [dayIndexes], hours: '08:00 - 17:00' } }
let planningAllocations = {
    'c1': {
        'cedbd55d-7fa3-47d9-8453-97cf81c4d756': { days: [0, 1, 2], hours: '08:00 - 17:00' },
        'u5': { days: [3, 4], hours: '08:00 - 17:00' }
    },
    'c2': {
        '6491e99c-2b99-4cd0-a771-fd57021a94ba': { days: [0, 1, 2, 3, 4], hours: '07:30 - 16:30' },
        'u6': { days: [0, 1, 2], hours: '07:30 - 16:30' }
    },
    'c3': {
        'u5': { days: [0, 1], hours: '08:00 - 16:00' }
    }
};

// Collapsed state of chantier rows in planning page
let collapsedProjects = {
    'c1': false,
    'c2': false,
    'c3': true,
    'c4': true
};

let currentPlanningPeriod = 'week'; // 'week', 'month', or 'quarter'
let currentPlanningView = 'chantiers'; // 'chantiers' or 'users'
let collapsedUsers = {
    '8e1eab40-a6b6-4f47-b33b-3f45e56f663b': true,
    'u2': true,
    '6491e99c-2b99-4cd0-a771-fd57021a94ba': false,
    'cedbd55d-7fa3-47d9-8453-97cf81c4d756': false,
    'u5': false,
    'u6': false,
    'u7': true
};

// Hours spreadsheet states
let currentHoursView = 'chantiers'; // 'chantiers' or 'users'
let hoursFilterQuery = '';
let hoursSelectFilterVal = 'all';
let hoursStatusFilterVal = 'all';
let hoursAllocations = {
    'c1': {
        'cedbd55d-7fa3-47d9-8453-97cf81c4d756': { 0: '08:00', 1: '00:00', 2: '00:00', 3: '09:00', 4: '00:00' },
        'u5': { 0: '00:00', 1: '06:00', 2: '00:00', 3: '03:00', 4: '00:00' }
    },
    'c2': {
        '6491e99c-2b99-4cd0-a771-fd57021a94ba': { 0: '08:00', 1: '08:00', 2: '08:00', 3: '08:00', 4: '08:00' },
        'u6': { 0: '08:00', 1: '08:00', 2: '08:00', 3: '00:00', 4: '00:00' }
    }
};

let planningChantierFilterVal = 'all';
let planningStatusFilterVal = 'all';

let memos = [];
try {
    const stored = localStorage.getItem('projetremi_memos');
    if (stored) memos = JSON.parse(stored);
} catch(e) {
    console.error("Erreur de lecture du localStorage pour les mémos :", e);
}

if (!memos || memos.length === 0) {
    memos = [
        {
            id: 'm1',
            chantierId: 'c1',
            description: 'Pensez à porter vos EPI (casques et gants de sécurité) sur le chantier de Cannes.',
            priority: 'Haute',
            date: '04/07/2026'
        },
        {
            id: 'm2',
            chantierId: 'c2',
            description: 'Livraison de béton prévue mardi matin à 8h.',
            priority: 'Moyenne',
            date: '04/07/2026'
        }
    ];
}

// Chantier detailed view states
let activeChantierId = localStorage.getItem('activeChantierId') || null;
let activeChantierSubTab = 'resume';

// User detailed view states
let activeUserId = localStorage.getItem('activeUserId') || null;

let chantierDocuments = {
    'c1': [
        { name: 'Plan_Maconnerie_V1.pdf', size: '4.2 MB', date: '04/07/2026', author: 'Jules Marcon' },
        { name: 'Devis_Signe_Fermeture.pdf', size: '1.8 MB', date: '04/07/2026', author: 'Marc Lambert' }
    ],
    'c2': [
        { name: 'Plan_Architecte_Villa.pdf', size: '12.4 MB', date: '04/07/2026', author: 'Marc Lambert' }
    ]
};

let chantierFeeds = {
    'c1': [
        { id: 1, author: 'Alobees Support', avatar: 'AS', time: 'Il y a 5 heures', content: 'Il s\'agit d\'un exemple de chantier que vous pourrez fermer lorsque vous le souhaitez.' }
    ],
    'c2': [
        { id: 2, author: 'Luc Petit', avatar: 'LP', time: 'Il y a 1 jour', content: 'Point d\'étape : Fondation terminée, coulage de dalle prévu demain matin.' }
    ]
};

// Log feed activity
let activities = [
    { text: 'Jules Marcon a créé le planning de la semaine', time: 'Il y a 10 min' },
    { text: 'Luc Petit a validé sa feuille d\'heures (Villa Cap d\'Antibes)', time: 'Il y a 1 h' },
    { text: 'Nouveau chantier créé : Extension Bureaux BTP', time: 'Il y a 3 h' },
    { text: 'Pierre Dubois a été affecté au chantier "Exemple de chantier"', time: 'Hier' }
];

// Helper: returns HTML for a chantier avatar (image if available, initials fallback)
function getChantierAvatar(ch, size = 36, extraStyle = '') {
    const initials = ch.name.split(' ').map(w => w.charAt(0)).join('').substring(0, 2).toUpperCase();
    if (ch.image) {
        return `<img src="${ch.image}" style="width:${size}px;height:${size}px;border-radius:50%;object-fit:cover;flex-shrink:0;${extraStyle}" alt="${ch.name}">`;
    }
    return `<div class="initials-bubble bubble-blue" style="width:${size}px;height:${size}px;font-size:${Math.round(size * 0.3)}px;line-height:${size}px;${extraStyle}">${initials}</div>`;
}

// Helper: returns HTML for a user avatar (image if available, initials fallback)
function getUserAvatar(u, size = 36, extraStyle = '') {
    const initials = `${u.firstname.charAt(0)}${u.lastname.charAt(0)}`.toUpperCase();
    if (u.image) {
        return `<img src="${u.image}" style="width:${size}px;height:${size}px;border-radius:50%;object-fit:cover;flex-shrink:0;${extraStyle}" alt="${u.firstname} ${u.lastname}">`;
    }
    return `<div class="initials-bubble bubble-violet" style="width:${size}px;height:${size}px;font-size:${Math.round(size * 0.3)}px;line-height:${size}px;${extraStyle}">${initials}</div>`;
}

// Async database loader from Supabase
async function loadDataFromSupabase() {
    if (!useSupabase) return;

    try {
        // 0. Fetch Entreprises
        const { data: entDb, error: entErr } = await supabaseClient.from('entreprises').select('*').order('name', { ascending: true });
        if (!entErr && entDb) {
            entreprises = entDb;
            populateEntreprisesSelects();
        }

        // 1. Fetch Users
        const { data: usersDb, error: usersErr } = await supabaseClient.from('utilisateurs').select('*').order('lastname', { ascending: true });
        if (!usersErr && usersDb) {
            users = usersDb;
            // Restore user images from localStorage (persisted separately)
            const savedImages = JSON.parse(localStorage.getItem('user_images') || '{}');
            users.forEach(u => {
                if (savedImages[u.id]) u.image = savedImages[u.id];
            });
        }

        // 2. Fetch Chantiers
        const { data: chDb, error: chErr } = await supabaseClient.from('chantiers').select('*').order('name', { ascending: true });
        if (!chErr && chDb) {
            chantiers = chDb.map(c => ({
                id: c.id,
                name: c.name,
                client: c.client,
                entreprise: c.entreprise,
                address: c.address,
                status: c.status,
                budgetHours: parseFloat(c.budget_hours) || 0,
                workedHours: parseFloat(c.worked_hours) || 0,
                color: c.color
            }));

            // Restore images from localStorage (persisted separately)
            const savedImages = JSON.parse(localStorage.getItem('chantier_images') || '{}');
            chantiers.forEach(ch => {
                if (savedImages[ch.id]) ch.image = savedImages[ch.id];
            });
        }

        // 3. Fetch Planning Allocations and their Days
        const { data: allocDb, error: allocErr } = await supabaseClient.from('planning_allocations').select('*');
        const { data: daysDb, error: daysErr } = await supabaseClient.from('planning_allocation_days').select('*');

        if (!allocErr && allocDb) {
            planningAllocations = {};
            allocDb.forEach(alloc => {
                const chId = alloc.chantier_id;
                const uId = alloc.user_id;
                const startTime = alloc.start_time ? alloc.start_time.substring(0, 5) : '08:00';
                const endTime = alloc.end_time ? alloc.end_time.substring(0, 5) : '17:00';

                if (!planningAllocations[chId]) planningAllocations[chId] = {};

                const days = daysDb
                    ? daysDb.filter(d => d.chantier_id === chId && d.user_id === uId).map(d => d.day_index)
                    : [];

                planningAllocations[chId][uId] = {
                    days: days,
                    hours: `${startTime} - ${endTime}`
                };
            });
        }

        // 4. Fetch Hours Allocations
        const { data: hoursDb, error: hoursErr } = await supabaseClient.from('hours_allocations').select('*');
        if (!hoursErr && hoursDb) {
            hoursAllocations = {};
            hoursDb.forEach(ha => {
                const chId = ha.chantier_id;
                const uId = ha.user_id;
                const day = ha.day_index;
                const val = ha.hours_value;

                if (!hoursAllocations[chId]) hoursAllocations[chId] = {};
                if (!hoursAllocations[chId][uId]) hoursAllocations[chId][uId] = {};
                hoursAllocations[chId][uId][day] = val;
            });
        }

        // 5. Fetch Feeds / Memos
        const { data: feedsDb, error: feedsErr } = await supabaseClient.from('chantier_feeds').select('*').order('created_at', { ascending: false });
        if (feedsErr) {
            console.error("Erreur lors de la récupération des mémos depuis Supabase :", feedsErr);
            alert("Erreur de chargement des mémos : " + feedsErr.message);
        }
        if (!feedsErr && feedsDb) {
            chantierFeeds = {};
            memos = [];
            feedsDb.forEach(f => {
                const chId = f.chantier_id;
                const timeStr = f.created_at ? new Date(f.created_at).toLocaleDateString('fr-FR') : 'À l\'instant';
                
                if (!chantierFeeds[chId]) chantierFeeds[chId] = [];
                chantierFeeds[chId].push({
                    id: f.id,
                    author: f.author,
                    avatar: f.avatar,
                    time: timeStr,
                    content: f.content
                });

                memos.push({
                    id: String(f.id),
                    chantierId: chId,
                    description: f.content,
                    priority: f.priority || 'Moyenne',
                    date: timeStr
                });
            });
        }

        // 6. Fetch Documents
        const { data: docsDb, error: docsErr } = await supabaseClient.from('chantier_documents').select('*').order('created_at', { ascending: false });
        if (!docsErr && docsDb) {
            chantierDocuments = {};
            docsDb.forEach(d => {
                const chId = d.chantier_id;
                if (!chantierDocuments[chId]) chantierDocuments[chId] = [];
                const dateStr = d.created_at ? new Date(d.created_at).toLocaleDateString('fr-FR') : '04/07/2026';
                chantierDocuments[chId].push({
                    name: d.name,
                    size: d.file_size,
                    date: dateStr,
                    author: d.author
                });
            });
        }

        // 7. Fetch Activities
        const { data: actDb, error: actErr } = await supabaseClient.from('dashboard_activities').select('*').order('created_at', { ascending: false });
        if (!actErr && actDb) {
            activities = actDb.map(act => {
                const timeStr = act.created_at ? new Date(act.created_at).toLocaleDateString('fr-FR') : 'À l\'instant';
                return {
                    text: act.activity_text,
                    time: timeStr
                };
            });
        }

    } catch (e) {
        console.warn("Erreur de chargement des données depuis Supabase (le projet est probablement en pause). Repli sur les données locales :", e);
        useSupabase = false;
    }
}

// App initialization
document.addEventListener('DOMContentLoaded', async () => {
    initClock();
    initWeekDisplay();
    initTabs();
    initModals();
    initForms();
    initSearch();
    initHoursEvents();
    initHoursDrawer();

    // Footer year
    const footerYear = document.getElementById('footer-year');
    if (footerYear) footerYear.textContent = new Date().getFullYear();

    // Logo Click Handlers (Return to dashboard tab)
    const logoDesktop = document.getElementById('logo-sidebar-click');
    const logoMobile = document.getElementById('logo-mobile-click');
    if (logoDesktop) {
        logoDesktop.addEventListener('click', () => switchTab('dashboard'));
    }
    if (logoMobile) {
        logoMobile.addEventListener('click', () => switchTab('dashboard'));
    }

    // Dynamic User Profile Info & Logout handler
    currentUserProfile = null;
    isChef = false;
    isOuvrier = false;
    isAdmin = true;

    const handleLogout = async () => {
        if (await showCustomConfirm('Voulez-vous vraiment vous déconnecter ?')) {
            if (useSupabase && supabaseClient) {
                await supabaseClient.auth.signOut();
            }
            window.location.replace('login.html');
        }
    };

    // Check URL parameters for explicit test/debug role override (ex: ?role=chef or ?role=ouvrier)
    const urlParams = new URLSearchParams(window.location.search);
    const debugRole = urlParams.get('role');

    if (useSupabase && supabaseClient && !debugRole) {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (user) {
            // Format email prefix as name if no metadata
            const name = user.user_metadata?.full_name || user.email.split('@')[0];
            const formattedName = name.split(/[\._]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

            // Load dynamic data first to find the user in DB
            await loadDataFromSupabase();

            // Find matching user in the database by ID or Email
            const emailLower = (user.email || '').toLowerCase();
            currentUserProfile = users.find(u => u.id === user.id || (u.email && u.email.toLowerCase() === emailLower));
            
            if (!currentUserProfile) {
                // Try fallback matching by name
                currentUserProfile = users.find(u => {
                    const dbName = `${u.firstname} ${u.lastname}`.toLowerCase();
                    return dbName.includes(formattedName.toLowerCase()) || formattedName.toLowerCase().includes(dbName);
                });
            }

            if (currentUserProfile) {
                const roleLower = (currentUserProfile.role || '').toLowerCase();
                const typeLower = (currentUserProfile.type || '').toLowerCase();
                
                if (roleLower.includes('chef') || typeLower.includes('chef') || roleLower.includes('conducteur')) {
                    isChef = true;
                    isAdmin = false;
                    isOuvrier = false;
                } else if (roleLower.includes('admin') || roleLower.includes('propri') || roleLower.includes('proprio') || typeLower.includes('admin')) {
                    isAdmin = true;
                    isChef = false;
                    isOuvrier = false;
                } else {
                    isOuvrier = true;
                    isAdmin = false;
                    isChef = false;
                }
            } else {
                // User logged in via Supabase but not in static users list
                if (emailLower.includes('admin')) {
                    isAdmin = true;
                    isChef = false;
                    isOuvrier = false;
                } else {
                    isOuvrier = true;
                    isAdmin = false;
                    isChef = false;
                }
                
                // Create temporary profile object for display
                const parts = formattedName.split(' ');
                currentUserProfile = {
                    id: user.id,
                    firstname: parts[0] || 'Admin',
                    lastname: parts.slice(1).join(' ') || '',
                    role: 'Administrateur',
                    status: 'Actif'
                };
            }

            // ── Override par email : si l'email contient "admin", forcer le rôle admin ──
            // Cela permet à admin@test.com d'être Admin même si son profil DB a un autre rôle
            if (emailLower.includes('admin')) {
                isAdmin = true;
                isChef = false;
                isOuvrier = false;
                // Forcer aussi le rôle affiché dans la sidebar
                if (currentUserProfile) currentUserProfile.role = 'Administrateur';
            }

            // Update profile info in sidebar
            const profileName = document.getElementById('profile-name');
            const profileRole = document.getElementById('profile-role');
            const welcomeText = document.querySelector('.welcome-text');
            const avatar = document.querySelector('.sidebar-footer .avatar');

            const displayName = `${currentUserProfile.firstname} ${currentUserProfile.lastname}`.trim();

            if (profileName) profileName.textContent = displayName;
            if (profileRole) profileRole.textContent = currentUserProfile.role || (isOuvrier ? 'Compagnon' : 'Administrateur');
            if (welcomeText) welcomeText.textContent = `Bonjour, ${displayName}`;
            if (avatar) {
                avatar.textContent = displayName.charAt(0).toUpperCase();
            }
        }
    } else if (debugRole) {
        await loadDataFromSupabase();
        if (debugRole === 'chef') {
            isChef = true;
            isAdmin = false;
            isOuvrier = false;
            currentUserProfile = users.find(u => (u.role || '').toLowerCase().includes('chef')) || users[2];
        } else if (debugRole === 'ouvrier') {
            isOuvrier = true;
            isAdmin = false;
            isChef = false;
            currentUserProfile = users.find(u => (u.role || '').toLowerCase().includes('maçon') || (u.role || '').toLowerCase().includes('compagnon')) || users[3];
        } else if (debugRole === 'admin') {
            isAdmin = true;
            isChef = false;
            isOuvrier = false;
            currentUserProfile = users[0];
        }
    }

    // Global Logout and Interaction bindings
    const logoutDesktop = document.getElementById('btn-logout-desktop');
    const logoutMobile = document.getElementById('btn-logout-mobile');
    const logoutMobileView = document.getElementById('mobile-logout-btn');
    const mobileHamburger = document.querySelector('#mobile-app-container .hamburger-btn');

    if (logoutDesktop) logoutDesktop.addEventListener('click', handleLogout);
    if (logoutMobile) logoutMobile.addEventListener('click', handleLogout);
    if (logoutMobileView) logoutMobileView.addEventListener('click', handleLogout);
    
    // Left side drawer open/close handlers
    const closeMobileDrawer = () => {
        const drawer = document.getElementById('mobile-side-drawer');
        const overlay = document.getElementById('mobile-drawer-overlay');
        if (drawer && overlay) {
            drawer.style.transform = 'translateX(-100%)';
            overlay.style.opacity = '0';
            setTimeout(() => { overlay.style.display = 'none'; }, 300);
        }
    };

    if (mobileHamburger) {
        mobileHamburger.addEventListener('click', () => {
            const drawer = document.getElementById('mobile-side-drawer');
            const overlay = document.getElementById('mobile-drawer-overlay');
            if (drawer && overlay) {
                // Set drawer user details
                const name = currentUserProfile ? `${currentUserProfile.firstname} ${currentUserProfile.lastname}` : 'Utilisateur';
                const roleName = currentUserProfile ? currentUserProfile.role : (isChef ? 'Chef de chantier' : 'Ouvrier');
                
                const drAvatar = document.getElementById('mobile-drawer-avatar');
                const drUsername = document.getElementById('mobile-drawer-username');
                const drUserrole = document.getElementById('mobile-drawer-userrole');
                
                if (drAvatar) drAvatar.textContent = name.charAt(0).toUpperCase();
                if (drUsername) drUsername.textContent = name;
                if (drUserrole) drUserrole.textContent = roleName;

                drawer.style.transform = 'translateX(0)';
                overlay.style.display = 'block';
                overlay.style.opacity = '1';
            }
        });
    }

    const btnCloseDrawer = document.getElementById('btn-close-mobile-drawer');
    const drawerOverlay = document.getElementById('mobile-drawer-overlay');
    const drawerLogout = document.getElementById('mobile-drawer-logout-btn');

    if (btnCloseDrawer) btnCloseDrawer.addEventListener('click', closeMobileDrawer);
    if (drawerOverlay) drawerOverlay.addEventListener('click', closeMobileDrawer);
    if (drawerLogout) drawerLogout.addEventListener('click', handleLogout);

    // Scroll to section when clicking drawer links
    const drawerItems = document.querySelectorAll('.drawer-nav-item');
    drawerItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetId = item.getAttribute('data-target');
            const targetEl = document.getElementById(targetId);
            closeMobileDrawer();
            if (targetEl) {
                targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    });

    // Apply Role-based Tab & Button Permissions
    checkDelegationRole();
    applyRolePermissions();

    // Standard renders (will respect isAdmin constraints)
    renderDashboard();
    renderUsers();
    renderChantiers();
    renderPlanning();
    renderHours();
    renderDelegations();
    initDelegationFeatures();
    initDiffusionFeatures();

    // Init onboarding flow if required (online version checks DB directly)
    if (useSupabase && supabaseClient && isAdmin) {
        initOnboarding();
    }

    // Hide global loader gracefully once everything is ready
    const globalLoader = document.getElementById('global-loader');
    if (globalLoader) {
        // Small delay to ensure all DOM renders are completed visually
        setTimeout(() => {
            globalLoader.style.opacity = '0';
            globalLoader.style.visibility = 'hidden';
            setTimeout(() => globalLoader.remove(), 400); // Remove from DOM after fade out
        }, 100);
    }
});

// Clock update logic
function initClock() {
    const clockEl = document.getElementById('realtime-clock');
    const update = () => {
        const d = new Date();
        const hr = String(d.getHours()).padStart(2, '0');
        const min = String(d.getMinutes()).padStart(2, '0');
        clockEl.textContent = `${hr}:${min}`;
    };
    update();
    setInterval(update, 60000);
}

// Current week calculator
function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return weekNo;
}

function initWeekDisplay() {
    const today = new Date();
    const weekNum = getWeekNumber(today);
    document.getElementById('current-week-display').textContent = `Semaine ${weekNum}`;

    // Set dates for the planning table
    updatePlanningDates(today);
}

// Calculate planning dates dynamically depending on the selected view period
let currentPlanningDate = new Date();

function getPlanningColumns(baseDate, period) {
    const columns = [];
    const months = []; // array of { name: string, colspan: number }
    const weeks = [];  // array of { num: number, colspan: number }

    if (period === 'week') {
        const currentDay = baseDate.getDay();
        const distanceToMon = currentDay === 0 ? -6 : 1 - currentDay;
        const monday = new Date(baseDate);
        monday.setDate(baseDate.getDate() + distanceToMon);

        for (let i = 0; i < 5; i++) {
            const date = new Date(monday);
            date.setDate(monday.getDate() + i);
            const wNum = getWeekNumber(date);
            const mName = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

            columns.push({
                date: date,
                dayLabel: `${date.toLocaleDateString('fr-FR', { weekday: 'long' })} ${date.getDate()}`,
                dayLetter: date.toLocaleDateString('fr-FR', { weekday: 'narrow' }).toUpperCase(),
                dayNum: date.getDate(),
                weekNum: wNum,
                monthName: mName
            });
        }

        columns.forEach(col => {
            const m = months.find(x => x.name === col.monthName);
            if (m) m.colspan++;
            else months.push({ name: col.monthName, colspan: 1 });

            const w = weeks.find(x => x.num === col.weekNum);
            if (w) w.colspan++;
            else weeks.push({ num: col.weekNum, colspan: 1 });
        });

    } else if (period === 'month') {
        const firstDayOfMonth = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
        const lastDayOfMonth = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0);

        let current = new Date(firstDayOfMonth);
        const day = current.getDay();
        const dist = day === 0 ? -6 : 1 - day;
        current.setDate(current.getDate() + dist);

        const end = new Date(lastDayOfMonth);
        const endDay = end.getDay();
        const endDist = endDay === 0 ? -2 : 5 - endDay;
        end.setDate(end.getDate() + endDist);

        while (current <= end) {
            const dateDay = current.getDay();
            if (dateDay >= 1 && dateDay <= 5) {
                const wNum = getWeekNumber(current);
                const mName = current.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

                columns.push({
                    date: new Date(current),
                    dayLabel: `${current.getDate()}`,
                    dayLetter: current.toLocaleDateString('fr-FR', { weekday: 'narrow' }).toUpperCase(),
                    dayNum: current.getDate(),
                    weekNum: wNum,
                    monthName: mName
                });
            }
            current.setDate(current.getDate() + 1);
        }

        columns.forEach(col => {
            const m = months.find(x => x.name === col.monthName);
            if (m) m.colspan++;
            else months.push({ name: col.monthName, colspan: 1 });

            const w = weeks.find(x => x.num === col.weekNum);
            if (w) w.colspan++;
            else weeks.push({ num: col.weekNum, colspan: 1 });
        });

    } else if (period === 'quarter') {
        const startMonth = baseDate.getMonth();
        const startYear = baseDate.getFullYear();

        const firstDayOfQuarter = new Date(startYear, startMonth, 1);
        const lastDayOfQuarter = new Date(startYear, startMonth + 3, 0);

        let current = new Date(firstDayOfQuarter);
        const day = current.getDay();
        const dist = day === 0 ? -6 : 1 - day;
        current.setDate(current.getDate() + dist);

        const end = new Date(lastDayOfQuarter);
        const endDay = end.getDay();
        const endDist = endDay === 0 ? -2 : 5 - endDay;
        end.setDate(end.getDate() + endDist);

        while (current <= end) {
            const dateDay = current.getDay();
            if (dateDay >= 1 && dateDay <= 5) {
                const wNum = getWeekNumber(current);
                const mName = current.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

                columns.push({
                    date: new Date(current),
                    dayLabel: current.toLocaleDateString('fr-FR', { weekday: 'narrow' }).toUpperCase(),
                    dayLetter: current.toLocaleDateString('fr-FR', { weekday: 'narrow' }).toUpperCase(),
                    dayNum: current.getDate(),
                    weekNum: wNum,
                    monthName: mName
                });
            }
            current.setDate(current.getDate() + 1);
        }

        columns.forEach(col => {
            const m = months.find(x => x.name === col.monthName);
            if (m) m.colspan++;
            else months.push({ name: col.monthName, colspan: 1 });

            const w = weeks.find(x => x.num === col.weekNum);
            if (w) w.colspan++;
            else weeks.push({ num: col.weekNum, colspan: 1 });
        });
    }

    return { columns, months, weeks };
}

function updatePlanningDates(baseDate) {
    const rangeDisplay = document.getElementById('planning-range-display');

    if (currentPlanningPeriod === 'week') {
        const currentDay = baseDate.getDay();
        const distanceToMon = currentDay === 0 ? -6 : 1 - currentDay;
        const monday = new Date(baseDate);
        monday.setDate(baseDate.getDate() + distanceToMon);

        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);

        const weekNum = getWeekNumber(baseDate);
        const options = { day: 'numeric', month: 'long' };
        rangeDisplay.textContent = `Semaine ${weekNum} | ${monday.toLocaleDateString('fr-FR', options)} - ${sunday.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`;

    } else if (currentPlanningPeriod === 'month') {
        const options = { month: 'long', year: 'numeric' };
        rangeDisplay.textContent = baseDate.toLocaleDateString('fr-FR', options).charAt(0).toUpperCase() + baseDate.toLocaleDateString('fr-FR', options).slice(1);

    } else if (currentPlanningPeriod === 'quarter') {
        const startMonthName = baseDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
        const endMonth = new Date(baseDate.getFullYear(), baseDate.getMonth() + 2, 1);
        const endMonthName = endMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

        rangeDisplay.textContent = `${startMonthName.charAt(0).toUpperCase() + startMonthName.slice(1)} - ${endMonthName.charAt(0).toUpperCase() + endMonthName.slice(1)}`;
    }
}

// SPA tab switching logic
function initTabs() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('mobile-sidebar-overlay');
    const toggleBtn = document.getElementById('btn-toggle-sidebar');

    if (toggleBtn && sidebar && overlay) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('show');
            overlay.classList.toggle('show');
        });

        overlay.addEventListener('click', () => {
            sidebar.classList.remove('show');
            overlay.classList.remove('show');
        });
    }

    // Add Click listeners for navbar switching
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const tabId = item.getAttribute('data-tab');
            switchTab(tabId);

            if (sidebar && overlay) {
                sidebar.classList.remove('show');
                overlay.classList.remove('show');
            }
        });
    });

    // Sync active state with URL hash on load
    const hash = window.location.hash.replace('#', '');
    if (hash && document.getElementById(`tab-${hash}`)) {
        switchTab(hash);
    }
}

function switchTab(tabId) {
    if (!isAdmin) {
        const forbiddenTabs = isOuvrier 
            ? ['users', 'settings', 'user-detail', 'chantiers'] 
            : ['users', 'user-detail'];
        if (forbiddenTabs.includes(tabId)) {
            tabId = 'dashboard';
        }
    }

    // Deactivate previous active tabs
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(section => section.classList.remove('active'));

    // Activate target
    const targetNav = document.querySelector(`.nav-item[data-tab="${tabId}"]`);
    const targetContent = document.getElementById(`tab-${tabId}`);

    if (targetNav) targetNav.classList.add('active');
    if (targetContent) targetContent.classList.add('active');

    // For detail sub-pages, highlight their parent nav item
    if (tabId === 'user-detail') {
        const usersNav = document.querySelector('.nav-item[data-tab="users"]');
        if (usersNav) usersNav.classList.add('active');
    }
    if (tabId === 'chantier-detail') {
        const chantiersNav = document.querySelector('.nav-item[data-tab="chantiers"]');
        if (chantiersNav) chantiersNav.classList.add('active');
    }

    // Scroll content view to top
    document.querySelector('.content-pane').scrollTop = 0;

    // Update browser URL hash quietly
    window.history.pushState(null, null, `#${tabId}`);

    if (tabId === 'memos') {
        renderMemos();
    }

    if (tabId === 'chantier-detail') {
        renderChantierDetail();
    }

    if (tabId === 'user-detail') {
        renderUserDetail();
    }
}

// Render Page 1: Dashboard
function renderDashboard() {
    // 1. Chantiers planifiés aujourd'hui
    const todayContainer = document.getElementById('today-chantiers-container');
    const today = new Date().getDay(); // 1 = Mon, 5 = Fri, etc.
    const activeTodayChantiers = [];

    // We only count normal workdays Mon-Fri
    if (today >= 1 && today <= 5) {
        const dayIdx = today - 1;
        chantiers.forEach(ch => {
            if (planningAllocations[ch.id]) {
                const userAllocations = planningAllocations[ch.id];
                const hasAllocationsToday = Object.values(userAllocations).some(alloc => alloc.days.includes(dayIdx));
                if (hasAllocationsToday) {
                    activeTodayChantiers.push(ch);
                }
            }
        });
    }

    if (activeTodayChantiers.length === 0) {
        todayContainer.innerHTML = `<div class="empty-state">Aucun chantier prévu</div>`;
    } else {
        todayContainer.innerHTML = `<div style="display:flex; flex-direction:column; gap: 8px; width: 100%;">
            ${activeTodayChantiers.map(ch => `
                <div style="display:flex; align-items:center; gap: 10px; font-size:14px; font-weight:600; padding:6px 10px; background:#f3f4f6; border-radius:6px;">
                    <span style="width:8px; height:8px; border-radius:50%; background:var(--green)"></span>
                    <span>${ch.name}</span>
                </div>
            `).join('')}
        </div>`;
    }

    // 2. Activity feed
    const activityFeed = document.getElementById('activity-feed-container');
    activityFeed.innerHTML = activities.map(act => `
        <div class="activity-item">
            <span class="activity-text">${act.text}</span>
            <span class="activity-time">${act.time}</span>
        </div>
    `).join('');

    // 3. Project Progress
    const progressContainer = document.getElementById('project-progress-container');
    progressContainer.innerHTML = chantiers.map(ch => {
        const pct = Math.min(100, Math.round((ch.workedHours / ch.budgetHours) * 100));
        return `
            <div class="progress-item" style="cursor: pointer;" onclick="openChantierDetail('${ch.id}')">
                <div class="progress-info">
                    <span class="progress-name">${ch.name}</span>
                    <span class="status-pill status-active">Ouvert</span>
                </div>
                <div class="progress-bar-wrapper">
                    <div class="progress-bar-fill" style="width: ${pct}%"></div>
                </div>
                <div class="progress-metrics">
                    <span>Heures consommées : <strong>${ch.workedHours}h</strong> / ${ch.budgetHours}h</span>
                    <span>Progression : <strong>${pct}%</strong></span>
                </div>
            </div>
        `;
    }).join('');
}

// Render Page 2: Users
function renderUsers(filterQuery = '') {
    const tbody = document.getElementById('users-table-tbody');
    const query = filterQuery.toLowerCase().trim();

    const filteredUsers = users.filter(u => {
        return u.firstname.toLowerCase().includes(query) ||
            u.lastname.toLowerCase().includes(query) ||
            u.role.toLowerCase().includes(query);
    });

    tbody.innerHTML = filteredUsers.map(u => {
        const statusClass = u.status === 'Actif' ? 'status-active' : 'status-passive';

        return `
            <tr>
                <td>
                    <div class="user-cell" style="cursor: pointer;" onclick="openUserDetail('${u.id}')">
                        ${getUserAvatar(u, 36)}
                        <span class="user-name-title" style="color: var(--primary); text-decoration: underline;">${u.firstname} ${u.lastname}</span>
                    </div>
                </td>
                <td>${u.role}</td>
                <td><span class="badge badge-purple">${u.type}</span></td>
                <td><span class="status-pill ${statusClass}">${u.status}</span></td>
                <td>${u.phone}</td>
                <td>
                    <div class="cell-actions">
                        <button class="btn-action" title="Modifier" onclick="openEditUserModal(event, '${u.id}')" style="color: var(--primary);">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                        </button>
                        <button class="btn-action" title="Supprimer" onclick="deleteUser('${u.id}')">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Open user detail view
function openUserDetail(userId) {
    activeUserId = userId;
    localStorage.setItem('activeUserId', userId);
    switchTab('user-detail');
    renderUserDetail();
}

// Open edit user modal (from table row or detail view)
function openEditUserModal(e, userId) {
    if (e && e.stopPropagation) e.stopPropagation();
    const u = users.find(x => x.id === userId);
    if (!u) return;

    document.getElementById('edit-user-id').value = u.id;
    document.getElementById('edit-user-firstname').value = u.firstname;
    document.getElementById('edit-user-lastname').value = u.lastname;
    document.getElementById('edit-user-phone').value = u.phone || '';
    document.getElementById('edit-user-code').value = u.code || '';

    // Set role select
    const roleSelect = document.getElementById('edit-user-role-select');
    if (roleSelect) {
        Array.from(roleSelect.options).forEach(opt => {
            opt.selected = opt.value === u.role;
        });
    }

    // Set type select
    const typeSelect = document.getElementById('edit-user-type');
    if (typeSelect) {
        Array.from(typeSelect.options).forEach(opt => {
            opt.selected = opt.value === (u.type || 'Employé');
        });
    }

    const modal = document.getElementById('edit-user-modal');
    if (modal) {
        // Pre-display existing user image in the uploader
        const uploader = modal.querySelector('.image-uploader');
        if (uploader) {
            // Reset first
            const oldPreview = uploader.querySelector('.uploader-preview-img');
            if (oldPreview) oldPreview.remove();
            uploader.querySelectorAll(':not(.image-uploader-input)').forEach(child => {
                child.style.opacity = '';
            });
            uploader.removeAttribute('data-image-base64');

            if (u.image) {
                uploader.setAttribute('data-image-base64', u.image);
                const previewImg = document.createElement('img');
                previewImg.className = 'uploader-preview-img';
                previewImg.src = u.image;
                previewImg.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;border-radius:8px;';
                uploader.style.position = 'relative';
                uploader.appendChild(previewImg);
                uploader.querySelectorAll(':not(.uploader-preview-img):not(.image-uploader-input)').forEach(child => {
                    child.style.opacity = '0';
                });
            }
        }
        modal.classList.add('show');
    }
}

// Render user detail page
function renderUserDetail() {
    const u = users.find(x => x.id === activeUserId);
    if (!u) {
        // If no active user, go back to users list
        switchTab('users');
        return;
    }

    const avatarColor = u.color || '#6050f3';
    const statusClass = u.status === 'Actif' ? 'status-active' : 'status-passive';

    // Count assigned chantiers
    const assignedChantiers = chantiers.filter(ch => {
        const alloc = planningAllocations[ch.id];
        return alloc && alloc[u.id];
    });

    // Header
    const headerEl = document.getElementById('user-detail-header');
    headerEl.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px;">
            <div style="display: flex; align-items: center; gap: 16px;">
                <button onclick="switchTab('users')" style="background: none; border: none; cursor: pointer; color: var(--gray-muted); font-size: 13px; display: flex; align-items: center; gap: 6px; padding: 6px 10px; border-radius: 6px; transition: background 0.2s;" onmouseover="this.style.background='var(--bg-primary)'" onmouseout="this.style.background='none'">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
                    Retour
                </button>
                ${getUserAvatar(u, 48, `background-color: ${avatarColor}; font-family: var(--font-heading); font-weight: 700; color: white; box-shadow: 0 4px 12px rgba(0,0,0,0.15);`)}
                <div>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <h2 style="font-family: var(--font-heading); font-size: 22px; font-weight: 700; color: var(--text-primary); margin: 0;">${u.firstname} ${u.lastname}</h2>
                        <span class="status-pill ${statusClass}">${u.status}</span>
                    </div>
                    <div style="font-size: 13px; color: var(--gray-muted); margin-top: 2px;">${u.role} &bull; ${u.type || 'Employé'}</div>
                </div>
            </div>
            <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                <button class="btn btn-secondary" onclick="deleteUser('${u.id}')" style="font-size: 13px; color: var(--red); border-color: var(--red); display: flex; align-items: center; gap: 6px;">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    Supprimer
                </button>
                <button class="btn btn-primary" onclick="openEditUserModal(event, '${u.id}')" style="font-size: 13px; background-color: var(--accent); display: flex; align-items: center; gap: 6px;">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    Modifier
                </button>
            </div>
        </div>
    `;

    // Content
    const contentEl = document.getElementById('user-detail-content');

    const assignedChantierHtml = assignedChantiers.length === 0
        ? `<div class="empty-state" style="padding: 20px; text-align: center; color: var(--gray-muted); font-style: italic;">Aucun chantier assigné</div>`
        : assignedChantiers.map(ch => {
            const alloc = planningAllocations[ch.id][u.id];
            const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'];
            const days = (alloc.days || []).map(d => dayNames[d]).join(', ');
            return `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--border-color);">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="width: 8px; height: 8px; border-radius: 50%; background-color: ${ch.color || 'var(--green)'};"></div>
                        <div>
                            <div style="font-weight: 600; font-size: 14px; cursor: pointer; color: var(--primary); text-decoration: underline;" onclick="openChantierDetail('${ch.id}')">${ch.name}</div>
                            <div style="font-size: 12px; color: var(--gray-muted); margin-top: 2px;">${days} &bull; ${alloc.hours || 'Horaires non définis'}</div>
                        </div>
                    </div>
                    <span class="status-pill status-active" style="font-size: 11px;">${ch.status}</span>
                </div>
            `;
        }).join('');

    contentEl.innerHTML = `
        <div class="user-detail-grid">
            <!-- Left column: info -->
            <div>
                <div class="detail-card">
                    <h3 class="detail-card-title">Informations personnelles</h3>
                    <ul class="info-list">
                        <li class="info-item">
                            <span class="info-icon">👤</span>
                            <span>Prénom : <strong>${u.firstname}</strong></span>
                        </li>
                        <li class="info-item">
                            <span class="info-icon">👤</span>
                            <span>Nom : <strong>${u.lastname}</strong></span>
                        </li>
                        <li class="info-item">
                            <span class="info-icon">🏷️</span>
                            <span>Rôle : <strong>${u.role}</strong></span>
                        </li>
                        <li class="info-item">
                            <span class="info-icon">💼</span>
                            <span>Type : <strong>${u.type || 'Employé'}</strong></span>
                        </li>
                        <li class="info-item">
                            <span class="info-icon">📞</span>
                            <span>Téléphone : <strong><a href="tel:${u.phone}" style="color: var(--accent);">${u.phone || 'Non renseigné'}</a></strong></span>
                        </li>
                        <li class="info-item">
                            <span class="info-icon">🔢</span>
                            <span>Code : <strong>${u.code || 'Non renseigné'}</strong></span>
                        </li>
                    </ul>
                </div>

                <div class="detail-card" style="margin-top: 16px;">
                    <h3 class="detail-card-title">Statistiques</h3>
                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: var(--bg-primary); border-radius: 8px;">
                            <span style="font-size: 13px; color: var(--gray-muted);">Chantiers assignés</span>
                            <strong style="font-size: 16px; color: var(--text-primary);">${assignedChantiers.length}</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: var(--bg-primary); border-radius: 8px;">
                            <span style="font-size: 13px; color: var(--gray-muted);">Statut</span>
                            <span class="status-pill ${statusClass}">${u.status}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right column: chantiers -->
            <div>
                <div class="detail-card">
                    <h3 class="detail-card-title" style="margin-bottom: 4px;">Chantiers assignés</h3>
                    <p style="font-size: 12px; color: var(--gray-muted); margin-bottom: 12px;">Chantiers sur lesquels cet utilisateur est planifié</p>
                    <div>
                        ${assignedChantierHtml}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Render Page 3: Chantiers
function renderChantiers(filterQuery = '') {
    const tbody = document.getElementById('chantiers-table-tbody');
    const query = filterQuery.toLowerCase().trim();

    const filteredChantiers = chantiers.filter(c => {
        return c.name.toLowerCase().includes(query) ||
            c.client.toLowerCase().includes(query) ||
            (c.entreprise && c.entreprise.toLowerCase().includes(query)) ||
            c.address.toLowerCase().includes(query);
    });

    tbody.innerHTML = filteredChantiers.map(c => {
        return `
            <tr>
                <td>
                    <div class="user-cell" style="cursor: pointer;" onclick="openChantierDetail('${c.id}')">
                        ${getChantierAvatar(c, 36)}
                        <span class="user-name-title" style="color: var(--primary); text-decoration: underline;">${c.name}</span>
                    </div>
                </td>
                <td>${c.client}</td>
                <td><span class="badge badge-gray">${c.entreprise || 'Non renseigné'}</span></td>
                <td>${c.address}</td>
                <td><span class="status-pill status-active">${c.status}</span></td>
                <td><strong>${c.workedHours}h</strong> / ${c.budgetHours}h</td>
                <td>
                    <div class="cell-actions">
                        ${isAdmin ? `
                        <button class="btn-action" title="Supprimer" onclick="deleteChantier('${c.id}')">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                        </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function renderPlanning() {
    const tbody = document.getElementById('planning-table-tbody');
    const thead = document.getElementById('planning-table-thead');
    if (!tbody || !thead) return;
    tbody.innerHTML = '';
    thead.innerHTML = '';

    // Populate planning filter select options dynamically
    const planningSelectFilter = document.getElementById('planning-chantier-filter');
    if (planningSelectFilter) {
        let optHtml = '<option value="all">Tous les chantiers (Nom)</option>';
        chantiers.forEach(ch => {
            optHtml += `<option value="${ch.id}" ${planningChantierFilterVal === ch.id ? 'selected' : ''}>${ch.name}</option>`;
        });
        planningSelectFilter.innerHTML = optHtml;
    }

    // Populate planning status select options dynamically based on active view mode
    const planningStatusSelect = document.getElementById('planning-status-filter');
    if (planningStatusSelect) {
        let optHtml = '';
        if (currentPlanningView === 'chantiers') {
            optHtml = `
                <option value="all" ${planningStatusFilterVal === 'all' ? 'selected' : ''}>Tous les chantiers (État)</option>
                <option value="not_fully" ${planningStatusFilterVal === 'not_fully' ? 'selected' : ''}>Chantiers pas complètement planifiés</option>
                <option value="fully" ${planningStatusFilterVal === 'fully' ? 'selected' : ''}>Complètement planifiés</option>
                <option value="planned" ${planningStatusFilterVal === 'planned' ? 'selected' : ''}>Planifiés</option>
                <option value="unplanned" ${planningStatusFilterVal === 'unplanned' ? 'selected' : ''}>Non planifiés</option>
            `;
        } else {
            optHtml = `
                <option value="all" ${planningStatusFilterVal === 'all' ? 'selected' : ''}>Tous les utilisateurs (État)</option>
                <option value="not_fully" ${planningStatusFilterVal === 'not_fully' ? 'selected' : ''}>Utilisateurs pas complètement planifiés</option>
                <option value="fully" ${planningStatusFilterVal === 'fully' ? 'selected' : ''}>Complètement planifiés</option>
                <option value="planned" ${planningStatusFilterVal === 'planned' ? 'selected' : ''}>Planifiés</option>
                <option value="unplanned" ${planningStatusFilterVal === 'unplanned' ? 'selected' : ''}>Non planifiés</option>
            `;
        }
        planningStatusSelect.innerHTML = optHtml;
    }

    // Filter projects based on dropdown selections
    const filteredChantiers = chantiers.filter(ch => {
        // Name Filter
        if (planningChantierFilterVal !== 'all' && planningChantierFilterVal !== ch.id) {
            return false;
        }

        // State / Status Filter (in chantiers mode)
        if (currentPlanningView === 'chantiers' && planningStatusFilterVal !== 'all') {
            const hasCompanions = Object.keys(planningAllocations[ch.id] || {}).length > 0;
            const isFullyPlanned = ch.workedHours >= ch.budgetHours;

            if (planningStatusFilterVal === 'not_fully' && isFullyPlanned) return false;
            if (planningStatusFilterVal === 'fully' && !isFullyPlanned) return false;
            if (planningStatusFilterVal === 'planned' && !hasCompanions) return false;
            if (planningStatusFilterVal === 'unplanned' && hasCompanions) return false;
        }
        return true;
    });

    // Filter users based on status selection (in users mode)
    let filteredUsers = users.filter(user => {
        if (currentPlanningView === 'users' && planningStatusFilterVal !== 'all') {
            const assignedDays = new Set();
            chantiers.forEach(ch => {
                const projectAllocations = planningAllocations[ch.id] || {};
                const alloc = projectAllocations[user.id];
                if (alloc && alloc.days) {
                    alloc.days.forEach(d => assignedDays.add(d));
                }
            });

            const totalDays = assignedDays.size;
            const isFullyPlanned = totalDays >= 5;
            const hasAssignments = totalDays > 0;

            if (planningStatusFilterVal === 'not_fully' && isFullyPlanned) return false;
            if (planningStatusFilterVal === 'fully' && !isFullyPlanned) return false;
            if (planningStatusFilterVal === 'planned' && !hasAssignments) return false;
            if (planningStatusFilterVal === 'unplanned' && hasAssignments) return false;
        }
        return true;
    });

    if (isOuvrier) {
        filteredUsers = filteredUsers.filter(user => user.id === currentUserProfile.id);
    }

    const txtToggleAll = document.getElementById('txt-toggle-all');

    // 1. Generate columns, months, and weeks definitions depending on active period
    const { columns, months, weeks } = getPlanningColumns(currentPlanningDate, currentPlanningPeriod);

    // Apply class to the wrapper table for narrow columns styling in CSS
    const tableEl = document.querySelector('.planning-table');
    if (tableEl) {
        tableEl.className = `planning-table ${currentPlanningPeriod}-mode`;
    }

    // 2. Build THEAD dynamically
    // Row 1: Months
    const trMonths = document.createElement('tr');

    // First header cell has the Toggle All button (rowspan="3")
    const thAll = document.createElement('th');
    thAll.className = 'col-project-info';
    thAll.rowSpan = 3;
    thAll.style.textAlign = 'left';
    thAll.style.paddingLeft = '12px';
    thAll.style.verticalAlign = 'middle';

    const anyUncollapsed = currentPlanningView === 'chantiers'
        ? Object.values(collapsedProjects).some(val => val === false)
        : Object.values(collapsedUsers).some(val => val === false);

    thAll.innerHTML = `
        <button class="btn-action" id="btn-toggle-all-resources" style="font-size: 12px; font-weight: 500; display: inline-flex; align-items: center; gap: 6px; padding: 2px 4px; border-radius: 4px; color: var(--gray-muted);">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 14h6v6H4zm10-10h6v6h-6zm-10 0h6v6H4zm10 10h6v6h-6z"/>
            </svg>
            <span id="txt-toggle-all">${anyUncollapsed ? 'Replier toutes les ressources' : 'Déplier toutes les ressources'}</span>
        </button>
    `;
    trMonths.appendChild(thAll);

    months.forEach(m => {
        const th = document.createElement('th');
        th.colSpan = m.colspan;
        th.style.textAlign = 'left';
        th.style.paddingLeft = '8px';
        th.style.fontSize = '12px';
        th.style.fontWeight = '700';
        th.textContent = m.name.charAt(0).toUpperCase() + m.name.slice(1);
        trMonths.appendChild(th);
    });
    thead.appendChild(trMonths);

    // Row 2: Weeks
    const trWeeks = document.createElement('tr');
    weeks.forEach(w => {
        const th = document.createElement('th');
        th.colSpan = w.colspan;
        th.style.fontSize = '11px';
        th.style.fontWeight = '600';
        th.style.color = 'var(--gray-muted)';
        th.style.textAlign = 'center';
        th.textContent = `${w.num}`;
        trWeeks.appendChild(th);
    });
    thead.appendChild(trWeeks);

    // Row 3: Days (numbers or letters)
    const trDays = document.createElement('tr');
    columns.forEach(col => {
        const th = document.createElement('th');
        th.className = 'col-day';
        if (currentPlanningPeriod === 'quarter') {
            th.textContent = col.dayLabel; // "L", "M", etc.
        } else {
            // week or month shows numbers
            th.innerHTML = `${col.dayLabel}`;
        }
        trDays.appendChild(th);
    });
    thead.appendChild(trDays);

    // Re-attach event listener to the recreated button
    const btnToggleAll = thAll.querySelector('#btn-toggle-all-resources');
    btnToggleAll.addEventListener('click', () => {
        const collapseVal = !anyUncollapsed;
        if (currentPlanningView === 'chantiers') {
            filteredChantiers.forEach(ch => {
                collapsedProjects[ch.id] = collapseVal;
            });
        } else {
            filteredUsers.forEach(u => {
                collapsedUsers[u.id] = collapseVal;
            });
        }
        renderPlanning();
    });

    // 3. Build TBODY
    if (currentPlanningView === 'chantiers') {
        filteredChantiers.forEach(ch => {
            const isCollapsed = collapsedProjects[ch.id] || false;
            // initials handled by getChantierAvatar

            const projectRow = document.createElement('tr');
            projectRow.className = `project-row ${isCollapsed ? 'collapsed' : ''}`;
            projectRow.dataset.chantierId = ch.id;

            const projectAllocations = planningAllocations[ch.id] || {};
            const companionIds = Object.keys(projectAllocations);

            let parentDaysHtml = '';
            columns.forEach(col => {
                const dayIdx = col.date.getDay() - 1;
                let count = 0;
                companionIds.forEach(uId => {
                    const alloc = projectAllocations[uId];
                    if (alloc && alloc.days.includes(dayIdx)) {
                        count++;
                    }
                });
                parentDaysHtml += `
                    <td style="background: #f9fafb; text-align: center; vertical-align: middle; position: relative;">
                        ${count > 0 ? `<div class="planning-count-badge" data-tooltip="${count} compagnon(s) planifié(s)">${count}</div>` : ''}
                    </td>
                `;
            });

            projectRow.innerHTML = `
                <td class="col-project-info">
                    <div class="project-cell-name">
                        <div class="project-title-left">
                            <svg class="toggle-arrow" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="9 18 15 12 9 6"/>
                            </svg>
                            ${getChantierAvatar(ch, 28)}
                            <span style="font-size: 13px;">${ch.name}</span>
                        </div>
                        ${isAdmin ? `
                        <button class="project-add-companion-btn" onclick="openAssignModal(event, '${ch.id}')" title="Affecter un compagnon">
                            +
                        </button>
                        ` : ''}
                    </div>
                </td>
                ${parentDaysHtml}
            `;

            projectRow.addEventListener('click', (e) => {
                if (e.target.closest('.btn') || e.target.closest('.project-add-companion-btn')) return;
                collapsedProjects[ch.id] = !collapsedProjects[ch.id];
                renderPlanning();
            });
            tbody.appendChild(projectRow);

            if (companionIds.length === 0) {
                if (!isCollapsed) {
                    const emptyRow = document.createElement('tr');
                    emptyRow.className = 'companion-row';
                    emptyRow.innerHTML = `
                        <td class="col-project-info tree-connector-cell" style="background: #fff; font-size: 12px; color: var(--gray-muted); font-style: italic;">
                            Aucun compagnon affecté
                        </td>
                        <td colspan="${columns.length}" style="background:#fff; text-align: center; color: var(--gray-muted); font-size: 12px;">
                            Cliquez sur "+" pour affecter des compagnons
                        </td>
                    `;
                    tbody.appendChild(emptyRow);
                }
            } else {
                companionIds.forEach(userId => {
                    const user = users.find(u => u.id === userId);
                    if (!user) return;

                    const alloc = projectAllocations[userId];
                    const initialsUser = `${user.firstname.charAt(0)}${user.lastname.charAt(0)}`.toUpperCase();

                    const compRow = document.createElement('tr');
                    compRow.className = 'companion-row';
                    if (isCollapsed) {
                        compRow.style.display = 'none';
                    }

                    let leftCellHtml = `
                        <td class="col-project-info tree-connector-cell">
                            <div class="companion-info-cell">
                                <div class="companion-left">
                                    ${getUserAvatar(user, 36)}
                                    <div class="user-info">
                                        <span class="companion-name">${user.firstname} ${user.lastname}</span>
                                        <span class="companion-role">${user.role}</span>
                                    </div>
                                </div>
                                <button class="btn-action" style="padding: 2px;" onclick="removeCompanionFromPlanning('${ch.id}', '${userId}')" title="Retirer du chantier">
                                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                                        <polyline points="3 6 5 6 21 6"/>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                    </svg>
                                </button>
                            </div>
                        </td>
                    `;

                    let daysHtml = '';
                    columns.forEach(col => {
                        const dayIdx = col.date.getDay() - 1;
                        const isAssigned = alloc.days.includes(dayIdx);

                        daysHtml += `
                            <td style="position: relative; text-align: center; vertical-align: middle;">
                                ${isAssigned ? `
                                    <div class="assignment-block" onclick="openEditAssignModal(event, '${ch.id}', '${userId}', '${col.dayLabel}')" data-tooltip="Chantier : ${ch.name} | Ouvrier : ${user.firstname} ${user.lastname}" style="cursor: pointer;">
                                        ${currentPlanningPeriod === 'week' ? `
                                            <span class="assignment-hours">${alloc.hours}</span>
                                            <span class="assignment-compagnon-name">${user.firstname} ${user.lastname}</span>
                                        ` : `
                                            <span class="assignment-bubble" style="background-color: var(--primary);">${user.firstname.charAt(0)}${user.lastname.charAt(0)}</span>
                                        `}
                                    </div>
                                ` : `
                                    ${isAdmin ? `<button class="planning-add-btn" onclick="openAssignModal(event, '${ch.id}', '${userId}')">+</button>` : ''}
                                `}
                            </td>
                        `;
                    });

                    compRow.innerHTML = leftCellHtml + daysHtml;
                    tbody.appendChild(compRow);
                });
            }
        });

    } else {
        // Mode 2: Utilisateurs
        filteredUsers.forEach(user => {
            const isCollapsed = collapsedUsers[user.id] || false;
            const initialsUser = `${user.firstname.charAt(0)}${user.lastname.charAt(0)}`.toUpperCase();

            const userAllocations = [];
            filteredChantiers.forEach(ch => {
                const projectAllocations = planningAllocations[ch.id] || {};
                if (projectAllocations[user.id]) {
                    userAllocations.push({
                        chantier: ch,
                        alloc: projectAllocations[user.id]
                    });
                }
            });

            const hasAssignments = userAllocations.length > 0;

            const userRow = document.createElement('tr');
            userRow.className = `project-row ${isCollapsed ? 'collapsed' : ''}`;
            userRow.dataset.userId = user.id;

            let rowHeaderHtml = '';
            if (hasAssignments) {
                let parentDaysHtml = '';
                columns.forEach(col => {
                    const dayIdx = col.date.getDay() - 1;
                    let count = 0;
                    userAllocations.forEach(({ alloc }) => {
                        if (alloc && alloc.days.includes(dayIdx)) {
                            count++;
                        }
                    });
                    parentDaysHtml += `
                        <td style="background: #f9fafb; text-align: center; vertical-align: middle; position: relative;">
                            ${count > 0 ? `<div class="planning-count-badge" style="background-color: var(--accent-light); color: var(--accent);" data-tooltip="${count} chantier(s) planifié(s)">${count}</div>` : ''}
                        </td>
                    `;
                });

                rowHeaderHtml = `
                    <td class="col-project-info">
                        <div class="project-cell-name">
                            <div class="project-title-left">
                                <svg class="toggle-arrow" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="9 18 15 12 9 6"/>
                                </svg>
                                ${getUserAvatar(user, 28)}
                                <span style="font-size: 13px;">${user.firstname} ${user.lastname}</span>
                            </div>
                        </div>
                    </td>
                    ${parentDaysHtml}
                `;
                userRow.addEventListener('click', () => {
                    collapsedUsers[user.id] = !collapsedUsers[user.id];
                    renderPlanning();
                });
            } else {
                let stripedCells = '';
                for (let k = 0; k < columns.length; k++) {
                    stripedCells += '<td class="striped-cell"></td>';
                }

                rowHeaderHtml = `
                    <td class="col-project-info">
                        <div class="project-cell-name">
                            <div class="project-title-left" style="padding-left: 20px;">
                                ${getUserAvatar(user, 28)}
                                <span style="font-size: 13px;">${user.firstname} ${user.lastname}</span>
                            </div>
                        </div>
                    </td>
                    ${stripedCells}
                `;
            }

            userRow.innerHTML = rowHeaderHtml;
            tbody.appendChild(userRow);

            if (hasAssignments && !isCollapsed) {
                userAllocations.forEach(({ chantier, alloc }) => {
                    const compRow = document.createElement('tr');
                    compRow.className = 'companion-row';

                    let leftCellHtml = `
                        <td class="col-project-info tree-connector-cell">
                            <div class="companion-info-cell">
                                <div class="companion-left">
                                    ${getChantierAvatar(chantier, 36)}
                                    <div class="user-info">
                                        <span class="companion-name">${chantier.name}</span>
                                        <span class="companion-role">Chantier</span>
                                    </div>
                                </div>
                                <button class="btn-action" style="padding: 2px;" onclick="removeCompanionFromPlanning('${chantier.id}', '${user.id}')" title="Retirer du chantier">
                                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                                        <polyline points="3 6 5 6 21 6"/>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                    </svg>
                                </button>
                            </div>
                        </td>
                    `;

                    let daysHtml = '';
                    columns.forEach(col => {
                        const dayIdx = col.date.getDay() - 1;
                        const isAssigned = alloc.days.includes(dayIdx);

                        daysHtml += `
                            <td style="position: relative; text-align: center; vertical-align: middle;">
                                ${isAssigned ? `
                                    <div class="assignment-block project-block" onclick="openEditAssignModal(event, '${chantier.id}', '${user.id}', '${col.dayLabel}')" style="background-color: ${chantier.color || 'var(--accent)'}; cursor: pointer;" data-tooltip="Chantier : ${chantier.name} | Ouvrier : ${user.firstname} ${user.lastname}">
                                        ${currentPlanningPeriod === 'week' ? `
                                            <span class="assignment-hours assignment-hours-pink">${alloc.hours}</span>
                                            <span class="assignment-compagnon-name">${chantier.name}</span>
                                        ` : `
                                            <span class="assignment-bubble">${initialsChantier}</span>
                                        `}
                                    </div>
                                ` : `
                                    ${isAdmin ? `<button class="planning-add-btn" onclick="openAssignModal(event, '${chantier.id}', '${user.id}')">+</button>` : ''}
                                `}
                            </td>
                        `;
                    });

                    compRow.innerHTML = leftCellHtml + daysHtml;
                    tbody.appendChild(compRow);
                });
            }
        });
    }

    // Render Mobile List View
    const mobileListView = document.getElementById('mobile-planning-list-view');
    if (mobileListView) {
        let mobileHtml = '';
        
        // Find Monday date of active week
        const currentDay = currentPlanningDate.getDay();
        const distanceToMon = currentDay === 0 ? -6 : 1 - currentDay;
        const monday = new Date(currentPlanningDate);
        monday.setDate(currentPlanningDate.getDate() + distanceToMon);

        const daysOfWeek = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi'];

        daysOfWeek.forEach((dayName, dIdx) => {
            const currentDayDate = new Date(monday);
            currentDayDate.setDate(monday.getDate() + dIdx);
            const dayNumStr = String(currentDayDate.getDate()).padStart(2, '0');
            const dayLabel = `${dayName} ${dayNumStr}`;

            mobileHtml += `<div class="mobile-planning-day-header">${dayLabel}</div>`;

            let dayAllocs = [];

            if (currentPlanningView === 'users') {
                // Show assignments of the active filtered users
                filteredUsers.forEach(user => {
                    chantiers.forEach(ch => {
                        const projectAllocations = planningAllocations[ch.id] || {};
                        const alloc = projectAllocations[user.id];
                        if (alloc && alloc.days.includes(dIdx)) {
                            dayAllocs.push({
                                id: ch.id,
                                title: ch.name,
                                subtitle: `${user.firstname} ${user.lastname}`,
                                hours: alloc.hours || '08:00 - 17:00',
                                color: ch.color || '#3b82f6',
                                initials: ch.name.split(' ').map(w => w.charAt(0)).join('').substring(0, 2).toUpperCase()
                            });
                        }
                    });
                });
            } else {
                // Planning Général: show chantiers and who is on them
                filteredChantiers.forEach(ch => {
                    const projectAllocations = planningAllocations[ch.id] || {};
                    const isCollapsed = collapsedProjects[ch.id] || false;
                    
                    const companionsOnDay = [];
                    for (const uId in projectAllocations) {
                        if (projectAllocations[uId].days.includes(dIdx)) {
                            const u = users.find(usr => usr.id === uId);
                            if (u) {
                                companionsOnDay.push({
                                    user: u,
                                    hours: projectAllocations[uId].hours || '08:00 - 17:00'
                                });
                            }
                        }
                    }

                    if (companionsOnDay.length > 0) {
                        dayAllocs.push({
                            id: ch.id,
                            title: ch.name,
                            companionsCount: companionsOnDay.length,
                            companions: companionsOnDay,
                            isCollapsed: isCollapsed,
                            color: ch.color || '#3b82f6',
                            initials: ch.name.split(' ').map(w => w.charAt(0)).join('').substring(0, 2).toUpperCase()
                        });
                    }
                });
            }

            if (dayAllocs.length === 0) {
                mobileHtml += `
                    <div class="mobile-planning-card" style="justify-content: center; color: #94a3b8; font-style: italic; font-size: 12px; background: white;">
                        Aucun chantier prévu
                    </div>
                `;
            } else {
                dayAllocs.forEach(alloc => {
                    if (currentPlanningView === 'users') {
                        mobileHtml += `
                            <div class="mobile-planning-card" style="background: white;">
                                <div class="mobile-planning-card-left">
                                    <div class="initials-bubble" style="background-color: ${alloc.color}; width: 32px; height: 32px; font-size: 11px; line-height: 32px; margin: 0; color: white;">
                                        ${alloc.initials}
                                    </div>
                                    <div style="display: flex; flex-direction: column;">
                                        <span class="mobile-planning-card-title">${alloc.title}</span>
                                        <span style="font-size: 11px; color: #64748b; margin-top: 2px;">${alloc.subtitle}</span>
                                    </div>
                                </div>
                                <span class="mobile-planning-card-hours" style="color: var(--primary);">${alloc.hours}</span>
                            </div>
                        `;
                    } else {
                        // General Planning: Collapsible Project Row
                        const arrowSvg = `
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3" style="transform: ${alloc.isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)'}; transition: transform 0.2s; margin-left: 6px; display: inline-block; vertical-align: middle;">
                                <polyline points="6 9 12 15 18 9"/>
                            </svg>
                        `;
                        
                        mobileHtml += `
                            <div class="mobile-planning-card project-toggle-card" data-project-id="${alloc.id}" style="background: white; cursor: pointer;">
                                <div class="mobile-planning-card-left">
                                    <div class="initials-bubble" style="background-color: ${alloc.color}; width: 32px; height: 32px; font-size: 11px; line-height: 32px; margin: 0; color: white;">
                                        ${alloc.initials}
                                    </div>
                                    <div style="display: flex; flex-direction: column;">
                                        <span class="mobile-planning-card-title">${alloc.title}</span>
                                        <span style="font-size: 11px; color: var(--accent); font-weight: 700; margin-top: 2px; display: flex; align-items: center; gap: 4px;">
                                            ${alloc.companionsCount} compagnon(s) ${arrowSvg}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        `;

                        if (!alloc.isCollapsed) {
                            alloc.companions.forEach(comp => {
                                const initialsComp = `${comp.user.firstname.charAt(0)}${comp.user.lastname.charAt(0)}`.toUpperCase();
                                mobileHtml += `
                                    <div class="mobile-planning-card" style="background: #f8fafc; padding-left: 36px; border-left: 4px solid var(--accent);">
                                        <div class="mobile-planning-card-left">
                                            <div class="initials-bubble bubble-violet" style="width: 28px; height: 28px; font-size: 10px; line-height: 28px; margin: 0;">
                                                ${initialsComp}
                                            </div>
                                            <div style="display: flex; flex-direction: column;">
                                                <span style="font-size: 13px; font-weight: 700; color: #334155;">${comp.user.firstname} ${comp.user.lastname}</span>
                                                <span style="font-size: 11px; color: #64748b;">${comp.user.role}</span>
                                            </div>
                                        </div>
                                        <span class="mobile-planning-card-hours" style="font-size: 13px; color: #334155;">${comp.hours}</span>
                                    </div>
                                `;
                            });
                        }
                    }
                });
            }
        });

        mobileListView.innerHTML = mobileHtml;

        // Bind click events for mobile project toggles
        mobileListView.querySelectorAll('.project-toggle-card').forEach(card => {
            card.addEventListener('click', () => {
                const projectId = card.getAttribute('data-project-id');
                collapsedProjects[projectId] = !collapsedProjects[projectId];
                renderPlanning();
            });
        });
    }
}

async function deleteUser(userId) {
    if (await showCustomConfirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
        if (useSupabase) {
            await supabaseClient.from('utilisateurs').delete().eq('id', userId);
            await loadDataFromSupabase();
        } else {
            users = users.filter(u => u.id !== userId);

            // Remove from planning as well
            Object.keys(planningAllocations).forEach(chId => {
                if (planningAllocations[chId][userId]) {
                    delete planningAllocations[chId][userId];
                }
            });
        }

        renderUsers();
        renderPlanning();
        renderDashboard();
    }
}

// Project Actions: delete project
async function deleteChantier(chantierId) {
    if (await showCustomConfirm('Êtes-vous sûr de vouloir supprimer ce chantier ?')) {
        if (useSupabase) {
            await supabaseClient.from('chantiers').delete().eq('id', chantierId);
            await loadDataFromSupabase();
        } else {
            chantiers = chantiers.filter(c => c.id !== chantierId);
            delete planningAllocations[chantierId];
            delete collapsedProjects[chantierId];
        }

        renderChantiers();
        renderPlanning();
        renderDashboard();
    }
}

// Planning actions: Remove Companion
async function removeCompanionFromPlanning(chantierId, userId) {
    if (planningAllocations[chantierId] && planningAllocations[chantierId][userId]) {
        const user = users.find(u => u.id === userId);
        const chantier = chantiers.find(c => c.id === chantierId);

        if (useSupabase) {
            await supabaseClient.from('planning_allocations').delete().eq('chantier_id', chantierId).eq('user_id', userId);
            await supabaseClient.from('hours_allocations').delete().eq('chantier_id', chantierId).eq('user_id', userId);
            if (user && chantier) {
                await supabaseClient.from('dashboard_activities').insert([{
                    activity_text: `${user.firstname} ${user.lastname} a été retiré du chantier "${chantier.name}"`
                }]);
            }
            await loadDataFromSupabase();
        } else {
            delete planningAllocations[chantierId][userId];

            // Log activity
            if (user && chantier) {
                activities.unshift({
                    text: `${user.firstname} ${user.lastname} a été retiré du chantier "${chantier.name}"`,
                    time: 'À l\'instant'
                });
            }
        }

        renderPlanning();
        renderDashboard();
    }
}

// Modal handling logic
function initModals() {
    const userModal = document.getElementById('user-modal');
    const chantierModal = document.getElementById('chantier-modal');
    const assignModal = document.getElementById('assign-modal');
    const editAssignModal = document.getElementById('edit-assign-modal');

    // Open User Modal
    document.getElementById('btn-open-user-modal').addEventListener('click', () => {
        userModal.classList.add('show');
    });

    // Open Chantier Modal
    document.getElementById('btn-open-chantier-modal').addEventListener('click', () => {
        chantierModal.classList.add('show');
    });

    // Close buttons
    document.getElementById('btn-close-user-modal').addEventListener('click', () => userModal.classList.remove('show'));
    document.getElementById('btn-cancel-user-modal').addEventListener('click', () => userModal.classList.remove('show'));

    document.getElementById('btn-close-chantier-modal').addEventListener('click', () => chantierModal.classList.remove('show'));
    document.getElementById('btn-cancel-chantier-modal').addEventListener('click', () => chantierModal.classList.remove('show'));

    // Edit Chantier Modal Close
    const editChantierModal = document.getElementById('edit-chantier-modal');
    document.getElementById('btn-close-edit-chantier-modal').addEventListener('click', () => editChantierModal.classList.remove('show'));
    document.getElementById('btn-cancel-edit-chantier-modal').addEventListener('click', () => editChantierModal.classList.remove('show'));

    // Edit Chantier Color Palette dots Click
    const editColorDots = document.querySelectorAll('#edit-chantier-color-picker .picker-dot');
    editColorDots.forEach(dot => {
        dot.addEventListener('click', () => {
            editColorDots.forEach(d => d.classList.remove('selected'));
            dot.classList.add('selected');
            document.getElementById('edit-chantier-color-input').value = dot.dataset.color;
        });
    });

    // Edit Chantier Form Submit
    const editChantierForm = document.getElementById('edit-chantier-form');
    if (editChantierForm) {
        editChantierForm.addEventListener('submit', saveEditChantier);
    }

    // Memo Modal events
    const memoModal = document.getElementById('memo-modal');
    const btnOpenMemoModal = document.getElementById('btn-open-memo-modal');
    if (btnOpenMemoModal) {
        btnOpenMemoModal.addEventListener('click', openMemoModal);
    }
    const btnCloseMemoModal = document.getElementById('btn-close-memo-modal');
    if (btnCloseMemoModal) {
        btnCloseMemoModal.addEventListener('click', () => memoModal.classList.remove('show'));
    }
    const btnCancelMemoModal = document.getElementById('btn-cancel-memo-modal');
    if (btnCancelMemoModal) {
        btnCancelMemoModal.addEventListener('click', () => memoModal.classList.remove('show'));
    }
    const createMemoForm = document.getElementById('create-memo-form');
    if (createMemoForm) {
        createMemoForm.addEventListener('submit', saveMemo);
    }

    document.getElementById('btn-close-assign-modal').addEventListener('click', () => assignModal.classList.remove('show'));
    document.getElementById('btn-cancel-assign-modal').addEventListener('click', () => assignModal.classList.remove('show'));

    // Close edit assignment modal
    document.getElementById('btn-close-edit-assign-modal').addEventListener('click', () => editAssignModal.classList.remove('show'));
    document.getElementById('btn-cancel-edit-assign-modal').addEventListener('click', () => editAssignModal.classList.remove('show'));

    // Save and Delete edit assignment buttons
    document.getElementById('btn-save-edit-assign').addEventListener('click', saveEditAssignment);
    document.getElementById('btn-delete-edit-assign').addEventListener('click', deleteEditAssignment);

    // Edit modal tab switching
    const editTabs = document.querySelectorAll('.edit-modal-tab');
    editTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            editTabs.forEach(t => {
                t.classList.remove('active');
                t.style.backgroundColor = '';
                t.style.color = 'var(--gray-muted)';
            });
            tab.classList.add('active');
            tab.style.backgroundColor = '#dbeafe';
            tab.style.color = '#1e3a8a';
            
            // Hide all tab contents
            document.querySelectorAll('.edit-tab-content').forEach(tc => tc.style.display = 'none');
            // Show target tab content
            const targetId = tab.dataset.tab;
            document.getElementById(targetId).style.display = 'block';
        });
    });

    // Edit Modal color dots picker
    const editColorPickerDots = document.querySelectorAll('#edit-assign-color-picker .picker-dot');
    editColorPickerDots.forEach(dot => {
        dot.addEventListener('click', () => {
            editColorPickerDots.forEach(d => d.classList.remove('selected'));
            dot.classList.add('selected');
            document.getElementById('edit-assign-color').value = dot.dataset.color;
        });
    });

    // Edit User Modal close buttons
    const editUserModal = document.getElementById('edit-user-modal');
    if (editUserModal) {
        document.getElementById('btn-close-edit-user-modal').addEventListener('click', () => editUserModal.classList.remove('show'));
        document.getElementById('btn-cancel-edit-user-modal').addEventListener('click', () => editUserModal.classList.remove('show'));
        editUserModal.addEventListener('click', (e) => { if (e.target === editUserModal) editUserModal.classList.remove('show'); });

        // Edit User Color Palette dots
        const editUserColorDots = document.querySelectorAll('#edit-user-color-picker .picker-dot');
        editUserColorDots.forEach(dot => {
            dot.addEventListener('click', () => {
                editUserColorDots.forEach(d => d.classList.remove('selected'));
                dot.classList.add('selected');
                document.getElementById('edit-user-color-input').value = dot.dataset.color;
            });
        });

        // Edit User Form Submit
        const editUserForm = document.getElementById('edit-user-form');
        if (editUserForm) {
            editUserForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const userId = document.getElementById('edit-user-id').value;
                const firstname = document.getElementById('edit-user-firstname').value.trim();
                const lastname = document.getElementById('edit-user-lastname').value.trim();
                const phone = document.getElementById('edit-user-phone').value.trim();
                const code = document.getElementById('edit-user-code').value.trim();
                const role = document.getElementById('edit-user-role-select').value;
                const type = document.getElementById('edit-user-type').value;
                const color = document.getElementById('edit-user-color-input').value;

                let imgData = null;
                const editUploader = document.querySelector('#edit-user-modal .image-uploader');
                if (editUploader) {
                    imgData = editUploader.getAttribute('data-image-base64');
                }

                if (useSupabase) {
                    try {
                        const { error } = await supabaseClient.from('utilisateurs').update({ firstname, lastname, phone, role, type, color }).eq('id', userId);
                        if (error) throw error;
                    } catch (err) {
                        console.warn("La modification complète a échoué (colonne color absente dans Supabase). Repli sur les champs de base.", err);
                        // Fallback: update only core fields that are guaranteed to exist
                        await supabaseClient.from('utilisateurs').update({ firstname, lastname, phone, role, type }).eq('id', userId);
                    }
                    await loadDataFromSupabase();
                } else {
                    const idx = users.findIndex(u => u.id === userId);
                    if (idx !== -1) {
                        users[idx] = { ...users[idx], firstname, lastname, phone, code, role, type, color };
                    }
                }

                if (imgData) {
                    const idx = users.findIndex(u => u.id === userId);
                    if (idx !== -1) users[idx].image = imgData;
                    const savedImages = JSON.parse(localStorage.getItem('user_images') || '{}');
                    savedImages[userId] = imgData;
                    localStorage.setItem('user_images', JSON.stringify(savedImages));
                }

                editUserModal.classList.remove('show');
                renderUsers();
                // If we're on the user detail page, refresh it
                if (activeUserId === userId) {
                    renderUserDetail();
                }
                renderDashboard();
            });
        }
    }

    // Close modals on clicking background
    [userModal, chantierModal, assignModal, editAssignModal].forEach(m => {
        if (m) {
            m.addEventListener('click', (e) => {
                if (e.target === m) {
                    m.classList.remove('show');
                }
            });
        }
    });
}

function openEditAssignModal(e, chantierId, userId, dateLabel) {
    if (!isAdmin) return;
    if (e && e.stopPropagation) e.stopPropagation();
    
    const chantier = chantiers.find(c => c.id === chantierId);
    const user = users.find(u => u.id === userId);
    if (!chantier || !user) return;

    const modal = document.getElementById('edit-assign-modal');
    document.getElementById('edit-assign-chantier-id').value = chantierId;
    document.getElementById('edit-assign-user-id').value = userId;

    document.getElementById('edit-assign-subtitle-worker').textContent = `${user.firstname} ${user.lastname}`;
    document.getElementById('edit-assign-subtitle-chantier').textContent = chantier.name;
    document.getElementById('edit-assign-date').value = dateLabel;

    // Get time from allocation
    const alloc = planningAllocations[chantierId] ? planningAllocations[chantierId][userId] : null;
    let startTime = "08:00";
    let endTime = "17:00";
    if (alloc && alloc.hours) {
        const parts = alloc.hours.split('-');
        if (parts[0]) startTime = parts[0].trim();
        if (parts[1]) endTime = parts[1].trim();
    }
    document.getElementById('edit-assign-start-time').value = startTime;
    document.getElementById('edit-assign-end-time').value = endTime;

    // Pre-populate note and task (mock or loaded from BDD if fields exist)
    document.getElementById('edit-assign-note').value = alloc && alloc.note ? alloc.note : "";
    document.getElementById('edit-assign-task').value = alloc && alloc.task ? alloc.task : "";

    // Reset color dots selector
    const activeColor = alloc && alloc.color ? alloc.color : "#10b981";
    document.getElementById('edit-assign-color').value = activeColor;
    const editColorPickerDots = document.querySelectorAll('#edit-assign-color-picker .picker-dot');
    editColorPickerDots.forEach(dot => {
        dot.classList.remove('selected');
        if (dot.dataset.color === activeColor) {
            dot.classList.add('selected');
        }
    });

    // Reset tabs in modal
    const tabs = document.querySelectorAll('.edit-modal-tab');
    tabs.forEach(t => {
        t.classList.remove('active');
        t.style.backgroundColor = '';
        t.style.color = 'var(--gray-muted)';
    });
    tabs[0].classList.add('active');
    tabs[0].style.backgroundColor = '#dbeafe';
    tabs[0].style.color = '#1e3a8a';
    document.querySelectorAll('.edit-tab-content').forEach(tc => tc.style.display = 'none');
    document.getElementById('tab-edit-alloc').style.display = 'block';

    modal.classList.add('show');
}

async function saveEditAssignment() {
    const chantierId = document.getElementById('edit-assign-chantier-id').value;
    const userId = document.getElementById('edit-assign-user-id').value;
    const startTime = document.getElementById('edit-assign-start-time').value;
    const endTime = document.getElementById('edit-assign-end-time').value;
    const note = document.getElementById('edit-assign-note').value.trim();
    const task = document.getElementById('edit-assign-task').value;
    const color = document.getElementById('edit-assign-color').value;

    const hoursStr = `${startTime} - ${endTime}`;

    if (useSupabase) {
        // Update planning_allocations
        await supabaseClient.from('planning_allocations').update({
            start_time: startTime + ':00',
            end_time: endTime + ':00',
            note: note,
            color: color
        }).eq('chantier_id', chantierId).eq('user_id', userId);
        
        await loadDataFromSupabase();
    } else {
        if (planningAllocations[chantierId] && planningAllocations[chantierId][userId]) {
            planningAllocations[chantierId][userId].hours = hoursStr;
            planningAllocations[chantierId][userId].note = note;
            planningAllocations[chantierId][userId].task = task;
            planningAllocations[chantierId][userId].color = color;
        }
    }

    document.getElementById('edit-assign-modal').classList.remove('show');
    renderPlanning();
    renderDashboard();
}

async function deleteEditAssignment() {
    const chantierId = document.getElementById('edit-assign-chantier-id').value;
    const userId = document.getElementById('edit-assign-user-id').value;

    if (await showCustomConfirm('Êtes-vous sûr de vouloir supprimer cette affectation ?')) {
        await removeCompanionFromPlanning(chantierId, userId);
        document.getElementById('edit-assign-modal').classList.remove('show');
    }
}

// Open Assign Companion Modal
function openAssignModal(e, chantierId, userId) {
    if (!isAdmin) return;
    if (e && e.stopPropagation) e.stopPropagation(); // prevent collapsing project row
    const modal = document.getElementById('assign-modal');
    document.getElementById('assign-chantier-id').value = chantierId;

    // Populate workers dropdown select option
    const select = document.getElementById('assign-user');
    select.innerHTML = users
        .filter(u => u.status === 'Actif')
        .map(u => `<option value="${u.id}" ${userId === u.id ? 'selected' : ''}>${u.firstname} ${u.lastname} (${u.role})</option>`)
        .join('');

    modal.classList.add('show');
}

// Form submissions
function initForms() {
    // 1. Add User Form
    const userForm = document.getElementById('add-user-form');
    userForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const firstname = document.getElementById('user-firstname').value.trim();
        const lastname = document.getElementById('user-lastname').value.trim();
        const role = document.getElementById('user-role').value;
        const phone = document.getElementById('user-phone').value.trim();
        const type = document.getElementById('add-user-type') ? document.getElementById('add-user-type').value : 'Employé';
        const color = document.getElementById('add-user-color-input') ? document.getElementById('add-user-color-input').value : '#10b981';
        const code = document.getElementById('add-user-code') ? document.getElementById('add-user-code').value.trim() : '';

        const newUser = {
            id: 'u_' + Date.now(),
            firstname,
            lastname,
            role,
            type,
            status: 'Actif',
            phone,
            color,
            code
        };

        let imgData = null;
        const addUploader = document.querySelector('#user-modal .image-uploader');
        if (addUploader) {
            imgData = addUploader.getAttribute('data-image-base64');
            if (imgData) newUser.image = imgData;
        }

        if (useSupabase) {
            try {
                // Try inserting with all fields (color, code, etc.)
                const { error } = await supabaseClient.from('utilisateurs').insert([newUser]);
                if (error) throw error;
            } catch (err) {
                console.warn("L'insertion complète a échoué (colonnes color/code probablement absentes dans Supabase). Repli sur les champs de base.", err);
                // Fallback: insert only core columns that exist in the default schema
                const coreUser = {
                    id: newUser.id,
                    firstname: newUser.firstname,
                    lastname: newUser.lastname,
                    role: newUser.role,
                    type: newUser.type,
                    status: newUser.status,
                    phone: newUser.phone
                };
                await supabaseClient.from('utilisateurs').insert([coreUser]);
            }
            await supabaseClient.from('dashboard_activities').insert([{ activity_text: `Nouvel utilisateur ajouté : ${firstname} ${lastname}` }]);
            await loadDataFromSupabase();
        } else {
            users.push(newUser);
            activities.unshift({
                text: `Nouvel utilisateur ajouté : ${firstname} ${lastname}`,
                time: 'À l\'instant'
            });
        }

        if (imgData) {
            const savedImages = JSON.parse(localStorage.getItem('user_images') || '{}');
            savedImages[newUser.id] = imgData;
            localStorage.setItem('user_images', JSON.stringify(savedImages));
        }

        userForm.reset();
        if (addUploader) {
            addUploader.removeAttribute('data-image-base64');
            const oldPreview = addUploader.querySelector('.uploader-preview-img');
            if (oldPreview) oldPreview.remove();
            addUploader.querySelectorAll(':not(.image-uploader-input)').forEach(child => child.style.opacity = '');
        }

        // Reset color picker selection
        const addColorDots = document.querySelectorAll('#add-user-color-picker .picker-dot');
        addColorDots.forEach(d => d.classList.remove('selected'));
        const firstDot = document.querySelector('#add-user-color-picker .picker-dot');
        if (firstDot) { firstDot.classList.add('selected'); }
        if (document.getElementById('add-user-color-input')) document.getElementById('add-user-color-input').value = '#10b981';

        document.getElementById('user-modal').classList.remove('show');

        renderUsers();
        renderDashboard();
    });

    // Init add-user color picker dots
    const addUserColorDots = document.querySelectorAll('#add-user-color-picker .picker-dot');
    addUserColorDots.forEach(dot => {
        dot.addEventListener('click', () => {
            addUserColorDots.forEach(d => d.classList.remove('selected'));
            dot.classList.add('selected');
            document.getElementById('add-user-color-input').value = dot.dataset.color;
        });
    });

    // 2. Add Chantier Form
    // Color picker interaction logic — scoped to chantier modal only
    const colorDots = document.querySelectorAll('#chantier-modal .picker-dot');
    colorDots.forEach(dot => {
        dot.addEventListener('click', () => {
            colorDots.forEach(d => d.classList.remove('selected'));
            dot.classList.add('selected');
            document.getElementById('chantier-color-input').value = dot.dataset.color;
        });
    });

    const chantierForm = document.getElementById('add-chantier-form');
    chantierForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('chantier-name').value.trim();
        const client = document.getElementById('chantier-client').value.trim();
        const entreprise = document.getElementById('chantier-entreprise') ? document.getElementById('chantier-entreprise').value.trim() : '';

        // Construct full address from components
        const addr = document.getElementById('chantier-address').value.trim();
        const zip = document.getElementById('chantier-zip').value.trim();
        const city = document.getElementById('chantier-city').value.trim();
        const fullAddress = addr + (zip ? `, ${zip}` : '') + (city ? ` ${city}` : '');

        const budgetHours = parseFloat(document.getElementById('chantier-budget').value) || 150;
        const color = document.getElementById('chantier-color-input').value || '#10b981';
        const status = document.getElementById('chantier-status').value || 'Ouvert';

        const newCh = {
            id: 'c_' + Date.now(),
            name,
            client,
            entreprise,
            address: fullAddress || 'Adresse non renseignée',
            status,
            budgetHours,
            workedHours: 0,
            color // Hex color code from selector
        };

        if (useSupabase) {
            await supabaseClient.from('chantiers').insert([{
                id: newCh.id,
                name: newCh.name,
                client: newCh.client,
                entreprise: newCh.entreprise,
                address: newCh.address,
                status: newCh.status,
                budget_hours: newCh.budgetHours,
                worked_hours: newCh.workedHours,
                color: newCh.color
            }]);
            await supabaseClient.from('dashboard_activities').insert([{ activity_text: `Nouveau chantier créé : ${name}` }]);
            await loadDataFromSupabase();
        } else {
            chantiers.push(newCh);
            activities.unshift({
                text: `Nouveau chantier créé : ${name}`,
                time: 'À l\'instant'
            });
        }

        collapsedProjects[newCh.id] = false; // start unfolded
        chantierForm.reset();

        // Reset color dots
        colorDots.forEach(d => d.classList.remove('selected'));
        if (colorDots[0]) {
            colorDots[0].classList.add('selected');
            document.getElementById('chantier-color-input').value = colorDots[0].dataset.color;
        }

        document.getElementById('chantier-modal').classList.remove('show');

        renderChantiers();
        renderPlanning();
        renderDashboard();
    });

    // 3. Assign Companion Form
    const assignForm = document.getElementById('assign-form');
    assignForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const chantierId = document.getElementById('assign-chantier-id').value;
        const userId = document.getElementById('assign-user').value;
        const startTime = document.getElementById('assign-start-time').value;
        const endTime = document.getElementById('assign-end-time').value;

        // Find checked days
        const checkedDaysEls = document.querySelectorAll('input[name="assign-days"]:checked');
        const days = Array.from(checkedDaysEls).map(el => parseInt(el.value));

        if (days.length === 0) {
            alert('Veuillez sélectionner au moins un jour d\'affectation.');
            return;
        }

        const user = users.find(u => u.id === userId);
        const chantier = chantiers.find(c => c.id === chantierId);

        if (useSupabase) {
            // 1. Insert planning_allocations
            await supabaseClient.from('planning_allocations').insert([{
                chantier_id: chantierId,
                user_id: userId,
                start_time: startTime + ':00',
                end_time: endTime + ':00'
            }]);

            // 2. Insert planning_allocation_days
            const daysIns = days.map(d => ({
                chantier_id: chantierId,
                user_id: userId,
                day_index: d
            }));
            await supabaseClient.from('planning_allocation_days').insert(daysIns);

            // 3. Insert hours_allocations "À compléter" or "00:00"
            const hoursIns = [];
            for (let d = 0; d < 5; d++) {
                hoursIns.push({
                    chantier_id: chantierId,
                    user_id: userId,
                    day_index: d,
                    hours_value: days.includes(d) ? 'À compléter' : '00:00'
                });
            }
            await supabaseClient.from('hours_allocations').insert(hoursIns);

            // 4. Log Activity
            await supabaseClient.from('dashboard_activities').insert([{
                activity_text: `${user.firstname} ${user.lastname} affecté au chantier "${chantier.name}"`
            }]);

            await loadDataFromSupabase();
        } else {
            // Initialize target project allocation entry if not exist
            if (!planningAllocations[chantierId]) {
                planningAllocations[chantierId] = {};
            }

            planningAllocations[chantierId][userId] = {
                days,
                hours: `${startTime} - ${endTime}`
            };

            // Initialize hours allocations to "À compléter" for assigned days
            if (!hoursAllocations[chantierId]) {
                hoursAllocations[chantierId] = {};
            }
            hoursAllocations[chantierId][userId] = {};
            for (let d = 0; d < 5; d++) {
                if (days.includes(d)) {
                    hoursAllocations[chantierId][userId][d] = "À compléter";
                } else {
                    hoursAllocations[chantierId][userId][d] = "00:00";
                }
            }

            activities.unshift({
                text: `${user.firstname} ${user.lastname} affecté au chantier "${chantier.name}"`,
                time: 'À l\'instant'
            });
        }

        // Reset and hide
        assignForm.reset();
        // Reset checkbox defaults (checked)
        document.querySelectorAll('input[name="assign-days"]').forEach(el => el.checked = true);
        document.getElementById('assign-modal').classList.remove('show');

        // Uncollapse the row to show the newly assigned user immediately
        collapsedProjects[chantierId] = false;
        collapsedUsers[userId] = false;

        renderPlanning();
        renderDashboard();
    });

    // Planning view period buttons (Semaine, Mois, Trimestre)
    const periodButtons = document.querySelectorAll('.view-mode-btn');
    periodButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            periodButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentPlanningPeriod = btn.dataset.mode;

            updatePlanningDates(currentPlanningDate);
            renderPlanning();
        });
    });

    // Planning next / previous period logic simulation
    document.getElementById('plan-prev-week').addEventListener('click', () => {
        if (currentPlanningPeriod === 'week') {
            currentPlanningDate.setDate(currentPlanningDate.getDate() - 7);
        } else if (currentPlanningPeriod === 'month') {
            currentPlanningDate.setMonth(currentPlanningDate.getMonth() - 1);
        } else if (currentPlanningPeriod === 'quarter') {
            currentPlanningDate.setMonth(currentPlanningDate.getMonth() - 3);
        }
        updatePlanningDates(currentPlanningDate);
        renderPlanning();
    });

    document.getElementById('plan-next-week').addEventListener('click', () => {
        if (currentPlanningPeriod === 'week') {
            currentPlanningDate.setDate(currentPlanningDate.getDate() + 7);
        } else if (currentPlanningPeriod === 'month') {
            currentPlanningDate.setMonth(currentPlanningDate.getMonth() + 1);
        } else if (currentPlanningPeriod === 'quarter') {
            currentPlanningDate.setMonth(currentPlanningDate.getMonth() + 3);
        }
        updatePlanningDates(currentPlanningDate);
        renderPlanning();
    });

    document.getElementById('plan-today').addEventListener('click', () => {
        currentPlanningDate = new Date();
        updatePlanningDates(currentPlanningDate);
        renderPlanning();
    });

    // Planning view switches (Chantiers vs. Utilisateurs)
    const btnToggleChantiers = document.getElementById('plan-toggle-chantiers');
    const btnToggleUsers = document.getElementById('plan-toggle-users');

    btnToggleChantiers.addEventListener('click', () => {
        currentPlanningView = 'chantiers';
        btnToggleChantiers.classList.add('active');
        btnToggleUsers.classList.remove('active');
        renderPlanning();
    });

    btnToggleUsers.addEventListener('click', () => {
        currentPlanningView = 'users';
        btnToggleUsers.classList.add('active');
        btnToggleChantiers.classList.remove('active');
        renderPlanning();
    });

    // Collapse / Expand all resources
}

// Search bar filters
function initSearch() {
    const searchUsersInput = document.getElementById('search-users');
    searchUsersInput.addEventListener('input', (e) => {
        renderUsers(e.target.value);
    });

    const searchChantiersInput = document.getElementById('search-chantiers');
    searchChantiersInput.addEventListener('input', (e) => {
        renderChantiers(e.target.value);
    });

    // Planning filters change listeners
    const planningChantierFilter = document.getElementById('planning-chantier-filter');
    if (planningChantierFilter) {
        planningChantierFilter.addEventListener('change', (e) => {
            planningChantierFilterVal = e.target.value;
            renderPlanning();
        });
    }

    const planningStatusFilter = document.getElementById('planning-status-filter');
    if (planningStatusFilter) {
        planningStatusFilter.addEventListener('change', (e) => {
            planningStatusFilterVal = e.target.value;
            renderPlanning();
        });
    }
}

// ==========================================
// Hours Spreadsheet Logic and Handlers
// ==========================================

function initHoursEvents() {
    const btnToggleChantiers = document.getElementById('hours-toggle-chantiers');
    const btnToggleUsers = document.getElementById('hours-toggle-users');
    const selectFilter = document.getElementById('hours-select-filter');
    const prevBtn = document.getElementById('hours-prev-week');
    const nextBtn = document.getElementById('hours-next-week');
    const prevLabel = document.getElementById('hours-prev-week-label');
    const nextLabel = document.getElementById('hours-next-week-label');
    const btnExport = document.getElementById('btn-export-hours');

    if (btnToggleChantiers && btnToggleUsers) {
        btnToggleChantiers.addEventListener('click', () => {
            currentHoursView = 'chantiers';
            btnToggleChantiers.classList.add('active');
            btnToggleUsers.classList.remove('active');
            hoursSelectFilterVal = 'all';
            renderHours();
        });

        btnToggleUsers.addEventListener('click', () => {
            currentHoursView = 'users';
            btnToggleUsers.classList.add('active');
            btnToggleChantiers.classList.remove('active');
            hoursSelectFilterVal = 'all';
            renderHours();
        });
    }

    if (selectFilter) {
        selectFilter.addEventListener('change', (e) => {
            hoursSelectFilterVal = e.target.value;
            renderHours();
        });
    }

    const statusFilter = document.getElementById('hours-status-filter');
    if (statusFilter) {
        statusFilter.addEventListener('change', (e) => {
            hoursStatusFilterVal = e.target.value;
            renderHours();
        });
    }

    const shiftWeek = (days) => {
        currentPlanningDate.setDate(currentPlanningDate.getDate() + days);
        updatePlanningDates(currentPlanningDate);
        renderPlanning();
        renderHours();
    };

    if (prevBtn) prevBtn.addEventListener('click', () => shiftWeek(-7));
    if (nextBtn) nextBtn.addEventListener('click', () => shiftWeek(7));
    if (prevLabel) prevLabel.addEventListener('click', () => shiftWeek(-7));
    if (nextLabel) nextLabel.addEventListener('click', () => shiftWeek(7));

    if (btnExport) {
        btnExport.addEventListener('click', () => {
            // Pre-fill dates with current week
            const today = new Date();
            const dayOfWeek = today.getDay();
            const distMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
            const mon = new Date(today);
            mon.setDate(today.getDate() + distMon);
            const sun = new Date(mon);
            sun.setDate(mon.getDate() + 6);
            document.getElementById('export-date-from').value = mon.toISOString().split('T')[0];
            document.getElementById('export-date-to').value = sun.toISOString().split('T')[0];
            document.getElementById('export-hours-modal').classList.add('show');
        });
    }

    // Export modal close / cancel
    const exportModal = document.getElementById('export-hours-modal');
    const btnCloseExport = document.getElementById('btn-close-export-modal');
    const btnCancelExport = document.getElementById('btn-cancel-export-modal');
    if (btnCloseExport) btnCloseExport.addEventListener('click', () => exportModal.classList.remove('show'));
    if (btnCancelExport) btnCancelExport.addEventListener('click', () => exportModal.classList.remove('show'));
    if (exportModal) exportModal.addEventListener('click', (e) => { if (e.target === exportModal) exportModal.classList.remove('show'); });

    // Date preset buttons
    document.querySelectorAll('.export-preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const preset = btn.dataset.preset;
            const now = new Date();
            let from, to;
            const dayOfWeek = now.getDay();
            const distMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

            if (preset === 'week') {
                from = new Date(now); from.setDate(now.getDate() + distMon);
                to = new Date(from); to.setDate(from.getDate() + 6);
            } else if (preset === 'lastweek') {
                from = new Date(now); from.setDate(now.getDate() + distMon - 7);
                to = new Date(from); to.setDate(from.getDate() + 6);
            } else if (preset === 'month') {
                from = new Date(now.getFullYear(), now.getMonth(), 1);
                to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            } else if (preset === 'lastmonth') {
                from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                to = new Date(now.getFullYear(), now.getMonth(), 0);
            }

            document.getElementById('export-date-from').value = from.toISOString().split('T')[0];
            document.getElementById('export-date-to').value = to.toISOString().split('T')[0];

            // Highlight active preset
            document.querySelectorAll('.export-preset-btn').forEach(b => {
                b.style.background = 'white';
                b.style.color = 'var(--text-primary)';
                b.style.borderColor = 'var(--border-color)';
            });
            btn.style.background = 'var(--primary)';
            btn.style.color = 'white';
            btn.style.borderColor = 'var(--primary)';
        });
    });

    // Radio button visual feedback
    document.querySelectorAll('input[name="export-view"]').forEach(radio => {
        radio.addEventListener('change', () => {
            document.querySelectorAll('input[name="export-view"]').forEach(r => {
                const label = r.closest('label');
                if (r.checked) {
                    label.style.borderColor = 'var(--primary)';
                    label.style.background = 'var(--primary-light)';
                    label.querySelector('span').style.color = 'var(--primary)';
                } else {
                    label.style.borderColor = 'var(--border-color)';
                    label.style.background = 'white';
                    label.querySelector('span').style.color = 'var(--gray-muted)';
                }
            });
        });
    });

    document.querySelectorAll('input[name="export-format"]').forEach(radio => {
        radio.addEventListener('change', () => {
            document.querySelectorAll('input[name="export-format"]').forEach(r => {
                const label = r.closest('label');
                const title = label.querySelector('div > div:first-child');
                if (r.checked) {
                    label.style.borderColor = 'var(--primary)';
                    label.style.background = 'var(--primary-light)';
                    if (title) title.style.color = 'var(--primary)';
                } else {
                    label.style.borderColor = 'var(--border-color)';
                    label.style.background = 'white';
                    if (title) title.style.color = 'var(--gray-muted)';
                }
            });
        });
    });

    // Download button
    const btnConfirmExport = document.getElementById('btn-confirm-export-hours');
    if (btnConfirmExport) {
        btnConfirmExport.addEventListener('click', () => {
            const fromVal = document.getElementById('export-date-from').value;
            const toVal = document.getElementById('export-date-to').value;
            if (!fromVal || !toVal) {
                alert('Veuillez sélectionner une plage de dates.');
                return;
            }

            const fromDate = new Date(fromVal);
            const toDate = new Date(toVal);
            toDate.setHours(23, 59, 59);

            if (fromDate > toDate) {
                alert('La date de début doit être avant la date de fin.');
                return;
            }

            const view = document.querySelector('input[name="export-view"]:checked').value;
            const format = document.querySelector('input[name="export-format"]:checked').value;

            // Build list of weekdays in range
            const rangeDays = [];
            const cur = new Date(fromDate);
            while (cur <= toDate) {
                const dow = cur.getDay();
                if (dow >= 1 && dow <= 5) { // Mon–Fri only
                    rangeDays.push({ date: new Date(cur), dayIndex: dow - 1 });
                }
                cur.setDate(cur.getDate() + 1);
            }

            const formatDate = (d) => d.toLocaleDateString('fr-FR');
            let rows = [];
            const dateHeader = `Du ${formatDate(fromDate)} au ${formatDate(toDate)}`;

            if (view === 'chantiers') {
                chantiers.forEach(ch => {
                    const pAllocs = hoursAllocations[ch.id] || {};
                    Object.keys(pAllocs).forEach(uId => {
                        const user = users.find(u => u.id === uId);
                        if (!user) return;
                        rangeDays.forEach(({ date, dayIndex }) => {
                            const val = pAllocs[uId][dayIndex] || '00:00';
                            if (val && val !== '00:00' && val !== 'À compléter') {
                                rows.push({
                                    Chantier: ch.name,
                                    Client: ch.client,
                                    Prénom: user.firstname,
                                    Nom: user.lastname,
                                    Rôle: user.role,
                                    Date: formatDate(date),
                                    Heures: val,
                                    'Heures (décimal)': timeStringToDecimal(val).toFixed(2)
                                });
                            }
                        });
                    });
                });
            } else {
                users.forEach(u => {
                    chantiers.forEach(ch => {
                        const pAllocs = hoursAllocations[ch.id] || {};
                        if (!pAllocs[u.id]) return;
                        rangeDays.forEach(({ date, dayIndex }) => {
                            const val = pAllocs[u.id][dayIndex] || '00:00';
                            if (val && val !== '00:00' && val !== 'À compléter') {
                                rows.push({
                                    Prénom: u.firstname,
                                    Nom: u.lastname,
                                    Rôle: u.role,
                                    Chantier: ch.name,
                                    Client: ch.client,
                                    Date: formatDate(date),
                                    Heures: val,
                                    'Heures (décimal)': timeStringToDecimal(val).toFixed(2)
                                });
                            }
                        });
                    });
                });
            }

            if (rows.length === 0) {
                alert(`Aucune heure trouvée pour la période : ${dateHeader}.\n\nVérifiez que des heures ont bien été saisies pour cette plage de dates.`);
                return;
            }

            let content, mimeType, filename;

            if (format === 'csv') {
                const headers = Object.keys(rows[0]);
                const csvRows = [
                    `Feuilles d'heures - ${dateHeader}`,
                    '',
                    headers.join(';'),
                    ...rows.map(r => headers.map(h => `"${(r[h] || '').toString().replace(/"/g, '""')}"`).join(';'))
                ];
                content = '\uFEFF' + csvRows.join('\r\n'); // BOM for Excel
                mimeType = 'text/csv;charset=utf-8;';
                filename = `heures_${fromVal}_${toVal}.csv`;
            } else {
                content = JSON.stringify({ periode: dateHeader, vue: view, donnees: rows }, null, 2);
                mimeType = 'application/json';
                filename = `heures_${fromVal}_${toVal}.json`;
            }

            // Trigger download
            const blob = new Blob([content], { type: mimeType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            exportModal.classList.remove('show');
        });
    }
}

function timeStringToDecimal(timeStr) {
    if (!timeStr || timeStr === '00:00' || timeStr === 'À compléter') return 0;
    const parts = timeStr.trim().split(':');
    const hours = parseInt(parts[0], 10) || 0;
    const minutes = parseInt(parts[1], 10) || 0;
    return hours + (minutes / 60);
}

function decimalToTimeString(decimal) {
    if (isNaN(decimal) || decimal <= 0) return '00:00';
    const hours = Math.floor(decimal);
    const minutes = Math.round((decimal - hours) * 60);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function sanitizeHourInput(val) {
    val = val.trim().replace('h', ':').replace('H', ':');
    if (val.toLowerCase() === 'à compléter' || val.toLowerCase() === 'a completer' || val === '') return 'À compléter';
    if (!val || val === '0' || val === '00') return '00:00';
    if (val.includes(':')) {
        const parts = val.split(':');
        const h = parseInt(parts[0], 10) || 0;
        const m = parseInt(parts[1], 10) || 0;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }
    const decimal = parseFloat(val);
    if (!isNaN(decimal)) {
        return decimalToTimeString(decimal);
    }
    return '00:00';
}

function renderHours() {
    const tbody = document.getElementById('hours-table-tbody');
    const thead = document.getElementById('hours-table-thead');
    if (!tbody || !thead) return;

    tbody.innerHTML = '';
    thead.innerHTML = '';

    // Calculate Monday to Friday dates of active week
    const currentDay = currentPlanningDate.getDay();
    const distanceToMon = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(currentPlanningDate);
    monday.setDate(currentPlanningDate.getDate() + distanceToMon);

    const weekDays = [];
    for (let i = 0; i < 5; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        weekDays.push(d);
    }

    // Update active week nav labels
    const formatWeekNavRange = (baseDate) => {
        const cDay = baseDate.getDay();
        const dist = cDay === 0 ? -6 : 1 - cDay;
        const mon = new Date(baseDate);
        mon.setDate(baseDate.getDate() + dist);
        const sun = new Date(mon);
        sun.setDate(mon.getDate() + 6);

        const monOpt = { day: 'numeric' };
        const sunOpt = { day: 'numeric', month: 'short' };

        if (mon.getMonth() !== sun.getMonth()) {
            monOpt.month = 'short';
        }
        return `${mon.toLocaleDateString('fr-FR', monOpt)} - ${sun.toLocaleDateString('fr-FR', sunOpt)}`;
    };

    document.getElementById('hours-active-week-label').textContent = formatWeekNavRange(currentPlanningDate) + ' ' + currentPlanningDate.getFullYear();
    document.getElementById('hours-active-week-sub').textContent = `Semaine ${getWeekNumber(currentPlanningDate)}`;

    const prevWeek = new Date(currentPlanningDate);
    prevWeek.setDate(currentPlanningDate.getDate() - 7);
    document.getElementById('hours-prev-week-label').innerHTML = `
        <div style="font-weight: 500;">${formatWeekNavRange(prevWeek)}</div>
        <div style="font-size: 11px;">Semaine ${getWeekNumber(prevWeek)}</div>
    `;

    const nextWeek = new Date(currentPlanningDate);
    nextWeek.setDate(currentPlanningDate.getDate() + 7);
    document.getElementById('hours-next-week-label').innerHTML = `
        <div style="font-weight: 500;">${formatWeekNavRange(nextWeek)}</div>
        <div style="font-size: 11px;">Semaine ${getWeekNumber(nextWeek)}</div>
    `;

    // Re-populate dropdown select options
    const selectFilter = document.getElementById('hours-select-filter');
    if (selectFilter) {
        let optionsHtml = '';
        if (currentHoursView === 'chantiers') {
            optionsHtml += '<option value="all">Tous les chantiers</option>';
            chantiers.forEach(ch => {
                optionsHtml += `<option value="${ch.id}" ${hoursSelectFilterVal === ch.id ? 'selected' : ''}>${ch.name}</option>`;
            });
        } else {
            optionsHtml += '<option value="all">Tous les utilisateurs</option>';
            users.forEach(u => {
                optionsHtml += `<option value="${u.id}" ${hoursSelectFilterVal === u.id ? 'selected' : ''}>${u.firstname} ${u.lastname}</option>`;
            });
        }
        selectFilter.innerHTML = optionsHtml;
    }

    // Re-populate state filter dropdown select options
    const statusSelectFilter = document.getElementById('hours-status-filter');
    if (statusSelectFilter) {
        let optionsHtml = '';
        if (currentHoursView === 'chantiers') {
            optionsHtml = `
                <option value="all" ${hoursStatusFilterVal === 'all' ? 'selected' : ''}>Tous les chantiers (État)</option>
                <option value="not_fully" ${hoursStatusFilterVal === 'not_fully' ? 'selected' : ''}>Chantiers pas complètement planifiés</option>
                <option value="fully" ${hoursStatusFilterVal === 'fully' ? 'selected' : ''}>Complètement planifiés</option>
                <option value="planned" ${hoursStatusFilterVal === 'planned' ? 'selected' : ''}>Planifiés</option>
                <option value="unplanned" ${hoursStatusFilterVal === 'unplanned' ? 'selected' : ''}>Non planifiés</option>
            `;
        } else {
            optionsHtml = `
                <option value="all" ${hoursStatusFilterVal === 'all' ? 'selected' : ''}>Tous les utilisateurs (État)</option>
                <option value="not_fully" ${hoursStatusFilterVal === 'not_fully' ? 'selected' : ''}>Utilisateurs pas complètement planifiés</option>
                <option value="fully" ${hoursStatusFilterVal === 'fully' ? 'selected' : ''}>Complètement planifiés</option>
                <option value="planned" ${hoursStatusFilterVal === 'planned' ? 'selected' : ''}>Planifiés</option>
                <option value="unplanned" ${hoursStatusFilterVal === 'unplanned' ? 'selected' : ''}>Non planifiés</option>
            `;
        }
        statusSelectFilter.innerHTML = optionsHtml;
    }

    // Build the THEAD
    const trHead = document.createElement('tr');

    // Column 1 with filter input
    const thFilter = document.createElement('th');
    thFilter.style.textAlign = 'left';
    thFilter.style.padding = '8px 12px';
    const placeholderText = currentHoursView === 'chantiers' ? 'Rechercher un chantier...' : 'Rechercher un utilisateur...';
    thFilter.innerHTML = `<input type="text" class="hours-filter-input" id="hours-search-filter" placeholder="${placeholderText}" value="${hoursFilterQuery}">`;
    trHead.appendChild(thFilter);

    // Columns Lundi to Vendredi
    weekDays.forEach(day => {
        const th = document.createElement('th');
        const dayName = day.toLocaleDateString('fr-FR', { weekday: 'long' });
        const formattedDate = `${day.getDate()}/${day.getMonth() + 1}/${day.getFullYear()}`;
        th.innerHTML = `
            <div style="text-transform: capitalize;">${dayName}</div>
            <div style="font-size: 10px; font-weight: normal; margin-top: 2px; opacity: 0.85;">${formattedDate}</div>
        `;
        trHead.appendChild(th);
    });

    // Totals columns
    const thTotal = document.createElement('th');
    thTotal.textContent = 'Total';
    trHead.appendChild(thTotal);

    const thGroupedTotal = document.createElement('th');
    thGroupedTotal.textContent = 'Total Groupé';
    trHead.appendChild(thGroupedTotal);

    thead.appendChild(trHead);

    // Attach search filter listener
    const searchFilterInput = thFilter.querySelector('#hours-search-filter');
    searchFilterInput.addEventListener('input', (e) => {
        hoursFilterQuery = e.target.value;
        renderHoursRows();
    });

    renderHoursRows();
}

function renderHoursRows() {
    const tbody = document.getElementById('hours-table-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const query = hoursFilterQuery.toLowerCase().trim();
    let dailyTotals = [0, 0, 0, 0, 0];
    let grandTotal = 0;

    if (currentHoursView === 'chantiers') {
        chantiers.forEach(ch => {
            if (hoursSelectFilterVal !== 'all' && hoursSelectFilterVal !== ch.id) return;
            if (query && !ch.name.toLowerCase().includes(query) && !ch.client.toLowerCase().includes(query)) return;

            // State Filter
            if (hoursStatusFilterVal !== 'all') {
                const hasCompanions = Object.keys(planningAllocations[ch.id] || {}).length > 0;
                const isFullyPlanned = ch.workedHours >= ch.budgetHours;

                if (hoursStatusFilterVal === 'not_fully' && isFullyPlanned) return;
                if (hoursStatusFilterVal === 'fully' && !isFullyPlanned) return;
                if (hoursStatusFilterVal === 'planned' && !hasCompanions) return;
                if (hoursStatusFilterVal === 'unplanned' && hasCompanions) return;
            }

            const pAllocs = hoursAllocations[ch.id] || {};
            let assignedUserIds = Object.keys(pAllocs);
            if (isOuvrier) {
                const hasDelegation = hasEditPermissionForChantier(ch.id);
                if (!hasDelegation) {
                    assignedUserIds = assignedUserIds.filter(uId => uId === currentUserProfile.id);
                }
            }
            if (assignedUserIds.length === 0) return;

            let projectGroupTotal = 0;
            assignedUserIds.forEach(uId => {
                for (let d = 0; d < 5; d++) {
                    projectGroupTotal += timeStringToDecimal(pAllocs[uId][d]);
                }
            });

            // Project Row Header
            const trProj = document.createElement('tr');
            trProj.className = 'project-row';
            trProj.innerHTML = `
                <td class="col-project-info" style="font-weight: 700;">
                    <div style="display: flex; align-items: center; gap: 10px; padding-left: 4px;">
                        ${getChantierAvatar(ch, 28)}
                        <span>${ch.name}</span>
                    </div>
                </td>
                <td colspan="5" style="background-color: #f9fafb;"></td>
                <td style="background-color: #f9fafb;"></td>
                <td class="hour-parent-total" style="background-color: #f9fafb; font-weight: 700;">
                    ${decimalToTimeString(projectGroupTotal)}
                </td>
            `;
            tbody.appendChild(trProj);

            // Sub-rows for companions
            assignedUserIds.forEach(uId => {
                const user = users.find(u => u.id === uId);
                if (!user) return;

                const userInitials = `${user.firstname.charAt(0)}${user.lastname.charAt(0)}`.toUpperCase();
                const trUser = document.createElement('tr');
                trUser.className = 'companion-row';

                let leftCell = `
                    <td class="col-project-info tree-connector-cell">
                        <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                ${getUserAvatar(user, 36)}
                                <div class="user-info">
                                    <span class="companion-name">${user.firstname} ${user.lastname}</span>
                                    <span class="companion-role">${user.role}</span>
                                </div>
                            </div>
                        </div>
                    </td>
                `;

                let daysHtml = '';
                let userRowTotal = 0;
                for (let d = 0; d < 5; d++) {
                    const val = pAllocs[uId][d] || '00:00';
                    const decVal = timeStringToDecimal(val);
                    userRowTotal += decVal;
                    dailyTotals[d] += decVal;

                    const isToComplete = val === 'À compléter';
                    const inputHtml = hasEditPermissionForChantier(ch.id) ? `
                        <input type="text" class="hour-cell-input ${isToComplete ? 'input-to-complete' : ''}" value="${val}" 
                               data-chantier-id="${ch.id}" data-user-id="${uId}" data-day="${d}">
                    ` : `
                        <span class="hour-cell-value ${isToComplete ? 'text-to-complete' : ''}">${val}</span>
                    `;
                    daysHtml += `<td>${inputHtml}</td>`;
                }

                grandTotal += userRowTotal;

                trUser.innerHTML = leftCell + daysHtml + `
                    <td class="hour-total-cell">${decimalToTimeString(userRowTotal)}</td>
                    <td></td>
                `;
                tbody.appendChild(trUser);
            });
        });

    } else {
        // Mode 2: Utilisateurs
        const filteredHoursUsers = users.filter(u => {
            if (isOuvrier) {
                const delegatedChantierIds = delegations
                    .filter(d => d.worker_id === currentUserProfile.id && new Date().toISOString().split('T')[0] >= d.start_date && new Date().toISOString().split('T')[0] <= d.end_date)
                    .map(d => d.chantier_id);
                const isAssignedToDelegated = delegatedChantierIds.some(chId => {
                    return hoursAllocations[chId]?.[u.id] !== undefined;
                });
                if (u.id !== currentUserProfile.id && !isAssignedToDelegated) return false;
            }
            if (hoursSelectFilterVal !== 'all' && hoursSelectFilterVal !== u.id) return false;
            const fullName = `${u.firstname} ${u.lastname}`;
            if (query && !fullName.toLowerCase().includes(query) && !u.role.toLowerCase().includes(query)) return false;

            if (hoursStatusFilterVal !== 'all') {
                const assignedDays = new Set();
                chantiers.forEach(ch => {
                    const projectAllocations = planningAllocations[ch.id] || {};
                    const alloc = projectAllocations[u.id];
                    if (alloc && alloc.days) {
                        alloc.days.forEach(d => assignedDays.add(d));
                    }
                });

                const totalDays = assignedDays.size;
                const isFullyPlanned = totalDays >= 5;
                const hasAssignments = totalDays > 0;

                if (hoursStatusFilterVal === 'not_fully' && isFullyPlanned) return false;
                if (hoursStatusFilterVal === 'fully' && !isFullyPlanned) return false;
                if (hoursStatusFilterVal === 'planned' && !hasAssignments) return false;
                if (hoursStatusFilterVal === 'unplanned' && hasAssignments) return false;
            }
            return true;
        });

        filteredHoursUsers.forEach(u => {
            const fullName = `${u.firstname} ${u.lastname}`;
            const userProjects = [];
            chantiers.forEach(ch => {
                if (hoursAllocations[ch.id] && hoursAllocations[ch.id][u.id]) {
                    userProjects.push({
                        chantier: ch,
                        daysHours: hoursAllocations[ch.id][u.id]
                    });
                }
            });

            let userGroupedTotal = 0;
            userProjects.forEach(up => {
                for (let d = 0; d < 5; d++) {
                    userGroupedTotal += timeStringToDecimal(up.daysHours[d]);
                }
            });

            const userInitials = `${u.firstname.charAt(0)}${u.lastname.charAt(0)}`.toUpperCase();

            // Parent User Row
            const trUserParent = document.createElement('tr');
            trUserParent.className = 'project-row';
            trUserParent.innerHTML = `
                <td class="col-project-info" style="font-weight: 700;">
                    <div style="display: flex; align-items: center; gap: 10px; padding-left: 4px;">
                        ${getUserAvatar(u, 28)}
                        <span>${fullName}</span>
                    </div>
                </td>
                <td colspan="5" style="background-color: #f9fafb;"></td>
                <td style="background-color: #f9fafb;"></td>
                <td class="hour-parent-total" style="background-color: #f9fafb; font-weight: 700;">
                    ${decimalToTimeString(userGroupedTotal)}
                </td>
            `;
            tbody.appendChild(trUserParent);

            // Sub-rows of projects
            userProjects.forEach(up => {
                const ch = up.chantier;
                const trProjSub = document.createElement('tr');
                trProjSub.className = 'companion-row';

                let leftCell = `
                    <td class="col-project-info tree-connector-cell">
                        <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                ${getChantierAvatar(ch, 36)}
                                <div class="user-info">
                                    <span class="companion-name">${ch.name}</span>
                                    <span class="companion-role">Chantier</span>
                                </div>
                            </div>
                        </div>
                    </td>
                `;

                let daysHtml = '';
                let projectRowTotal = 0;
                for (let d = 0; d < 5; d++) {
                    const val = up.daysHours[d] || '00:00';
                    const decVal = timeStringToDecimal(val);
                    projectRowTotal += decVal;
                    dailyTotals[d] += decVal;

                    const isToComplete = val === 'À compléter';
                    const inputHtml = hasEditPermissionForChantier(ch.id) ? `
                        <input type="text" class="hour-cell-input ${isToComplete ? 'input-to-complete' : ''}" value="${val}" 
                               data-chantier-id="${ch.id}" data-user-id="${u.id}" data-day="${d}">
                    ` : `
                        <span class="hour-cell-value ${isToComplete ? 'text-to-complete' : ''}">${val}</span>
                    `;
                    daysHtml += `<td>${inputHtml}</td>`;
                }

                grandTotal += projectRowTotal;

                trProjSub.innerHTML = leftCell + daysHtml + `
                    <td class="hour-total-cell">${decimalToTimeString(projectRowTotal)}</td>
                    <td></td>
                `;
                tbody.appendChild(trProjSub);
            });
        });
    }

    // Render Bottom Totals Row
    const trTotals = document.createElement('tr');
    trTotals.className = 'total-row';

    let daysTotalsHtml = '';
    for (let d = 0; d < 5; d++) {
        daysTotalsHtml += `<td>${decimalToTimeString(dailyTotals[d])}</td>`;
    }

    trTotals.innerHTML = `
        <td class="col-project-info" style="font-weight: 800; padding-left: 16px;">Total général</td>
        ${daysTotalsHtml}
        <td class="hour-total-cell">${decimalToTimeString(grandTotal)}</td>
        <td class="hour-parent-total">${decimalToTimeString(grandTotal)}</td>
    `;
    tbody.appendChild(trTotals);

    // Bind event listeners to input fields
    const inputs = tbody.querySelectorAll('.hour-cell-input');
    inputs.forEach(input => {
        input.addEventListener('change', async (e) => {
            const chId = input.dataset.chantierId;
            const uId = input.dataset.userId;
            const day = parseInt(input.dataset.day, 10);
            const rawVal = e.target.value;
            const sanitized = sanitizeHourInput(rawVal);

            if (useSupabase) {
                await supabaseClient.from('hours_allocations').upsert([{
                    chantier_id: chId,
                    user_id: uId,
                    day_index: day,
                    hours_value: sanitized
                }]);

                if (!hoursAllocations[chId]) hoursAllocations[chId] = {};
                if (!hoursAllocations[chId][uId]) hoursAllocations[chId][uId] = {};
                hoursAllocations[chId][uId][day] = sanitized;

                let totalProjHours = 0;
                Object.keys(hoursAllocations[chId]).forEach(workerId => {
                    for (let wd = 0; wd < 5; wd++) {
                        totalProjHours += timeStringToDecimal(hoursAllocations[chId][workerId][wd]);
                    }
                });
                const finalHours = totalProjHours + (chId === 'c1' ? 70 : chId === 'c2' ? 80 : 0);
                await supabaseClient.from('chantiers').update({ worked_hours: finalHours }).eq('id', chId);
                await loadDataFromSupabase();
            } else {
                if (!hoursAllocations[chId]) hoursAllocations[chId] = {};
                if (!hoursAllocations[chId][uId]) hoursAllocations[chId][uId] = {};
                hoursAllocations[chId][uId][day] = sanitized;

                const chantier = chantiers.find(c => c.id === chId);
                if (chantier) {
                    let totalProjHours = 0;
                    Object.keys(hoursAllocations[chId]).forEach(workerId => {
                        for (let wd = 0; wd < 5; wd++) {
                            totalProjHours += timeStringToDecimal(hoursAllocations[chId][workerId][wd]);
                        }
                    });
                    chantier.workedHours = totalProjHours + (chId === 'c1' ? 70 : chId === 'c2' ? 80 : 0);
                    renderDashboard();
                }
            }

            renderHoursRows();
        });

        input.addEventListener('focus', (e) => {
            e.target.select();
        });
    });

    // Render Mobile Hours List View
    const mobileHoursListView = document.getElementById('mobile-hours-list-view');
    if (mobileHoursListView) {
        let mobileHtml = '';

        // Calculate Monday to Friday dates of active week
        const currentDay = currentPlanningDate.getDay();
        const distanceToMon = currentDay === 0 ? -6 : 1 - currentDay;
        const monday = new Date(currentPlanningDate);
        monday.setDate(currentPlanningDate.getDate() + distanceToMon);

        const daysOfWeek = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi'];

        daysOfWeek.forEach((dayName, dIdx) => {
            const currentDayDate = new Date(monday);
            currentDayDate.setDate(monday.getDate() + dIdx);
            const dayNumStr = String(currentDayDate.getDate()).padStart(2, '0');
            const dayLabel = `${dayName} ${dayNumStr}`;

            mobileHtml += `<div class="mobile-planning-day-header">${dayLabel}</div>`;

            let dayAllocs = [];

            if (currentHoursView === 'chantiers') {
                chantiers.forEach(ch => {
                    if (hoursSelectFilterVal !== 'all' && hoursSelectFilterVal !== ch.id) return;
                    
                    const pAllocs = hoursAllocations[ch.id] || {};
                    let assignedUserIds = Object.keys(pAllocs);
                    if (isOuvrier) {
                        assignedUserIds = assignedUserIds.filter(uId => uId === currentUserProfile.id);
                    }

                    let companionsOnDay = [];
                    assignedUserIds.forEach(uId => {
                        const user = users.find(u => u.id === uId);
                        if (user) {
                            const val = pAllocs[uId][dIdx] || '00:00';
                            companionsOnDay.push({
                                user: user,
                                value: val
                            });
                        }
                    });

                    if (companionsOnDay.length > 0) {
                        const isCollapsed = collapsedProjects[ch.id] || false;
                        dayAllocs.push({
                            id: ch.id,
                            title: ch.name,
                            companionsCount: companionsOnDay.length,
                            companions: companionsOnDay,
                            isCollapsed: isCollapsed,
                            color: ch.color || '#3b82f6',
                            initials: ch.name.split(' ').map(w => w.charAt(0)).join('').substring(0, 2).toUpperCase()
                        });
                    }
                });
            } else {
                // Users view
                const filteredHoursUsers = users.filter(u => {
                    if (isOuvrier && u.id !== currentUserProfile.id) return false;
                    if (hoursSelectFilterVal !== 'all' && hoursSelectFilterVal !== u.id) return false;
                    return true;
                });

                filteredHoursUsers.forEach(u => {
                    let userAllocsOnDay = [];
                    chantiers.forEach(ch => {
                        const pAllocs = hoursAllocations[ch.id] || {};
                        if (pAllocs[u.id]) {
                            const val = pAllocs[u.id][dIdx] || '00:00';
                            userAllocsOnDay.push({
                                chantier: ch,
                                value: val
                            });
                        }
                    });

                    if (userAllocsOnDay.length > 0) {
                        dayAllocs.push({
                            id: u.id,
                            title: `${u.firstname} ${u.lastname}`,
                            subtitle: u.role,
                            projects: userAllocsOnDay,
                            isCollapsed: collapsedUsers[u.id] || false,
                            initials: `${u.firstname.charAt(0)}${u.lastname.charAt(0)}`.toUpperCase()
                        });
                    }
                });
            }

            if (dayAllocs.length === 0) {
                mobileHtml += `
                    <div class="mobile-planning-card" style="justify-content: center; color: #94a3b8; font-style: italic; font-size: 12px; background: white;">
                        Aucune heure saisie
                    </div>
                `;
            } else {
                dayAllocs.forEach(alloc => {
                    if (currentHoursView === 'chantiers') {
                        // Collapsible Chantier Row
                        const arrowSvg = `
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3" style="transform: ${alloc.isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)'}; transition: transform 0.2s; margin-left: 6px; display: inline-block; vertical-align: middle;">
                                <polyline points="6 9 12 15 18 9"/>
                            </svg>
                        `;

                        mobileHtml += `
                            <div class="mobile-planning-card hours-project-toggle-card" data-project-id="${alloc.id}" style="background: white; cursor: pointer;">
                                <div class="mobile-planning-card-left">
                                    <div class="initials-bubble" style="background-color: ${alloc.color}; width: 32px; height: 32px; font-size: 11px; line-height: 32px; margin: 0; color: white;">
                                        ${alloc.initials}
                                    </div>
                                    <div style="display: flex; flex-direction: column;">
                                        <span class="mobile-planning-card-title">${alloc.title}</span>
                                        <span style="font-size: 11px; color: var(--accent); font-weight: 700; margin-top: 2px; display: flex; align-items: center; gap: 4px;">
                                            Voir les heures ${arrowSvg}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        `;

                        if (!alloc.isCollapsed) {
                            alloc.companions.forEach(comp => {
                                const initialsComp = `${comp.user.firstname.charAt(0)}${comp.user.lastname.charAt(0)}`.toUpperCase();
                                const isToComplete = comp.value === 'À compléter';
                                const hasHours = comp.value !== '00:00' && !isToComplete;

                                const inputHtml = hasEditPermissionForChantier(alloc.id) ? `
                                    <input type="text" class="hour-cell-input ${isToComplete ? 'input-to-complete' : ''}" value="${comp.value}" 
                                           data-chantier-id="${alloc.id}" data-user-id="${comp.user.id}" data-day="${dIdx}"
                                           style="width: 70px; text-align: center; font-weight: 700; border: 1px solid #cbd5e1; border-radius: 4px; padding: 4px;">
                                ` : `
                                    <span style="font-weight: 800; color: ${hasHours ? '#16a34a' : '#64748b'};">${comp.value}</span>
                                `;

                                mobileHtml += `
                                    <div class="mobile-planning-card" style="background: #f8fafc; padding-left: 36px; border-left: 4px solid var(--accent);">
                                        <div class="mobile-planning-card-left">
                                            <div class="initials-bubble bubble-violet" style="width: 28px; height: 28px; font-size: 10px; line-height: 28px; margin: 0;">
                                                ${initialsComp}
                                            </div>
                                            <div style="display: flex; flex-direction: column;">
                                                <span style="font-size: 13px; font-weight: 700; color: #334155;">${comp.user.firstname} ${comp.user.lastname}</span>
                                                <span style="font-size: 11px; color: #64748b;">${comp.user.role}</span>
                                            </div>
                                        </div>
                                        ${inputHtml}
                                    </div>
                                `;
                            });
                        }
                    } else {
                        // Users Mode
                        const arrowSvg = `
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3" style="transform: ${alloc.isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)'}; transition: transform 0.2s; margin-left: 6px; display: inline-block; vertical-align: middle;">
                                <polyline points="6 9 12 15 18 9"/>
                            </svg>
                        `;

                        mobileHtml += `
                            <div class="mobile-planning-card hours-user-toggle-card" data-user-id="${alloc.id}" style="background: white; cursor: pointer;">
                                <div class="mobile-planning-card-left">
                                    <div class="initials-bubble bubble-violet" style="width: 32px; height: 32px; font-size: 11px; line-height: 32px; margin: 0;">
                                        ${alloc.initials}
                                    </div>
                                    <div style="display: flex; flex-direction: column;">
                                        <span class="mobile-planning-card-title">${alloc.title}</span>
                                        <span style="font-size: 11px; color: var(--accent); font-weight: 700; margin-top: 2px; display: flex; align-items: center; gap: 4px;">
                                            Voir les heures ${arrowSvg}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        `;

                        if (!alloc.isCollapsed) {
                            alloc.projects.forEach(p => {
                                const initialsCh = p.chantier.name.split(' ').map(w => w.charAt(0)).join('').substring(0, 2).toUpperCase();
                                const isToComplete = p.value === 'À compléter';
                                const hasHours = p.value !== '00:00' && !isToComplete;

                                const inputHtml = hasEditPermissionForChantier(p.chantier.id) ? `
                                    <input type="text" class="hour-cell-input ${isToComplete ? 'input-to-complete' : ''}" value="${p.value}" 
                                           data-chantier-id="${p.chantier.id}" data-user-id="${alloc.id}" data-day="${dIdx}"
                                           style="width: 70px; text-align: center; font-weight: 700; border: 1px solid #cbd5e1; border-radius: 4px; padding: 4px;">
                                ` : `
                                    <span style="font-weight: 800; color: ${hasHours ? '#16a34a' : '#64748b'};">${p.value}</span>
                                `;

                                mobileHtml += `
                                    <div class="mobile-planning-card" style="background: #f8fafc; padding-left: 36px; border-left: 4px solid var(--accent);">
                                        <div class="mobile-planning-card-left">
                                            <div class="initials-bubble" style="background-color: ${p.chantier.color || '#3b82f6'}; width: 28px; height: 28px; font-size: 9px; line-height: 28px; margin: 0; color: white;">
                                                ${initialsCh}
                                            </div>
                                            <div style="display: flex; flex-direction: column;">
                                                <span style="font-size: 13px; font-weight: 700; color: #334155;">${p.chantier.name}</span>
                                                <span style="font-size: 11px; color: #64748b;">Chantier</span>
                                            </div>
                                        </div>
                                        ${inputHtml}
                                    </div>
                                `;
                            });
                        }
                    }
                });
            }
        });

        mobileHoursListView.innerHTML = mobileHtml;

        // Bind collapsible actions for mobile hours list
        mobileHoursListView.querySelectorAll('.hours-project-toggle-card').forEach(card => {
            card.addEventListener('click', () => {
                const projectId = card.getAttribute('data-project-id');
                collapsedProjects[projectId] = !collapsedProjects[projectId];
                renderHoursRows();
            });
        });

        mobileHoursListView.querySelectorAll('.hours-user-toggle-card').forEach(card => {
            card.addEventListener('click', () => {
                const userId = card.getAttribute('data-user-id');
                collapsedUsers[userId] = !collapsedUsers[userId];
                renderHoursRows();
            });
        });

        // Bind event listeners to input fields inside mobile view
        const mobileInputs = mobileHoursListView.querySelectorAll('.hour-cell-input');
        mobileInputs.forEach(input => {
            input.addEventListener('change', async (e) => {
                const chId = input.dataset.chantierId;
                const uId = input.dataset.userId;
                const day = parseInt(input.dataset.day, 10);
                const rawVal = e.target.value;
                const sanitized = sanitizeHourInput(rawVal);

                if (useSupabase) {
                    await supabaseClient.from('hours_allocations').upsert([{
                        chantier_id: chId,
                        user_id: uId,
                        day_index: day,
                        hours_value: sanitized
                    }]);

                    if (!hoursAllocations[chId]) hoursAllocations[chId] = {};
                    if (!hoursAllocations[chId][uId]) hoursAllocations[chId][uId] = {};
                    hoursAllocations[chId][uId][day] = sanitized;

                    let totalProjHours = 0;
                    Object.keys(hoursAllocations[chId]).forEach(workerId => {
                        for (let wd = 0; wd < 5; wd++) {
                            totalProjHours += timeStringToDecimal(hoursAllocations[chId][workerId][wd]);
                        }
                    });
                    const finalHours = totalProjHours + (chId === 'c1' ? 70 : chId === 'c2' ? 80 : 0);
                    await supabaseClient.from('chantiers').update({ worked_hours: finalHours }).eq('id', chId);
                    await loadDataFromSupabase();
                } else {
                    if (!hoursAllocations[chId]) hoursAllocations[chId] = {};
                    if (!hoursAllocations[chId][uId]) hoursAllocations[chId][uId] = {};
                    hoursAllocations[chId][uId][day] = sanitized;

                    const chantier = chantiers.find(c => c.id === chId);
                    if (chantier) {
                        let totalProjHours = 0;
                        Object.keys(hoursAllocations[chId]).forEach(workerId => {
                            for (let wd = 0; wd < 5; wd++) {
                                totalProjHours += timeStringToDecimal(hoursAllocations[chId][workerId][wd]);
                            }
                        });
                        chantier.workedHours = totalProjHours + (chId === 'c1' ? 70 : chId === 'c2' ? 80 : 0);
                        renderDashboard();
                    }
                }

                renderHoursRows();
            });

            input.addEventListener('focus', (e) => {
                e.target.select();
            });
        });
    }
}

// ==========================================
// CHANTIER DETAIL VIEW SUB-PAGES ENGINE
// ==========================================

function openChantierDetail(chantierId) {
    activeChantierId = chantierId;
    localStorage.setItem('activeChantierId', chantierId);
    activeChantierSubTab = 'resume';
    switchTab('chantier-detail');
    renderChantierDetail();
}

function switchChantierSubTab(subTab) {
    activeChantierSubTab = subTab;
    renderChantierDetail();
}

function renderChantierDetail() {
    const ch = chantiers.find(c => c.id === activeChantierId);
    if (!ch) return;

    // 1. Render Header
    const initials = ch.name.split(' ').map(w => w.charAt(0)).join('').substring(0, 2).toUpperCase();
    const headerEl = document.getElementById('chantier-detail-header');
    headerEl.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px;">
            <div style="display: flex; align-items: center; gap: 14px;">
                ${getChantierAvatar(ch, 44, 'font-weight:700;background:linear-gradient(135deg, #e11d48, #be123c);')}
                <div>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <h2 style="font-family: var(--font-heading); font-size: 22px; font-weight: 700; color: var(--text-primary); margin: 0;">${ch.name}</h2>
                        <span class="status-pill status-active" style="background-color: #d1fae5; color: #065f46; font-weight: 600; font-size: 11px; padding: 2px 8px; border-radius: 9999px;">${ch.status}</span>
                    </div>
                    ${ch.entreprise || (isAdmin || isChef) ? `<div style="font-size: 13px; color: var(--gray-muted); margin-top: 4px;">Entreprise : <strong>${ch.entreprise || 'Non spécifiée'}</strong></div>` : ''}
                </div>
            </div>
            <div style="display: flex; align-items: center; gap: 12px;">
                <button class="btn btn-secondary" onclick="exportChantierPDF('${ch.id}')" style="font-size: 13px; display: flex; align-items: center; gap: 6px;">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Exporter le rapport PDF
                </button>
                ${(isAdmin || isChef) ? `
                <button class="btn btn-primary" onclick="openEditChantierModal('${ch.id}')" style="font-size: 13px; display: flex; align-items: center; gap: 6px; background-color: var(--accent);">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Modifier
                </button>
                ` : ''}
            </div>
        </div>
    `;

    // Update active sub-tab styling
    document.querySelectorAll('.subtab-btn').forEach(btn => btn.classList.remove('active'));
    const actBtn = document.getElementById(`subtab-btn-${activeChantierSubTab}`);
    if (actBtn) actBtn.classList.add('active');

    // 2. Render Sub-tab Content
    const contentEl = document.getElementById('chantier-detail-content');
    if (activeChantierSubTab === 'resume') {
        const pct = Math.min(100, Math.round((ch.workedHours / ch.budgetHours) * 100));

        // Feed posts HTML
        const posts = chantierFeeds[ch.id] || [];
        const postsHtml = posts.length === 0
            ? `<div class="empty-state" style="padding: 24px; text-align: center; color: var(--gray-muted); font-style: italic;">Aucun message publié</div>`
            : posts.map(p => `
                <div class="feed-post-card">
                    <div class="feed-post-header">
                        <div class="feed-post-author-info">
                            <div class="feed-avatar" style="background-color: var(--accent); color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 11px;">${p.avatar}</div>
                            <div>
                                <div class="feed-post-author-name">${p.author}</div>
                                <div class="feed-post-time" style="color: var(--gray-muted); font-size: 11px;">${p.time}</div>
                            </div>
                        </div>
                    </div>
                    <div class="feed-post-content" style="font-size: 13.5px; line-height: 1.5; color: var(--text-primary); margin-top: 8px;">${p.content}</div>
                    <div class="feed-post-footer" style="margin-top: 12px; border-top: 1px solid var(--border-color); padding-top: 8px; font-size: 12px; color: var(--gray-muted);">
                        <div class="feed-post-action" style="cursor: pointer; display: flex; align-items: center; gap: 4px;">
                            💬 Commenter...
                        </div>
                    </div>
                </div>
            `).join('');

        contentEl.innerHTML = `
            <div class="chantier-detail-grid">
                <!-- Left Side: Info Cards -->
                <div>
                    <div class="detail-card">
                        <h3 class="detail-card-title">Informations</h3>
                        <ul class="info-list">
                            <li class="info-item">
                                <span class="info-icon"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1024 1024" width="20" height="20" fill="currentColor"><g><circle cx="512" cy="277.3" r="220.7"/><path d="M841.5,967.4h-659c-26.5,0-48-21.5-48-48V804.7c0-127.6,103.4-231,231-231h293c127.6,0,231,103.4,231,231v114.7C889.5,945.9,868,967.4,841.5,967.4z"/></g></svg></span>
                                <span>Client : <strong>${ch.client}</strong></span>
                            </li>
                            <li class="info-item">
                                <span class="info-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="20" height="20" fill="currentColor"><path d="M50,77.13l-1.79-2.35C47.34,73.64,27,46.67,27,27.93a23,23,0,0,1,46.08,0c0,18.74-20.38,45.71-21.25,46.85ZM50,9.5A18.51,18.51,0,0,0,31.46,27.93C31.46,42.07,45,62.57,50,69.59c5-7,18.54-27.52,18.54-41.66A18.51,18.51,0,0,0,50,9.5Z"/><path d="M50,40.37A12.44,12.44,0,1,1,62.44,27.93,12.45,12.45,0,0,1,50,40.37ZM50,20a7.94,7.94,0,1,0,7.94,7.94A8,8,0,0,0,50,20Z"/><path d="M50,95C28.19,95,5,89,5,77.77,5,71.44,12.83,66.06,26.48,63l.95-.21L41.2,74.15,38,75.35c-2.68,1-3.55,2.06-3.55,2.42C34.4,79,39.87,82,50,82s15.6-3,15.6-4.24c0-.36-.87-1.42-3.55-2.42l-3.25-1.2L72.57,62.77l1,.21C87.17,66.06,95,71.44,95,77.77,95,89,71.81,95,50,95ZM26.4,67.1C15.8,69.64,9,73.79,9,77.77,9,84,25.84,91,50,91s41-7,41-13.23c0-4-6.8-8.13-17.4-10.67L66.42,73c2.56,1.61,3.18,3.39,3.18,4.74C69.6,83.18,59.74,86,50,86s-19.6-2.83-19.6-8.24c0-1.35.62-3.13,3.18-4.74Z"/></svg></span>
                                <span><a href="https://maps.google.com/?q=${encodeURIComponent(ch.address)}" target="_blank">${ch.address}</a></span>
                            </li>
                            <li class="info-item">
                                <span class="info-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="-5.0 -10.0 110.0 135.0" width="20" height="20" fill="currentColor"><path d="m25.398 60.898h5.8008c2.1992 0 3.8984-1.8008 3.8984-3.8984v-5.8008c0-2.1992-1.8008-3.8984-3.8984-3.8984h-5.8008c-2.1992 0-3.8984 1.8008-3.8984 3.8984v5.8008c0 2.1016 1.6992 3.8984 3.8984 3.8984z"/><path d="m47 60.898h5.8008c2.1992 0 3.8984-1.8008 3.8984-3.8984v-5.8008c0-2.1992-1.8008-3.8984-3.8984-3.8984h-5.8008c-2.1992 0-3.8984 1.8008-3.8984 3.8984v5.8008c0 2.1016 1.6992 3.8984 3.8984 3.8984z"/><path d="m47 81.699h5.8008c2.1992 0 3.8984-1.8008 3.8984-3.8984v-5.8008c0-2.1992-1.8008-3.8984-3.8984-3.8984h-5.8008c-2.1992 0-3.8984 1.8008-3.8984 3.8984v5.8008c0 2.0977 1.6992 3.8984 3.8984 3.8984z"/><path d="m25.398 81.699h5.8008c2.1992 0 3.8984-1.8008 3.8984-3.8984v-5.8008c0-2.1992-1.8008-3.8984-3.8984-3.8984h-5.8008c-2.1992 0-3.8984 1.8008-3.8984 3.8984v5.8008c0 2.0977 1.6992 3.8984 3.8984 3.8984z"/><path d="m68.602 60.898h5.8008c2.1992 0 3.8984-1.8008 3.8984-3.8984v-5.8008c0-2.1992-1.8008-3.8984-3.8984-3.8984h-5.8008c-2.1992 0-3.8984 1.8008-3.8984 3.8984v5.8008c-0.003906 2.1016 1.6953 3.8984 3.8984 3.8984z"/><path d="m68.602 81.699h5.8008c2.1992 0 3.8984-1.8008 3.8984-3.8984v-5.8008c0-2.1992-1.8008-3.8984-3.8984-3.8984h-5.8008c-2.1992 0-3.8984 1.8008-3.8984 3.8984v5.8008c-0.003906 2.0977 1.6953 3.8984 3.8984 3.8984z"/><path d="m28.301 20.898c2.1992 0 4-1.8008 4-4v-10.398c0-2.1992-1.8008-4-4-4s-4 1.8008-4 4v10.5c0.097657 2.1016 1.8008 3.8984 4 3.8984z"/><path d="m71.5 20.898c2.1992 0 4-1.8008 4-4v-10.398c0-2.1992-1.8008-4-4-4s-4 1.8008-4 4v10.5c0.10156 2.1016 1.8008 3.8984 4 3.8984z"/><path d="m83.898 12.602h-3.5v4.3984c0 4.8984-4 8.8008-8.8008 8.8008-4.8008 0-8.8008-4-8.8008-8.8008v-4.3008h-25.598v4.3008c0 4.8984-4 8.8008-8.8008 8.8008-4.8984 0-8.8008-4-8.8008-8.8008v-4.3008h-3.3984c-6.6016 0-12 5.3984-12 12v60.898c0 6.6016 5.3984 12 12 12h67.801c6.6016 0 12-5.3984 12-12v-60.996c-0.10156-6.6016-5.5-12-12.102-12zm4.2031 72.898c0 2.3008-1.8984 4.1992-4.1992 4.1992h-67.801c-2.3008 0-4.1992-1.8984-4.1992-4.1992l-0.003906-46.398h76.301v46.398z"/></svg></span>
                                <span>Date de début : <strong>04/07/2026</strong></span>
                            </li>
                            <li class="info-item">
                                <span class="info-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="-5.0 -10.0 110.0 135.0" width="20" height="20" fill="currentColor"><path d="m25.398 60.898h5.8008c2.1992 0 3.8984-1.8008 3.8984-3.8984v-5.8008c0-2.1992-1.8008-3.8984-3.8984-3.8984h-5.8008c-2.1992 0-3.8984 1.8008-3.8984 3.8984v5.8008c0 2.1016 1.6992 3.8984 3.8984 3.8984z"/><path d="m47 60.898h5.8008c2.1992 0 3.8984-1.8008 3.8984-3.8984v-5.8008c0-2.1992-1.8008-3.8984-3.8984-3.8984h-5.8008c-2.1992 0-3.8984 1.8008-3.8984 3.8984v5.8008c0 2.1016 1.6992 3.8984 3.8984 3.8984z"/><path d="m47 81.699h5.8008c2.1992 0 3.8984-1.8008 3.8984-3.8984v-5.8008c0-2.1992-1.8008-3.8984-3.8984-3.8984h-5.8008c-2.1992 0-3.8984 1.8008-3.8984 3.8984v5.8008c0 2.0977 1.6992 3.8984 3.8984 3.8984z"/><path d="m25.398 81.699h5.8008c2.1992 0 3.8984-1.8008 3.8984-3.8984v-5.8008c0-2.1992-1.8008-3.8984-3.8984-3.8984h-5.8008c-2.1992 0-3.8984 1.8008-3.8984 3.8984v5.8008c0 2.0977 1.6992 3.8984 3.8984 3.8984z"/><path d="m68.602 60.898h5.8008c2.1992 0 3.8984-1.8008 3.8984-3.8984v-5.8008c0-2.1992-1.8008-3.8984-3.8984-3.8984h-5.8008c-2.1992 0-3.8984 1.8008-3.8984 3.8984v5.8008c-0.003906 2.1016 1.6953 3.8984 3.8984 3.8984z"/><path d="m68.602 81.699h5.8008c2.1992 0 3.8984-1.8008 3.8984-3.8984v-5.8008c0-2.1992-1.8008-3.8984-3.8984-3.8984h-5.8008c-2.1992 0-3.8984 1.8008-3.8984 3.8984v5.8008c-0.003906 2.0977 1.6953 3.8984 3.8984 3.8984z"/><path d="m28.301 20.898c2.1992 0 4-1.8008 4-4v-10.398c0-2.1992-1.8008-4-4-4s-4 1.8008-4 4v10.5c0.097657 2.1016 1.8008 3.8984 4 3.8984z"/><path d="m71.5 20.898c2.1992 0 4-1.8008 4-4v-10.398c0-2.1992-1.8008-4-4-4s-4 1.8008-4 4v10.5c0.10156 2.1016 1.8008 3.8984 4 3.8984z"/><path d="m83.898 12.602h-3.5v4.3984c0 4.8984-4 8.8008-8.8008 8.8008-4.8008 0-8.8008-4-8.8008-8.8008v-4.3008h-25.598v4.3008c0 4.8984-4 8.8008-8.8008 8.8008-4.8984 0-8.8008-4-8.8008-8.8008v-4.3008h-3.3984c-6.6016 0-12 5.3984-12 12v60.898c0 6.6016 5.3984 12 12 12h67.801c6.6016 0 12-5.3984 12-12v-60.996c-0.10156-6.6016-5.5-12-12.102-12zm4.2031 72.898c0 2.3008-1.8984 4.1992-4.1992 4.1992h-67.801c-2.3008 0-4.1992-1.8984-4.1992-4.1992l-0.003906-46.398h76.301v46.398z"/></svg></span>
                                <span>Date de fin : <strong>04/07/2027</strong></span>
                            </li>
                            <li class="info-item">
                                <span class="info-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="20" height="20" fill="currentColor"><path d="M 50 5 C 25.182718 5 5 25.1827 5 50 C 5 74.8172 25.182714 95 50 95 C 74.817295 95 95 74.8172 95 50 C 95 25.1827 74.81729 5 50 5 z M 47 11.125 L 47 15 A 3.0003 3.0003 0 1 0 53 15 L 53 11.125 C 72.168401 12.578094 87.413808 27.833892 88.875 47 L 85 47 A 3.0003 3.0003 0 0 0 84.6875 47 A 3.0040663 3.0040663 0 1 0 85 53 L 88.875 53 C 87.428122 72.179986 72.177719 87.420015 53 88.875 L 53 85 A 3.0003 3.0003 0 0 0 49.96875 81.9375 A 3.0003 3.0003 0 0 0 47 85 L 47 88.875 C 27.822287 87.420015 12.571879 72.179986 11.125 53 L 15 53 A 3.0003 3.0003 0 1 0 15 47 L 11.125 47 C 12.586193 27.833892 27.831607 12.578094 47 11.125 z M 33.65625 30.96875 A 3.0003 3.0003 0 0 0 31.875 36.09375 L 45.0625 49.28125 C 45.027559 49.519813 45 49.751738 45 50 C 45 52.7614 47.238575 55 50 55 C 52.761425 55 55 52.7614 55 50 C 55 47.23858 52.761425 45 50 45 C 49.762358 45 49.541304 45.030436 49.3125 45.0625 L 36.125 31.875 A 3.0003 3.0003 0 0 0 33.65625 30.96875 z"/></svg></span>
                                <span>Heure de début : <strong>09:00</strong></span>
                            </li>
                            <li class="info-item">
                                <span class="info-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="20" height="20" fill="currentColor"><path d="M 50 5 C 25.182718 5 5 25.1827 5 50 C 5 74.8172 25.182714 95 50 95 C 74.817295 95 95 74.8172 95 50 C 95 25.1827 74.81729 5 50 5 z M 47 11.125 L 47 15 A 3.0003 3.0003 0 1 0 53 15 L 53 11.125 C 72.168401 12.578094 87.413808 27.833892 88.875 47 L 85 47 A 3.0003 3.0003 0 0 0 84.6875 47 A 3.0040663 3.0040663 0 1 0 85 53 L 88.875 53 C 87.428122 72.179986 72.177719 87.420015 53 88.875 L 53 85 A 3.0003 3.0003 0 0 0 49.96875 81.9375 A 3.0003 3.0003 0 0 0 47 85 L 47 88.875 C 27.822287 87.420015 12.571879 72.179986 11.125 53 L 15 53 A 3.0003 3.0003 0 1 0 15 47 L 11.125 47 C 12.586193 27.833892 27.831607 12.578094 47 11.125 z M 33.65625 30.96875 A 3.0003 3.0003 0 0 0 31.875 36.09375 L 45.0625 49.28125 C 45.027559 49.519813 45 49.751738 45 50 C 45 52.7614 47.238575 55 50 55 C 52.761425 55 55 52.7614 55 50 C 55 47.23858 52.761425 45 50 45 C 49.762358 45 49.541304 45.030436 49.3125 45.0625 L 36.125 31.875 A 3.0003 3.0003 0 0 0 33.65625 30.96875 z"/></svg></span>
                                <span>Heure de fin : <strong>17:00</strong></span>
                            </li>
                        </ul>
                    </div>
                    
                    <div class="detail-card">
                        <h3 class="detail-card-title">Contact chantier</h3>
                        <div class="info-item">
                            <span class="info-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="-5.0 -10.0 110.0 135.0" width="20" height="20" fill="currentColor"><path d="m33 7c-4.4141 0-8 3.5859-8 8v70c0 4.4141 3.5859 8 8 8h34c4.4141 0 8-3.5859 8-8v-70c0-4.4141-3.5859-8-8-8zm0 2h34c3.3398 0 6 2.6602 6 6v2h-46v-2c0-3.3398 2.6602-6 6-6zm-6 10h46v58h-46zm0 60h46v6c0 3.3398-2.6602 6-6 6h-34c-3.3398 0-6-2.6602-6-6zm23 4c-1.1055 0-2 0.89453-2 2s0.89453 2 2 2 2-0.89453 2-2-0.89453-2-2-2z"/></svg></span>
                            <span style="font-weight: 600; color: var(--accent);">01 23 45 67 89</span>
                        </div>
                    </div>
                </div>

                <!-- Right Side: Progress & Feed -->
                <div>
                    <div class="detail-card">
                        <h3 class="detail-card-title">Avancement du chantier</h3>
                        <div style="font-size: 13.5px; margin-bottom: 8px;">Vous avez réalisé <strong>${ch.workedHours}h</strong>.</div>
                        <div class="progress-bar-wrapper" style="height: 12px; border-radius: 6px; background-color: #e5e7eb; overflow: hidden; margin-bottom: 12px;">
                            <div class="progress-bar-fill" style="width: ${pct}%; background-color: var(--green); height: 100%;"></div>
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px; font-size: 12.5px;">
                            <span style="width: 8px; height: 8px; border-radius: 50%; background-color: var(--green); display: inline-block;"></span>
                            <span>Réalisé : <strong>${ch.workedHours}h</strong></span>
                        </div>
                    </div>

                    <h3 style="font-family: var(--font-heading); font-size: 17px; font-weight: 700; color: var(--text-primary); margin: 24px 0 12px 0;">Fil d'actualité</h3>
                    
                    <!-- Exprimez-vous post box -->
                    <div class="feed-post-input-card">
                        <div class="feed-avatar" style="background-color: var(--accent); color: white; font-weight: bold;">JM</div>
                        <div class="feed-input-wrapper">
                            <input type="text" id="chantier-new-post-input" class="feed-text-input" placeholder="Exprimez-vous">
                            <div class="feed-input-actions">
                                <button class="feed-input-action-btn" onclick="alert('Ajout d\\\'image simulé')" style="display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; padding: 0;">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="-5.0 -10.0 110.0 135.0" width="20" height="20" fill="currentColor"><path d="m90.602 8.8008h-68.902c-3.8008 0-6.8984 3.1016-6.8984 6.8984v4.6992h-5.4023c-3.8008 0-6.8984 3.1016-6.8984 6.8984v56.898c0 3.8008 3.1016 6.8984 6.8984 6.8984h68.898c3.8008 0 6.8984-3.1016 6.8984-6.8984v-4.6992h5.3984c3.8008 0 6.8984-3.1016 6.8984-6.8984l0.007812-56.898c0-3.8008-3.1016-6.8984-6.8984-6.8984zm-11.402 64.699v10.699c0 0.5-0.39844 0.89844-0.89844 0.89844l-68.902 0.003906c-0.5 0-0.89844-0.39844-0.89844-0.89844v-56.805c0-0.5 0.39844-0.89844 0.89844-0.89844h68.898c0.5 0 0.89844 0.39844 0.89844 0.89844zm12.301-0.89844c0 0.5-0.39844 0.89844-0.89844 0.89844h-5.3984l-0.003906-46.102c0-3.8008-3.1016-6.8984-6.8984-6.8984h-57.5v-4.6992c0-0.5 0.39844-0.89844 0.89844-0.89844h68.898c0.5 0 0.89844 0.39844 0.89844 0.89844z"/><path d="m43.898 65.801-11.699-10-18.301 17.898v6.1016h59.902v-22.199l-10.902-13.402z"/><path d="m25.301 49.5c4.6016 0 8.3984-3.8008 8.3984-8.3984 0-4.6016-3.8008-8.3984-8.3984-8.3984-4.6016 0-8.3984 3.8008-8.3984 8.3984-0.003906 4.5977 3.7969 8.3984 8.3984 8.3984z"/></svg>
                                </button>
                                <button class="feed-input-action-btn" id="btn-submit-chantier-post" style="color: var(--accent); font-weight: bold; font-size: 16px;">➔</button>
                            </div>
                        </div>
                    </div>

                    <!-- Posts list -->
                    <div id="chantier-posts-list">
                        ${postsHtml}
                    </div>
                </div>
            </div>
        `;

        // Bind new post submission click
        const btnSubmitPost = document.getElementById('btn-submit-chantier-post');
        if (btnSubmitPost) {
            btnSubmitPost.addEventListener('click', submitChantierFeedPost);
            document.getElementById('chantier-new-post-input').addEventListener('keypress', (e) => {
                if (e.key === 'Enter') submitChantierFeedPost();
            });
        }

    } else if (activeChantierSubTab === 'documents') {
        const docs = chantierDocuments[ch.id] || [];
        const docsHtml = docs.length === 0
            ? `<div class="empty-state" style="padding: 24px; text-align: center; color: var(--gray-muted); font-style: italic;">Aucun document disponible</div>`
            : docs.map(d => `
                <div class="document-list-item">
                    <div class="doc-info-left">
                        <span style="font-size: 24px;">📄</span>
                        <div>
                            <div style="font-weight: 600; font-size: 13.5px; color: var(--text-primary);">${d.name}</div>
                            <div style="font-size: 11px; color: var(--gray-muted); margin-top: 2px;">Ajouté le ${d.date} par ${d.author} • ${d.size}</div>
                        </div>
                    </div>
                    <button class="btn btn-secondary" onclick="alert('Téléchargement simulé de ${d.name}')" style="padding: 6px 12px; font-size: 12px;">Télécharger</button>
                </div>
            `).join('');

        contentEl.innerHTML = `
            <div class="detail-card">
                <h3 class="detail-card-title">Documents du chantier</h3>
                <div class="upload-dropzone" onclick="document.getElementById('doc-file-input').click()">
                    <input type="file" id="doc-file-input" style="display: none;">
                    <div style="font-size: 28px; margin-bottom: 8px;">📂</div>
                    <div style="font-weight: 600; font-size: 14px;">Glissez-déposez des fichiers ici ou cliquez pour parcourir</div>
                    <div style="font-size: 11px; color: var(--gray-muted); margin-top: 4px;">Plans, Devis, Attestations de sécurité (Max 10 Mo)</div>
                </div>
                
                <div id="chantier-doc-list">
                    ${docsHtml}
                </div>
            </div>
        `;

        // Handle document file upload input change
        const fileInput = document.getElementById('doc-file-input');
        if (fileInput) {
            fileInput.addEventListener('change', async (e) => {
                if (e.target.files.length > 0) {
                    const file = e.target.files[0];
                    const sizeMB = (file.size / (1024 * 1024)).toFixed(1) + ' MB';

                    if (useSupabase) {
                        await supabaseClient.from('chantier_documents').insert([{
                            chantier_id: ch.id,
                            name: file.name,
                            file_size: sizeMB,
                            author: 'Jules Marcon'
                        }]);
                        await loadDataFromSupabase();
                    } else {
                        const newDoc = {
                            name: file.name,
                            size: sizeMB,
                            date: new Date().toLocaleDateString('fr-FR'),
                            author: 'Jules Marcon'
                        };
                        if (!chantierDocuments[ch.id]) {
                            chantierDocuments[ch.id] = [];
                        }
                        chantierDocuments[ch.id].unshift(newDoc);
                    }
                    renderChantierDetail();
                }
            });
        }

    } else if (activeChantierSubTab === 'planning') {
        const { columns, months, weeks } = getPlanningColumns(currentPlanningDate, currentPlanningPeriod);

        let headerRow1 = `<th class="col-project-info" rowspan="3" style="text-align: left; padding-left: 12px; background: #f9fafb; font-size: 12px; font-weight: 700; color: var(--text-primary);">Collaborateurs</th>`;
        months.forEach(m => {
            headerRow1 += `<th colspan="${m.colspan}" style="text-align: left; padding-left: 8px; font-size: 12px; font-weight: 700;">${m.name.charAt(0).toUpperCase() + m.name.slice(1)}</th>`;
        });

        let headerRow2 = '';
        weeks.forEach(w => {
            headerRow2 += `<th colspan="${w.colspan}" style="font-size: 11px; font-weight: 600; color: var(--gray-muted); text-align: center;">${w.num}</th>`;
        });

        let headerRow3 = '';
        columns.forEach(col => {
            headerRow3 += `<th class="col-day" style="text-align: center; font-size: 11px; font-weight: 600;">${col.dayLabel}</th>`;
        });

        const projectAllocations = planningAllocations[ch.id] || {};
        const companionIds = Object.keys(projectAllocations);
        let rowsHtml = '';

        if (companionIds.length === 0) {
            rowsHtml = `
                <tr>
                    <td class="col-project-info" style="font-style: italic; color: var(--gray-muted); font-size: 13px;">Aucun compagnon planifié</td>
                    <td colspan="${columns.length}" style="text-align: center; color: var(--gray-muted); padding: 20px; font-size: 13px;">Cliquez sur l'onglet global Planning pour ajouter des ressources</td>
                </tr>
            `;
        } else {
            companionIds.forEach(userId => {
                const user = users.find(u => u.id === userId);
                if (!user) return;
                const alloc = projectAllocations[userId];
                const initialsUser = `${user.firstname.charAt(0)}${user.lastname.charAt(0)}`.toUpperCase();

                let daysHtml = '';
                columns.forEach(col => {
                    const dayIdx = col.date.getDay() - 1;
                    const isAssigned = alloc.days.includes(dayIdx);
                    daysHtml += `
                        <td style="text-align: center;">
                            ${isAssigned ? `
                                <div class="assignment-block" style="background-color: var(--primary-light); color: var(--accent); font-size: 10px; font-weight: 700; padding: 4px; border-radius: 4px; border-left: 3px solid var(--accent);">
                                    ${alloc.hours}
                                </div>
                            ` : ''}
                        </td>
                    `;
                });

                rowsHtml += `
                    <tr class="companion-row">
                        <td class="col-project-info tree-connector-cell">
                            <div class="companion-info-cell" style="display: flex; align-items: center; gap: 8px;">
                                ${getUserAvatar(user, 36)}
                                <div class="user-info">
                                    <span class="companion-name">${user.firstname} ${user.lastname}</span>
                                    <span class="companion-role">${user.role}</span>
                                </div>
                            </div>
                        </td>
                        ${daysHtml}
                    </tr>
                `;
            });
        }

        contentEl.innerHTML = `
            <div class="detail-card" style="padding: 16px; overflow-x: auto;">
                <h3 class="detail-card-title">Affectations Planning</h3>
                <table class="planning-table week-mode" style="width: 100%; border-collapse: collapse; min-width: 800px;">
                    <thead>
                        <tr>${headerRow1}</tr>
                        <tr>${headerRow2}</tr>
                        <tr>${headerRow3}</tr>
                    </thead>
                    <tbody>
                        ${rowsHtml}
                    </tbody>
                </table>
            </div>
        `;

    } else if (activeChantierSubTab === 'hours') {
        const pAllocs = hoursAllocations[ch.id] || {};
        const assignedUserIds = Object.keys(pAllocs);

        let daysHeaderHtml = '';
        const baseDate = new Date(currentPlanningDate);
        const currentDay = baseDate.getDay();
        const dist = currentDay === 0 ? -6 : 1 - currentDay;
        baseDate.setDate(baseDate.getDate() + dist);

        for (let i = 0; i < 5; i++) {
            const dDate = new Date(baseDate);
            dDate.setDate(baseDate.getDate() + i);
            const dayLabel = dDate.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'narrow' }).toUpperCase();
            daysHeaderHtml += `<th style="text-align: center; font-size: 11px; font-weight: 600;">${dayLabel}</th>`;
        }

        let companionRowsHtml = '';
        let totalSum = 0;
        let daySums = [0, 0, 0, 0, 0];

        if (assignedUserIds.length === 0) {
            companionRowsHtml = `
                <tr>
                    <td class="col-project-info" style="font-style: italic; color: var(--gray-muted); font-size: 13px;">Aucun relevé d'heures disponible</td>
                    <td colspan="5" style="text-align: center; color: var(--gray-muted); padding: 20px; font-size: 13px;">Saisissez des heures dans la feuille d'heures globale pour ce chantier</td>
                    <td></td>
                </tr>
            `;
        } else {
            assignedUserIds.forEach(uId => {
                const user = users.find(u => u.id === uId);
                if (!user) return;
                const initialsUser = `${user.firstname.charAt(0)}${user.lastname.charAt(0)}`.toUpperCase();

                let cellsHtml = '';
                let userSum = 0;
                for (let d = 0; d < 5; d++) {
                    const val = pAllocs[uId][d] || '00:00';
                    const decVal = timeStringToDecimal(val);
                    userSum += decVal;
                    daySums[d] += decVal;
                    const isToComplete = val === 'À compléter';

                    cellsHtml += `
                        <td>
                            <input type="text" class="hour-cell-input ${isToComplete ? 'input-to-complete' : ''}" 
                                   value="${val}" 
                                   data-chantier-id="${ch.id}" data-user-id="${uId}" data-day="${d}"
                                   style="width: 100%; border: 1px solid var(--border-color); padding: 6px; text-align: center; border-radius: 6px;">
                        </td>
                    `;
                }

                totalSum += userSum;

                companionRowsHtml += `
                    <tr class="companion-row">
                        <td class="col-project-info tree-connector-cell">
                            <div class="companion-info-cell" style="display: flex; align-items: center; gap: 8px;">
                                ${getUserAvatar(user, 36)}
                                <div class="user-info">
                                    <span class="companion-name">${user.firstname} ${user.lastname}</span>
                                    <span class="companion-role">${user.role}</span>
                                </div>
                            </div>
                        </td>
                        ${cellsHtml}
                        <td class="hour-total-cell" style="font-weight: 700; text-align: center;">${decimalToTimeString(userSum)}</td>
                    </tr>
                `;
            });
        }

        contentEl.innerHTML = `
            <div class="detail-card" style="padding: 16px; overflow-x: auto;">
                <h3 class="detail-card-title">Saisie des Heures</h3>
                <table class="hours-table" style="width: 100%; border-collapse: collapse; min-width: 800px;">
                    <thead>
                        <tr style="background-color: #ff6b4a; color: white;">
                            <th class="col-project-info" style="text-align: left; padding: 12px; color: white; background-color: #ff6b4a;">Collaborateurs</th>
                            ${daysHeaderHtml}
                            <th style="text-align: center;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${companionRowsHtml}
                        <tr class="total-row" style="background-color: #f9fafb; font-weight: bold; border-top: 2px solid #d1d5db;">
                            <td class="col-project-info" style="padding: 12px;">Total général</td>
                            ${daySums.map(s => `<td style="text-align: center; padding: 12px;">${decimalToTimeString(s)}</td>`).join('')}
                            <td style="text-align: center; padding: 12px; font-weight: 800;">${decimalToTimeString(totalSum)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;

        const subInputs = contentEl.querySelectorAll('.hour-cell-input');
        subInputs.forEach(input => {
            input.addEventListener('change', async (e) => {
                const chId = input.dataset.chantierId;
                const uId = input.dataset.userId;
                const day = parseInt(input.dataset.day, 10);
                const rawVal = e.target.value;
                const sanitized = sanitizeHourInput(rawVal);

                if (useSupabase) {
                    await supabaseClient.from('hours_allocations').upsert([{
                        chantier_id: chId,
                        user_id: uId,
                        day_index: day,
                        hours_value: sanitized
                    }]);

                    if (!hoursAllocations[chId]) hoursAllocations[chId] = {};
                    if (!hoursAllocations[chId][uId]) hoursAllocations[chId][uId] = {};
                    hoursAllocations[chId][uId][day] = sanitized;

                    let totalProjHours = 0;
                    Object.keys(hoursAllocations[chId]).forEach(workerId => {
                        for (let wd = 0; wd < 5; wd++) {
                            totalProjHours += timeStringToDecimal(hoursAllocations[chId][workerId][wd]);
                        }
                    });
                    const finalHours = totalProjHours + (chId === 'c1' ? 70 : chId === 'c2' ? 80 : 0);
                    await supabaseClient.from('chantiers').update({ worked_hours: finalHours }).eq('id', chId);
                    await loadDataFromSupabase();
                } else {
                    if (!hoursAllocations[chId]) hoursAllocations[chId] = {};
                    if (!hoursAllocations[chId][uId]) hoursAllocations[chId][uId] = {};
                    hoursAllocations[chId][uId][day] = sanitized;

                    let totalProjHours = 0;
                    Object.keys(hoursAllocations[chId]).forEach(workerId => {
                        for (let wd = 0; wd < 5; wd++) {
                            totalProjHours += timeStringToDecimal(hoursAllocations[chId][workerId][wd]);
                        }
                    });
                    ch.workedHours = totalProjHours + (chId === 'c1' ? 70 : chId === 'c2' ? 80 : 0);
                    renderDashboard();
                }

                renderChantierDetail();
            });

            input.addEventListener('focus', (e) => {
                e.target.select();
            });
        });

    } else if (activeChantierSubTab === 'memos') {
        const projectMemos = memos.filter(m => m.chantierId === ch.id);
        const memosHtml = projectMemos.map(p => `
            <div class="feed-post-card" style="margin-bottom: 12px; padding: 14px; position: relative; border: 1px solid var(--border-color); border-radius: 8px;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div class="feed-avatar" style="width: 28px; height: 28px; font-size: 10px; line-height: 28px; background-color: var(--accent); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600;">JM</div>
                        <span style="font-weight: 600; font-size: 13px;">Jules Marcon</span>
                        <span style="font-size: 10px; padding: 2px 6px; border-radius: 9999px; background-color: ${p.priority === 'Haute' ? '#fee2e2' : p.priority === 'Moyenne' ? '#ffedd5' : '#d1fae5'}; color: ${p.priority === 'Haute' ? '#991b1b' : p.priority === 'Moyenne' ? '#c2410c' : '#065f46'};">${p.priority}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 11px; color: var(--gray-muted);">${p.date}</span>
                        <div style="display: flex; align-items: center; gap: 6px;">
                            <button class="btn-action" style="color: var(--primary); padding: 2px; border: none; background: none; cursor: pointer; display: inline-flex;" onclick="openEditChantierMemo(event, '${p.id}')" title="Modifier le mémo">
                                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                    <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z"/>
                                </svg>
                            </button>
                            <button class="btn-action" style="color: var(--red); padding: 2px; border: none; background: none; cursor: pointer; font-size: 16px; font-weight: 700; line-height: 1; display: inline-flex;" onclick="deleteChantierMemo(event, '${p.id}')" title="Supprimer le mémo">
                                &times;
                            </button>
                        </div>
                    </div>
                </div>
                <div style="font-size: 13.5px; color: var(--text-primary); line-height: 1.4; white-space: pre-line;">${p.description}</div>
            </div>
        `).join('');

        contentEl.innerHTML = `
            <div class="detail-card">
                <h3 class="detail-card-title">Mémos & Notes</h3>
                <div style="display: flex; gap: 10px; margin-bottom: 16px;">
                    <input type="text" id="chantier-memo-input" class="form-input" placeholder="Ajouter une note de chantier..." style="flex: 1; font-size: 13px;">
                    <button class="btn btn-primary" id="btn-submit-chantier-memo" style="background-color: var(--accent);">Ajouter</button>
                </div>
                <div id="chantier-memos-list">
                    ${memosHtml}
                </div>
            </div>
        `;

        const btnSubmitMemo = document.getElementById('btn-submit-chantier-memo');
        if (btnSubmitMemo) {
            btnSubmitMemo.addEventListener('click', submitChantierMemo);
            document.getElementById('chantier-memo-input').addEventListener('keypress', (e) => {
                if (e.key === 'Enter') submitChantierMemo();
            });
        }
    }
}

async function submitChantierFeedPost() {
    const input = document.getElementById('chantier-new-post-input');
    if (!input || !input.value.trim()) return;

    const content = input.value.trim();
    if (useSupabase) {
        await supabaseClient.from('chantier_feeds').insert([{
            chantier_id: activeChantierId,
            author: 'Jules Marcon',
            avatar: 'JM',
            content: content
        }]);
        await loadDataFromSupabase();
    } else {
        const newPost = {
            id: Date.now(),
            author: 'Jules Marcon',
            avatar: 'JM',
            time: 'À l\'instant',
            content: content
        };

        if (!chantierFeeds[activeChantierId]) {
            chantierFeeds[activeChantierId] = [];
        }
        chantierFeeds[activeChantierId].unshift(newPost);
    }
    renderChantierDetail();
}

async function submitChantierMemo() {
    const input = document.getElementById('chantier-memo-input');
    if (!input || !input.value.trim()) return;

    const content = input.value.trim();
    if (useSupabase && supabaseClient) {
        try {
            const { error } = await supabaseClient
                .from('chantier_feeds')
                .insert([{
                    chantier_id: activeChantierId,
                    author: 'Jules Marcon',
                    avatar: 'JM',
                    content: content,
                    priority: 'Moyenne'
                }]);

            if (error) {
                console.warn("Erreur d'insertion (colonne priority manquante probable). Repli sans priority...", error);
                const { error: retryError } = await supabaseClient
                    .from('chantier_feeds')
                    .insert([{
                        chantier_id: activeChantierId,
                        author: 'Jules Marcon',
                        avatar: 'JM',
                        content: content
                    }]);
                if (retryError) throw retryError;
            }
            await loadDataFromSupabase();
        } catch (err) {
            console.error("Erreur lors de l'insertion du mémo depuis la fiche chantier :", err);
            alert("Erreur lors de l'enregistrement : " + (err.message || err));
        }
    } else {
        const newMemo = {
            id: 'memo_' + Date.now(),
            chantierId: activeChantierId,
            description: content,
            priority: 'Moyenne',
            date: new Date().toLocaleDateString('fr-FR')
        };
        memos.unshift(newMemo);
        localStorage.setItem('projetremi_memos', JSON.stringify(memos));
    }
    input.value = '';
    renderChantierDetail();
}

async function deleteChantierMemo(e, memoId) {
    if (e) e.stopPropagation();
    if (await showCustomConfirm('Êtes-vous sûr de vouloir supprimer ce mémo ?')) {
        if (useSupabase && supabaseClient && !isNaN(Number(memoId))) {
            try {
                const { error } = await supabaseClient
                    .from('chantier_feeds')
                    .delete()
                    .eq('id', Number(memoId));
                if (error) throw error;
                await loadDataFromSupabase();
            } catch (err) {
                console.error("Erreur lors de la suppression du mémo :", err);
            }
        } else {
            memos = memos.filter(m => m.id !== memoId);
            localStorage.setItem('projetremi_memos', JSON.stringify(memos));
        }
        renderChantierDetail();
    }
}

let activeHourInput = null;

function initHoursDrawer() {
    const drawer = document.getElementById('hours-slider-drawer');
    const closeBtn = document.getElementById('btn-close-drawer');
    const rangeInput = document.getElementById('drawer-range-input');
    const manualInput = document.getElementById('drawer-manual-input');
    const sliderValueLabel = document.getElementById('drawer-slider-value');
    const hoursDecimalLabel = document.getElementById('drawer-hours-decimal');
    const userNameLabel = document.getElementById('drawer-user-name');
    const chantierNameLabel = document.getElementById('drawer-chantier-name');
    const dayLabel = document.getElementById('drawer-day-label');

    const dayNames = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];

    // Delegate click/focus event on hours cells
    document.addEventListener('focusin', (e) => {
        if (e.target.classList.contains('hour-cell-input')) {
            activeHourInput = e.target;
            const chId = activeHourInput.dataset.chantierId;
            const uId = activeHourInput.dataset.userId;
            const dayIdx = parseInt(activeHourInput.dataset.day, 10);

            const chantier = chantiers.find(c => c.id === chId);
            const user = users.find(u => u.id === uId);

            if (user) userNameLabel.textContent = `${user.firstname} ${user.lastname}`;
            if (chantier) chantierNameLabel.textContent = chantier.name;
            dayLabel.textContent = `Jour : ${dayNames[dayIdx] || 'Jour'}`;

            // Parse initial time
            let val = activeHourInput.value.trim();
            if (val === 'À compléter' || val === '') {
                val = '08:00';
            }
            
            const decimalVal = timeStringToDecimal(val);
            rangeInput.value = decimalVal;
            sliderValueLabel.textContent = val;
            hoursDecimalLabel.textContent = `${decimalVal.toFixed(1)} h`;
            manualInput.value = val;

            drawer.classList.add('show');
        }
    });

    // Close drawer when clicking close button
    closeBtn.addEventListener('click', () => {
        drawer.classList.remove('show');
        if (activeHourInput) {
            activeHourInput.blur();
            activeHourInput = null;
        }
    });

    // Range input change
    rangeInput.addEventListener('input', (e) => {
        if (!activeHourInput) return;
        const decVal = parseFloat(e.target.value);
        const timeStr = decimalToTimeString(decVal);

        sliderValueLabel.textContent = timeStr;
        hoursDecimalLabel.textContent = `${decVal.toFixed(1)} h`;
        manualInput.value = timeStr;

        // Update target input and trigger change
        activeHourInput.value = timeStr;
        activeHourInput.dispatchEvent(new Event('change'));
    });

    // Manual input typing
    manualInput.addEventListener('input', (e) => {
        if (!activeHourInput) return;
        const val = e.target.value.trim();
        activeHourInput.value = val;

        // Try to sync with range slider
        const decVal = timeStringToDecimal(val);
        if (!isNaN(decVal) && decVal >= 0 && decVal <= 12) {
            rangeInput.value = decVal;
            sliderValueLabel.textContent = val;
            hoursDecimalLabel.textContent = `${decVal.toFixed(1)} h`;
        }

        activeHourInput.dispatchEvent(new Event('change'));
    });

    // Close drawer when clicking outside
    document.addEventListener('mousedown', (e) => {
        if (!drawer.contains(e.target) && !e.target.classList.contains('hour-cell-input') && drawer.classList.contains('show')) {
            drawer.classList.remove('show');
            activeHourInput = null;
        }
    });

    // Mettre sur "À compléter" button click handler
    const btnSetToComplete = document.getElementById('btn-drawer-set-to-complete');
    if (btnSetToComplete) {
        btnSetToComplete.addEventListener('click', () => {
            if (!activeHourInput) return;
            activeHourInput.value = 'À compléter';
            activeHourInput.dispatchEvent(new Event('change'));
            drawer.classList.remove('show');
            if (activeHourInput) activeHourInput.blur();
            activeHourInput = null;
        });
    }
}

function openEditChantierModal(chantierId) {
    const ch = chantiers.find(c => c.id === chantierId);
    if (!ch) return;

    document.getElementById('edit-chantier-id').value = ch.id;
    document.getElementById('edit-chantier-name').value = ch.name || '';
    
    // Core fields recovery
    const clientVal = ch.client || '';
    document.getElementById('edit-chantier-client').value = clientVal;
    
    const entrepriseVal = ch.entreprise || '';
    if (document.getElementById('edit-chantier-entreprise')) {
        document.getElementById('edit-chantier-entreprise').value = entrepriseVal;
    }
    
    // Parse address components
    let street = '';
    let zip = '';
    let city = '';
    if (ch.address && ch.address !== 'Adresse non renseignée') {
        const addrParts = ch.address.split(',');
        street = addrParts[0] ? addrParts[0].trim() : '';
        if (addrParts[1]) {
            const zipCityParts = addrParts[1].trim().split(' ');
            zip = zipCityParts[0] ? zipCityParts[0].trim() : '';
            city = zipCityParts.slice(1).join(' ').trim();
        }
    }
    document.getElementById('edit-chantier-address').value = street;
    document.getElementById('edit-chantier-zip').value = zip;
    document.getElementById('edit-chantier-city').value = city;

    // Fill placeholder static values for detailed fields from the screenshot
    document.getElementById('edit-chantier-code').value = ch.code || 'Code chantier';
    document.getElementById('edit-chantier-desc').value = ch.description || 'Description du chantier';
    document.getElementById('edit-chantier-date-start').value = ch.dateStart || '2026-07-04';
    document.getElementById('edit-chantier-date-end').value = ch.dateEnd || '2027-07-04';
    document.getElementById('edit-chantier-time-start').value = ch.timeStart || '09:00';
    document.getElementById('edit-chantier-time-end').value = ch.timeEnd || '17:00';
    document.getElementById('edit-chantier-budget').value = ch.budgetHours || 150;
    document.getElementById('edit-chantier-lat').value = ch.lat || '';
    document.getElementById('edit-chantier-lng').value = ch.lng || '';
    document.getElementById('edit-chantier-addr-comp').value = ch.addressComplement || '';
    document.getElementById('edit-chantier-status').value = ch.status || 'Ouvert';
    document.getElementById('edit-chantier-contact').value = ch.contact || '';
    document.getElementById('edit-chantier-contact-phone').value = ch.contactPhone || '0123456789';
    document.getElementById('edit-chantier-contact-email').value = ch.contactEmail || '';

    // Color picker
    const chColor = ch.color || '#10b981';
    document.getElementById('edit-chantier-color-input').value = chColor;
    const colorPickerContainer = document.getElementById('edit-chantier-color-picker');
    if (colorPickerContainer) {
        colorPickerContainer.querySelectorAll('.color-dot').forEach(dot => {
            if (dot.dataset.color.toLowerCase() === chColor.toLowerCase()) {
                dot.classList.add('selected');
            } else {
                dot.classList.remove('selected');
            }
        });
    }

    const modal = document.getElementById('edit-chantier-modal');
    if (modal) {
        // Pre-display existing chantier image in the uploader
        const uploader = modal.querySelector('.image-uploader');
        if (uploader) {
            // Reset first
            const oldPreview = uploader.querySelector('.uploader-preview-img');
            if (oldPreview) oldPreview.remove();
            uploader.querySelectorAll(':not(.image-uploader-input)').forEach(child => {
                child.style.opacity = '';
            });
            uploader.removeAttribute('data-image-base64');

            if (ch.image) {
                uploader.setAttribute('data-image-base64', ch.image);
                const previewImg = document.createElement('img');
                previewImg.className = 'uploader-preview-img';
                previewImg.src = ch.image;
                previewImg.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;border-radius:8px;';
                uploader.style.position = 'relative';
                uploader.appendChild(previewImg);
                uploader.querySelectorAll(':not(.uploader-preview-img):not(.image-uploader-input)').forEach(child => {
                    child.style.opacity = '0';
                });
            }
        }
        modal.classList.add('show');
    }
}

async function saveEditChantier(e) {
    if (e) e.preventDefault();

    const id = document.getElementById('edit-chantier-id').value;
    const name = document.getElementById('edit-chantier-name').value.trim();
    const code = document.getElementById('edit-chantier-code').value.trim();
    const description = document.getElementById('edit-chantier-desc').value.trim();
    const client = document.getElementById('edit-chantier-client').value.trim();
    const entreprise = document.getElementById('edit-chantier-entreprise') ? document.getElementById('edit-chantier-entreprise').value.trim() : '';
    const dateStart = document.getElementById('edit-chantier-date-start').value;
    const dateEnd = document.getElementById('edit-chantier-date-end').value;
    const timeStart = document.getElementById('edit-chantier-time-start').value;
    const timeEnd = document.getElementById('edit-chantier-time-end').value;
    const budgetHours = parseFloat(document.getElementById('edit-chantier-budget').value) || 0;
    
    const street = document.getElementById('edit-chantier-address').value.trim();
    const zip = document.getElementById('edit-chantier-zip').value.trim();
    const city = document.getElementById('edit-chantier-city').value.trim();
    const fullAddress = street + (zip ? `, ${zip}` : '') + (city ? ` ${city}` : '');

    const lat = document.getElementById('edit-chantier-lat').value;
    const lng = document.getElementById('edit-chantier-lng').value;
    const addressComplement = document.getElementById('edit-chantier-addr-comp').value;
    const status = document.getElementById('edit-chantier-status').value;
    const color = document.getElementById('edit-chantier-color-input').value;
    const contact = document.getElementById('edit-chantier-contact').value;
    const contactPhone = document.getElementById('edit-chantier-contact-phone').value;
    const contactEmail = document.getElementById('edit-chantier-contact-email').value;

    const chIdx = chantiers.findIndex(c => c.id === id);
    if (chIdx !== -1) {
        // Update local object
        chantiers[chIdx] = {
            ...chantiers[chIdx],
            name,
            code,
            description,
            client,
            entreprise,
            dateStart,
            dateEnd,
            timeStart,
            timeEnd,
            budgetHours,
            address: fullAddress || 'Adresse non renseignée',
            lat,
            lng,
            addressComplement,
            status,
            color,
            contact,
            contactPhone,
            contactEmail
        };

        // Save image if one was selected in the uploader
        const editUploader = document.querySelector('#edit-chantier-modal .image-uploader');
        if (editUploader) {
            const imgData = editUploader.getAttribute('data-image-base64');
            if (imgData) {
                chantiers[chIdx].image = imgData;
                // Persist to localStorage so it survives page refresh
                const savedImages = JSON.parse(localStorage.getItem('chantier_images') || '{}');
                savedImages[id] = imgData;
                localStorage.setItem('chantier_images', JSON.stringify(savedImages));
            }
        }

        // Update database if using Supabase
        if (useSupabase && supabaseClient) {
            try {
                const { error } = await supabaseClient
                    .from('chantiers')
                    .update({
                        name,
                        client,
                        entreprise,
                        address: fullAddress || 'Adresse non renseignée',
                        status,
                        budget_hours: budgetHours,
                        color
                    })
                    .eq('id', id);

                if (error) throw error;
                console.log("Chantier mis à jour avec succès dans Supabase !");
            } catch (err) {
                console.error("Erreur lors de la mise à jour du chantier dans Supabase :", err);
            }
        }

        // Close modal
        const modal = document.getElementById('edit-chantier-modal');
        if (modal) modal.classList.remove('show');

        // Refresh views
        renderChantiers();
        renderChantierDetail();
        renderPlanning();
        renderHours();
    }
}

function renderMemos() {
    const container = document.getElementById('memos-grid-container');
    if (!container) return;
    container.innerHTML = '';

    if (memos.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; background: white; border-radius: 12px; border: 1px solid var(--border-color); color: var(--gray-muted);">
                <div style="font-size: 40px; margin-bottom: 12px;">💬</div>
                <div style="font-weight: 600; font-size: 15px; color: var(--text-primary);">Aucun mémo pour le moment</div>
                <div style="font-size: 13px; margin-top: 4px;">Cliquez sur "Créer un mémo" pour ajouter une consigne ou une note.</div>
            </div>
        `;
        return;
    }

    memos.forEach(m => {
        const chantier = chantiers.find(c => c.id === m.chantierId) || { name: 'Chantier inconnu' };
        
        let badgeColor = '#d1fae5';
        let badgeText = '#065f46';
        if (m.priority === 'Haute') {
            badgeColor = '#fee2e2';
            badgeText = '#991b1b';
        } else if (m.priority === 'Moyenne') {
            badgeColor = '#ffedd5';
            badgeText = '#c2410c';
        }

        const card = document.createElement('div');
        card.style.cssText = `
            background: white;
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.02);
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            gap: 16px;
            position: relative;
        `;

        card.innerHTML = `
            <div>
                <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 10px;">
                    <div style="font-weight: 700; font-size: 14.5px; color: var(--primary); font-family: var(--font-heading);">${chantier.name}</div>
                    <span style="font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 9999px; background-color: ${badgeColor}; color: ${badgeText};">${m.priority}</span>
                </div>
                <div style="font-size: 13.5px; line-height: 1.5; color: var(--text-primary); margin-top: 12px; white-space: pre-line;">${m.description}</div>
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--border-color); padding-top: 12px; margin-top: auto;">
                <span style="font-size: 11px; color: var(--gray-muted);">${m.date}</span>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <button class="btn-action" style="color: var(--primary); padding: 4px; border: none; background: none; cursor: pointer; display: inline-flex;" onclick="openEditMemoModal('${m.id}')" title="Modifier le mémo">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z"/>
                        </svg>
                    </button>
                    <button class="btn-action" style="color: var(--red); padding: 4px; border: none; background: none; cursor: pointer; display: inline-flex;" onclick="deleteMemo('${m.id}')" title="Supprimer le mémo">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function openMemoModal() {
    const select = document.getElementById('memo-chantier-select');
    if (select) {
        select.innerHTML = '<option value="" disabled selected>Veuillez sélectionner un chantier</option>';
        chantiers.forEach(c => {
            select.innerHTML += `<option value="${c.id}">${c.name}</option>`;
        });
    }

    document.getElementById('memo-desc-textarea').value = '';
    document.getElementById('memo-priority-select').value = 'Moyenne';
    document.getElementById('edit-memo-id').value = '';

    const title = document.getElementById('memo-modal-title');
    if (title) title.textContent = 'Créer un mémo';

    const modal = document.getElementById('memo-modal');
    if (modal) modal.classList.add('show');
}

async function saveMemo(e) {
    if (e) e.preventDefault();

    const chantierId = document.getElementById('memo-chantier-select').value;
    const description = document.getElementById('memo-desc-textarea').value.trim();
    const priority = document.getElementById('memo-priority-select').value;

    const editId = document.getElementById('edit-memo-id').value;

    if (useSupabase && supabaseClient) {
        try {
            if (editId) {
                // Update mode
                const { error } = await supabaseClient
                    .from('chantier_feeds')
                    .update({
                        chantier_id: chantierId,
                        content: description,
                        priority: priority
                    })
                    .eq('id', Number(editId));

                if (error) {
                    console.warn("Erreur de modification (repli sans priority)...", error);
                    const { error: retryError } = await supabaseClient
                        .from('chantier_feeds')
                        .update({
                            chantier_id: chantierId,
                            content: description
                        })
                        .eq('id', Number(editId));
                    if (retryError) throw retryError;
                }
            } else {
                // Insert mode
                const { error } = await supabaseClient
                    .from('chantier_feeds')
                    .insert([{
                        chantier_id: chantierId,
                        author: 'Jules Marcon',
                        avatar: 'JM',
                        content: description,
                        priority: priority
                    }]);

                if (error) {
                    console.warn("Erreur d'insertion (colonne priority manquante probable). Repli sans priority...", error);
                    const { error: retryError } = await supabaseClient
                        .from('chantier_feeds')
                        .insert([{
                            chantier_id: chantierId,
                            author: 'Jules Marcon',
                            avatar: 'JM',
                            content: description
                        }]);
                    if (retryError) throw retryError;
                }
            }
            console.log("Mémo enregistré dans Supabase avec succès !");
            await loadDataFromSupabase();
        } catch (err) {
            console.error("Erreur lors de l'enregistrement du mémo dans Supabase :", err);
            alert("Erreur lors de l'enregistrement : " + (err.message || err));
        }
    } else {
        if (editId) {
            // Update mode local
            const memo = memos.find(m => m.id === editId);
            if (memo) {
                memo.chantierId = chantierId;
                memo.description = description;
                memo.priority = priority;
                localStorage.setItem('projetremi_memos', JSON.stringify(memos));
            }
        } else {
            // Insert mode local
            const todayStr = new Date().toLocaleDateString('fr-FR');
            const newMemo = {
                id: 'memo_' + Date.now(),
                chantierId,
                description,
                priority,
                date: todayStr
            };
            memos.unshift(newMemo);
            localStorage.setItem('projetremi_memos', JSON.stringify(memos));
        }
    }

    const modal = document.getElementById('memo-modal');
    if (modal) modal.classList.remove('show');

    renderMemos();
    if (activeChantierId) {
        renderChantierDetail();
    }
}

async function deleteMemo(id) {
    if (await showCustomConfirm('Êtes-vous sûr de vouloir supprimer ce mémo ?')) {
        if (useSupabase && supabaseClient && !isNaN(Number(id))) {
            try {
                const { error } = await supabaseClient
                    .from('chantier_feeds')
                    .delete()
                    .eq('id', Number(id));
                if (error) throw error;
                await loadDataFromSupabase();
            } catch (err) {
                console.error("Erreur lors de la suppression du mémo :", err);
            }
        } else {
            memos = memos.filter(m => m.id !== id);
            localStorage.setItem('projetremi_memos', JSON.stringify(memos));
        }
        renderMemos();
        if (activeChantierId) renderChantierDetail();
    }
}

function openEditMemoModal(id) {
    const memo = memos.find(m => m.id === String(id));
    if (!memo) return;

    const select = document.getElementById('memo-chantier-select');
    if (select) {
        select.innerHTML = '<option value="" disabled>Veuillez sélectionner un chantier</option>';
        chantiers.forEach(c => {
            select.innerHTML += `<option value="${c.id}" ${c.id === memo.chantierId ? 'selected' : ''}>${c.name}</option>`;
        });
    }

    document.getElementById('memo-desc-textarea').value = memo.description;
    document.getElementById('memo-priority-select').value = memo.priority;
    document.getElementById('edit-memo-id').value = memo.id;

    const title = document.getElementById('memo-modal-title');
    if (title) title.textContent = 'Modifier le mémo';

    const modal = document.getElementById('memo-modal');
    if (modal) modal.classList.add('show');
}

function openEditChantierMemo(e, id) {
    if (e) e.stopPropagation();
    openEditMemoModal(id);
}

// PDF Export function for Chantier Detail
function exportChantierPDF(chantierId) {
    const ch = chantiers.find(c => c.id === chantierId);
    if (!ch) {
        alert("Chantier introuvable.");
        return;
    }

    // Get planning assignments
    const assignments = [];
    Object.keys(planningAllocations[ch.id] || {}).forEach(uId => {
        const user = users.find(u => u.id === uId);
        if (user) {
            assignments.push(user);
        }
    });

    // Get documents
    const documents = chantierDocuments[ch.id] || [];

    // Get feeds/memos
    const feeds = chantierFeeds[ch.id] || [];

    // Create a new window for print document
    const printWindow = window.open('', '_blank', 'width=900,height=800');
    if (!printWindow) {
        alert("Le bloqueur de fenêtres pop-up a empêché l'exportation. Veuillez autoriser les pop-ups pour ce site.");
        return;
    }

    const pct = Math.min(100, Math.round((ch.workedHours / ch.budgetHours) * 100));

    // Construct the print layout
    printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="fr">
        <head>
            <meta charset="UTF-8">
            <title>Rapport de chantier — ${ch.name}</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
                
                body {
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    color: #1e1b4b;
                    margin: 0;
                    padding: 40px;
                    background-color: #ffffff;
                    font-size: 14px;
                    line-height: 1.5;
                }

                /* Header style */
                .report-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 2px solid #5B47E0;
                    padding-bottom: 20px;
                    margin-bottom: 30px;
                }

                .logo-container img {
                    height: 36px;
                    filter: brightness(0) saturate(100%) invert(28%) sepia(86%) saturate(1600%) hue-rotate(235deg) brightness(95%) contrast(95%);
                }

                .report-title-container {
                    text-align: right;
                }

                .report-title {
                    font-size: 20px;
                    font-weight: 700;
                    color: #5B47E0;
                    margin: 0 0 5px 0;
                }

                .report-date {
                    font-size: 12px;
                    color: #6b7280;
                    margin: 0;
                }

                /* Main Grid */
                .grid-two-cols {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 30px;
                    margin-bottom: 30px;
                }

                .section-title {
                    font-size: 15px;
                    font-weight: 700;
                    color: #1e1b4b;
                    border-bottom: 1px solid #e5e7eb;
                    padding-bottom: 8px;
                    margin-top: 0;
                    margin-bottom: 15px;
                }

                /* Info table card */
                .info-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .info-table td {
                    padding: 10px 0;
                    border-bottom: 1px solid #f3f4f6;
                }

                .info-table td.label {
                    color: #6b7280;
                    font-weight: 500;
                    width: 40%;
                }

                .info-table td.value {
                    font-weight: 600;
                    color: #111827;
                    text-align: right;
                }

                /* Budget Progress */
                .budget-progress-container {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 10px;
                    padding: 16px;
                    box-sizing: border-box;
                }

                .progress-bar-bg {
                    height: 10px;
                    background: #e2e8f0;
                    border-radius: 5px;
                    overflow: hidden;
                    margin: 12px 0;
                }

                .progress-bar-fill {
                    height: 100%;
                    background: #7C3AED;
                    border-radius: 5px;
                }

                /* Assignment block */
                .card {
                    border: 1px solid #e2e8f0;
                    border-radius: 10px;
                    padding: 16px;
                    margin-bottom: 24px;
                }

                .table-data {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 10px;
                }

                .table-data th {
                    text-align: left;
                    background-color: #f8fafc;
                    padding: 10px 12px;
                    font-size: 12px;
                    font-weight: 600;
                    color: #4b5563;
                    border-bottom: 1px solid #e2e8f0;
                }

                .table-data td {
                    padding: 12px;
                    border-bottom: 1px solid #f3f4f6;
                    font-size: 13px;
                }

                /* Feeds/Memos area */
                .feed-item {
                    border-left: 3px solid #5B47E0;
                    padding-left: 12px;
                    margin-bottom: 16px;
                }

                .feed-item-header {
                    font-size: 12px;
                    font-weight: 600;
                    color: #4b5563;
                    margin-bottom: 4px;
                }

                .feed-item-body {
                    font-size: 13px;
                    color: #1f2937;
                }

                /* Footer */
                .print-footer {
                    margin-top: 50px;
                    text-align: center;
                    font-size: 11px;
                    color: #9ca3af;
                    border-top: 1px solid #e5e7eb;
                    padding-top: 15px;
                }

                @media print {
                    body {
                        padding: 0;
                    }
                    button {
                        display: none !important;
                    }
                }
            </style>
        </head>
        <body>
            <!-- Header bar -->
            <div class="report-header">
                <div class="logo-container">
                    <img src="logobatir.png" alt="LogoBatir">
                </div>
                <div class="report-title-container">
                    <h1 class="report-title">RAPPORT DE CHANTIER</h1>
                    <p class="report-date">Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}</p>
                </div>
            </div>

            <div class="grid-two-cols">
                <!-- Info card -->
                <div>
                    <h2 class="section-title">Fiche d'identité</h2>
                    <table class="info-table">
                        <tr>
                            <td class="label">Nom du chantier</td>
                            <td class="value">${ch.name}</td>
                        </tr>
                        <tr>
                            <td class="label">Client</td>
                            <td class="value">${ch.client}</td>
                        </tr>
                        <tr>
                            <td class="label">Adresse</td>
                            <td class="value">${ch.address}</td>
                        </tr>
                        <tr>
                            <td class="label">Statut</td>
                            <td class="value">${ch.status}</td>
                        </tr>
                    </table>
                </div>

                <!-- Hours Budget card -->
                <div>
                    <h2 class="section-title">Suivi des heures</h2>
                    <div class="budget-progress-container">
                        <table class="info-table" style="margin-bottom: 10px;">
                            <tr>
                                <td style="padding: 0; border: none;" class="label">Budget Total</td>
                                <td style="padding: 0; border: none;" class="value">${ch.budgetHours} h</td>
                            </tr>
                            <tr style="border: none;">
                                <td style="padding: 6px 0 0 0; border: none;" class="label">Heures consomées</td>
                                <td style="padding: 6px 0 0 0; border: none;" class="value">${ch.workedHours} h</td>
                            </tr>
                        </table>
                        <div class="progress-bar-bg">
                            <div class="progress-bar-fill" style="width: ${pct}%;"></div>
                        </div>
                        <div style="font-size: 12px; color: #6b7280; font-weight: 500;">
                            Consommé à ${pct}% du budget alloué.
                        </div>
                    </div>
                </div>
            </div>

            <!-- Team assignments -->
            <h2 class="section-title">Équipe affectée</h2>
            <div class="card" style="padding: 0; overflow: hidden;">
                <table class="table-data">
                    <thead>
                        <tr>
                            <th>Compagnon</th>
                            <th>Rôle</th>
                            <th>Téléphone</th>
                            <th>Type</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${assignments.length === 0 
                            ? `<tr><td colspan="4" style="text-align: center; color: #9ca3af; font-style: italic;">Aucun compagnon actuellement affecté à ce chantier.</td></tr>` 
                            : assignments.map(u => `
                                <tr>
                                    <td style="font-weight: 600;">${u.firstname} ${u.lastname}</td>
                                    <td>${u.role}</td>
                                    <td>${u.phone || 'Non renseigné'}</td>
                                    <td>${u.type}</td>
                                </tr>
                            `).join('')
                        }
                    </tbody>
                </table>
            </div>

            <!-- Recent activity feeds / memos -->
            <h2 class="section-title">Dernières actualités / Mémos</h2>
            <div class="card">
                ${feeds.length === 0 
                    ? `<div style="color: #9ca3af; font-style: italic; font-size: 13px;">Aucune actualité ou note récente publiée pour ce chantier.</div>` 
                    : feeds.slice(0, 5).map(f => `
                        <div class="feed-item">
                            <div class="feed-item-header">Par ${f.author} — le ${f.time || 'Récemment'}</div>
                            <div class="feed-item-body">${f.content}</div>
                        </div>
                    `).join('')
                }
            </div>

            <!-- Documents -->
            <h2 class="section-title">Documents de chantier</h2>
            <div class="card" style="padding: 0; overflow: hidden;">
                <table class="table-data">
                    <thead>
                        <tr>
                            <th>Nom du document</th>
                            <th>Taille</th>
                            <th>Auteur</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${documents.length === 0 
                            ? `<tr><td colspan="3" style="text-align: center; color: #9ca3af; font-style: italic;">Aucun document partagé sur ce chantier.</td></tr>` 
                            : documents.map(d => `
                                <tr>
                                    <td style="font-weight: 500;">📄 ${d.name}</td>
                                    <td>${d.file_size}</td>
                                    <td>${d.author}</td>
                                </tr>
                            `).join('')
                        }
                    </tbody>
                </table>
            </div>

            <!-- Print Footer -->
            <div class="print-footer">
                Document confidentiel généré par la plateforme LogoBatir Planning.
            </div>

            <script>
                // Wait for the window to load its resources (like images if any), then print
                window.onload = function() {
                    window.print();
                };
            </script>
        </body>
        </html>
    `);

    printWindow.document.close();
}

// =============================================================================
// ROLE PERMISSIONS & ACCESS CONTROL LOGIC
// =============================================================================

function checkDelegationRole() {
    if (!currentUserProfile) return;
    const todayStr = new Date().toISOString().split('T')[0];
    const activeDels = delegations.filter(d => {
        return d.worker_id === currentUserProfile.id && 
               todayStr >= d.start_date && 
               todayStr <= d.end_date;
    });
    if (activeDels.length > 0) {
        console.log(`L'utilisateur dispose de ${activeDels.length} délégation(s) active(s) aujourd'hui.`);
    }
}

function hasEditPermissionForChantier(chantierId) {
    if (isAdmin) return true;
    if (isChef) return true;

    if (currentUserProfile) {
        const todayStr = new Date().toISOString().split('T')[0];
        const activeDel = delegations.find(d => {
            const hasCh = d.chantier_ids ? d.chantier_ids.includes(chantierId) : (d.chantier_id === chantierId);
            return d.worker_id === currentUserProfile.id && 
                   hasCh &&
                   todayStr >= d.start_date && 
                   todayStr <= d.end_date;
        });
        if (activeDel) return true;
    }
    return false;
}

function applyRolePermissions() {
    const toggleChantiers = document.getElementById('plan-toggle-chantiers');
    const toggleUsers = document.getElementById('plan-toggle-users');

    // ─── Reset sidebar nav links to default (all visible) ────────────────────
    const allTabs = ['dashboard', 'memos', 'users', 'chantiers', 'planning', 'hours', 'settings'];
    allTabs.forEach(tab => {
        const el = document.querySelector(`.sidebar-nav [data-tab="${tab}"]`);
        if (el) el.style.display = '';
    });

    // ─── Reset toolbar/action buttons ────────────────────────────────────────
    const btnAddUser = document.getElementById('btn-open-user-modal');
    const btnAddChantier = document.getElementById('btn-open-chantier-modal');
    const btnDiffusion = document.getElementById('btn-open-diffusion-modal');
    const hoursToggleWrap = document.querySelector('.planning-type-toggle');  // Toggle Chantiers/Utilisateurs in hours
    const hoursFiltersRow = document.querySelector('.hours-filters-row');

    if (btnAddUser) btnAddUser.style.display = '';
    if (btnAddChantier) btnAddChantier.style.display = '';
    if (btnDiffusion) btnDiffusion.style.display = '';
    if (hoursToggleWrap) hoursToggleWrap.style.display = '';
    if (hoursFiltersRow) hoursFiltersRow.style.display = '';

    // ─── ADMIN ────────────────────────────────────────────────────────────────
    if (isAdmin) {
        // Show admin dashboard, hide worker dashboard
        const adminView = document.getElementById('admin-dashboard-view');
        const workerView = document.getElementById('worker-dashboard-view');
        if (adminView) adminView.style.display = 'block';
        if (workerView) workerView.style.display = 'none';

        // Planning toggle labels
        if (toggleChantiers && toggleUsers) {
            toggleChantiers.childNodes[toggleChantiers.childNodes.length - 1].textContent = ' Chantiers';
            toggleUsers.childNodes[toggleUsers.childNodes.length - 1].textContent = ' Utilisateurs';
        }
        return;
    }

    // ─── CHEF DE CHANTIER ─────────────────────────────────────────────────────
    if (isChef) {
        // Chef sees the admin dashboard (full planning view), NOT the worker card
        const adminView = document.getElementById('admin-dashboard-view');
        const workerView = document.getElementById('worker-dashboard-view');
        if (adminView) adminView.style.display = 'block';
        if (workerView) workerView.style.display = 'none';

        // Planning toggle labels renamed for chef
        if (toggleChantiers && toggleUsers) {
            toggleChantiers.childNodes[toggleChantiers.childNodes.length - 1].textContent = ' Planning Général';
            toggleUsers.childNodes[toggleUsers.childNodes.length - 1].textContent = ' Mon planning';
            currentPlanningView = 'users';
            toggleChantiers.classList.remove('active');
            toggleUsers.classList.add('active');
        }

        // Chef: hide user management tab
        const tabsToHide = ['users'];
        tabsToHide.forEach(tab => {
            const el = document.querySelector(`.sidebar-nav [data-tab="${tab}"]`);
            if (el) el.style.display = 'none';
        });

        // Chef can use diffusion but not add users/chantiers
        if (btnAddUser) btnAddUser.style.display = 'none';
        if (btnAddChantier) btnAddChantier.style.display = 'none';

        return;
    }

    // ─── OUVRIER ──────────────────────────────────────────────────────────────
    const adminView = document.getElementById('admin-dashboard-view');
    const workerView = document.getElementById('worker-dashboard-view');
    if (adminView) adminView.style.display = 'none';
    if (workerView) workerView.style.display = 'flex';

    // Planning toggle labels renamed for ouvrier
    if (toggleChantiers && toggleUsers) {
        toggleChantiers.childNodes[toggleChantiers.childNodes.length - 1].textContent = ' Planning Général';
        toggleUsers.childNodes[toggleUsers.childNodes.length - 1].textContent = ' Mon planning';
        // Set default to "Mon planning" for workers
        currentPlanningView = 'users';
        toggleChantiers.classList.remove('active');
        toggleUsers.classList.add('active');
    }

    // Tabs to hide in sidebar depending on role
    const tabsToHide = isOuvrier ? ['users', 'chantiers', 'settings'] : ['users'];
    tabsToHide.forEach(tab => {
        const el = document.querySelector(`.sidebar-nav [data-tab="${tab}"]`);
        if (el) el.style.display = 'none';
    });

    // ─── Masquage des boutons réservés aux admins/chefs ───────────────────────
    if (isOuvrier) {
        // Masquer les boutons de création (admin only)
        if (btnAddUser) btnAddUser.style.display = 'none';
        if (btnAddChantier) btnAddChantier.style.display = 'none';

        // Masquer le toggle chantiers/utilisateurs dans les heures (ouvrier voit uniquement ses heures)
        if (hoursToggleWrap) hoursToggleWrap.style.display = 'none';

        // Masquer les filtres de sélection chantier/état dans les heures (pas pertinents pour un ouvrier)
        if (hoursFiltersRow) hoursFiltersRow.style.display = 'none';

        // Forcer la vue chantiers dans les heures pour l'ouvrier (ses heures par chantier)
        currentHoursView = 'chantiers';
    }

    if (!isAdmin) {
        // Chef et Ouvrier : masquer le bouton diffusion si pas admin
        // Chef peut le voir (géré dans initDiffusionFeatures), ouvrier non
        if (isOuvrier && btnDiffusion) btnDiffusion.style.display = 'none';
    }

    // Populate worker dashboard content
    let user = currentUserProfile;
    if (!user) {
        // Fallback user: Pierre Dubois
        user = users.find(u => u.id === 'cedbd55d-7fa3-47d9-8453-97cf81c4d756') || users[3];
    }

    const displayName = user ? `${user.firstname} ${user.lastname}` : 'Compagnon';
    const welcomeTitle = document.getElementById('worker-welcome-title');
    if (welcomeTitle) welcomeTitle.textContent = `Bonjour, ${displayName} !`;

    // Find assigned chantier
    let assignedChantier = null;
    for (const chId in planningAllocations) {
        if (planningAllocations[chId][user.id]) {
            assignedChantier = chantiers.find(c => c.id === chId);
            break;
        }
    }

    // Populate Active Chantier Card
    const chantierCard = document.getElementById('worker-active-chantier-card');
    if (chantierCard) {
        if (assignedChantier) {
            chantierCard.innerHTML = `
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    <span style="font-weight: 800; font-size: 16px; color: var(--text-primary);">${assignedChantier.name}</span>
                    <span style="font-size: 12px; color: var(--gray-muted); text-transform: uppercase; font-weight: 700;">Client: ${assignedChantier.client || 'Client'}</span>
                    <span style="font-size: 13px; color: var(--text-secondary); display: flex; align-items: center; gap: 6px;">
                        <img src="place.svg" alt="Adresse" style="width: 16px; height: 16px; filter: brightness(0) saturate(100%) invert(37%) sepia(93%) saturate(5437%) hue-rotate(239deg) brightness(96%) contrast(102%);">
                        ${assignedChantier.address || 'Adresse non spécifiée'}
                    </span>
                    <span style="font-size: 11px; margin-top: 4px; font-weight: 700; color: ${assignedChantier.status === 'Ouvert' ? 'var(--green)' : '#ef4444'};">
                        ● Chantier ${assignedChantier.status}
                    </span>
                </div>
            `;
        } else {
            chantierCard.innerHTML = `<div class="empty-state">Aucun chantier affecté cette semaine</div>`;
        }
    }

    // Populate Schedule details
    const scheduleCard = document.getElementById('worker-schedule-details');
    if (scheduleCard) {
        const daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
        const allocation = assignedChantier ? planningAllocations[assignedChantier.id]?.[user.id] : null;
        const assignedDays = allocation ? allocation.days : [];
        const hoursText = allocation ? allocation.hours : '08:00 - 17:00';

        if (assignedChantier && assignedDays.length > 0) {
            scheduleCard.innerHTML = daysOfWeek.map((day, idx) => {
                const isAssigned = assignedDays.includes(idx);
                return `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px solid #f1f5f9;">
                        <span style="font-weight: 700; font-size: 13px; color: #475569;">${day}</span>
                        <span style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 99px; ${isAssigned ? 'background: #dcfce7; color: #15803d;' : 'background: #f1f5f9; color: #64748b;'}">
                            ${isAssigned ? hoursText : 'Libre'}
                        </span>
                    </div>
                `;
            }).join('');
        } else {
            scheduleCard.innerHTML = `<div class="empty-state">Aucun jour planifié cette semaine</div>`;
        }
    }

    // Populate Worker Hours Preview Card (Total + 5-day mini bar + Validation status)
    const hoursPreviewContainer = document.getElementById('worker-hours-preview-container');
    if (hoursPreviewContainer) {
        const shortDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'];
        let totalHoursFloat = 0;
        let dayHoursList = [0, 0, 0, 0, 0];
        let isValidated = true;
        let hasAnyAllocation = false;

        if (assignedChantier) {
            const userHoursObj = hoursAllocations[assignedChantier.id]?.[user.id] || {};
            const userPlanningObj = planningAllocations[assignedChantier.id]?.[user.id] || { days: [0, 1, 2, 3, 4] };

            for (let dayIdx = 0; dayIdx < 5; dayIdx++) {
                if (userPlanningObj.days && userPlanningObj.days.includes(dayIdx)) {
                    hasAnyAllocation = true;
                    let valStr = userHoursObj[dayIdx] || '08:00';
                    let hVal = 8.0;

                    if (valStr.includes(':')) {
                        const parts = valStr.split(':');
                        hVal = parseFloat(parts[0]) + (parseFloat(parts[1]) / 60);
                    } else if (!isNaN(parseFloat(valStr))) {
                        hVal = parseFloat(valStr);
                    }

                    if (valStr === 'À compléter' || valStr === '00:00') {
                        isValidated = false;
                        hVal = 0;
                    }

                    dayHoursList[dayIdx] = hVal;
                    totalHoursFloat += hVal;
                }
            }
        }

        const totalHoursFormatted = totalHoursFloat > 0 ? totalHoursFloat.toFixed(1) + ' h' : '0.0 h';
        const statusBadgeHtml = (!hasAnyAllocation || totalHoursFloat === 0) 
            ? `<span style="font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 99px; background: #f1f5f9; color: #64748b;">Aucune heure</span>`
            : (isValidated 
                ? `<span style="font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 99px; background: #dcfce7; color: #15803d; display: inline-flex; align-items: center; gap: 4px;">✓ Validées par le chef</span>`
                : `<span style="font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 99px; background: #fff7ed; color: #c2410c; display: inline-flex; align-items: center; gap: 4px;"><img src="sablier.svg" alt="Sablier" style="width: 14px; height: 14px; filter: brightness(0) saturate(100%) invert(32%) sepia(85%) saturate(2200%) hue-rotate(10deg) brightness(95%) contrast(98%);"> En attente de saisie</span>`
            );

        hoursPreviewContainer.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 14px; width: 100%; margin: 4px 0 8px 0;">
                <!-- Total + Status Header -->
                <div style="display: flex; justify-content: space-between; align-items: center; background: #f8fafc; padding: 12px 14px; border-radius: 10px; border: 1px solid #e2e8f0;">
                    <div>
                        <span style="font-size: 11px; font-weight: 700; color: var(--gray-muted); text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 2px;">Total Semaine</span>
                        <span style="font-family: var(--font-heading); font-size: 26px; font-weight: 800; color: var(--primary); font-feature-settings: 'tnum';">${totalHoursFormatted}</span>
                    </div>
                    <div>
                        ${statusBadgeHtml}
                    </div>
                </div>

                <!-- 5-Day Mini Bar (Lun-Ven) -->
                <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; width: 100%;">
                    ${shortDays.map((dName, dIdx) => {
                        const hrs = dayHoursList[dIdx];
                        const isDone = hrs > 0;
                        const todayDay = new Date().getDay();
                        const isToday = (todayDay === (dIdx + 1));

                        const bgStyle = isDone ? 'background: #ede9fe; border: 1px solid #c4b5fd;' : 'background: #f8fafc; border: 1px solid #e2e8f0;';
                        const txtColor = isDone ? 'color: var(--accent);' : 'color: #94a3b8;';
                        const todayRing = isToday ? 'outline: 2px solid var(--accent); outline-offset: -1px;' : '';

                        return `
                            <div style="display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 8px 4px; border-radius: 8px; ${bgStyle} ${todayRing} text-align: center;">
                                <span style="font-size: 11px; font-weight: 700; color: #475569;">${dName}</span>
                                <span style="font-size: 12px; font-weight: 800; ${txtColor}">${isDone ? hrs + 'h' : '-'}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    // Bind worker view hours button to redirect to "hours" tab
    const btnViewHours = document.getElementById('btn-worker-view-hours');
    if (btnViewHours) {
        // Clone and replace to prevent duplicate events on re-init
        const newBtn = btnViewHours.cloneNode(true);
        btnViewHours.parentNode.replaceChild(newBtn, btnViewHours);
        
        newBtn.addEventListener('click', () => {
            switchTab('hours');
        });
    }

    const btnCloseHours = document.getElementById('btn-close-worker-hours-modal');
    if (btnCloseHours) {
        btnCloseHours.addEventListener('click', () => {
            const modal = document.getElementById('worker-hours-modal');
            if (modal) modal.classList.remove('show');
        });
    }

}

// =============================================================================
// DELEGATION & INTÉRIM LOGIC
// =============================================================================

function renderDelegations() {
    const tbody = document.getElementById('delegations-table-tbody');
    if (!tbody) return;

    if (delegations.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; color: var(--gray-muted); font-style: italic; padding: 20px;">Aucune délégation active ou planifiée.</td>
            </tr>
        `;
        return;
    }

    const todayStr = new Date().toISOString().split('T')[0];

    tbody.innerHTML = delegations.map(del => {
        const worker = users.find(u => u.id === del.worker_id);
        const workerName = worker ? `${worker.firstname} ${worker.lastname}` : 'Compagnon inconnu';
        
        // Get multiple chantier names
        let authorizedChantiers = [];
        if (del.chantier_ids && Array.isArray(del.chantier_ids)) {
            authorizedChantiers = del.chantier_ids.map(cId => {
                const c = chantiers.find(proj => proj.id === cId);
                return c ? c.name : 'Chantier inconnu';
            });
        } else if (del.chantier_id) {
            const c = chantiers.find(proj => proj.id === del.chantier_id);
            authorizedChantiers = [c ? c.name : 'Chantier inconnu'];
        }
        const chantiersListText = authorizedChantiers.join(', ');

        let statusBadge = '<span class="badge badge-gray" style="background-color: #f1f5f9; color: #64748b; padding: 4px 8px; border-radius: 99px; font-size: 11px; font-weight: 700;">Planifié</span>';
        if (todayStr >= del.start_date && todayStr <= del.end_date) {
            statusBadge = '<span class="badge badge-success" style="background-color: #dcfce7; color: #15803d; padding: 4px 8px; border-radius: 99px; font-size: 11px; font-weight: 700;">Actif</span>';
        } else if (todayStr > del.end_date) {
            statusBadge = '<span class="badge badge-gray" style="background-color: #f1f5f9; color: #94a3b8; opacity: 0.6; padding: 4px 8px; border-radius: 99px; font-size: 11px; font-weight: 700;">Expiré</span>';
        }

        return `
            <tr>
                <td style="font-weight: 700; color: var(--text-primary); padding: 12px 16px;">${workerName}</td>
                <td style="font-weight: 500; color: var(--text-secondary); padding: 12px 16px; max-width: 250px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${chantiersListText}">${chantiersListText}</td>
                <td style="padding: 12px 16px;">${formatDateFr(del.start_date)}</td>
                <td style="padding: 12px 16px;">${formatDateFr(del.end_date)}</td>
                <td style="padding: 12px 16px;">${statusBadge}</td>
                <td style="text-align: center; padding: 12px 16px;">
                    <div style="display: flex; gap: 8px; justify-content: center;">
                        <button class="btn-action" onclick="editDelegation('${del.id}')" title="Modifier" style="border: none; background: none; cursor: pointer; padding: 4px; display: inline-flex; align-items: center; justify-content: center;">
                            <img src="edit.svg" alt="Modifier" style="width: 22px; height: 22px; filter: brightness(0) saturate(100%) invert(37%) sepia(93%) saturate(5437%) hue-rotate(239deg) brightness(96%) contrast(102%);">
                        </button>
                        <button class="btn-action text-danger" onclick="deleteDelegation('${del.id}')" title="Annuler la délégation" style="border: none; background: none; cursor: pointer; padding: 4px; display: inline-flex; align-items: center; justify-content: center;">
                            <img src="bin.svg" alt="Supprimer" style="width: 22px; height: 22px; filter: brightness(0) saturate(100%) invert(27%) sepia(85%) saturate(5437%) hue-rotate(350deg) brightness(96%) contrast(102%);">
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function formatDateFr(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

async function deleteDelegation(delId) {
    if (await showCustomConfirm("Voulez-vous vraiment annuler cette délégation de droits ?")) {
        delegations = delegations.filter(d => d.id !== delId);
        localStorage.setItem('foreman_delegations', JSON.stringify(delegations));
        
        // Refresh UI
        renderDelegations();
        
        // Reload page to re-evaluate active roles instantly
        window.location.reload();
    }
}

function editDelegation(delId) {
    const del = delegations.find(d => d.id === delId);
    if (!del) return;

    // Reset Form first
    const form = document.getElementById('delegation-form');
    if (form) form.reset();

    document.getElementById('edit-delegation-id').value = del.id;
    
    // Populate Worker select
    const workerSelect = document.getElementById('delegation-worker-select');
    if (workerSelect) {
        const companions = users.filter(u => {
            const role = (u.role || '').toLowerCase();
            return !role.includes('chef') && !role.includes('admin') && !role.includes('conducteur') && !role.includes('propri');
        });
        workerSelect.innerHTML = '<option value="">Sélectionnez un ouvrier...</option>' + 
            companions.map(u => `<option value="${u.id}" ${u.id === del.worker_id ? 'selected' : ''}>${u.firstname} ${u.lastname} (${u.role})</option>`).join('');
    }

    // Populate Chantiers checkboxes
    const container = document.getElementById('delegation-chantiers-checkbox-list');
    if (container) {
        const selectedIds = del.chantier_ids || (del.chantier_id ? [del.chantier_id] : []);
        container.innerHTML = chantiers.map(c => {
            const isChecked = selectedIds.includes(c.id) ? 'checked' : '';
            return `
                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 13px; color: var(--text-primary);">
                    <input type="checkbox" name="delegation-chantiers" value="${c.id}" ${isChecked} style="accent-color: var(--accent);">
                    <span>${c.name}</span>
                </label>
            `;
        }).join('');
    }

    document.getElementById('delegation-start-date').value = del.start_date;
    document.getElementById('delegation-end-date').value = del.end_date;

    const modalTitle = document.querySelector('#delegation-modal .modal-title');
    if (modalTitle) modalTitle.textContent = "Modifier la délégation de droits";

    document.getElementById('delegation-modal').classList.add('show');
}

function initDelegationFeatures() {
    const form = document.getElementById('delegation-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const editId = document.getElementById('edit-delegation-id').value;
            const workerId = document.getElementById('delegation-worker-select').value;
            const startDate = document.getElementById('delegation-start-date').value;
            const endDate = document.getElementById('delegation-end-date').value;

            // Collect checkboxes values
            const checkboxes = document.querySelectorAll('input[name="delegation-chantiers"]:checked');
            const chantierIds = Array.from(checkboxes).map(cb => cb.value);

            if (chantierIds.length === 0) {
                alert("Veuillez sélectionner au moins un chantier !");
                return;
            }

            if (startDate > endDate) {
                alert("La date de début doit être antérieure ou égale à la date de fin !");
                return;
            }

            if (editId) {
                // Modify existing
                const idx = delegations.findIndex(d => d.id === editId);
                if (idx !== -1) {
                    delegations[idx].worker_id = workerId;
                    delegations[idx].chantier_ids = chantierIds;
                    delegations[idx].start_date = startDate;
                    delegations[idx].end_date = endDate;
                    // Delete old single chantier_id field to clean data
                    delete delegations[idx].chantier_id;
                }
            } else {
                // Create new
                const newDel = {
                    id: 'del_' + Date.now(),
                    worker_id: workerId,
                    chantier_ids: chantierIds,
                    start_date: startDate,
                    end_date: endDate
                };
                delegations.push(newDel);
            }

            localStorage.setItem('foreman_delegations', JSON.stringify(delegations));
            
            // Close modal
            document.getElementById('delegation-modal').classList.remove('show');
            form.reset();

            // Refresh UI
            renderDelegations();
            
            // Reload page to apply roles instantly if the active worker was delegated
            window.location.reload();
        });
    }

    const btnOpen = document.getElementById('btn-open-delegation-modal');
    if (btnOpen) {
        btnOpen.addEventListener('click', () => {
            document.getElementById('edit-delegation-id').value = '';
            const modalTitle = document.querySelector('#delegation-modal .modal-title');
            if (modalTitle) modalTitle.textContent = "Déléguer les droits de pointage";

            const workerSelect = document.getElementById('delegation-worker-select');
            if (workerSelect) {
                const companions = users.filter(u => {
                    const role = (u.role || '').toLowerCase();
                    return !role.includes('chef') && !role.includes('admin') && !role.includes('conducteur') && !role.includes('propri');
                });
                workerSelect.innerHTML = '<option value="">Sélectionnez un ouvrier...</option>' + 
                    companions.map(u => `<option value="${u.id}">${u.firstname} ${u.lastname} (${u.role})</option>`).join('');
            }

            const container = document.getElementById('delegation-chantiers-checkbox-list');
            if (container) {
                container.innerHTML = chantiers.map(c => `
                    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 13px; color: var(--text-primary);">
                        <input type="checkbox" name="delegation-chantiers" value="${c.id}" style="accent-color: var(--accent);">
                        <span>${c.name}</span>
                    </label>
                `).join('');
            }
            
            document.getElementById('delegation-modal').classList.add('show');
        });
    }

    const btnClose = document.getElementById('btn-close-delegation-modal');
    const btnCancel = document.getElementById('btn-cancel-delegation-modal');
    [btnClose, btnCancel].forEach(btn => {
        if (btn) {
            btn.addEventListener('click', () => {
                document.getElementById('delegation-modal').classList.remove('show');
            });
        }
    });
}

// =============================================================================
// PLANNING DIFFUSION LOGIC
// =============================================================================

function formatPhoneForWhatsApp(phoneStr) {
    if (!phoneStr) return '';
    let cleaned = phoneStr.replace(/\s+/g, '');
    if (cleaned.startsWith('0')) {
        cleaned = '+33' + cleaned.substring(1);
    }
    return cleaned;
}

function getWorkerWeeklyMessage(workerId, channel = 'whatsapp') {
    const worker = users.find(u => u.id === workerId);
    if (!worker) return '';

    const daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
    const shortDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'];

    if (channel === 'sms') {
        // Ultra-concise SMS format to avoid Twilio trial limits and save costs
        let message = `Planning ${worker.firstname} :\n`;
        let hasAnyAlloc = false;

        daysOfWeek.forEach((day, dayIdx) => {
            let assignedChantier = null;
            let hoursRange = '08:00-17:00';
            
            for (const chId in planningAllocations) {
                const alloc = planningAllocations[chId][workerId];
                if (alloc && alloc.days.includes(dayIdx)) {
                    assignedChantier = chantiers.find(c => c.id === chId);
                    hoursRange = (alloc.hours || '08:00-17:00').replace(/\s+/g, '');
                    break;
                }
            }

            if (assignedChantier) {
                hasAnyAlloc = true;
                message += `${shortDays[dayIdx]}: ${assignedChantier.name} (${hoursRange})\n`;
            }
        });

        if (!hasAnyAlloc) {
            return `Aucun chantier planifie pour ${worker.firstname} cette semaine.`;
        }

        return message.trim();
    }

    let message = `👷 *BATIR - Votre planning de la semaine*\n\nBonjour ${worker.firstname}, voici vos affectations pour cette semaine :\n\n`;
    let hasAnyAlloc = false;

    daysOfWeek.forEach((day, dayIdx) => {
        // Find if worker is assigned to any project on this day
        let assignedChantier = null;
        let hoursRange = '08:00 - 17:00';
        
        for (const chId in planningAllocations) {
            const alloc = planningAllocations[chId][workerId];
            if (alloc && alloc.days.includes(dayIdx)) {
                assignedChantier = chantiers.find(c => c.id === chId);
                hoursRange = alloc.hours || '08:00 - 17:00';
                break;
            }
        }

        if (assignedChantier) {
            hasAnyAlloc = true;
            // Find other companions assigned to this chantier on this day
            const team = [];
            const pAllocs = hoursAllocations[assignedChantier.id] || {};
            for (const uId in pAllocs) {
                if (uId !== workerId) {
                    const u = users.find(usr => usr.id === uId);
                    const alloc = planningAllocations[assignedChantier.id]?.[uId];
                    if (u && alloc && alloc.days.includes(dayIdx)) {
                        team.push(`${u.firstname} ${u.lastname}`);
                    }
                }
            }
            const teamText = team.length > 0 ? `\n👥 *Équipe* : ${team.join(', ')}` : '';
            message += `📍 *${day}* : ${hoursRange}\n➡ ${assignedChantier.name}${teamText}\n\n`;
        } else {
            message += `📍 *${day}* : Repos / Libre\n\n`;
        }
    });

    if (!hasAnyAlloc) {
        return `👷 *BATIR - Votre planning de la semaine*\n\nBonjour ${worker.firstname}, aucun chantier ne vous a été affecté pour cette semaine.\n\nBonne semaine !`;
    }

    message += `Bonne semaine à vous !`;
    return message;
}

function getGeneralPlanningLink() {
    return `Planning General: ${window.location.origin}`;
}

function sendPersonalPlanning(workerId, phone) {
    const text = getWorkerWeeklyMessage(workerId, 'whatsapp');
    const encoded = encodeURIComponent(text);
    const waPhone = formatPhoneForWhatsApp(phone);
    const url = `https://wa.me/${waPhone}?text=${encoded}`;
    window.open(url, '_blank');
}

function sendGeneralPlanning(phone) {
    const text = `👷 *BATIR - Planning Général*\n\n` + getGeneralPlanningLink();
    const encoded = encodeURIComponent(text);
    const waPhone = formatPhoneForWhatsApp(phone);
    const url = `https://wa.me/${waPhone}?text=${encoded}`;
    window.open(url, '_blank');
}

function sendBothPlannings(workerId, phone) {
    const personalText = getWorkerWeeklyMessage(workerId, 'whatsapp');
    const generalText = getGeneralPlanningLink();
    const combined = `${personalText}\n\n🌐 ${generalText}`;
    const encoded = encodeURIComponent(combined);
    const waPhone = formatPhoneForWhatsApp(phone);
    const url = `https://wa.me/${waPhone}?text=${encoded}`;
    window.open(url, '_blank');
}

async function updateWorkerPhone(userId, newPhone) {
    // Update local users array
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
        users[userIndex].phone = newPhone;
    }

    // Persist to Supabase if connected
    if (useSupabase && supabaseClient) {
        try {
            const { error } = await supabaseClient
                .from('utilisateurs')
                .update({ phone: newPhone })
                .eq('id', userId);
            if (error) {
                console.error("Erreur de mise à jour du téléphone sur Supabase:", error.message);
            } else {
                console.log(`Téléphone mis à jour avec succès pour l'utilisateur ${userId}`);
            }
        } catch (err) {
            console.error("Exception lors de la mise à jour du téléphone:", err);
        }
    }
}

// --- Inline SVG helpers for Diffusion Modal ---
const SVG_SPREAD = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-5.0 -10.0 110.0 135.0" width="26" height="26" fill="currentColor"><g><path d="m62.5 34.723h-20.832c-2.2969 0-4.168 1.8672-4.168 4.168v1.3906h-1.3906c-2.2969 0-4.168 1.8672-4.168 4.168v16.668c0 2.2969 1.8672 4.168 4.168 4.168h26.391c2.2969 0 4.1641-1.8711 4.1641-4.168v-22.223c0-2.2969-1.8672-4.168-4.168-4.168zm-26.391 27.777c-0.76562 0-1.3906-0.625-1.3906-1.3906v-16.668c0-0.76562 0.62109-1.3906 1.3906-1.3906h20.832c0.76562 0 1.3906 0.625 1.3906 1.3906v16.668c0 0.48828 0.085938 0.95312 0.23828 1.3906zm27.781-1.3906c0 0.76562-0.62109 1.3906-1.3906 1.3906-0.76562 0-1.3906-0.625-1.3906-1.3906v-16.668c0-2.2969-1.8672-4.168-4.168-4.168h-16.668v-1.3906c0-0.76562 0.62109-1.3906 1.3906-1.3906h20.832c0.76562 0 1.3906 0.625 1.3906 1.3906v22.223z"/><path d="m54.168 47.223h-9.7227c-0.76953 0-1.3906 0.62109-1.3906 1.3906 0 0.76562 0.62109 1.3906 1.3906 1.3906h9.7227c0.76953 0 1.3906-0.62109 1.3906-1.3906 0-0.76562-0.62109-1.3906-1.3906-1.3906z"/><path d="m54.168 51.391h-15.277c-0.76953 0-1.3906 0.62109-1.3906 1.3906 0 0.76562 0.62109 1.3906 1.3906 1.3906h15.277c0.76953 0 1.3906-0.62109 1.3906-1.3906 0-0.76562-0.62109-1.3906-1.3906-1.3906z"/><path d="m54.168 55.555h-15.277c-0.76953 0-1.3906 0.62109-1.3906 1.3906 0 0.76563 0.62109 1.3906 1.3906 1.3906h15.277c0.76953 0 1.3906-0.62109 1.3906-1.3906 0-0.76562-0.62109-1.3906-1.3906-1.3906z"/><path d="m88.891 81.945c-1.4141 0-2.7266 0.42969-3.8242 1.1562l-13.516-13.516c1.9727-2.168 3.6211-4.6289 4.875-7.3164l5.5938 2.2734c-0.03125 0.24219-0.074219 0.48438-0.074219 0.73438 0 3.0625 2.4922 5.5547 5.5547 5.5547s5.5547-2.4922 5.5547-5.5547-2.4922-5.5547-5.5547-5.5547c-1.8203 0-3.4219 0.89062-4.4375 2.2461l-5.5898-2.2695c1.0781-3.0391 1.6914-6.2969 1.6914-9.6992 0-4.0508-0.83203-7.9062-2.332-11.414l9.2227-4.457c1.0195 1.2031 2.5234 1.9805 4.2188 1.9805 3.0625 0 5.5547-2.4922 5.5547-5.5547s-2.4922-5.5547-5.5547-5.5547-5.5547 2.4922-5.5547 5.5547c0 0.37109 0.039062 0.73047 0.10938 1.082l-9.207 4.4453c-1.9648-3.6055-4.6875-6.7305-7.9258-9.2148l4.5703-6.6016c0.83984 0.35938 1.7617 0.5625 2.7305 0.5625 3.8281 0 6.9453-3.1172 6.9453-6.9453 0-3.8281-3.1172-6.9453-6.9453-6.9453s-6.9453 3.1172-6.9453 6.9453c0 1.8594 0.74219 3.5391 1.9375 4.7891l-4.5742 6.6094c-4.4805-2.8047-9.7539-4.4531-15.418-4.4531-7.543 0-14.402 2.9023-19.586 7.6172l-11.129-11.129c0.97266-1.3633 1.5469-3.0234 1.5469-4.8203 0-4.5938-3.7383-8.332-8.332-8.332s-8.332 3.7383-8.332 8.332 3.7383 8.332 8.332 8.332c1.7969 0 3.457-0.57812 4.8203-1.5469l11.129 11.129c-4.7148 5.1836-7.6172 12.043-7.6172 19.586 0 6.707 2.2969 12.871 6.1172 17.805l-9.0977 7.7617c-1.4492-1.2188-3.3164-1.9531-5.3516-1.9531-4.5938 0-8.332 3.7383-8.332 8.332s3.7383 8.332 8.332 8.332 8.332-3.7383 8.332-8.332c0-1.5586-0.4375-3.0117-1.1836-4.2578l9.1055-7.7656c5.3242 5.6758 12.867 9.25 21.246 9.25 7.543 0 14.402-2.9023 19.586-7.6172l13.516 13.516c-0.72656 1.0977-1.1562 2.4102-1.1562 3.8242 0 3.8281 3.1172 6.9453 6.9453 6.9453s6.9453-3.1172 6.9453-6.9453-3.1172-6.9453-6.9453-6.9453zm-1.3906-19.445c1.5312 0 2.7773 1.2461 2.7773 2.7773s-1.2461 2.7773-2.7773 2.7773-2.7773-1.2461-2.7773-2.7773c0-0.35547 0.074219-0.69531 0.19531-1.0117 0.003906-0.011719 0.015625-0.023437 0.019531-0.035156 0.007812-0.015625 0.003906-0.035157 0.007812-0.050781 0.42578-0.98828 1.4102-1.6797 2.5508-1.6797zm2.7773-34.723c1.5312 0 2.7773 1.2461 2.7773 2.7773s-1.2461 2.7773-2.7773 2.7773-2.7773-1.2461-2.7773-2.7773 1.2461-2.7773 2.7773-2.7773zm-15.277-18.055c2.2969 0 4.168 1.8672 4.168 4.168 0 2.2969-1.8672 4.168-4.168 4.168-2.2969 0-4.168-1.8672-4.168-4.168 0-2.2969 1.8672-4.168 4.168-4.168zm-62.5 77.777c-3.0625 0-5.5547-2.4922-5.5547-5.5547s2.4922-5.5547 5.5547-5.5547 5.5547 2.4922 5.5547 5.5547-2.4922 5.5547-5.5547 5.5547zm-5.5547-75c0-3.0625 2.4922-5.5547 5.5547-5.5547s5.5547 2.4922 5.5547 5.5547-2.4922 5.5547-5.5547 5.5547-5.5547-2.4922-5.5547-5.5547zm16.664 37.5c0-14.551 11.84-26.391 26.391-26.391s26.391 11.84 26.391 26.391-11.84 26.391-26.391 26.391-26.391-11.84-26.391-26.391zm65.281 43.055c-2.2969 0-4.168-1.8672-4.168-4.168 0-2.2969 1.8672-4.168 4.168-4.168 2.2969 0 4.168 1.8672 4.168 4.168 0 2.2969-1.8672 4.168-4.168 4.168z"/></g></svg>`;
const SVG_WHATSAPP = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-5.0 -10.0 110.0 135.0" width="26" height="26" fill="currentColor"><path d="m33.379 79.781c5.0781 2.8008 10.801 4.2695 16.621 4.2695 19.02 0 34.5-15.48 34.5-34.5s-15.48-34.5-34.5-34.5-34.5 15.48-34.5 34.5c0 6.1094 1.6094 12.09 4.6797 17.352l-4.3906 18.051zm1.832-46.352c0.73047-0.67188 1.6797-1.0312 2.6719-1.0312h1.0508c1.3906 0 2.6289 0.87109 3.1016 2.1719l2.1484 5.9219c0.19922 0.55859 0.10156 1.1797-0.26953 1.6484l-1.6992 2.1211c-0.67188 0.82812-0.85156 1.9609-0.46094 2.9492 2.0586 5.1797 8.1797 8.8203 11.379 10.422 1.1602 0.57813 2.5508 0.35938 3.4688-0.55078l1.8789-1.8789c0.44922-0.44922 1.1211-0.60938 1.7305-0.42188l5.6992 1.8203c1.3711 0.44141 2.3008 1.7109 2.3008 3.1484v1.4492c0 1.0586-0.42188 2.0781-1.1719 2.8281-5.5508 5.4805-14.762 1.4609-20.73-2.1992-4.3008-2.6406-8.0508-6.1094-10.84-10.32-6.75-10.188-2.6484-15.898-0.25781-18.078z"/></svg>`;
const SVG_PHONE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-5.0 -10.0 110.0 135.0" width="26" height="26" fill="currentColor"><path d="m33 7c-4.4141 0-8 3.5859-8 8v70c0 4.4141 3.5859 8 8 8h34c4.4141 0 8-3.5859 8-8v-70c0-4.4141-3.5859-8-8-8zm0 2h34c3.3398 0 6 2.6602 6 6v2h-46v-2c0-3.3398 2.6602-6 6-6zm-6 10h46v58h-46zm0 60h46v6c0 3.3398-2.6602 6-6 6h-34c-3.3398 0-6-2.6602-6-6zm23 4c-1.1055 0-2 0.89453-2 2s0.89453 2 2 2 2-0.89453 2-2-0.89453-2-2-2z"/></svg>`;
const SVG_MEN = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-5.0 -10.0 110.0 135.0" width="26" height="26" fill="currentColor"><path d="m60 26c3.3125 0 6 2.6875 6 6v24c0 1.6562-1.3438 3-3 3s-3-1.3438-3-3v-21.746c0-0.55469-0.44922-1.0039-1.0039-1.0039-0.55078 0-1 0.44531-1.0039 0.99609l-0.46094 51.52c-0.019531 1.7891-1.4766 3.2344-3.2656 3.2344-1.8047 0-3.2656-1.4609-3.2656-3.2656v-29.105c0-0.625-0.50391-1.1289-1.1289-1.1289-0.62109 0-1.125 0.5-1.1289 1.1211l-0.21484 28.891c-0.015625 1.9297-1.5859 3.4883-3.5156 3.4883-1.9375 0-3.5117-1.5742-3.5117-3.5117v-51.238c0-0.55078-0.44922-1-1-1s-1 0.44922-1 1v22c0 1.5195-1.2305 2.75-2.75 2.75s-2.75-1.2305-2.75-2.75v-24.25c0-3.3125 2.6875-6 6-6zm-9.5-15c3.5898 0 6.5 2.9102 6.5 6.5s-2.9102 6.5-6.5 6.5-6.5-2.9102-6.5-6.5 2.9102-6.5 6.5-6.5z"/></svg>`;
const SVG_MENS = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-5.0 -10.0 110.0 135.0" width="26" height="26" fill="currentColor"><path d="m26.594 41.266c-1.3906-1.3906-3.2812-2.1562-5.2344-2.1406l-4.0469 0.046875c-1.9062 0.015625-3.7188 0.78125-5.0781 2.125l-5.7812 5.7812c-0.82812 0.82812-0.82812 2.1719 0 3 0.40625 0.40625 0.95312 0.625 1.5 0.625s1.0938-0.20312 1.5-0.625l5.0469-5.0469v13.406l-2.6562 10.641c-0.046875 0.17188-0.0625 0.34375-0.0625 0.51562 0 0.95312 0.64062 1.8125 1.6094 2.0625 1.1406 0.28125 2.2812-0.40625 2.5625-1.5469l2.9062-11.672 0.53125-2.1406v-0.046875h0.015625v0.03125l0.53125 2.1406 2.8594 11.453c0.28125 1.1406 1.4219 1.8125 2.5625 1.5469 0.96875-0.23438 1.6094-1.1094 1.6094-2.0625 0-0.15625-0.015625-0.34375-0.0625-0.51562l-2.6406-10.562v-13.359l5.0469 5.0469c0.40625 0.40625 0.95312 0.625 1.5 0.625s1.0781-0.20312 1.5-0.625c0.82812-0.82812 0.82812-2.1719 0-3z"/><path d="m24.266 32.422c0 6.5-9.75 6.5-9.75 0s9.75-6.5 9.75 0z"/><path d="m57.375 41.844c-1.3906-1.3906-3.2812-2.1562-5.2344-2.1406l-4.0469 0.046875c-1.9062 0.015625-3.7188 0.78125-5.0781 2.125l-5.7812 5.7812c-0.82812 0.82812-0.82812 2.1719 0 3 0.40625 0.40625 0.95312 0.625 1.5 0.625s1.0938-0.20312 1.5-0.625l5.0469-5.0469v13.406l-2.6562 10.641c-0.046875 0.17188-0.0625 0.34375-0.0625 0.51562 0 0.95312 0.64062 1.8125 1.6094 2.0625 1.1406 0.28125 2.2812-0.40625 2.5625-1.5469l2.9062-11.672 0.53125-2.1406-0.015625-0.046875h0.015625v0.03125l0.53125 2.1406 2.8594 11.453c0.28125 1.1406 1.4219 1.8125 2.5625 1.5469 0.96875-0.23438 1.6094-1.1094 1.6094-2.0625 0-0.15625-0.015625-0.34375-0.0625-0.51562l-2.6406-10.562v-13.359l5.0469 5.0469c0.40625 0.40625 0.95312 0.625 1.5 0.625s1.0781-0.20312 1.5-0.625c0.82812-0.82812 0.82812-2.1719 0-3z"/><path d="m55.047 32.984c0 6.5-9.75 6.5-9.75 0s9.75-6.5 9.75 0z"/><path d="m93.531 47.719-5.7031-5.7031c-1.3906-1.3906-3.2812-2.1562-5.2344-2.1406l-4.0469 0.046875c-1.9062 0.015625-3.7188 0.78125-5.0781 2.125l-5.7812 5.7812c-0.82812 0.82812-0.82812 2.1719 0 3 0.40625 0.40625 0.95312 0.625 1.5 0.625s1.0938-0.20312 1.5-0.625l5.0469-5.0469v13.406l-2.6562 10.641c-0.046875 0.17188-0.0625 0.34375-0.0625 0.51562 0 0.95312 0.64062 1.8125 1.6094 2.0625 1.1406 0.28125 2.2812-0.40625 2.5625-1.5469l2.9062-11.672 0.53125-2.1406-0.015625-0.046875h0.015625v0.03125l0.53125 2.1406 2.8594 11.453c0.28125 1.1406 1.4219 1.8125 2.5625 1.5469 0.96875-0.23438 1.6094-1.1094 1.6094-2.0625 0-0.15625-0.015625-0.34375-0.0625-0.51562l-2.6406-10.562v-13.359l5.0469 5.0469c0.40625 0.40625 0.95312 0.625 1.5 0.625s1.0781-0.20312 1.5-0.625c0.82812-0.82812 0.82812-2.1719 0-3z"/><path d="m85.484 33.172c0 6.5-9.75 6.5-9.75 0s9.75-6.5 9.75 0z"/></svg>`;

function renderDiffusionModal() {
    const tbody = document.getElementById('diffusion-table-tbody');
    if (!tbody) return;

    // Filtrer uniquement les ouvriers/compagnons
    const companions = users.filter(u => {
        const role = (u.role || '').toLowerCase();
        return !role.includes('chef') && !role.includes('admin') && !role.includes('conducteur') && !role.includes('propri');
    });

    if (companions.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; color: var(--gray-muted); padding: 20px;">Aucun ouvrier enregistré.</td>
            </tr>
        `;
        return;
    }

    // Générer les lignes avec cases à cocher
    tbody.innerHTML = companions.map(u => {
        const phone = u.phone || '';
        const name = `${u.firstname} ${u.lastname}`;
        const whatsappLink = phone ? `https://wa.me/${formatPhoneForWhatsApp(phone)}?text=${encodeURIComponent(getWorkerWeeklyMessage(u.id, 'whatsapp'))}` : '';

        return `
            <tr class="diffusion-row" data-user-id="${u.id}" style="transition: background 0.15s;">
                <td style="text-align: center; padding: 10px 12px;">
                    <input type="checkbox" class="diffusion-user-checkbox" data-user-id="${u.id}" data-phone="${phone}" data-name="${name}"
                        style="accent-color: var(--accent); width: 17px; height: 17px; cursor: pointer;"
                        ${!phone ? 'disabled title="Pas de numéro de téléphone"' : ''}>
                </td>
                <td style="font-weight: 700; color: var(--text-primary); padding: 10px 16px;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="width: 32px; height: 32px; border-radius: 50%; background: var(--primary-light); color: var(--primary); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 13px; flex-shrink: 0;">
                            ${u.firstname.charAt(0)}${u.lastname.charAt(0)}
                        </div>
                        <span>${name}</span>
                    </div>
                </td>
                <td style="padding: 8px 16px;">
                    <input type="text" class="phone-edit-input" data-user-id="${u.id}" value="${phone}" placeholder="Non renseigné"
                        style="width: 100%; max-width: 150px; padding: 6px 10px; border: 1px solid var(--border-color); border-radius: 6px; font-size: 13px; transition: background-color 0.3s ease;">
                </td>
                <td style="text-align: center; padding: 10px 16px;">
                    <div style="display: flex; justify-content: center;">
                        <button class="btn btn-primary" onclick="sendSingleSMSViaBackend('${u.id}', '${phone}', 'perso')" style="padding: 6px 14px; font-size: 11px; background: var(--accent); display: inline-flex; align-items: center; gap: 6px; cursor: pointer; border-radius: 99px;">
                            Envoyer par SMS
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    // ── Tout sélectionner ──────────────────────────────────────────────────────
    const checkAll = document.getElementById('diffusion-check-all');
    const updateCounter = () => {
        const checked = document.querySelectorAll('.diffusion-user-checkbox:checked');
        const countEl = document.getElementById('diffusion-selected-count');
        if (countEl) countEl.textContent = checked.length;
        // Grisé si 0 sélectionné
        const btn = document.getElementById('btn-send-grouped');
        if (btn) btn.style.opacity = checked.length === 0 ? '0.5' : '1';
    };

    if (checkAll) {
        checkAll.checked = false;
        checkAll.addEventListener('change', () => {
            document.querySelectorAll('.diffusion-user-checkbox:not(:disabled)').forEach(cb => {
                cb.checked = checkAll.checked;
            });
            updateCounter();
        });
    }

    // Listeners sur chaque checkbox
    tbody.querySelectorAll('.diffusion-user-checkbox').forEach(cb => {
        cb.addEventListener('change', () => {
            updateCounter();
            // Décocher "Tout" si un est décoché
            if (checkAll && !cb.checked) checkAll.checked = false;
        });
    });
    updateCounter();

    // ── Envoi groupé : ouvre les liens WhatsApp en séquence ──────────────────
    const btnGrouped = document.getElementById('btn-send-grouped');
    if (btnGrouped) {
        // Remplacer l'event pour éviter les doublons
        const newBtn = btnGrouped.cloneNode(true);
        btnGrouped.parentNode.replaceChild(newBtn, btnGrouped);
        newBtn.addEventListener('click', async () => {
            const checked = document.querySelectorAll('.diffusion-user-checkbox:checked');
            if (checked.length === 0) {
                alert('Sélectionnez au moins un ouvrier.');
                return;
            }
            if (!(await showCustomConfirm(`Envoyer le planning par SMS à ${checked.length} ouvrier(s) ?`))) return;
            
            const messages = [];
            checked.forEach(cb => {
                const userId = cb.getAttribute('data-user-id');
                const phone = cb.getAttribute('data-phone');
                messages.push({
                    to: formatPhoneForWhatsApp(phone),
                    text: getWorkerWeeklyMessage(userId, 'sms')
                });
            });
            
            try {
                const response = await fetch('/api/send-sms-bulk', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ messages })
                });
                const result = await response.json();
                if (result.success) {
                    alert("SMS groupés envoyés avec succès !");
                } else {
                    alert("Erreur lors de l'envoi groupé : " + (result.error || "Erreur inconnue"));
                }
            } catch (err) {
                alert("Erreur réseau : " + err.message);
            }
        });
    }

    // ── Éditeurs de téléphone inline ──────────────────────────────────────────
    tbody.querySelectorAll('.phone-edit-input').forEach(input => {
        input.addEventListener('change', async (e) => {
            const userId = e.target.getAttribute('data-user-id');
            const newPhone = e.target.value.trim();
            e.target.style.backgroundColor = '#fef08a';
            await updateWorkerPhone(userId, newPhone);
            e.target.style.backgroundColor = '#dcfce7';
            setTimeout(() => { e.target.style.backgroundColor = ''; }, 1000);
            // Mettre à jour la data-phone du checkbox correspondant
            const cb = tbody.querySelector(`.diffusion-user-checkbox[data-user-id="${userId}"]`);
            if (cb) {
                cb.setAttribute('data-phone', newPhone);
                if (newPhone) { cb.disabled = false; cb.title = ''; }
            }
            renderDiffusionModal(); // Re-render pour afficher le lien
        });
    });
}

async function sendSingleSMSViaBackend(workerId, phone, mode) {
    if (!phone) {
        alert("Cet ouvrier n'a pas de numéro de téléphone !");
        return;
    }
    
    let text = '';
    if (mode === 'perso') {
        text = getWorkerWeeklyMessage(workerId, 'sms');
    } else if (mode === 'general') {
        text = `👷 *BATIR - Planning Général*\n\n` + getGeneralPlanningLink();
    } else {
        text = getWorkerWeeklyMessage(workerId, 'sms') + `\n\n🌐 ` + getGeneralPlanningLink();
    }

    if (!(await showCustomConfirm(`Envoyer ce SMS à ${phone} ?`))) return;

    try {
        const response = await fetch('/api/send-sms-bulk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [{
                    to: formatPhoneForWhatsApp(phone),
                    text: text
                }]
            })
        });

        const result = await response.json();
        if (result.success && result.results[0].success) {
            alert("SMS envoyé avec succès !");
        } else {
            alert("Erreur lors de l'envoi : " + (result.error || result.results[0].error));
        }
    } catch (err) {
        alert("Erreur réseau : " + err.message);
    }
}

function initDiffusionFeatures() {
    const btnOpen = document.getElementById('btn-open-diffusion-modal');
    if (btnOpen) {
        // Bouton visible pour Admin & Chef uniquement
        btnOpen.style.display = (isAdmin || isChef) ? 'inline-flex' : 'none';

        btnOpen.addEventListener('click', () => {
            console.log("Diffuser planning button clicked");
            const modal = document.getElementById('diffusion-modal');
            console.log("Modal element found:", modal);
            renderDiffusionModal();
            if (modal) {
                modal.classList.add('show');
                console.log("Added 'show' class to modal. Current class list:", modal.className);
            } else {
                console.error("Error: Modal '#diffusion-modal' not found in DOM!");
            }
        });
    }

    // Bind change listeners to channel radios
    const radios = document.querySelectorAll('input[name="diffusion-channel"]');
    radios.forEach(radio => {
        radio.addEventListener('change', () => {
            renderDiffusionModal();
        });
    });

    const btnBulkSMS = document.getElementById('btn-send-bulk-sms');
    if (btnBulkSMS) {
        btnBulkSMS.addEventListener('click', async () => {
            const companions = users.filter(u => {
                const role = (u.role || '').toLowerCase();
                return !role.includes('chef') && !role.includes('admin') && !role.includes('conducteur') && !role.includes('propri');
            });

            const messages = [];
            companions.forEach(u => {
                if (u.phone) {
                    const text = getWorkerWeeklyMessage(u.id, 'sms') + `\n\n🌐 ` + getGeneralPlanningLink();
                    messages.push({
                        to: formatPhoneForWhatsApp(u.phone),
                        text: text
                    });
                }
            });

            if (messages.length === 0) {
                alert("Aucun ouvrier n'a de numéro de téléphone renseigné !");
                return;
            }

            if (!(await showCustomConfirm(`Voulez-vous vraiment envoyer le planning par SMS aux ${messages.length} ouvriers ?`))) {
                return;
            }

            btnBulkSMS.disabled = true;
            btnBulkSMS.textContent = "Envoi en cours...";

            try {
                const response = await fetch('/api/send-sms-bulk', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ messages })
                });

                const result = await response.json();
                if (result.success) {
                    const successfulCount = result.results.filter(r => r.success).length;
                    alert(`Succès : ${successfulCount} / ${result.results.length} SMS envoyés avec succès !`);
                } else {
                    alert("Erreur lors de l'envoi : " + result.error);
                }
            } catch (err) {
                alert("Erreur réseau ou serveur : " + err.message);
            } finally {
                btnBulkSMS.disabled = false;
                btnBulkSMS.textContent = "🚀 Tout envoyer par SMS";
            }
        });
    }

    const btnClose = document.getElementById('btn-close-diffusion-modal');
    const btnCancel = document.getElementById('btn-cancel-diffusion-modal');
    [btnClose, btnCancel].forEach(btn => {
        if (btn) {
            btn.addEventListener('click', () => {
                const modal = document.getElementById('diffusion-modal');
                if (modal) modal.classList.remove('show');
            });
        }
    });
}

// Bind to window for global inline onclick callbacks access
window.sendPersonalPlanning = sendPersonalPlanning;
window.sendGeneralPlanning = sendGeneralPlanning;
window.sendBothPlannings = sendBothPlannings;
window.sendSingleSMSViaBackend = sendSingleSMSViaBackend;

function initImageUploaders() {
    document.querySelectorAll('.image-uploader').forEach(uploader => {
        const fileInput = uploader.querySelector('.image-uploader-input');
        if (!fileInput) return;

        const btn = uploader.querySelector('.btn-uploader-file');
        if (btn) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                fileInput.click();
            });
        }

        uploader.addEventListener('click', (e) => {
            if (e.target !== fileInput && e.target !== btn) {
                fileInput.click();
            }
        });

        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploader.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            }, false);
        });

        uploader.addEventListener('dragover', () => {
            uploader.classList.add('dragover');
            uploader.style.borderColor = 'var(--primary)';
            uploader.style.backgroundColor = 'var(--primary-light)';
        });

        uploader.addEventListener('dragleave', () => {
            uploader.classList.remove('dragover');
            uploader.style.borderColor = '';
            uploader.style.backgroundColor = '';
        });

        uploader.addEventListener('drop', (e) => {
            uploader.classList.remove('dragover');
            uploader.style.borderColor = '';
            uploader.style.backgroundColor = '';
            
            if (e.dataTransfer.files.length > 0) {
                fileInput.files = e.dataTransfer.files;
                fileInput.dispatchEvent(new Event('change'));
            }
        });

        fileInput.addEventListener('change', () => {
            if (fileInput.files.length > 0) {
                const file = fileInput.files[0];
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        uploader.setAttribute('data-image-base64', e.target.result);
                        
                        let previewImg = uploader.querySelector('.uploader-preview-img');
                        if (!previewImg) {
                            previewImg = document.createElement('img');
                            previewImg.className = 'uploader-preview-img';
                            previewImg.style.position = 'absolute';
                            previewImg.style.top = '0';
                            previewImg.style.left = '0';
                            previewImg.style.width = '100%';
                            previewImg.style.height = '100%';
                            previewImg.style.objectFit = 'cover';
                            previewImg.style.borderRadius = '8px';
                            uploader.style.position = 'relative';
                            uploader.appendChild(previewImg);
                        }
                        previewImg.src = e.target.result;
                        previewImg.style.display = 'block';
                        
                        uploader.querySelectorAll(':not(.uploader-preview-img):not(.image-uploader-input)').forEach(child => {
                            child.style.opacity = '0';
                        });
                    };
                    reader.readAsDataURL(file);
                } else {
                    alert("Veuillez sélectionner un fichier image.");
                }
            }
        });
    });
}

// Run uploader initialization
initImageUploaders();

// --- Onboarding Logic ---
function populateEntreprisesSelects() {
    const selects = [
        document.getElementById('chantier-entreprise'),
        document.getElementById('edit-chantier-entreprise')
    ];
    
    selects.forEach(select => {
        if (!select) return;
        select.innerHTML = '<option value="">Sélectionnez une entreprise</option>';
        entreprises.forEach(ent => {
            const opt = document.createElement('option');
            opt.value = ent.name;
            opt.textContent = ent.name;
            select.appendChild(opt);
        });
    });
}

function initOnboarding() {
    const modal = document.getElementById('onboarding-modal');
    if (!modal) return;
    
    if (entreprises.length > 0) {
        modal.style.display = 'none';
        return;
    }

    modal.style.display = 'block';

    const inputName = document.getElementById('onboarding-entreprise-name');
    const btnAdd = document.getElementById('btn-add-onboarding-entreprise');
    const tbody = document.getElementById('onboarding-entreprises-list');
    const btnFinish = document.getElementById('btn-finish-onboarding');
    const errorMsg = document.getElementById('onboarding-error-msg');

    let localEntreprises = [];

    const renderLocalList = () => {
        tbody.innerHTML = localEntreprises.map((name, i) => `
            <tr>
                <td style="font-weight: 500;">${name}</td>
                <td style="text-align: right; width: 60px;">
                    <button class="btn-action" onclick="window.removeOnboardingEntreprise(${i})">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                    </button>
                </td>
            </tr>
        `).join('');

        if (localEntreprises.length > 0) {
            btnFinish.disabled = false;
        } else {
            btnFinish.disabled = true;
        }
    };

    window.removeOnboardingEntreprise = (index) => {
        localEntreprises.splice(index, 1);
        renderLocalList();
    };

    btnAdd.addEventListener('click', () => {
        const name = inputName.value.trim();
        if (!name) {
            errorMsg.textContent = "Le nom ne peut pas être vide.";
            errorMsg.style.display = 'block';
            return;
        }
        if (localEntreprises.includes(name)) {
            errorMsg.textContent = "Cette entreprise a déjà été ajoutée.";
            errorMsg.style.display = 'block';
            return;
        }
        errorMsg.style.display = 'none';
        localEntreprises.push(name);
        inputName.value = '';
        renderLocalList();
    });

    btnFinish.addEventListener('click', async () => {
        btnFinish.disabled = true;
        btnFinish.textContent = "Enregistrement...";
        
        try {
            const inserts = localEntreprises.map(name => ({
                id: 'e_' + Date.now() + Math.random().toString(36).substr(2, 5),
                name: name
            }));
            
            const { error } = await supabaseClient.from('entreprises').insert(inserts);
            if (error) throw error;
            
            entreprises = inserts; // Update global
            populateEntreprisesSelects();
            modal.style.display = 'none';
            await supabaseClient.from('dashboard_activities').insert([{ activity_text: 'Configuration initiale terminée.' }]);
            renderDashboard();
        } catch (err) {
            console.error("Erreur lors de l'onboarding:", err);
            errorMsg.textContent = "Une erreur est survenue lors de l'enregistrement.";
            errorMsg.style.display = 'block';
            btnFinish.disabled = false;
            btnFinish.textContent = "Terminer et accéder à l'application";
        }
    });
}
