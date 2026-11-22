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

/** @type {Task[]} */
export const tasks = [
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

export const getTasksByProfile = (profileId) =>
    tasks.filter((task) => task.profileId === profileId);

export const addTask = (task) => {
    const newTask = { id: `t${tasks.length + 1}`, ...task };
    tasks.push(newTask);
    return newTask;
};