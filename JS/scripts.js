import { firebaseSettings } from "./firebase-config.js";

const body = document.body;
const navToggle = document.getElementById("nav-toggle");
const navMenu = document.getElementById("nav-menu");
const themeToggle = document.getElementById("theme-toggle");
const typingText = document.getElementById("typing-text");
const scrollProgressBar = document.getElementById("scroll-progress-bar");
const filterButtons = document.querySelectorAll(".filter-button");
const revealItems = document.querySelectorAll(".reveal");
const skillMeters = document.querySelectorAll(".meter");
const skillPills = document.querySelectorAll(".skill-pill");
const magneticItems = document.querySelectorAll(".magnetic");
const cursor = document.getElementById("custom-cursor");
const sections = document.querySelectorAll("main section[id]");
const contactForm = document.getElementById("contact-form");
const formStatus = document.getElementById("form-status");
const commentForm = document.getElementById("comment-form");
const commentStatus = document.getElementById("comment-status");
const approvedCommentsList = document.getElementById("approved-comments-list");
const approvedCommentsEmpty = document.getElementById("approved-comments-empty");
const approvedCommentsCount = document.getElementById("approved-comments-count");
const statsProjectsCount = document.getElementById("stats-projects-count");
const statsSkillsCount = document.getElementById("stats-skills-count");
const statsApprovedCount = document.getElementById("stats-approved-count");
const projectsGrid = document.getElementById("projects-grid");
const toastStack = document.getElementById("toast-stack");
const heroToplineName = document.getElementById("hero-topline-name");
const heroToplineRole = document.getElementById("hero-topline-role");
const heroPhoto = document.getElementById("hero-photo");
const heroPanelText = document.getElementById("hero-panel-text");
const heroPanelList = document.getElementById("hero-panel-list");
const heroBasedIn = document.getElementById("hero-based-in");
const heroOpenTo = document.getElementById("hero-open-to");
const heroBadgeAlphaLabel = document.getElementById("hero-badge-alpha-label");
const heroBadgeAlphaTitle = document.getElementById("hero-badge-alpha-title");
const heroBadgeBetaLabel = document.getElementById("hero-badge-beta-label");
const heroBadgeBetaTitle = document.getElementById("hero-badge-beta-title");
const skillCloud = document.getElementById("skill-cloud");
const skillsBars = document.getElementById("skills-bars");
const contactEmail = document.getElementById("contact-email");
const contactPhone = document.getElementById("contact-phone");
const contactLocation = document.getElementById("contact-location");
const contactSocialGithub = document.getElementById("contact-social-github");
const contactSocialLinkedin = document.getElementById("contact-social-linkedin");
const contactSocialX = document.getElementById("contact-social-x");
const contactSocialFacebook = document.getElementById("contact-social-facebook");

const typingPhrases = [
    "premium frontend experiences.",
    "responsive product interfaces.",
    "clean full stack delivery.",
    "thoughtful UI engineering."
];

const themeStorageKey = "shihab-portfolio-theme";
const commentsStorageKey = "shihab-portfolio-comments";
const projectsStorageKey = "shihab-portfolio-projects";
const heroStorageKey = "shihab-portfolio-hero";
const skillsStorageKey = "shihab-portfolio-skills";
const contactStorageKey = "shihab-portfolio-contact";

if (localStorage.getItem(themeStorageKey) === "light") {
    body.classList.add("light-mode");
}

const state = {
    projectFilter: "all"
};

const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
}[char]));

const splitList = (value = "") => value.split(",").map((item) => item.trim()).filter(Boolean);

const isHttpUrl = (value = "") => /^https?:\/\//i.test(String(value).trim());

const buildWebsitePreviewUrl = (value = "") => {
    const url = String(value).trim();
    return isHttpUrl(url) ? `https://image.thum.io/get/width/1200/crop/720/noanimate/${url}` : "";
};

const getProjectImage = (project = {}) => {
    const explicitImage = String(project.image || "").trim();
    if (explicitImage) return explicitImage;

    const previewUrl = buildWebsitePreviewUrl(project.liveUrl || "");
    return previewUrl || "images/dashboard.png";
};

const getProjectLinkLabel = (type) => type === "live" ? "Open Live Site" : "View Code";

