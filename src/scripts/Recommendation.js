import { DAY_MS, MINUTE_MS, dateKey, parseTaskDate } from "../data/TaskDates.js";

export const WEIGHTS = Object.freeze({
    urgency: 32,
    importance: 24,
    deadline: 32,
    age: 10,
    duration: 20,
    disposition: 36,
});

const LEVEL_SCORE = { low: 0.2, medium: 0.55, high: 1 };
const LEVEL_TEXT = { low: "baixa", medium: "média", high: "alta" };
const PENDING = new Set(["a fazer", "em andamento", "adiada"]);

const isPending = (task) => PENDING.has(task.status);
export const isInQueue = (task) => isPending(task) && task.status !== "adiada";

function completedIds(tasks) {
    return new Set(tasks.filter((task) => task.status === "concluída").map((task) => task.id));
}

export function isBlocked(task, completed) {
    return (task.idsVinculados ?? []).some((id) => !completed.has(id));
}

export function getNextCommitment(tasks, now, excludedId) {
    let next = null;
    for (const task of tasks) {
        if (task.id === excludedId || task.scheduled === false || !isInQueue(task)) continue;

        const start = parseTaskDate(task.startDate);
        if (start && start > now && (!next || start < next.start)) next = { task, start };
    }
    return next;
}

export function getAvailableMinutes(commitment, now) {
    return commitment ? (commitment.start - now) / MINUTE_MS : Infinity;
}

export function getUpcomingTasks(tasks, now) {
    const today = dateKey(now);
    return tasks
        .filter(isInQueue)
        .map((task) => ({ task, start: parseTaskDate(task.startDate) }))
        .filter(({ start }) => start && start > now && dateKey(start) === today)
        .sort((first, second) => first.start - second.start)
        .map(({ task }) => task);
}

export function getStats(tasks, now) {
    const completed = completedIds(tasks);
    let old = 0;
    let blocked = 0;

    for (const task of tasks) {
        if (!isPending(task)) continue;

        const deadline = parseTaskDate(task.endDate, true);
        if (deadline && now - deadline >= DAY_MS) old++;
        if (isBlocked(task, completed)) blocked++;
    }
    return { old, completed: completed.size, blocked };
}

export function fitsAvailableTime(task, available) {
    return task.requiresFullTime === false || task.estimatedTime <= available;
}

function getFactors(task, now, disposition, available) {
    const deadline = parseTaskDate(task.endDate, true);
    const remaining = deadline ? (deadline - now) / DAY_MS : Infinity;
    const createdAt = parseTaskDate(task.createdAt);
    const age = createdAt ? Math.max((now - createdAt) / DAY_MS, 0) : 0;
    const duration = task.estimatedTime;
    const effortLevel = LEVEL_SCORE[task.effort] ?? Math.min(duration / 100, 1);
    const effort = (Math.min(duration / 100, 1) + effortLevel) / 2;
    const energyMatch = {
        high: effort,
        medium: 1 - Math.abs(effort - 0.5) * 1.5,
        low: 1 - effort,
    }[disposition];
    const timePressure = Math.max(1 - available / 240, 0);
    const shortTask = duration > 0 ? Math.max(1 - duration / Math.max(available, 30), 0) : 0;

    return [
        { score: WEIGHTS.urgency * LEVEL_SCORE[task.urgency], reason: `tem urgência ${LEVEL_TEXT[task.urgency]}` },
        { score: WEIGHTS.importance * LEVEL_SCORE[task.priority], reason: `tem prioridade ${LEVEL_TEXT[task.priority]}` },
        {
            score: WEIGHTS.deadline * Math.max(1 - Math.max(remaining, 0) / 2, 0),
            reason: remaining < 0 ? "o prazo já venceu" : "o prazo está próximo",
        },
        { score: WEIGHTS.age * Math.min(age / 7, 1), reason: age >= 1 ? "está pendente há mais tempo" : "" },
        { score: WEIGHTS.duration * shortTask * timePressure, reason: "é curta para o tempo disponível" },
        { score: WEIGHTS.disposition * energyMatch, reason: `combina com disposição ${LEVEL_TEXT[disposition]}` },
    ];
}

export function recommendTask(tasks, now, disposition = "medium") {
    const completed = completedIds(tasks);
    const available = getAvailableMinutes(getNextCommitment(tasks, now), now);
    let best = null;

    for (const task of tasks) {
        if (!isInQueue(task) || isBlocked(task, completed) || !fitsAvailableTime(task, available)) continue;

        const start = parseTaskDate(task.startDate);
        if (start && start > now) continue;

        const factors = getFactors(task, now, disposition, available);
        const score = factors.reduce((total, factor) => total + factor.score, 0);
        if (!best || score > best.score) best = { task, factors, score };
    }

    if (!best) return { task: null, reasons: [] };

    const reasons = best.factors
        .filter(({ score, reason }) => score > 0 && reason)
        .sort((first, second) => second.score - first.score)
        .slice(0, 2)
        .map(({ reason }) => reason);
    return { task: best.task, reasons };
}
