/**
 * @typedef {Object} Recommendation
 * @property {string} name
 * @property {number} estimatedTime   em minutos
 * @property {string} date
 * @property {string} reason
 *
 * @typedef {Object} Usage
 * @property {string} profileId
 * @property {number} oldTasks          tarefas antigas
 * @property {number} doneTasks         tarefas concluidas
 * @property {number} blockedTasks      tarefas bloqueadas
 * @property {number} timeUntilNext     em minutos ate a proxima tarefa
 * @property {"low" | "medium" | "high"} recommendedPriority
 * @property {"good" | "neutral" | "bad"} mood   disposicao do dia
 * @property {Recommendation} recommendation
 */

const STORAGE_KEY = "agora-usage";

/** @type {Usage[]} */
const defaultUsage = [
    {
        profileId: "01",
        oldTasks: 12,
        doneTasks: 8,
        blockedTasks: 3,
        timeUntilNext: 220,
        recommendedPriority: "high",
        mood: "neutral",
        recommendation: {
            name: "Entrevista de estagio",
            estimatedTime: 45,
            date: "20/07/2027 as 17:00",
            reason: "Tarefa urgente pois esse é o unico evento com prioridade alta do dia.",
        },
    },
];

/** @type {Usage[]} */
export const usages = JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? defaultUsage;

export const getUsageByProfile = (profileId) =>
    usages.find((usage) => usage.profileId === profileId);

//guarda a disposicao escolhida no dia
export const setMood = (profileId, mood) => {
    const usage = getUsageByProfile(profileId);
    usage.mood = mood;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usages));
    return usage;
};