const showToast = (title, message, type = "success") => {
    if (!toastStack) return;

    const toast = document.createElement("article");
    toast.className = `toast toast--${type}`;
    toast.innerHTML = `
        <p class="toast__title">${escapeHtml(title)}</p>
        <p class="toast__message">${escapeHtml(message)}</p>
    `;
    toastStack.append(toast);
    window.setTimeout(() => toast.remove(), 3600);
};

const formatDate = (timestamp) => new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric"
}).format(timestamp ? new Date(timestamp) : new Date());

const isFirebaseConfigured = () => {
    const config = firebaseSettings?.config || {};
    return Boolean(firebaseSettings?.enabled && config.apiKey && config.projectId && config.appId);
};

const parseInitialProjects = () => {
    if (!projectsGrid) return [];

    return Array.from(projectsGrid.querySelectorAll(".project-card")).map((card, index) => {
        const image = card.querySelector("img");
        const links = Array.from(card.querySelectorAll(".project-card__links a"));
        return {
            id: `seed-project-${index + 1}`,
            title: card.querySelector("h3")?.textContent?.trim() || "Untitled project",
            description: card.querySelector(".project-card__content p")?.textContent?.trim() || "",
            image: image?.getAttribute("src") || "images/dashboard.png",
            imageAlt: image?.getAttribute("alt") || "Project preview",
            categories: (card.dataset.category || "").split(" ").map((item) => item.trim()).filter(Boolean),
            meta: Array.from(card.querySelectorAll(".project-card__meta span")).map((item) => item.textContent.trim()),
            tags: Array.from(card.querySelectorAll(".project-card__tags span")).map((item) => item.textContent.trim()),
            liveUrl: links.find((item) => item.textContent.trim() === "Live")?.href || "",
            githubUrl: links.find((item) => item.textContent.trim() === "GitHub")?.href || "",
            order: index + 1,
            createdAt: new Date().toISOString()
        };
    });
};

const parseInitialHero = () => ({
    topLineName: heroToplineName?.textContent?.trim() || "Shihab",
    topLineRole: heroToplineRole?.textContent?.trim() || "Frontend + Full Stack",
    photoUrl: heroPhoto?.getAttribute("src") || "images/me.png",
    photoAlt: heroPhoto?.getAttribute("alt") || "Portrait of Shihab",
    panelText: heroPanelText?.textContent?.trim() || "Building premium interfaces with engineering discipline and design sensitivity.",
    panelItems: Array.from(heroPanelList?.querySelectorAll("li") || []).map((item) => item.textContent.trim()),
    basedIn: heroBasedIn?.textContent?.trim() || "Zagazig, Egypt",
    openTo: heroOpenTo?.textContent?.trim() || "Freelance & collaboration",
    badgeAlphaLabel: heroBadgeAlphaLabel?.textContent?.trim() || "Frontend craft",
    badgeAlphaTitle: heroBadgeAlphaTitle?.textContent?.trim() || "Premium UI",
    badgeBetaLabel: heroBadgeBetaLabel?.textContent?.trim() || "Engineering",
    badgeBetaTitle: heroBadgeBetaTitle?.textContent?.trim() || "Structured code"
});

const parseInitialSkills = () => {
    const pills = Array.from(skillCloud?.querySelectorAll(".skill-pill") || []).map((pill, index) => ({
        id: `skill-pill-${index + 1}`,
        kind: "pill",
        title: pill.textContent.trim(),
        description: "",
        progress: 0,
        order: index + 1
    }));

    const meters = Array.from(skillsBars?.querySelectorAll(".meter-card") || []).map((card, index) => ({
        id: `skill-meter-${index + 1}`,
        kind: "meter",
        title: card.querySelector("h3")?.textContent?.trim() || "Untitled skill",
        description: card.querySelector("p")?.textContent?.trim() || "",
        progress: Number((card.querySelector(".meter")?.dataset.progress) || 0),
        order: pills.length + index + 1
    }));

    return [...pills, ...meters];
};

