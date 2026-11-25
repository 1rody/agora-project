import { showStartupContent } from "./Session.js";
import { getProfile } from "../data/AccountMock.js";
import { NOW, PROFILE_ID } from "../data/AgoraMock.js";
import { PRIORITY_LABELS, getTasksByProfile, subscribeToTasks } from "../data/MockTask.js";
import { formatDateTime, parseTaskDate } from "../data/TaskDates.js";
import {
    fitsAvailableTime, getAvailableMinutes, getNextCommitment, getStats, isInQueue, recommendTask,
} from "./Recommendation.js";

import { bindDisposition, getDisposition } from "./Disposition.js";
import {
    clearAdvancedTask, elapsedSince, fillFields, fillTaskCard, getAdvancedTaskId, hasPendingDependencies, setupUpcomingTasks,
} from "./UpcomingTasks.js";

function formatAvailableTime(available) {
    if (!Number.isFinite(available)) return "Sem compromisso agendado";
    const minutes = Math.floor(available);
    const hours = Math.floor(minutes / 60);
    const remainder = minutes % 60;
    return hours > 0 ? `${hours}h ${remainder} min` : `${remainder} min`;
}

function formatReason(reasons) {
    if (!reasons.length) return "Tarefa disponível para agora.";
    const text = reasons.join(" e ");
    return text[0].toUpperCase() + text.slice(1) + ".";
}

function formatElapsed(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    return `${String(minutes).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

function setupHome(home) {
    const profile = getProfile(PROFILE_ID);
    const header = home.querySelector("#profile");
    const stats = home.querySelector("#stats");
    const nextTask = home.querySelector("#next-task");
    const recommendation = home.querySelector("#recommended-task");
    const recommendationEmpty = home.querySelector("#recommendation-empty");
    const renderUpcoming = setupUpcomingTasks(home.querySelector("#tasks"));
    const timer = home.querySelector("#task-timer");
    const elapsed = timer.querySelector('[role="timer"]');
    let timerInterval;
    bindDisposition(home.querySelector('[aria-labelledby="disposition-title"] [role="group"]'), (changed) => {
        if (changed) clearAdvancedTask();
        renderHome();
    });

    fillFields(header, { name: profile.name, lastTimeOnline: formatDateTime(NOW) });
    header.querySelector("time").dateTime = NOW.toISOString();

    function renderTimer(running) {
        clearInterval(timerInterval);
        timer.hidden = running?.timerStartedAt == null;
        if (timer.hidden) return;

        const tick = () => {
            elapsed.textContent = formatElapsed(elapsedSince(running.timerStartedAt));
        };
        tick();
        timerInterval = setInterval(tick, 1000);
    }

    function renderHome() {
        const tasks = getTasksByProfile(profile.id);
        const commitment = getNextCommitment(tasks, NOW);
        const available = getAvailableMinutes(commitment, NOW);
        const result = recommendTask(tasks, NOW, getDisposition());
        const running = tasks.find((task) => task.status === "em andamento");
        const advancedId = getAdvancedTaskId();
        const advanced = tasks.find((task) => task.id === advancedId && isInQueue(task));
        const advancedStart = parseTaskDate(advanced?.startDate);
        const canKeepAdvanced = advanced && (!advancedStart || advancedStart <= NOW)
            && !hasPendingDependencies(advanced, tasks) && fitsAvailableTime(advanced, available);
        const currentTask = running ?? (canKeepAdvanced ? advanced : result.task);
        renderTimer(running);
        fillFields(stats, getStats(tasks, NOW));
        fillFields(nextTask, {
            availableTime: formatAvailableTime(available),
            name: commitment?.task.name ?? "",
            priority: commitment ? `Prioridade ${PRIORITY_LABELS[commitment.task.priority].toLowerCase()}` : "",
        });
        nextTask.querySelector('[data-field="priority"]').dataset.priority = commitment?.task.priority ?? "";

        recommendation.hidden = !currentTask;
        recommendationEmpty.hidden = Boolean(currentTask);
        if (currentTask) {
            fillTaskCard(recommendation, currentTask);
            const reason = running ? "Tarefa em andamento."
                : canKeepAdvanced ? "Você adiantou esta tarefa." : formatReason(result.reasons);
            fillFields(recommendation, { description: currentTask.description ?? "", reason });
        }

        renderUpcoming(tasks);
    }

    subscribeToTasks(renderHome);
    window.addEventListener("pageshow", (event) => {
        if (event.persisted) renderHome();
    });
    renderHome();
}

const home = document.querySelector("#app");
if (home) {
    setupHome(home);
    showStartupContent();
}
