import { getSessionProfileId, showStartupContent } from "./Session.js";
import { getProfile, emailExists, updateAccount } from "../data/AccountMock.js";
import { MINIMUM_PASSWORD_LENGTH, NOW, mockSecurity, mockTasks, mockHistory } from "../data/AgoraMock.js";
import { getTasksByProfile } from "../data/MockTask.js";
import { getHistoryByProfile } from "../data/HistoryMock.js";
import { dateKey, formatDate, parseTaskDate } from "../data/TaskDates.js";

const profileId = getSessionProfileId();
const profile = getProfile(profileId);
const field = (name) => document.querySelector(`[data-field="${name}"]`);

function setupProfile() {
    const form = document.querySelector("#profile-form");
    const summary = document.querySelector("#profile");
    const editor = document.querySelector("#perfil");
    const feedback = form.querySelector('[role="status"]');
    const today = dateKey(NOW);
    function render() {
        const current = getProfile(profileId);
        field("name").textContent = current.name;
        const memberDate = parseTaskDate(current.memberSince);
        field("memberSince").textContent = memberDate
            ? new Intl.DateTimeFormat("pt-BR", { month: "short", year: "numeric", timeZone: "America/Bahia" }).format(memberDate).replace(" de ", " ").replace(".", "")
            : "Data não informada";
        const birth = current.birthDate || "";
        const age = birth ? Number(today.slice(0, 4)) - Number(birth.slice(0, 4)) - Number(today.slice(5) < birth.slice(5)) : null;
        field("age").textContent = birth ? `${age} anos · ${formatDate(birth)}` : "Nascimento não informado";
        field("pronouns").textContent = current.pronouns || "Não informados";
        field("recovery").textContent = current.recoveryEmail || "ADICIONAR";
        form.elements.name.value = current.name || "";
        form.elements.birthDate.value = birth;
        form.elements.birthDate.max = today;
        form.elements.pronouns.value = current.pronouns || "";
    }
    function showSection() {
        const editing = location.hash === "#perfil";
        editor.hidden = !editing;
        summary.hidden = editing;
        document.querySelector("#settings-title").textContent = editing ? "PERFIL" : "CONFIGURAÇÕES";
        document.querySelector("#settings-back").href = editing ? "#settings" : "../../app.html";
        if (editing) form.elements.name.focus();
    }
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const name = form.elements.name.value.trim();
        if (!name || !form.elements.birthDate.validity.valid) {
            feedback.textContent = !name ? "Preencha seu nome." : "Informe uma data de nascimento válida.";
            return;
        }
        updateAccount(profileId, { name, birthDate: form.elements.birthDate.value, pronouns: form.elements.pronouns.value.trim() });
        render();
        feedback.textContent = "Dados salvos!";
    });
    window.addEventListener("hashchange", showSection);
    render();
    showSection();
}

function setupEmailFlow(kind) {
    const block = document.querySelector(`#${kind}`);
    const send = block.querySelector("[data-send]");
    const verify = block.querySelector("[data-verify]");
    const recipient = block.querySelector("[data-recipient]");
    const feedback = block.querySelector('[role="status"]');
    let pending = "";
    send.addEventListener("submit", (event) => {
        event.preventDefault();
        const input = send.elements.email;
        const email = input.value.trim();
        if (!email || !input.validity.valid) {
            feedback.textContent = "Informe um e-mail válido.";
            return;
        }
        if (kind === "trocar-email" && emailExists(email)) {
            feedback.textContent = "Este e-mail já está cadastrado.";
            return;
        }
        pending = email;
        recipient.textContent = pending;
        send.hidden = true;
        verify.hidden = false;
        feedback.textContent = "";
        verify.elements.code.focus();
    });
    block.querySelector("[data-edit]").addEventListener("click", () => {
        pending = "";
        verify.hidden = true;
        send.hidden = false;
        feedback.textContent = "";
        send.elements.email.focus();
    });
    verify.addEventListener("submit", (event) => {
        event.preventDefault();
        if (!pending || verify.elements.code.value.trim() !== mockSecurity.verificationCode) {
            feedback.textContent = "Código inválido.";
            return;
        }
        const result = updateAccount(profileId, kind === "recuperacao" ? { recoveryEmail: pending } : { email: pending });
        if (!result) {
            feedback.textContent = "Este e-mail já está cadastrado.";
            return;
        }
        field(kind === "recuperacao" ? "recovery" : "email").textContent = pending;
        pending = "";
        send.reset();
        verify.reset();
        verify.hidden = true;
        send.hidden = false;
        feedback.textContent = "E-mail salvo com sucesso.";
    });
}