const parseInitialContact = () => ({
    email: contactEmail?.textContent?.trim() || "sh.s.ghazal2003@gmail.com",
    phone: contactPhone?.textContent?.trim() || "+20 101 092 0472",
    phoneLink: (contactPhone?.getAttribute("href") || "tel:+201010920472").replace(/^tel:/i, ""),
    location: contactLocation?.textContent?.trim() || "Zagazig, Sharqia, Egypt",
    githubUrl: contactSocialGithub?.getAttribute("href") || "https://github.com/Shehap152/Shehap152",
    linkedinUrl: contactSocialLinkedin?.getAttribute("href") || "https://www.linkedin.com/in/shehap-0-ghazal/",
    xUrl: contactSocialX?.getAttribute("href") || "https://x.com/sh_ghazal2003",
    facebookUrl: contactSocialFacebook?.getAttribute("href") || "https://www.facebook.com/shehap.ghazal"
});

const loadLocalProjects = () => {
    try {
        const parsed = JSON.parse(localStorage.getItem(projectsStorageKey) || "null");
        if (Array.isArray(parsed) && parsed.length) return parsed;
    } catch {
        // ignore invalid local storage
    }

    const fallback = parseInitialProjects();
    localStorage.setItem(projectsStorageKey, JSON.stringify(fallback));
    return fallback;
};

const loadLocalHero = () => {
    try {
        const parsed = JSON.parse(localStorage.getItem(heroStorageKey) || "null");
        if (parsed && typeof parsed === "object") return parsed;
    } catch {
        // ignore invalid local storage
    }

    const fallback = parseInitialHero();
    localStorage.setItem(heroStorageKey, JSON.stringify(fallback));
    return fallback;
};

const loadLocalSkills = () => {
    try {
        const parsed = JSON.parse(localStorage.getItem(skillsStorageKey) || "null");
        if (Array.isArray(parsed) && parsed.length) return parsed;
    } catch {
        // ignore invalid local storage
    }

    const fallback = parseInitialSkills();
    localStorage.setItem(skillsStorageKey, JSON.stringify(fallback));
    return fallback;
};

const loadLocalContact = () => {
    try {
        const parsed = JSON.parse(localStorage.getItem(contactStorageKey) || "null");
        if (parsed && typeof parsed === "object") return parsed;
    } catch {
        // ignore invalid local storage
    }

    const fallback = parseInitialContact();
    localStorage.setItem(contactStorageKey, JSON.stringify(fallback));
    return fallback;
};

