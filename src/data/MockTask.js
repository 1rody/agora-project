/** @import 

/**
 * @typedef {Object} Task
 * @property {string} id
 * @property {string} profileId   
 * @property {string} name
 * @property {string} description
 * @property {string} startDate
 * @property {string} endDate
 * @property {"low" | "medium" | "high"} priority
 * @property {number} estimatedTime   em minutos
 */

import { addHistory } from "./HistoryMock.js";

const STORAGE_KEY = "agora-tasks";

/** @type {Task[]} */
const defaultTasks = [
    {
        id: "t1",
        profileId: "01",
        name: "Estudar JS",
        description: "Revisar módulos",
        startDate: "2026-11-15",
        endDate: "2026-11-20",
        priority: "medium",
        estimatedTime: 55,
    },
];

/** @type {Task[]} */
export const tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? defaultTasks;

export const getTasksByProfile = (profileId) =>
    tasks.filter((task) => task.profileId === profileId);

export const addTask = (task) => {
    const newTask = { id: `t${tasks.length + 1}`, ...task };
    tasks.push(newTask);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    addHistory(newTask.profileId, newTask.name, "created");
    return newTask;
};