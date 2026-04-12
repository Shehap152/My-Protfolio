import { firebaseSettings } from "./firebase-config.js";

const commentsStorageKey = "shihab-portfolio-comments";
const projectsStorageKey = "shihab-portfolio-projects";
const heroStorageKey = "shihab-portfolio-hero";
const skillsStorageKey = "shihab-portfolio-skills";
const contactStorageKey = "shihab-portfolio-contact";
const loginForm = document.getElementById("admin-login-form");
const loginStatus = document.getElementById("admin-login-status");
const authShell = document.getElementById("admin-auth-shell");
const dashboardShell = document.getElementById("admin-dashboard-shell");
const dashboardStatus = document.getElementById("admin-dashboard-status");
const adminUserEmail = document.getElementById("admin-user-email");
const signOutButton = document.getElementById("admin-signout");
const moderationList = document.getElementById("admin-comments-list");
const moderationEmpty = document.getElementById("admin-comments-empty");
const statTotal = document.getElementById("stat-total");
const statPending = document.getElementById("stat-pending");
const statApproved = document.getElementById("stat-approved");
const statHidden = document.getElementById("stat-hidden");
const filterButtons = document.querySelectorAll(".admin-filter");
const projectForm = document.getElementById("admin-project-form");
const projectResetButton = document.getElementById("project-reset-button");
const projectsList = document.getElementById("admin-projects-list");
const projectsEmpty = document.getElementById("admin-projects-empty");
const toastStack = document.getElementById("toast-stack");
const profileForm = document.getElementById("admin-profile-form");
const contactForm = document.getElementById("admin-contact-form");
const skillForm = document.getElementById("admin-skill-form");
const skillResetButton = document.getElementById("skill-reset-button");
const skillsList = document.getElementById("admin-skills-list");
const skillsEmpty = document.getElementById("admin-skills-empty");
const heroPhotoFileInput = document.getElementById("hero-photo-file");

let currentFilter = "all";
let comments = loadJson(commentsStorageKey, []);
let projects = loadJson(projectsStorageKey, []);
let heroContent = loadJson(heroStorageKey, {});
let skills = loadJson(skillsStorageKey, []);
let contactContent = loadJson(contactStorageKey, {});
let authReady = false;
let firebase = null;

async function uploadHeroImage(file) {
    if (!file) {
        return profileForm.elements.namedItem("heroPhotoUrl").value.trim();
    }

    if (firebase?.storage && firebase?.storageModule) {
        const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
        const fileRef = firebase.storageModule.ref(firebase.storage, `portfolio/profile/${safeName}`);
        await firebase.storageModule.uploadBytes(fileRef, file);
        return firebase.storageModule.getDownloadURL(fileRef);
    }

    return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ""));
        reader.onerror = () => reject(new Error("Unable to read the selected image file."));
        reader.readAsDataURL(file);
    });
}

function loadJson(key, fallback) {
    try {
        const parsed = JSON.parse(localStorage.getItem(key) || "null");
        return parsed === null ? fallback : parsed;
    } catch {
        return fallback;
    }
}

