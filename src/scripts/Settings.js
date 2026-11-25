import { getSessionProfileId, showStartupContent } from "./Session.js";
import { getProfile } from "../data/AccountMock.js";
import { MINIMUM_PASSWORD_LENGTH, NOW, mockSecurity } from "../data/AgoraMock.js";
import { dateKey, formatDate, formatDateTime } from "../data/TaskDates.js";

const profile = getProfile(getSessionProfileId());

function setupProfile(form) {
    const summary = document.querySelector("#profile");
    const name = summary.querySelector('[data-field="name"]');
    const feedback = form.querySelector('[role="status"]');
    const back = document.querySelector("#settings-back");
    const title = document.querySelector("#settings-title");
    const editor = document.querySelector("#perfil");
    const fields = form.elements;

    const today = dateKey(NOW);
    const age = summary.querySelector('[data-field="age"]');
    const pronouns = summary.querySelector('[data-field="pronouns"]');

    function showProfileDetails(birthDate, selectedPronouns) {
        const years = Number(today.slice(0, 4)) - Number(birthDate.slice(0, 4));
        const birthdayPending = today.slice(5) < birthDate.slice(5);
        age.textContent = (years - Number(birthdayPending)) + " anos";
        pronouns.textContent = selectedPronouns;
    }

    name.textContent = profile.name;
    showProfileDetails(profile.birthDate, profile.pronouns);
    summary.querySelector('[data-field="memberSince"]').textContent = formatDate(profile.memberSince);
    fields.name.value = profile.name;
    fields.birthDate.value = profile.birthDate;
    fields.birthDate.max = today;
    fields.pronouns.value = profile.pronouns;

    function showSection() {
        const editing = location.hash === "#perfil";
        editor.hidden = !editing;
        summary.hidden = editing;
        title.textContent = editing ? "PERFIL" : "CONFIGURAÇÕES";
        back.href = editing ? "#settings" : "../../app.html";
        if (editing) fields.name.focus();
    }

    window.addEventListener("hashchange", showSection);
    showSection();

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const updatedName = fields.name.value.trim();
        if (!updatedName) {
            feedback.textContent = "Preencha seu nome.";
            fields.name.focus();
            return;
        }
        if (!fields.birthDate.validity.valid) {
            feedback.textContent = "Informe uma data de nascimento válida.";
            fields.birthDate.focus();
            return;
        }

        name.textContent = updatedName;
        fields.name.value = updatedName;
        fields.pronouns.value = fields.pronouns.value.trim();
        showProfileDetails(fields.birthDate.value, fields.pronouns.value);
        feedback.textContent = "Dados salvos!";
    });
}

function setupEmail() {
    const current = document.querySelector("#current-email");
    const send = document.querySelector("#send-email-code");
    const verify = document.querySelector("#verify-email-code");
    const recipient = document.querySelector("#email-recipient");
    const feedback = document.querySelector("#email-feedback");
    const code = verify.elements.code;
    let pendingEmail = "";

    current.textContent = profile.email;
    send.addEventListener("submit", (event) => {
        event.preventDefault();
        const field = send.elements.email;
        const email = field.value.trim();
        if (!field.validity.valid) {
            feedback.textContent = "Informe um e-mail válido.";
            return;
        }
        if (email.toLowerCase() === current.textContent.toLowerCase()) {
            feedback.textContent = "Informe um e-mail diferente do atual.";
            return;
        }

        pendingEmail = email;
        recipient.querySelector("p").textContent = `Enviado para ${pendingEmail}`;
        recipient.hidden = false;
        send.hidden = true;
        feedback.textContent = "";
        verify.reset();
        verify.hidden = false;
        code.focus();
    });

    document.querySelector("#edit-email-recipient").addEventListener("click", () => {
        pendingEmail = "";
        recipient.hidden = true;
        verify.hidden = true;
        feedback.textContent = "";
        send.hidden = false;
        send.elements.email.focus();
    });

    verify.addEventListener("submit", (event) => {
        event.preventDefault();
        if (!pendingEmail || code.value.trim() !== mockSecurity.verificationCode) {
            feedback.textContent = "Código inválido";
            return;
        }

        current.textContent = pendingEmail;
        pendingEmail = "";
        recipient.hidden = true;
        verify.hidden = true;
        verify.reset();
        send.reset();
        send.hidden = false;
        feedback.textContent = "E-mail alterado!";
    });
}

function setupSecurity() {
    setupEmail();

    function openLinkedSection() {
        const details = document.getElementById(location.hash.slice(1));
        if (details instanceof HTMLDetailsElement) details.open = true;
    }

    window.addEventListener("hashchange", openLinkedSection);
    openLinkedSection();

    const recovery = document.querySelector("#recovery-email-form");
    const feedback = recovery.querySelector('[role="status"]');
    recovery.addEventListener("submit", (event) => {
        event.preventDefault();
        const field = recovery.elements.email;
        feedback.textContent = field.validity.valid
            ? `E-mail de recuperação adicionado: ${field.value.trim()}`
            : "Informe um e-mail válido.";
    });

    const devices = document.querySelector("#device-list");
    const template = document.querySelector("#device-entry");
    for (const device of mockSecurity.devices) {
        const item = template.content.cloneNode(true);
        item.querySelector('[data-field="name"]').textContent = device.isCurrent
            ? `${device.name} (este dispositivo)` : device.name;
        item.querySelector('[data-field="lastAccess"]').textContent = `Último acesso em ${formatDateTime(device.lastAccess)}`;
        devices.append(item);
    }
}

function setupPassword(form) {
    const feedback = form.querySelector('[role="status"]');
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const password = form.elements.password.value;
        const repeat = form.elements.repeat.value;
        if (!password.trim() || !repeat.trim()) {
            feedback.textContent = "Preencha todos os campos para trocar a senha";
        } else if (password.length < MINIMUM_PASSWORD_LENGTH) {
            feedback.textContent = `A senha deve ter pelo menos ${MINIMUM_PASSWORD_LENGTH} caracteres.`;
        } else if (password !== repeat) {
            feedback.textContent = "As senhas precisam ser iguais.";
        } else {
            form.reset();
            feedback.textContent = "Senha salva!";
        }
    });
}

const twoFactor = document.querySelector("#status");
if (twoFactor) twoFactor.textContent = mockSecurity.twoFactorEnabled ? "ATIVADA" : "DESATIVADA";

const profileForm = document.querySelector("#profile-form");
const passwordForm = document.querySelector("#change-password");
if (profileForm) setupProfile(profileForm);
if (document.querySelector("#security")) setupSecurity();
if (passwordForm) setupPassword(passwordForm);
showStartupContent();
