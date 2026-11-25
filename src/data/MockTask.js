import { NOW, mockTasks } from "./AgoraMock.js";
import { addHistory, createTaskHistoryEntry, isTaskHistoryStatus } from "./HistoryMock.js";

/**
 * @typedef {Object} Task
 * @property {string} id
 * @property {string} profileId   
 * @property {string} name
 * @property {string} description
 * @property {string} startDate
 * @property {string} endDate
 * @property {"low" | "medium" | "high"} priority
 * @property {"low" | "medium" | "high"} urgency
 * @property {number} estimatedTime
 * @property {string} createdAt
 * @property {"a fazer" | "em andamento" | "concluída" | "adiada" | "cancelada"} status
 * @property {string[]} idsVinculados
 * @property {number | null} tempoReal
 */

const STORAGE_KEY = "agora-tasks";
const TASKS_CHANGE = "agora:tasks-change";
const PRIORITY_VALUES = new Map([
    ["baixa", "low"], ["media", "medium"], ["alta", "high"],
    ["low", "low"], ["medium", "medium"], ["high", "high"],
]);

export const PRIORITY_LABELS = { low: "Baixa", medium: "Média", high: "Alta" };

/** @type {Task[]} */
export let tasks = readTasks();

function normalizePriority(value) {
    const key = String(value ?? "").trim().toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");
    return PRIORITY_VALUES.get(key) ?? "medium";
}

function normalizeTask(task) {
    const duration = Number(task.estimatedTime);
    const status = task.status ?? "a fazer";
    const normalized = {
        ...task,
        priority: normalizePriority(task.priority),
        urgency: normalizePriority(task.urgency),
        estimatedTime: Number.isFinite(duration) && duration > 0 ? duration : 0,
        createdAt: task.createdAt ?? (task.startDate || NOW.toISOString()),
        status,
        idsVinculados: Array.isArray(task.idsVinculados) ? task.idsVinculados : [],
        tempoReal: status === "concluída" ? (task.tempoReal ?? null) : null,
        requiresFullTime: task.requiresFullTime ?? true,
        scheduled: task.scheduled ?? Boolean(task.startDate),
        timerStartedAt: status === "em andamento" && Number.isFinite(task.timerStartedAt) ? task.timerStartedAt : null,
    };

    normalized.activity = task.activity ?? (isTaskHistoryStatus(normalized.status)
        ? [createTaskHistoryEntry(normalized, task.statusDate ?? normalized.createdAt)]
        : []);
    return normalized;
}

function readTasks() {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return (stored ?? mockTasks).map(normalizeTask);
}

function saveTasks(updatedTasks) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTasks));
    tasks = updatedTasks;
    window.dispatchEvent(new Event(TASKS_CHANGE));
}

export function subscribeToTasks(callback) {
    window.addEventListener(TASKS_CHANGE, callback);
    window.addEventListener("storage", (event) => {
        if (event.key === STORAGE_KEY || event.key === null) callback();
    });
}

export function getTasksByProfile(profileId) {
    tasks = readTasks();
    return tasks.filter((task) => task.profileId === profileId);
}

export const addTask = (task) => {
    const current = readTasks();
    const ids = new Set(current.map((item) => item.id));
    let nextId = current.length + 1;
    while (ids.has(`t${nextId}`)) nextId++;

    const newTask = normalizeTask({ id: `t${nextId}`, createdAt: NOW.toISOString(), ...task });
    saveTasks([...current, newTask]);
    addHistory(newTask.profileId, newTask.name, "created");
    return newTask;
};

export function updateTask(taskId, changes) {
    const current = readTasks();
    const index = current.findIndex((task) => task.id === taskId);
    if (index === -1) return null;

    const previous = current[index];
    const task = normalizeTask({ ...previous, ...changes, id: previous.id, profileId: previous.profileId });
    if (task.status !== previous.status && isTaskHistoryStatus(task.status)) {
        task.statusDate = NOW.toISOString();
        task.activity = [...previous.activity, createTaskHistoryEntry(task, task.statusDate, previous.activity.length + 1)];
    }

    current[index] = task;
    saveTasks(current);
    return task;
}
