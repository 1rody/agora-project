import { addAccount, emailExists, getAccountByEmail, login, updateAccount } from "../data/AccountMock.js";
import { MINIMUM_PASSWORD_LENGTH, PROFILE_ID, mockSecurity } from "../data/AgoraMock.js";
import { showStartupContent, startSession } from "./Session.js";

function clearErrors(form) {
    for (const input of form.querySelectorAll('[aria-invalid]')) input.removeAttribute('aria-invalid');
}
function invalid(input) {
    input.setAttribute('aria-invalid', 'true');
    input.focus();
}
function enter(profileId, feedback) {
    try { startSession(profileId); } catch {
        feedback.textContent = 'O navegador bloqueou o armazenamento da sessão.';
        return;
    }
    const overlay = document.createElement('div');
    overlay.className = 'entering-overlay';
    overlay.setAttribute('role', 'status');
    const logo = document.createElement('img');
    logo.src = '../assets/icons/logo.png';
    logo.alt = 'Agora';
    logo.className = 'auth-logo inversion-colors';
    const progress = document.createElement('div');
    progress.className = 'entering-progress';
    progress.setAttribute('aria-hidden', 'true');
    const bar = document.createElement('div');
    progress.append(bar);
    const text = document.createElement('p');
    text.textContent = 'ENTRANDO...';
    overlay.append(logo, progress, text);
    document.body.append(overlay);
    setTimeout(() => location.assign('./app.html'), 1200);
}
const form = document.querySelector('#login-form, #register-form');
if (form) {
    const registering = form.id === 'register-form';
    const feedback = form.querySelector('[data-field="message"]');
    let entering = false;
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        if (entering) return;
        clearErrors(form);
        feedback.textContent = '';
        const { email, password, repeat, terms } = form.elements;
        if (!registering) {
            const account = login(email.value.trim(), password.value);
            if (!account) {
                feedback.textContent = 'E-mail ou senha incorretos.';
                invalid(email); password.setAttribute('aria-invalid', 'true');
                return;
            }
            entering = true; enter(account.id, feedback); entering = Boolean(document.querySelector('.entering-overlay'));
            return;
        }
        if (!email.validity.valid) { feedback.textContent = 'Informe um e-mail válido.'; invalid(email); return; }
        if (emailExists(email.value)) { feedback.textContent = 'Este e-mail já está cadastrado.'; invalid(email); return; }
        if (password.value.length < MINIMUM_PASSWORD_LENGTH) { feedback.textContent = `A senha deve ter pelo menos ${MINIMUM_PASSWORD_LENGTH} caracteres.`; invalid(password); return; }
        if (password.value !== repeat.value) { feedback.textContent = 'As senhas precisam ser iguais.'; invalid(repeat); return; }
        if (!terms.checked) { feedback.textContent = 'Para se registrar, você precisa aceitar os termos.'; terms.focus(); return; }
        const account = addAccount(email.value.trim().split('@')[0], email.value.trim(), password.value);
        if (!account) { feedback.textContent = 'Este e-mail já está cadastrado.'; invalid(email); return; }
        entering = true; enter(account.id, feedback); entering = Boolean(document.querySelector('.entering-overlay'));
    });
    for (const button of form.querySelectorAll('[data-social-login]')) button.addEventListener('click', () => {
        if (!entering) { entering = true; enter(PROFILE_ID, feedback); entering = Boolean(document.querySelector('.entering-overlay')); }
    });
    window.addEventListener('pageshow', (event) => { if (event.persisted) { document.querySelector('.entering-overlay')?.remove(); entering = false; } });
}
const recovery = document.querySelector('#recover-account');
if (recovery) {
    const emailForm = recovery.querySelector('#recovery-email-form');
    const codeForm = recovery.querySelector('#recovery-code-form');
    const passwordForm = recovery.querySelector('#recovery-password-form');
    const feedback = recovery.querySelector('[data-field="message"]');
    emailForm.addEventListener('submit', (event) => {
        event.preventDefault(); clearErrors(emailForm);
        const email = emailForm.elements.email;
        if (!email.validity.valid) { feedback.textContent = 'Informe um e-mail válido.'; invalid(email); return; }
        if (!getAccountByEmail(email.value)) { feedback.textContent = 'Não encontramos uma conta com esse e-mail.'; invalid(email); return; }
        feedback.textContent = ''; emailForm.hidden = true; codeForm.hidden = false; codeForm.elements.code.focus();
    });
    codeForm.addEventListener('submit', (event) => {
        event.preventDefault(); clearErrors(codeForm);
        if (codeForm.elements.code.value.trim() !== mockSecurity.verificationCode) { feedback.textContent = 'Código inválido'; invalid(codeForm.elements.code); return; }
        codeForm.hidden = true; passwordForm.hidden = false; feedback.textContent = 'Código confirmado'; passwordForm.elements.password.focus();
    });
    passwordForm.addEventListener('submit', (event) => {
        event.preventDefault(); clearErrors(passwordForm);
        const { password, repeat } = passwordForm.elements;
        if (password.value.length < MINIMUM_PASSWORD_LENGTH) { feedback.textContent = `A senha deve ter pelo menos ${MINIMUM_PASSWORD_LENGTH} caracteres.`; invalid(password); return; }
        if (password.value !== repeat.value) { feedback.textContent = 'As senhas precisam ser iguais.'; invalid(repeat); return; }
        const account = getAccountByEmail(emailForm.elements.email.value);
        if (!account) { feedback.textContent = 'Não encontramos uma conta com esse e-mail.'; return; }
        if (!updateAccount(account.id, { password: password.value })) {
            feedback.textContent = 'Não foi possível atualizar a senha. Tente novamente mais tarde.';
            return;
        }
        passwordForm.hidden = true;
        feedback.textContent = 'Senha alterada. Faça login com a nova senha.';
    });
}
showStartupContent();