function escapeHtml(value = "") {
    return String(value).replace(/[&<>"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    }[char]));
}

function splitList(value = "") {
    return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function isHttpUrl(value = "") {
    return /^https?:\/\//i.test(String(value).trim());
}

function buildWebsitePreviewUrl(value = "") {
    const url = String(value).trim();
    return isHttpUrl(url) ? `https://image.thum.io/get/width/1200/crop/720/noanimate/${url}` : "";
}

function getProjectImage(project = {}) {
    const explicitImage = String(project.image || "").trim();
    if (explicitImage) return explicitImage;

    const previewUrl = buildWebsitePreviewUrl(project.liveUrl || "");
    return previewUrl || "images/dashboard.png";
}

function getProjectLinkLabel(type) {
    return type === "live" ? "Open Live Site" : "View Code";
}

function formatDate(timestamp) {
    return new Intl.DateTimeFormat("en", { year: "numeric", month: "short", day: "numeric" }).format(timestamp ? new Date(timestamp) : new Date());
}

function showToast(title, message, type = "success") {
    if (!toastStack) return;
    const toast = document.createElement("article");
    toast.className = `toast toast--${type}`;
    toast.innerHTML = `<p class="toast__title">${escapeHtml(title)}</p><p class="toast__message">${escapeHtml(message)}</p>`;
    toastStack.append(toast);
    window.setTimeout(() => toast.remove(), 3600);
}

function isFirebaseConfigured() {
    const config = firebaseSettings?.config || {};
    return Boolean(firebaseSettings?.enabled && config.apiKey && config.projectId && config.appId);
}

function normalizeComment(docId, raw = {}) {
    return {
        id: docId || raw.id || `${Date.now()}`,
        name: raw.name || "Anonymous",
        role: raw.role || "Visitor",
        message: raw.message || "",
        status: raw.status || "pending",
        createdAt: raw.createdAt?.toDate ? raw.createdAt.toDate().toISOString() : (raw.createdAt || new Date().toISOString())
    };
}

function normalizeProject(docId, raw = {}) {
    return {
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
        order: typeof raw.order === "number" ? raw.order : Number(raw.order || 0),
        createdAt: raw.createdAt?.toDate ? raw.createdAt.toDate().toISOString() : (raw.createdAt || new Date().toISOString())
    };
}

function normalizeHero(raw = {}) {
    return {
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
    };
}

function normalizeSkill(docId, raw = {}) {
    return {
        id: docId || raw.id || `skill-${Date.now()}`,
        kind: raw.kind === "meter" ? "meter" : "pill",
        title: raw.title || "Untitled skill",
        description: raw.description || "",
        progress: Number(raw.progress || 0),
        order: typeof raw.order === "number" ? raw.order : Number(raw.order || 0)
    };
}

function normalizeContact(raw = {}) {
    return {
        email: raw.email || "sh.s.ghazal2003@gmail.com",
        phone: raw.phone || "+20 101 092 0472",
        phoneLink: raw.phoneLink || "+201010920472",
        location: raw.location || "Zagazig, Sharqia, Egypt",
        githubUrl: raw.githubUrl || "https://github.com/Shehap152/Shehap152",
        linkedinUrl: raw.linkedinUrl || "https://www.linkedin.com/in/shehap-0-ghazal/",
        xUrl: raw.xUrl || "https://x.com/sh_ghazal2003",
        facebookUrl: raw.facebookUrl || "https://www.facebook.com/shehap.ghazal"
    };
}

function renderStats() {
    statTotal.textContent = String(comments.length);
    statPending.textContent = String(comments.filter((comment) => comment.status === "pending").length);
    statApproved.textContent = String(comments.filter((comment) => comment.status === "approved").length);
    statHidden.textContent = String(comments.filter((comment) => comment.status === "hidden").length);
}

function renderComments() {
    const filteredComments = currentFilter === "all" ? comments : comments.filter((comment) => comment.status === currentFilter);
    moderationList.innerHTML = filteredComments.map((comment) => `
        <article class="comment-card comment-card--admin">
            <div class="comment-card__top">
                <div class="comment-card__author">
                    <strong>${escapeHtml(comment.name)}</strong>
                    <span>${escapeHtml(comment.role)}</span>
                    <span class="comment-card__status comment-card__status--${escapeHtml(comment.status)}">${escapeHtml(comment.status)}</span>
                </div>
                <span class="comment-card__date">${formatDate(comment.createdAt)}</span>
            </div>
            <p class="comment-card__message">${escapeHtml(comment.message)}</p>
            <div class="comment-card__actions">
                <button class="comment-action comment-action--approve" type="button" data-action="approve" data-id="${comment.id}">Approve</button>
                <button class="comment-action comment-action--hide" type="button" data-action="hide" data-id="${comment.id}">Hide</button>
                <button class="comment-action comment-action--delete" type="button" data-action="delete" data-id="${comment.id}">Delete</button>
            </div>
        </article>
    `).join("");
    moderationEmpty.hidden = filteredComments.length > 0;
    renderStats();
}

function renderProjects() {
    const sortedProjects = [...projects].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    projectsList.innerHTML = sortedProjects.map((project) => `
        <article class="comment-card admin-project-card">
            <div class="admin-project-card__media">
                <img src="${escapeHtml(getProjectImage(project))}" alt="${escapeHtml(project.imageAlt)}">
            </div>
            <div class="admin-project-card__content">
                <div class="comment-card__top">
                    <div class="comment-card__author">
                        <strong>${escapeHtml(project.title)}</strong>
                        <span>${escapeHtml(project.categories.join(", ") || "no categories")}</span>
                    </div>
                    <span class="comment-card__date">Order ${project.order || 0}</span>
                </div>
                <p class="comment-card__message">${escapeHtml(project.description)}</p>
                <div class="project-card__meta">${project.meta.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div>
                <div class="project-card__tags">${project.tags.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div>
                <div class="project-card__links">
                    ${project.liveUrl ? `<a class="project-card__link project-card__link--live" href="${escapeHtml(project.liveUrl)}" target="_blank" rel="noopener noreferrer"><span>Live</span><small>${getProjectLinkLabel("live")}</small></a>` : ""}
                    ${project.githubUrl ? `<a class="project-card__link project-card__link--github" href="${escapeHtml(project.githubUrl)}" target="_blank" rel="noopener noreferrer"><span>GitHub</span><small>${getProjectLinkLabel("github")}</small></a>` : ""}
                </div>
                <div class="comment-card__actions">
                    <button class="comment-action comment-action--approve" type="button" data-project-action="edit" data-id="${project.id}">Edit</button>
                    <button class="comment-action comment-action--delete" type="button" data-project-action="delete" data-id="${project.id}">Delete</button>
                </div>
            </div>
        </article>
    `).join("");
    projectsEmpty.hidden = sortedProjects.length > 0;
}

function fillProfileForm() {
    const normalized = normalizeHero(heroContent);
    profileForm.elements.namedItem("heroName").value = normalized.topLineName;
    profileForm.elements.namedItem("heroRole").value = normalized.topLineRole;
    profileForm.elements.namedItem("heroPhotoUrl").value = normalized.photoUrl;
    profileForm.elements.namedItem("heroPhotoAlt").value = normalized.photoAlt;
    profileForm.elements.namedItem("heroBasedIn").value = normalized.basedIn;
    profileForm.elements.namedItem("heroOpenTo").value = normalized.openTo;
    profileForm.elements.namedItem("heroBadgeAlphaLabel").value = normalized.badgeAlphaLabel;
    profileForm.elements.namedItem("heroBadgeAlphaTitle").value = normalized.badgeAlphaTitle;
    profileForm.elements.namedItem("heroBadgeBetaLabel").value = normalized.badgeBetaLabel;
    profileForm.elements.namedItem("heroBadgeBetaTitle").value = normalized.badgeBetaTitle;
    profileForm.elements.namedItem("heroPanelText").value = normalized.panelText;
    profileForm.elements.namedItem("heroPanelItems").value = normalized.panelItems.join(", ");
}

function fillContactForm() {
    if (!contactForm) return;

    const normalized = normalizeContact(contactContent);
    contactForm.elements.namedItem("contactEmail").value = normalized.email;
    contactForm.elements.namedItem("contactPhone").value = normalized.phone;
    contactForm.elements.namedItem("contactPhoneLink").value = normalized.phoneLink;
    contactForm.elements.namedItem("contactLocation").value = normalized.location;
    contactForm.elements.namedItem("contactGithub").value = normalized.githubUrl;
    contactForm.elements.namedItem("contactLinkedin").value = normalized.linkedinUrl;
    contactForm.elements.namedItem("contactX").value = normalized.xUrl;
    contactForm.elements.namedItem("contactFacebook").value = normalized.facebookUrl;
}

function renderSkills() {
    const sortedSkills = [...skills].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    skillsList.innerHTML = sortedSkills.map((skill) => `
        <article class="comment-card">
            <div class="comment-card__top">
                <div class="comment-card__author">
                    <strong>${escapeHtml(skill.title)}</strong>
                    <span>${escapeHtml(skill.kind === "meter" ? "Progress card" : "Skill pill")}</span>
                </div>
                <span class="comment-card__date">Order ${skill.order || 0}</span>
            </div>
            ${skill.description ? `<p class="comment-card__message">${escapeHtml(skill.description)}</p>` : ""}
            <div class="project-card__meta">
                <span>${escapeHtml(skill.kind)}</span>
                ${skill.kind === "meter" ? `<span>${escapeHtml(String(skill.progress))}%</span>` : ""}
            </div>
            <div class="comment-card__actions">
                <button class="comment-action comment-action--approve" type="button" data-skill-action="edit" data-id="${skill.id}">Edit</button>
                <button class="comment-action comment-action--delete" type="button" data-skill-action="delete" data-id="${skill.id}">Delete</button>
            </div>
        </article>
    `).join("");
    skillsEmpty.hidden = sortedSkills.length > 0;
}

function fillSkillForm(skill) {
    skillForm.elements.namedItem("skillEditId").value = skill.id || "";
    skillForm.elements.namedItem("skillKind").value = skill.kind || "pill";
    skillForm.elements.namedItem("skillTitle").value = skill.title || "";
    skillForm.elements.namedItem("skillOrder").value = skill.order || "";
    skillForm.elements.namedItem("skillProgress").value = skill.progress || "";
    skillForm.elements.namedItem("skillDescription").value = skill.description || "";
}

function clearSkillForm() {
    skillForm.reset();
    skillForm.elements.namedItem("skillEditId").value = "";
    skillForm.elements.namedItem("skillKind").value = "pill";
}

function getHeroPayload() {
    return {
        topLineName: profileForm.elements.namedItem("heroName").value.trim(),
        topLineRole: profileForm.elements.namedItem("heroRole").value.trim(),
        photoUrl: profileForm.elements.namedItem("heroPhotoUrl").value.trim(),
        photoAlt: profileForm.elements.namedItem("heroPhotoAlt").value.trim(),
        panelText: profileForm.elements.namedItem("heroPanelText").value.trim(),
        panelItems: splitList(profileForm.elements.namedItem("heroPanelItems").value.trim()),
        basedIn: profileForm.elements.namedItem("heroBasedIn").value.trim(),
        openTo: profileForm.elements.namedItem("heroOpenTo").value.trim(),
        badgeAlphaLabel: profileForm.elements.namedItem("heroBadgeAlphaLabel").value.trim(),
        badgeAlphaTitle: profileForm.elements.namedItem("heroBadgeAlphaTitle").value.trim(),
        badgeBetaLabel: profileForm.elements.namedItem("heroBadgeBetaLabel").value.trim(),
        badgeBetaTitle: profileForm.elements.namedItem("heroBadgeBetaTitle").value.trim()
    };
}

function getContactPayload() {
    if (!contactForm) {
        throw new Error("Contact form is not available.");
    }

    const email = contactForm.elements.namedItem("contactEmail").value.trim();
    const phone = contactForm.elements.namedItem("contactPhone").value.trim();

    if (!email || !phone) {
        throw new Error("Email and phone are required.");
    }

    return {
        email,
        phone,
        phoneLink: contactForm.elements.namedItem("contactPhoneLink").value.trim() || phone,
        location: contactForm.elements.namedItem("contactLocation").value.trim(),
        githubUrl: contactForm.elements.namedItem("contactGithub").value.trim(),
        linkedinUrl: contactForm.elements.namedItem("contactLinkedin").value.trim(),
        xUrl: contactForm.elements.namedItem("contactX").value.trim(),
        facebookUrl: contactForm.elements.namedItem("contactFacebook").value.trim()
    };
}

function getSkillPayload() {
    const kind = skillForm.elements.namedItem("skillKind").value;
    const title = skillForm.elements.namedItem("skillTitle").value.trim();
    const order = Number(skillForm.elements.namedItem("skillOrder").value || 0);
    const progress = Number(skillForm.elements.namedItem("skillProgress").value || 0);
    const description = skillForm.elements.namedItem("skillDescription").value.trim();

    if (!title) {
        throw new Error("Skill title is required.");
    }

    if (kind === "meter" && (!description || !Number.isFinite(progress))) {
        throw new Error("Meter skills need a description and progress value.");
    }

    return {
        kind,
        title,
        order,
        progress: kind === "meter" ? progress : 0,
        description: kind === "meter" ? description : ""
    };
}

function syncAuthUI(user) {
    const isLoggedIn = Boolean(user) || !authReady;
    authShell.hidden = isLoggedIn;
    dashboardShell.hidden = !isLoggedIn;
    adminUserEmail.textContent = user?.email || "Local admin mode";
}

function fillProjectForm(project) {
    projectForm.elements.namedItem("projectEditId").value = project.id || "";
    projectForm.elements.namedItem("projectTitle").value = project.title || "";
    projectForm.elements.namedItem("projectImage").value = project.image || "";
    projectForm.elements.namedItem("projectCategories").value = (project.categories || []).join(", ");
    projectForm.elements.namedItem("projectMeta").value = (project.meta || []).join(", ");
    projectForm.elements.namedItem("projectTags").value = (project.tags || []).join(", ");
    projectForm.elements.namedItem("projectLive").value = project.liveUrl || "";
    projectForm.elements.namedItem("projectGithub").value = project.githubUrl || "";
    projectForm.elements.namedItem("projectAlt").value = project.imageAlt || "";
    projectForm.elements.namedItem("projectDescription").value = project.description || "";
}

function clearProjectForm() {
    projectForm.reset();
    projectForm.elements.namedItem("projectEditId").value = "";
}

function getProjectPayload() {
    const title = projectForm.elements.namedItem("projectTitle").value.trim();
    const description = projectForm.elements.namedItem("projectDescription").value.trim();
    const image = projectForm.elements.namedItem("projectImage").value.trim();
    const categories = splitList(projectForm.elements.namedItem("projectCategories").value.trim().toLowerCase());
    const meta = splitList(projectForm.elements.namedItem("projectMeta").value.trim());
    const tags = splitList(projectForm.elements.namedItem("projectTags").value.trim());

    if (!title || !description || !categories.length) {
        throw new Error("Project name, description, and at least one category are required.");
    }

    return {
        title,
        description,
        image,
        imageAlt: projectForm.elements.namedItem("projectAlt").value.trim() || `${title} preview`,
        categories,
        meta,
        tags,
        liveUrl: projectForm.elements.namedItem("projectLive").value.trim(),
        githubUrl: projectForm.elements.namedItem("projectGithub").value.trim(),
        order: projects.findIndex((item) => item.id === projectForm.elements.namedItem("projectEditId").value) + 1 || projects.length + 1,
        createdAt: new Date().toISOString()
    };
}

async function setupFirebaseDashboard() {
    if (!isFirebaseConfigured()) {
        authReady = false;
        loginStatus.textContent = "Firebase is not configured yet. The dashboard is showing local demo data only.";
        dashboardStatus.textContent = "Connect Firebase to moderate comments and manage projects live.";
        syncAuthUI(null);
        renderComments();
        renderProjects();
        return;
    }

    try {
        const appModule = await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js");
        const firestoreModule = await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js");
        const authModule = await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js");
        const storageModule = await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js");
        const app = appModule.getApps()[0] || appModule.initializeApp(firebaseSettings.config);
        const db = firestoreModule.getFirestore(app);
        const auth = authModule.getAuth(app);
        const storage = storageModule.getStorage(app);
        const commentsCollectionName = firebaseSettings.collectionName || "portfolioComments";
        const projectsCollectionName = firebaseSettings.projectsCollectionName || "portfolioProjects";
        const contentCollectionName = firebaseSettings.contentCollectionName || "portfolioContent";
        const skillsCollectionName = firebaseSettings.skillsCollectionName || "portfolioSkills";

        firebase = { db, auth, storage, firestoreModule, authModule, storageModule, commentsCollectionName, projectsCollectionName, contentCollectionName, skillsCollectionName };
        authReady = true;

        authModule.onAuthStateChanged(auth, (user) => {
            syncAuthUI(user);
            dashboardStatus.textContent = user ? "Realtime moderation and project management are connected to Firebase." : "Sign in to start managing comments and projects.";
        });

        firestoreModule.onSnapshot(
            firestoreModule.query(firestoreModule.collection(db, commentsCollectionName), firestoreModule.orderBy("createdAt", "desc")),
            (snapshot) => {
                comments = snapshot.docs.map((item) => normalizeComment(item.id, item.data()));
                localStorage.setItem(commentsStorageKey, JSON.stringify(comments));
                renderComments();
            }
        );

        firestoreModule.onSnapshot(
            firestoreModule.query(firestoreModule.collection(db, projectsCollectionName), firestoreModule.orderBy("order", "asc")),
            (snapshot) => {
                projects = snapshot.docs.map((item) => normalizeProject(item.id, item.data()));
                localStorage.setItem(projectsStorageKey, JSON.stringify(projects));
                renderProjects();
            }
        );

        firestoreModule.onSnapshot(
            firestoreModule.doc(db, contentCollectionName, "heroProfile"),
            (snapshot) => {
                if (snapshot.exists()) {
                    heroContent = normalizeHero(snapshot.data());
                    localStorage.setItem(heroStorageKey, JSON.stringify(heroContent));
                }
                fillProfileForm();
            }
        );

        firestoreModule.onSnapshot(
            firestoreModule.doc(db, contentCollectionName, "contactProfile"),
            (snapshot) => {
                if (snapshot.exists()) {
                    contactContent = normalizeContact(snapshot.data());
                    localStorage.setItem(contactStorageKey, JSON.stringify(contactContent));
                }
                fillContactForm();
            }
        );

        firestoreModule.onSnapshot(
            firestoreModule.query(firestoreModule.collection(db, skillsCollectionName), firestoreModule.orderBy("order", "asc")),
            (snapshot) => {
                skills = snapshot.docs.map((item) => normalizeSkill(item.id, item.data()));
                localStorage.setItem(skillsStorageKey, JSON.stringify(skills));
                renderSkills();
            }
        );

        loginForm?.addEventListener("submit", async (event) => {
            event.preventDefault();
            const email = loginForm.elements.namedItem("adminEmail").value.trim();
            const password = loginForm.elements.namedItem("adminPassword").value.trim();

            try {
                await authModule.signInWithEmailAndPassword(auth, email, password);
                loginForm.reset();
                loginStatus.textContent = "";
                showToast("Signed in", "Welcome back to the dashboard.", "success");
            } catch (error) {
                loginStatus.textContent = `Login failed: ${error.message || "Unknown error"}`;
                showToast("Login failed", error.message || "Check the Firebase admin credentials.", "error");
            }
        });

        signOutButton?.addEventListener("click", async () => {
            await authModule.signOut(auth);
            showToast("Signed out", "The admin session has been closed.", "success");
        });
    } catch (error) {
        console.error("Firebase dashboard setup failed:", error);
        authReady = false;
        loginStatus.textContent = `Firebase setup failed: ${error.message || "Unknown error"}`;
        dashboardStatus.textContent = "Check your Firebase config, Firestore, and Authentication setup.";
        syncAuthUI(null);
        renderComments();
        renderProjects();
    }
}

filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
        currentFilter = button.dataset.filter;
        filterButtons.forEach((item) => item.classList.remove("is-active"));
        button.classList.add("is-active");
        renderComments();
    });
});

