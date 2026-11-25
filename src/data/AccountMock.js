import { mockAccount } from "./AgoraMock.js";

const STORAGE_KEY = "agora-accounts";

function readAccounts() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) return JSON.parse(stored);
    const initial = [{ ...mockAccount }];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
}

const normalizeEmail = (email) => String(email).trim().toLowerCase();

export const getProfile = (id) => readAccounts().find((profile) => profile.id === id);
export const getAccountByEmail = (email) => readAccounts().find((profile) => normalizeEmail(profile.email) === normalizeEmail(email));
export const emailExists = (email) => readAccounts().some((profile) => normalizeEmail(profile.email) === normalizeEmail(email));
export const login = (email, password) => readAccounts().find((profile) =>
    normalizeEmail(profile.email) === normalizeEmail(email) && profile.password === password);

export function addAccount(name, email, password) {
    const accounts = readAccounts();
    if (accounts.some((profile) => normalizeEmail(profile.email) === normalizeEmail(email))) return null;
    const ids = new Set(accounts.map((profile) => profile.id));
    let nextId = 1;
    while (ids.has(String(nextId).padStart(2, "0"))) nextId++;
    const profile = { id: String(nextId).padStart(2, "0"), name, email: email.trim(), password, lastTimeOnline: "" };
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...accounts, profile]));
    return profile;
}

export function updateAccount(id, changes) {
    const accounts = readAccounts();
    const index = accounts.findIndex((profile) => profile.id === id);
    if (index === -1) return null;
    if (changes.email !== undefined && accounts.some((profile) => profile.id !== id && normalizeEmail(profile.email) === normalizeEmail(changes.email))) return null;
    const profile = { ...accounts[index], ...changes, id };
    accounts[index] = profile;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
    return profile;
}
