/**
 * @typedef {Object} Profile
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {string} password
 * @property {string} lastTimeOnline
 * @property {string} createdAt
 * @property {boolean} otp
 */

console.log("MockProfile carregou");

const STORAGE_KEY = "agora-accounts";
const SESSION_KEY = "agora-session";

/** @type {Profile[]} */
const defaultAccounts = [
    {
        id: "01",
        name: "Lucas",
        email: "jhon@mail.com",
        password: "123#4$*Aa1213",
        lastTimeOnline: "14/11/2026 : 14:07",
        createdAt: "2026-11-14",
        otp: false,
    },
];

/** @type {Profile[]} */
export const accounts = JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? defaultAccounts;

const saveAccounts = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));

export const getProfile = (id) =>  accounts.find((profile) => profile.id === id);

export const getProfileByEmail = (email) => accounts.find((profile) => profile.email === email);

export const login = (email, password) =>
    accounts.find((profile) => profile.email === email && profile.password === password);

export const setSession = (id) => localStorage.setItem(SESSION_KEY, id);

export const getCurrentProfile = () => getProfile(localStorage.getItem(SESSION_KEY)) ?? accounts[0];

export const addAccount = (name, email, password) => {
    const profile = {
        id: String(accounts.length + 1).padStart(2, "0"),
        name,
        email,
        password,
        lastTimeOnline: "",
        createdAt: new Date().toISOString().slice(0, 10),
        otp: false,
    };
    accounts.push(profile);
    saveAccounts();
    return profile;
};

export const updateAccount = (id, changes) => {
    const profile = getProfile(id);
    Object.assign(profile, changes);
    saveAccounts();
    return profile;
};