const loadLocalComments = () => {
    try {
        const parsed = JSON.parse(localStorage.getItem(commentsStorageKey) || "[]");
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

const normalizeComment = (docId, raw = {}) => ({
    id: docId || raw.id || `${Date.now()}`,
    name: raw.name || "Anonymous",
    role: raw.role || "Visitor",
    message: raw.message || "",
    status: raw.status || "pending",
    createdAt: raw.createdAt?.toDate ? raw.createdAt.toDate().toISOString() : (raw.createdAt || new Date().toISOString())
});

const normalizeProject = (docId, raw = {}) => ({
    id: docId || raw.id || `project-${Date.now()}`,
    title: raw.title || "Untitled project",
    description: raw.description || "",
    image: typeof raw.image === "string" ? raw.image : "",
    imageAlt: raw.imageAlt || `${raw.title || "Project"} preview`,
    categories: Array.isArray(raw.categories) ? raw.categories : splitList(raw.categories || ""),
    meta: Array.isArray(raw.meta) ? raw.meta : splitList(raw.meta || ""),
    tags: Array.isArray(raw.tags) ? raw.tags : splitList(raw.tags || ""),
    liveUrl: raw.liveUrl || "",
    githubUrl: raw.githubUrl || "",
    order: typeof raw.order === "number" ? raw.order : 0,
    createdAt: raw.createdAt?.toDate ? raw.createdAt.toDate().toISOString() : (raw.createdAt || new Date().toISOString())
});

const normalizeHero = (raw = {}) => ({
    topLineName: raw.topLineName || "Shihab",
    topLineRole: raw.topLineRole || "Frontend + Full Stack",
    photoUrl: raw.photoUrl || "images/me.png",
    photoAlt: raw.photoAlt || "Portrait of Shihab",
    panelText: raw.panelText || "Building premium interfaces with engineering discipline and design sensitivity.",
    panelItems: Array.isArray(raw.panelItems) ? raw.panelItems : splitList(raw.panelItems || ""),
    basedIn: raw.basedIn || "Zagazig, Egypt",
    openTo: raw.openTo || "Freelance & collaboration",
    badgeAlphaLabel: raw.badgeAlphaLabel || "Frontend craft",
    badgeAlphaTitle: raw.badgeAlphaTitle || "Premium UI",
    badgeBetaLabel: raw.badgeBetaLabel || "Engineering",
    badgeBetaTitle: raw.badgeBetaTitle || "Structured code"
});

const normalizeSkill = (docId, raw = {}) => ({
    id: docId || raw.id || `skill-${Date.now()}`,
    kind: raw.kind === "meter" ? "meter" : "pill",
    title: raw.title || "Untitled skill",
    description: raw.description || "",
    progress: Number(raw.progress || 0),
    order: typeof raw.order === "number" ? raw.order : Number(raw.order || 0)
});

const normalizeContact = (raw = {}) => ({
    email: raw.email || "sh.s.ghazal2003@gmail.com",
    phone: raw.phone || "+20 101 092 0472",
    phoneLink: raw.phoneLink || "+201010920472",
    location: raw.location || "Zagazig, Sharqia, Egypt",
    githubUrl: raw.githubUrl || "https://github.com/Shehap152/Shehap152",
    linkedinUrl: raw.linkedinUrl || "https://www.linkedin.com/in/shehap-0-ghazal/",
    xUrl: raw.xUrl || "https://x.com/sh_ghazal2003",
    facebookUrl: raw.facebookUrl || "https://www.facebook.com/shehap.ghazal"
});

let comments = loadLocalComments();
let projects = loadLocalProjects();
let heroContent = loadLocalHero();
let skillsData = loadLocalSkills();
let contactContent = loadLocalContact();
const commentStore = {
    mode: "local",
    async add(comment) {
        comments.unshift(comment);
        localStorage.setItem(commentsStorageKey, JSON.stringify(comments));
        rerenderComments();
    },
    async updateStatus(id, status) {
        comments = comments.map((comment) => comment.id === id ? { ...comment, status } : comment);
        localStorage.setItem(commentsStorageKey, JSON.stringify(comments));
        rerenderComments();
    },
    async remove(id) {
        comments = comments.filter((comment) => comment.id !== id);
        localStorage.setItem(commentsStorageKey, JSON.stringify(comments));
        rerenderComments();
    }
};

const renderProjects = () => {
    if (!projectsGrid) return;

    const visibleProjects = [...projects]
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .filter((project) => state.projectFilter === "all" || project.categories.includes(state.projectFilter));

    projectsGrid.innerHTML = visibleProjects.map((project, index) => `
        <article class="project-card glass-card reveal is-visible ${index % 2 ? "reveal--delay" : ""}" data-category="${escapeHtml(project.categories.join(" "))}">
            <div class="project-card__media">
                <img src="${escapeHtml(getProjectImage(project))}" alt="${escapeHtml(project.imageAlt)}">
            </div>
            <div class="project-card__content">
                <div class="project-card__meta">${project.meta.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div>
                <h3>${escapeHtml(project.title)}</h3>
                <p>${escapeHtml(project.description)}</p>
                <div class="project-card__tags">${project.tags.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div>
                <div class="project-card__links">
                    ${project.liveUrl ? `<a class="project-card__link project-card__link--live" href="${escapeHtml(project.liveUrl)}" target="_blank" rel="noopener noreferrer"><span>Live</span><small>${getProjectLinkLabel("live")}</small></a>` : ""}
                    ${project.githubUrl ? `<a class="project-card__link project-card__link--github" href="${escapeHtml(project.githubUrl)}" target="_blank" rel="noopener noreferrer"><span>GitHub</span><small>${getProjectLinkLabel("github")}</small></a>` : ""}
                </div>
            </div>
        </article>
    `).join("");
};

const bindSkillPillHover = () => {
    document.querySelectorAll(".skill-pill").forEach((pill) => {
        pill.addEventListener("mouseenter", () => {
            document.querySelectorAll(".skill-pill").forEach((item) => item.classList.remove("is-active"));
            pill.classList.add("is-active");
        });
    });
};

const renderHero = () => {
    heroToplineName.textContent = heroContent.topLineName;
    heroToplineRole.textContent = heroContent.topLineRole;
    heroPhoto.src = heroContent.photoUrl;
    heroPhoto.alt = heroContent.photoAlt;
    heroPanelText.textContent = heroContent.panelText;
    heroPanelList.innerHTML = heroContent.panelItems.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
    heroBasedIn.textContent = heroContent.basedIn;
    heroOpenTo.textContent = heroContent.openTo;
    heroBadgeAlphaLabel.textContent = heroContent.badgeAlphaLabel;
    heroBadgeAlphaTitle.textContent = heroContent.badgeAlphaTitle;
    heroBadgeBetaLabel.textContent = heroContent.badgeBetaLabel;
    heroBadgeBetaTitle.textContent = heroContent.badgeBetaTitle;
};

const renderSkills = () => {
    const sortedSkills = [...skillsData].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const pillSkills = sortedSkills.filter((skill) => skill.kind === "pill");
    const meterSkills = sortedSkills.filter((skill) => skill.kind === "meter");

    skillCloud.innerHTML = pillSkills.map((skill, index) => `
        <button class="skill-pill magnetic ${index === 0 ? "is-active" : ""}" type="button">${escapeHtml(skill.title)}</button>
    `).join("");

    skillsBars.innerHTML = meterSkills.map((skill) => `
        <article class="meter-card glass-card">
            <div class="meter-card__header">
                <h3>${escapeHtml(skill.title)}</h3>
                <span>${escapeHtml(String(skill.progress))}%</span>
            </div>
            <p>${escapeHtml(skill.description)}</p>
            <div class="meter" data-progress="${escapeHtml(String(skill.progress))}">
                <span style="width:${escapeHtml(String(skill.progress))}%"></span>
            </div>
        </article>
    `).join("");

    bindSkillPillHover();
};

const renderContact = () => {
    const normalized = normalizeContact(contactContent);

    if (contactEmail) {
        contactEmail.textContent = normalized.email;
        contactEmail.href = `mailto:${normalized.email}`;
    }

    if (contactPhone) {
        contactPhone.textContent = normalized.phone;
        contactPhone.href = `tel:${normalized.phoneLink}`;
    }

    if (contactLocation) {
        contactLocation.textContent = normalized.location;
    }

    if (contactSocialGithub) contactSocialGithub.href = normalized.githubUrl;
    if (contactSocialLinkedin) contactSocialLinkedin.href = normalized.linkedinUrl;
    if (contactSocialX) contactSocialX.href = normalized.xUrl;
    if (contactSocialFacebook) contactSocialFacebook.href = normalized.facebookUrl;
};

const renderPortfolioStats = () => {
    if (statsProjectsCount) {
        statsProjectsCount.textContent = String(projects.length);
    }

    if (statsSkillsCount) {
        statsSkillsCount.textContent = String(skillsData.length);
    }

    if (statsApprovedCount) {
        statsApprovedCount.textContent = String(comments.filter((comment) => comment.status === "approved").length);
    }
};

const renderApprovedComments = () => {
    if (!approvedCommentsList || !approvedCommentsEmpty || !approvedCommentsCount) return;

    const approvedComments = comments.filter((comment) => comment.status === "approved");
    approvedCommentsList.innerHTML = approvedComments.map((comment) => `
        <article class="comment-card">
            <div class="comment-card__top">
                <div class="comment-card__author">
                    <strong>${escapeHtml(comment.name)}</strong>
                    <span>${escapeHtml(comment.role)}</span>
                </div>
                <span class="comment-card__date">${formatDate(comment.createdAt)}</span>
            </div>
            <p class="comment-card__message">${escapeHtml(comment.message)}</p>
        </article>
    `).join("");

    approvedCommentsEmpty.hidden = approvedComments.length > 0;
    approvedCommentsCount.textContent = `${approvedComments.length} approved`;
};

const rerenderComments = () => {
    renderApprovedComments();
    renderPortfolioStats();
};

const clearFieldState = (selector) => {
    document.querySelectorAll(`${selector} .field`).forEach((field) => field.classList.remove("is-invalid"));
    document.querySelectorAll(`${selector} .field__error`).forEach((item) => {
        item.textContent = "";
    });
};

const validators = {
    name: (value) => value.trim().length >= 2 || "Please enter at least 2 characters.",
    email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || "Please enter a valid email address.",
    subject: (value) => value.trim().length >= 3 || "Please add a short subject or project type.",
    message: (value) => value.trim().length >= 20 || "Please share a bit more detail so I can understand your project.",
    commentName: (value) => value.trim().length >= 2 || "Please enter at least 2 characters.",
    commentRole: (value) => value.trim().length >= 2 || "Please add a short role or title.",
    commentMessage: (value) => value.trim().length >= 12 || "Please write a more useful comment before submitting."
};

const showFieldState = (field, message) => {
    const wrapper = field.closest(".field");
    const errorElement = wrapper.querySelector(".field__error");
    const isValid = message === true;
    wrapper.classList.toggle("is-invalid", !isValid);
    errorElement.textContent = isValid ? "" : message;
    return isValid;
};

const closeMobileMenu = () => {
    navMenu.classList.remove("is-open");
    navToggle.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
};

const setupFirebaseComments = async () => {
    if (!isFirebaseConfigured()) {
        rerenderComments();
        return;
    }

    try {
        const appModule = await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js");
        const firestoreModule = await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js");
        const app = appModule.getApps()[0] || appModule.initializeApp(firebaseSettings.config);
        const db = firestoreModule.getFirestore(app);
        const collectionName = firebaseSettings.collectionName || "portfolioComments";
        const commentsCollection = firestoreModule.collection(db, collectionName);
        const commentsQuery = firestoreModule.query(commentsCollection, firestoreModule.orderBy("createdAt", "desc"));

        commentStore.mode = "firebase";
        commentStore.add = async (comment) => {
            await firestoreModule.addDoc(commentsCollection, {
                name: comment.name,
                role: comment.role,
                message: comment.message,
                status: comment.status,
                createdAt: firestoreModule.serverTimestamp()
            });
        };
        commentStore.updateStatus = async (id, status) => {
            await firestoreModule.updateDoc(firestoreModule.doc(db, collectionName, id), { status });
        };
        commentStore.remove = async (id) => {
            await firestoreModule.deleteDoc(firestoreModule.doc(db, collectionName, id));
        };

        firestoreModule.onSnapshot(commentsQuery, (snapshot) => {
            comments = snapshot.docs.map((item) => normalizeComment(item.id, item.data()));
            rerenderComments();
        });
    } catch (error) {
        console.error("Firebase comments setup failed:", error);
    }
};

const setupFirebaseProjects = async () => {
    if (!isFirebaseConfigured()) {
        renderProjects();
        renderPortfolioStats();
        return;
    }

    try {
        const appModule = await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js");
        const firestoreModule = await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js");
        const app = appModule.getApps()[0] || appModule.initializeApp(firebaseSettings.config);
        const db = firestoreModule.getFirestore(app);
        const collectionName = firebaseSettings.projectsCollectionName || "portfolioProjects";
        const projectsQuery = firestoreModule.query(firestoreModule.collection(db, collectionName), firestoreModule.orderBy("order", "asc"));

        firestoreModule.onSnapshot(projectsQuery, (snapshot) => {
            const firebaseProjects = snapshot.docs.map((item) => normalizeProject(item.id, item.data()));
            if (firebaseProjects.length) {
                projects = firebaseProjects;
                localStorage.setItem(projectsStorageKey, JSON.stringify(firebaseProjects));
            }
            renderProjects();
            renderPortfolioStats();
        }, (error) => {
            console.error("Firebase projects setup failed:", error);
            renderProjects();
            renderPortfolioStats();
        });
    } catch (error) {
        console.error("Firebase projects setup failed:", error);
        renderProjects();
        renderPortfolioStats();
    }
};

const setupFirebaseHero = async () => {
    if (!isFirebaseConfigured()) {
        renderHero();
        return;
    }

    try {
        const appModule = await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js");
        const firestoreModule = await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js");
        const app = appModule.getApps()[0] || appModule.initializeApp(firebaseSettings.config);
        const db = firestoreModule.getFirestore(app);
        const collectionName = firebaseSettings.contentCollectionName || "portfolioContent";

        firestoreModule.onSnapshot(
            firestoreModule.doc(db, collectionName, "heroProfile"),
            (snapshot) => {
                if (snapshot.exists()) {
                    heroContent = normalizeHero(snapshot.data());
                    localStorage.setItem(heroStorageKey, JSON.stringify(heroContent));
                }
                renderHero();
            },
            (error) => {
                console.error("Firebase hero setup failed:", error);
                renderHero();
            }
        );
    } catch (error) {
        console.error("Firebase hero setup failed:", error);
        renderHero();
    }
};

const setupFirebaseSkills = async () => {
    if (!isFirebaseConfigured()) {
        renderSkills();
        renderPortfolioStats();
        return;
    }

    try {
        const appModule = await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js");
        const firestoreModule = await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js");
        const app = appModule.getApps()[0] || appModule.initializeApp(firebaseSettings.config);
        const db = firestoreModule.getFirestore(app);
        const collectionName = firebaseSettings.skillsCollectionName || "portfolioSkills";
        const skillsQuery = firestoreModule.query(firestoreModule.collection(db, collectionName), firestoreModule.orderBy("order", "asc"));

        firestoreModule.onSnapshot(skillsQuery, (snapshot) => {
            const firebaseSkills = snapshot.docs.map((item) => normalizeSkill(item.id, item.data()));
            if (firebaseSkills.length) {
                skillsData = firebaseSkills;
                localStorage.setItem(skillsStorageKey, JSON.stringify(firebaseSkills));
            }
            renderSkills();
            renderPortfolioStats();
        }, (error) => {
            console.error("Firebase skills setup failed:", error);
            renderSkills();
            renderPortfolioStats();
        });
    } catch (error) {
        console.error("Firebase skills setup failed:", error);
        renderSkills();
        renderPortfolioStats();
    }
};

const setupFirebaseContact = async () => {
    if (!isFirebaseConfigured()) {
        renderContact();
        return;
    }

    try {
        const appModule = await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js");
        const firestoreModule = await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js");
        const app = appModule.getApps()[0] || appModule.initializeApp(firebaseSettings.config);
        const db = firestoreModule.getFirestore(app);
        const collectionName = firebaseSettings.contentCollectionName || "portfolioContent";

        firestoreModule.onSnapshot(
            firestoreModule.doc(db, collectionName, "contactProfile"),
            (snapshot) => {
                if (snapshot.exists()) {
                    contactContent = normalizeContact(snapshot.data());
                    localStorage.setItem(contactStorageKey, JSON.stringify(contactContent));
                }
                renderContact();
            },
            (error) => {
                console.error("Firebase contact setup failed:", error);
                renderContact();
            }
        );
    } catch (error) {
        console.error("Firebase contact setup failed:", error);
        renderContact();
    }
};

navToggle?.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("is-open");
    navToggle.classList.toggle("is-open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
});

document.querySelectorAll(".nav__menu a").forEach((link) => {
    link.addEventListener("click", () => {
        if (window.innerWidth <= 820) closeMobileMenu();
    });
});

themeToggle?.addEventListener("click", () => {
    body.classList.toggle("light-mode");
    localStorage.setItem(themeStorageKey, body.classList.contains("light-mode") ? "light" : "dark");
});

const runTypingAnimation = () => {
    if (!typingText) return;
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    const tick = () => {
        const currentPhrase = typingPhrases[phraseIndex];
        typingText.textContent = currentPhrase.slice(0, charIndex);

        if (!isDeleting && charIndex < currentPhrase.length) {
            charIndex += 1;
            setTimeout(tick, 70);
            return;
        }

        if (!isDeleting && charIndex === currentPhrase.length) {
            isDeleting = true;
            setTimeout(tick, 1400);
            return;
        }

        if (isDeleting && charIndex > 0) {
            charIndex -= 1;
            setTimeout(tick, 35);
            return;
        }

        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % typingPhrases.length;
        setTimeout(tick, 320);
    };

    tick();
};

const updateScrollProgress = () => {
    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollableHeight > 0 ? (window.scrollY / scrollableHeight) * 100 : 0;
    scrollProgressBar.style.width = `${progress}%`;
};

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.15, rootMargin: "0px 0px -30px 0px" });

