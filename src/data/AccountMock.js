
/**
 * @typedef {Object} Profile
 * @property {string} id
 * @property {string} name
 * @property {string} lastTimeOnline
 */

/** @type {Profile[]} */

console.log("MockProfile carregou");
export const accounts = [
    { 
        id: "01",
        name: "Lucas",
        lastTimeOnline: "14/11/2026 : 14:07",
    },
];

export const getProfile = (id) =>  accounts.find((profile) => profile.id === id);