moderationList?.addEventListener("click", async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const action = target.dataset.action;
    const id = target.dataset.id;
    if (!action || !id) return;

    try {
        if (firebase) {
            const commentRef = firebase.firestoreModule.doc(firebase.db, firebase.commentsCollectionName, id);
            if (action === "approve") await firebase.firestoreModule.updateDoc(commentRef, { status: "approved" });
            if (action === "hide") await firebase.firestoreModule.updateDoc(commentRef, { status: "hidden" });
            if (action === "delete") await firebase.firestoreModule.deleteDoc(commentRef);
        } else {
            if (action === "approve") comments = comments.map((comment) => comment.id === id ? { ...comment, status: "approved" } : comment);
            if (action === "hide") comments = comments.map((comment) => comment.id === id ? { ...comment, status: "hidden" } : comment);
            if (action === "delete") comments = comments.filter((comment) => comment.id !== id);
            localStorage.setItem(commentsStorageKey, JSON.stringify(comments));
            renderComments();
        }
        showToast("Comment updated", `Comment ${action}d successfully.`, "success");
    } catch (error) {
        dashboardStatus.textContent = `Action failed: ${error.message || "Unknown error"}`;
        showToast("Comment action failed", error.message || "Unable to update the comment.", "error");
    }
});

projectForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    try {
        const payload = getProjectPayload();
        const editId = projectForm.elements.namedItem("projectEditId").value.trim();

        if (firebase) {
            if (editId) {
                await firebase.firestoreModule.updateDoc(firebase.firestoreModule.doc(firebase.db, firebase.projectsCollectionName, editId), payload);
                showToast("Project updated", "The project card was updated successfully.", "success");
            } else {
                await firebase.firestoreModule.addDoc(firebase.firestoreModule.collection(firebase.db, firebase.projectsCollectionName), payload);
                showToast("Project added", "A new project card was added to your portfolio.", "success");
            }
        } else {
            if (editId) {
                projects = projects.map((project) => project.id === editId ? { ...project, ...payload } : project);
                showToast("Project updated", "The local project card was updated.", "success");
            } else {
                projects.unshift({ id: `local-${Date.now()}`, ...payload });
                showToast("Project added", "A local project card was added.", "success");
            }
            localStorage.setItem(projectsStorageKey, JSON.stringify(projects));
            renderProjects();
        }

        clearProjectForm();
    } catch (error) {
        showToast("Project form error", error.message || "Unable to save this project.", "error");
    }
});

profileForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    try {
        const payload = getHeroPayload();
        const uploadedPhotoUrl = await uploadHeroImage(heroPhotoFileInput?.files?.[0]);
        if (uploadedPhotoUrl) {
            payload.photoUrl = uploadedPhotoUrl;
            profileForm.elements.namedItem("heroPhotoUrl").value = uploadedPhotoUrl;
        }

        if (firebase) {
            await firebase.firestoreModule.setDoc(
                firebase.firestoreModule.doc(firebase.db, firebase.contentCollectionName, "heroProfile"),
                payload
            );
        } else {
            heroContent = normalizeHero(payload);
            localStorage.setItem(heroStorageKey, JSON.stringify(heroContent));
            fillProfileForm();
        }

        if (heroPhotoFileInput) {
            heroPhotoFileInput.value = "";
        }
        showToast("Hero updated", "The hero section and profile image were updated successfully.", "success");
    } catch (error) {
        showToast("Hero update failed", error.message || "Unable to save the hero content.", "error");
    }
});

contactForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    try {
        const payload = getContactPayload();

        if (firebase) {
            await firebase.firestoreModule.setDoc(
                firebase.firestoreModule.doc(firebase.db, firebase.contentCollectionName, "contactProfile"),
                payload
            );
        } else {
            contactContent = normalizeContact(payload);
            localStorage.setItem(contactStorageKey, JSON.stringify(contactContent));
            fillContactForm();
        }

        showToast("Contact updated", "The contact section details were updated successfully.", "success");
    } catch (error) {
        showToast("Contact update failed", error.message || "Unable to save the contact details.", "error");
    }
});

skillForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    try {
        const payload = getSkillPayload();
        const editId = skillForm.elements.namedItem("skillEditId").value.trim();

        if (firebase) {
            if (editId) {
                await firebase.firestoreModule.updateDoc(firebase.firestoreModule.doc(firebase.db, firebase.skillsCollectionName, editId), payload);
                showToast("Skill updated", "The skill was updated successfully.", "success");
            } else {
                await firebase.firestoreModule.addDoc(firebase.firestoreModule.collection(firebase.db, firebase.skillsCollectionName), payload);
                showToast("Skill added", "A new skill was added successfully.", "success");
            }
        } else {
            if (editId) {
                skills = skills.map((skill) => skill.id === editId ? { ...skill, ...payload } : skill);
            } else {
                skills.unshift({ id: `local-skill-${Date.now()}`, ...payload });
            }
            localStorage.setItem(skillsStorageKey, JSON.stringify(skills));
            renderSkills();
            showToast("Skill saved", "The local skill data was updated.", "success");
        }

        clearSkillForm();
    } catch (error) {
        showToast("Skill form error", error.message || "Unable to save this skill.", "error");
    }
});

projectResetButton?.addEventListener("click", () => {
    clearProjectForm();
    showToast("Form cleared", "The project form is ready for a new entry.", "success");
});