revealItems.forEach((item) => revealObserver.observe(item));

const meterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const meter = entry.target;
        meter.firstElementChild.style.width = `${meter.dataset.progress || 0}%`;
        meterObserver.unobserve(meter);
    });
}, { threshold: 0.45 });

skillMeters.forEach((meter) => meterObserver.observe(meter));

filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
        state.projectFilter = button.dataset.filter;
        filterButtons.forEach((item) => item.classList.remove("is-active"));
        button.classList.add("is-active");
        renderProjects();
    });
});

skillPills.forEach((pill) => {
    pill.addEventListener("mouseenter", () => {
        skillPills.forEach((item) => item.classList.remove("is-active"));
        pill.classList.add("is-active");
    });
});

bindSkillPillHover();
renderContact();

if (window.matchMedia("(pointer:fine)").matches && cursor) {
    window.addEventListener("mousemove", (event) => {
        cursor.classList.add("is-visible");
        cursor.style.transform = `translate(${event.clientX - 9}px, ${event.clientY - 9}px)`;
    });

    document.addEventListener("mouseleave", () => cursor.classList.remove("is-visible"));

    magneticItems.forEach((item) => {
        item.addEventListener("mousemove", (event) => {
            const bounds = item.getBoundingClientRect();
            const offsetX = event.clientX - bounds.left - bounds.width / 2;
            const offsetY = event.clientY - bounds.top - bounds.height / 2;
            item.style.transform = `translate(${offsetX * 0.08}px, ${offsetY * 0.08}px)`;
            cursor.classList.add("is-active");
        });

        item.addEventListener("mouseleave", () => {
            item.style.transform = "translate(0, 0)";
            cursor.classList.remove("is-active");
        });
    });
}

