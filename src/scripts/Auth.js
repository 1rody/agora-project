import { addAccount, login } from "../data/AccountMock.js";
import { MINIMUM_PASSWORD_LENGTH, PROFILE_ID, mockSecurity } from "../data/AgoraMock.js";
import { showStartupContent, startSession } from "./Session.js";

const form = document.querySelector("#login-form, #register-form");
if (form) {
    const registering = form.id === "register-form";
    const submit = form.querySelector('button[type="submit"]');
    const feedback = form.querySelector('[data-field="message"]');
    let entering = false;

    function resetEntry() {
        entering = false;
        submit.disabled = false;
        submit.textContent = registering ? "REGISTRE-SE" : "ENTRAR";
        for (const button of form.querySelectorAll("[data-social-login]")) button.disabled = false;
    }

    function enter(profileId) {
        if (entering) return;
        entering = true;
        feedback.textContent = "";
        submit.textContent = "ENTRANDO....";
        submit.disabled = true;
        for (const button of form.querySelectorAll("[data-social-login]")) button.disabled = true;
        setTimeout(() => {
            try {
                startSession(profileId);
            } catch {
                resetEntry();
                feedback.textContent = "O navegador bloqueou o armazenamento da sessão.";
                return;
            }
            location.assign("./app.html");
        }, 450);
    }

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        if (entering) return;

        const { email, password, repeat, terms } = form.elements;
        if (registering && !terms.checked) {
            feedback.textContent = "Para se registrar, você precisa aceitar os termos.";
        } else if (!email.validity.valid) {
            feedback.textContent = "Informe um e-mail válido.";
            email.focus();
        } else if (!password.value.trim()) {
            feedback.textContent = "Informe sua senha.";
            password.focus();
        } else if (registering && password.value.length < MINIMUM_PASSWORD_LENGTH) {
            feedback.textContent = "A senha deve ter pelo menos " + MINIMUM_PASSWORD_LENGTH + " caracteres.";
            password.focus();
        } else if (registering && password.value !== repeat.value) {
            feedback.textContent = "As senhas precisam ser iguais.";
            repeat.focus();
        } else if (!registering && !login(email.value.trim().toLowerCase(), password.value)) {
            feedback.textContent = "E-mail ou senha incorretos.";
        } else {
            const account = registering
                ? addAccount(email.value.trim().split("@")[0], email.value.trim(), password.value)
                : login(email.value.trim(), password.value);
            if (!account) {
                feedback.textContent = "Este e-mail já está cadastrado.";
                return;
            }
            enter(account.id);
        }
    });

    for (const button of form.querySelectorAll("[data-social-login]")) button.addEventListener("click", () => enter(PROFILE_ID));
    window.addEventListener("pageshow", (event) => {
        if (event.persisted && entering) resetEntry();
    });
}


const recovery = document.querySelector("#recover-account");
if (recovery) {
    const emailForm = recovery.querySelector("#recovery-email-form");
    const codeForm = recovery.querySelector("#recovery-code-form");
    const sent = recovery.querySelector("#recovery-sent");
    const feedback = recovery.querySelector('[data-field="message"]');
    const backToLogin = recovery.querySelector("#recovery-login");

    emailForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const email = emailForm.elements.email;
        if (!email.validity.valid) {
            feedback.textContent = "Informe um e-mail válido.";
            email.focus();
            return;
        }

        feedback.textContent = "";
        sent.hidden = false;
        emailForm.hidden = true;
        codeForm.hidden = false;
        codeForm.elements.code.focus();
    });

    codeForm.addEventListener("submit", (event) => {
        event.preventDefault();
        if (codeForm.hidden) return;
        if (codeForm.elements.code.value.trim() !== mockSecurity.verificationCode) {
            feedback.textContent = "Código inválido";
            return;
        }

        codeForm.reset();
        codeForm.hidden = true;
        feedback.textContent = "Código confirmado!";
        backToLogin.hidden = false;
        backToLogin.focus();
    });
}

showStartupContent();
