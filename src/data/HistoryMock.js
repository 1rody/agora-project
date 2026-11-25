import { mockHistory } from "./AgoraMock.js";

/**
 * @typedef {Object} HistoryEntry
 * @property {string} id
 * @property {string} profileId
 * @property {string} taskName
 * @property {"created" | "deleted"} action
 * @property {string} date
 */

const STORAGE_KEY = "agora-history";
const TASK_HISTORY_STATUSES = new Set(["concluída", "adiada", "cancelada"]);

/** @type {HistoryEntry[]} */
export let history = readHistory();

function readHistory() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? mockHistory;
}

export function createTaskHistoryEntry(task, date, sequence = 1) {
    return {
        id: `${task.id}-${sequence}`,
        profileId: task.profileId,
        taskName: task.name,
        priority: task.priority,
        startDate: task.startDate,
        endDate: task.endDate,
        action: task.status,
        date,
        tempoReal: task.tempoReal,
    };
}

export function getHistoryByProfile(profileId, tasks = []) {
    history = readHistory();
    const taskHistory = tasks.flatMap((task) => task.activity ?? []);
    return [...history, ...taskHistory].filter((entry) => entry.profileId === profileId);
}

export const isTaskHistoryStatus = (status) => TASK_HISTORY_STATUSES.has(status);

export const addHistory = (profileId, taskName, action) => {
    const entries = readHistory();
    const entry = {
        id: `h${entries.length + 1}`,
        profileId,
        taskName,
        action,
        date: new Date().toISOString().slice(0, 10),
    };
    history = [...entries, entry];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    return entry;
};