const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        document.querySelectorAll(".nav__menu a").forEach((link) => {
            link.classList.toggle("is-current", link.getAttribute("href") === `#${entry.target.id}`);
        });
    });
}, { threshold: 0.45, rootMargin: "-20% 0px -35% 0px" });

sections.forEach((section) => sectionObserver.observe(section));

["name", "email", "subject", "message"].forEach((fieldName) => {
    const field = contactForm?.elements.namedItem(fieldName);
    field?.addEventListener("input", () => showFieldState(field, validators[fieldName](field.value)));
});

["commentName", "commentRole", "commentMessage"].forEach((fieldName) => {
    const field = commentForm?.elements.namedItem(fieldName);
    field?.addEventListener("input", () => showFieldState(field, validators[fieldName](field.value)));
});

contactForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const fields = ["name", "email", "subject", "message"];
    const allValid = fields.every((fieldName) => {
        const field = contactForm.elements.namedItem(fieldName);
        return showFieldState(field, validators[fieldName](field.value));
    });

    if (!allValid) {
        showToast("Check the form", "Please fix the highlighted contact fields and try again.", "error");
        return;
    }

    formStatus.textContent = "";
    contactForm.reset();
    clearFieldState("#contact");
    showToast("Message prepared", "Your contact message looks good.", "success");
});

commentForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const fields = ["commentName", "commentRole", "commentMessage"];
    const allValid = fields.every((fieldName) => {
        const field = commentForm.elements.namedItem(fieldName);
        return showFieldState(field, validators[fieldName](field.value));
    });

    if (!allValid) {
        showToast("Check the form", "Please fix the highlighted comment fields before submitting.", "error");
        return;
    }

    const newComment = {
        id: `${Date.now()}`,
        name: commentForm.elements.namedItem("commentName").value.trim(),
        role: commentForm.elements.namedItem("commentRole").value.trim(),
        message: commentForm.elements.namedItem("commentMessage").value.trim(),
        status: "pending",
        createdAt: new Date().toISOString()
    };

    try {
        await commentStore.add(newComment);
        commentForm.reset();
        commentStatus.textContent = "";
        clearFieldState("#comments .comment-form");
        showToast("Comment received", commentStore.mode === "firebase" ? "Your comment is now waiting for approval in Firebase." : "Your comment was saved locally and is waiting for approval.", "success");
    } catch (error) {
        console.error("Failed to submit comment:", error);
        showToast("Comment failed", error.message || "Something went wrong while submitting your comment.", "error");
    }
});

window.addEventListener("scroll", updateScrollProgress, { passive: true });
window.addEventListener("resize", () => {
    if (window.innerWidth > 820) closeMobileMenu();
});

updateScrollProgress();
renderPortfolioStats();
runTypingAnimation();
renderHero();
renderSkills();
renderProjects();
rerenderComments();
setupFirebaseComments();
setupFirebaseHero();
setupFirebaseSkills();
setupFirebaseProjects();
setupFirebaseContact();
