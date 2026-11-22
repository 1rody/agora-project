/**
 * @typedef {Object} HistoryEntry
 * @property {string} id
 * @property {string} profileId
 * @property {string} taskName
 * @property {"created" | "deleted"} action
 * @property {string} date
 */

const STORAGE_KEY = "agora-history";

/** @type {HistoryEntry[]} */
const defaultHistory = [
    {
        id: "h1",
        profileId: "01",
        taskName: "Ler capitulo 3",
        action: "deleted",
        date: "2026-11-18",
    },
];

/** @type {HistoryEntry[]} */
export const history = JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? defaultHistory;

export const getHistoryByProfile = (profileId) =>
    history.filter((entry) => entry.profileId === profileId);

export const addHistory = (profileId, taskName, action) => {
    const entry = {
        id: `h${history.length + 1}`,
        profileId,
        taskName,
        action,
        date: new Date().toISOString().slice(0, 10),
    };
    history.push(entry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    return entry;
};
