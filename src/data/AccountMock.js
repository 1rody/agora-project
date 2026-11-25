import { mockAccount } from "./AgoraMock.js";

/**
 * @typedef {Object} Profile
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {string} password
 * @property {string} lastTimeOnline
 */

/** @type {Profile[]} */
export const accounts = [mockAccount];

export const getProfile = (id) =>  accounts.find((profile) => profile.id === id);

export const login = (email, password) =>
    accounts.find((profile) => profile.email === email && profile.password === password);

export const addAccount = (name, email, password) => {
    const profile = {
        id: String(accounts.length + 1).padStart(2, "0"),
        name,
        email,
        password,
        lastTimeOnline: "",
    };
    accounts.push(profile);
    return profile;
};