skillResetButton?.addEventListener("click", () => {
    clearSkillForm();
    showToast("Skill form cleared", "The skill form is ready for a new entry.", "success");
});

projectsList?.addEventListener("click", async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const action = target.dataset.projectAction;
    const id = target.dataset.id;
    if (!action || !id) return;

    const project = projects.find((item) => item.id === id);
    if (!project) return;

    if (action === "edit") {
        fillProjectForm(project);
        showToast("Editing project", `You are now editing ${project.title}.`, "success");
        return;
    }

    if (action === "delete") {
        try {
            if (firebase) {
                await firebase.firestoreModule.deleteDoc(firebase.firestoreModule.doc(firebase.db, firebase.projectsCollectionName, id));
            } else {
                projects = projects.filter((item) => item.id !== id);
                localStorage.setItem(projectsStorageKey, JSON.stringify(projects));
                renderProjects();
            }
            clearProjectForm();
            showToast("Project deleted", `${project.title} was removed successfully.`, "success");
        } catch (error) {
            showToast("Delete failed", error.message || "Unable to delete this project.", "error");
        }
    }
});

skillsList?.addEventListener("click", async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const action = target.dataset.skillAction;
    const id = target.dataset.id;
    if (!action || !id) return;

    const skill = skills.find((item) => item.id === id);
    if (!skill) return;

    if (action === "edit") {
        fillSkillForm(skill);
        showToast("Editing skill", `You are now editing ${skill.title}.`, "success");
        return;
    }

    if (action === "delete") {
        try {
            if (firebase) {
                await firebase.firestoreModule.deleteDoc(firebase.firestoreModule.doc(firebase.db, firebase.skillsCollectionName, id));
            } else {
                skills = skills.filter((item) => item.id !== id);
                localStorage.setItem(skillsStorageKey, JSON.stringify(skills));
                renderSkills();
            }
            clearSkillForm();
            showToast("Skill deleted", `${skill.title} was removed successfully.`, "success");
        } catch (error) {
            showToast("Delete failed", error.message || "Unable to delete this skill.", "error");
        }
    }
});

renderComments();
renderProjects();
fillProfileForm();
fillContactForm();
renderSkills();
setupFirebaseDashboard();
