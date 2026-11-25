import { getProfile } from "../data/AccountMock.js";

const SESSION_KEY = "agora-session";
const loginUrl = new URL("../login.html", import.meta.url);
const requiresSession = document.body.hasAttribute("data-requires-session");
const startupMessage = document.querySelector("[data-startup-message]");
const startupContent = document.querySelector("[data-startup-content]");
const startupText = startupMessage.querySelector("span");
const openingHelp = startupText.textContent;
let pageReady = false;
let sessionAllowed = !requiresSession;

export function startSession(profileId) {
    sessionStorage.setItem(SESSION_KEY, profileId);
}

export function getSessionProfileId() {
    return sessionStorage.getItem(SESSION_KEY);
}

function updateVisibility() {
    const show = pageReady && sessionAllowed;
    startupContent.hidden = !show;
    startupMessage.hidden = show;
}

export function showStartupContent() {
    if (location.protocol === "file:") return;
    pageReady = true;
    updateVisibility();
}

if (requiresSession && location.protocol !== "file:") {
    function checkSession() {
        try {
            sessionAllowed = Boolean(getProfile(getSessionProfileId()));
            if (sessionAllowed) localStorage.getItem("agora-tasks");
        } catch {
            sessionAllowed = false;
            startupText.textContent = "O navegador bloqueou o armazenamento necessário para abrir o Agora.";
            updateVisibility();
            return;
        }

        startupText.textContent = sessionAllowed ? openingHelp : "Abrindo a tela de login…";
        updateVisibility();
        if (!sessionAllowed) location.replace(loginUrl);
    }

    checkSession();
    window.addEventListener("pageshow", checkSession);
}