function setupSecurity() {
    field("email").textContent = profile.email;
    field("recovery").textContent = profile.recoveryEmail || "ADICIONAR";
    setupEmailFlow("recuperacao");
    setupEmailFlow("trocar-email");
    const form = document.querySelector("#change-password");
    const feedback = form.querySelector('[role="status"]');
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const password = form.elements.password.value;
        const repeat = form.elements.repeat.value;
        let message = "";
        if (!password || !repeat) message = "PREENCHA TODOS OS CAMPOS PARA TROCAR A SENHA";
        else if (password.length < MINIMUM_PASSWORD_LENGTH) message = `A senha deve ter pelo menos ${MINIMUM_PASSWORD_LENGTH} caracteres.`;
        else if (password !== repeat) message = "As senhas precisam ser iguais.";
        form.querySelectorAll("fieldset").forEach((item) => item.toggleAttribute("data-invalid", Boolean(message)));
        if (message) {
            feedback.textContent = message;
            return;
        }
        updateAccount(profileId, { password });
        form.reset();
        feedback.textContent = "Senha alterada com sucesso.";
    });
}

function setupDevices() {
    const key = `agora-devices-${profileId}`;
    const list = document.querySelector("#device-list");
    const template = document.querySelector("#device-entry");
    function render() {
        const removed = JSON.parse(localStorage.getItem(key) || "[]");
        const items = mockSecurity.devices.filter((device) => !removed.includes(device.name)).map((device) => {
            const item = template.content.cloneNode(true);
            item.querySelector('[data-field="name"]').textContent = device.name;
            item.querySelector('[data-field="lastAccess"]').textContent = device.isCurrent ? "Este dispositivo" : `Último acesso: ${formatDate(device.lastAccess)}`;
            const button = item.querySelector("button");
            button.hidden = device.isCurrent;
            button.addEventListener("click", () => {
                localStorage.setItem(key, JSON.stringify([...removed, device.name]));
                render();
            });
            return item;
        });
        list.replaceChildren(...items);
    }
    render();
}

function setupPrivacy() {
    const feedback = document.querySelector("#privacy-feedback");
    document.querySelector("#export-data").addEventListener("click", () => {
        const { password, ...account } = getProfile(profileId);
        const tasks = getTasksByProfile(profileId);
        const history = getHistoryByProfile(profileId, tasks);
        const url = URL.createObjectURL(new Blob([JSON.stringify({ account, tasks, history }, null, 4)], { type: "application/json" }));
        const link = document.createElement("a");
        link.href = url;
        link.download = "agora-meus-dados.json";
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 0);
        feedback.textContent = "Seus dados foram exportados.";
    });
    const confirmation = document.querySelector("#delete-confirmation");
    document.querySelector("#delete-data").addEventListener("click", () => { confirmation.hidden = false; });
    document.querySelector("#cancel-delete").addEventListener("click", () => { confirmation.hidden = true; });
    document.querySelector("#confirm-delete").addEventListener("click", () => {
        for (const [key, fallback] of [["agora-tasks", mockTasks], ["agora-history", mockHistory]]) {
            const entries = JSON.parse(localStorage.getItem(key) || "null") ?? fallback;
            localStorage.setItem(key, JSON.stringify(entries.filter((entry) => entry.profileId !== profileId)));
        }
        window.dispatchEvent(new Event("agora:tasks-change"));
        confirmation.hidden = true;
        feedback.textContent = "Tarefas e histórico apagados.";
    });
}

if (profile) {
    if (document.querySelector("#profile-form")) setupProfile();
    if (document.querySelector("#security")) setupSecurity();
    if (document.querySelector("#device-list")) setupDevices();
    if (document.querySelector("#privacy")) setupPrivacy();
}
showStartupContent();
