import { NOW, PROFILE_ID } from "../data/AgoraMock.js";
import { PRIORITY_LABELS, getTasksByProfile, updateTask } from "../data/MockTask.js";
import { MINUTE_MS, formatTaskPeriod, parseTaskDate } from "../data/TaskDates.js";
import { fitsAvailableTime, getAvailableMinutes, getNextCommitment, getUpcomingTasks, isBlocked, isInQueue } from "./Recommendation.js";

const CONFIRMATION_MS = 5000;
const ADVANCED_TASK_KEY = "agora-advanced-task";

export const getAdvancedTaskId = () => sessionStorage.getItem(ADVANCED_TASK_KEY);

export function clearAdvancedTask() {
    sessionStorage.removeItem(ADVANCED_TASK_KEY);
}

export function fillFields(container, fields) {
    for (const [field, value] of Object.entries(fields)) {
        container.querySelector('[data-field="' + field + '"]').textContent = value;
    }
}

export function fillTaskCard(card, task) {
    fillFields(card, {
        name: task.name,
        priority: "Prioridade " + PRIORITY_LABELS[task.priority].toLowerCase(),
        estimatedTime: task.estimatedTime > 0 ? task.estimatedTime + " min" : "Sem estimativa",
        period: formatTaskPeriod(task),
    });
}

export function hasPendingDependencies(task, tasks) {
    const completed = new Set(tasks.filter((item) => item.status === "concluída").map((item) => item.id));
    return isBlocked(task, completed);
}

export function elapsedSince(startedAt) {
    return startedAt === null ? 0 : Math.max(Date.now() - startedAt, 0);
}

export function setupUpcomingTasks(container) {
    const list = container.querySelector("#upcoming-list");
    const empty = container.querySelector("#upcoming-empty");
    const template = document.querySelector("#upcoming-task");
    const feedback = container.querySelector("#task-feedback");
    let cancelConfirmation = () => {};

    function completeTask(id) {
        const tasks = getTasksByProfile(PROFILE_ID);
        const task = tasks.find((item) => item.id === id && isInQueue(item));
        if (!task) return;
        if (hasPendingDependencies(task, tasks)) {
            feedback.textContent = "Conclua as tarefas vinculadas primeiro.";
            return;
        }

        const tempoReal = Math.floor(elapsedSince(task.timerStartedAt) / MINUTE_MS);
        if (getAdvancedTaskId() === id) clearAdvancedTask();
        updateTask(id, { status: "concluída", tempoReal });
        feedback.textContent = "Concluído em " + tempoReal + " min";
    }

    function advanceTask(id) {
        const tasks = getTasksByProfile(PROFILE_ID);
        const task = getUpcomingTasks(tasks, NOW).find((item) => item.id === id);
        if (!task) return;
        if (tasks.some((item) => item.status === "em andamento")) {
            feedback.textContent = "Conclua a tarefa em andamento para adiantar outra.";
            return;
        }
        if (hasPendingDependencies(task, tasks)) {
            feedback.textContent = "Conclua as tarefas vinculadas primeiro.";
            return;
        }

        const available = getAvailableMinutes(getNextCommitment(tasks, NOW, id), NOW);
        if (!fitsAvailableTime(task, available)) {
            feedback.textContent = "A tarefa exige mais tempo do que está disponível.";
            return;
        }

        feedback.textContent = "";
        sessionStorage.setItem(ADVANCED_TASK_KEY, id);
        updateTask(id, { startDate: NOW.toISOString() });
    }

    return function renderUpcoming(tasks) {
        cancelConfirmation();
        const future = getUpcomingTasks(tasks, NOW);
        const advancedId = getAdvancedTaskId();
        const current = tasks.filter((task) => isInQueue(task) && (task.id === advancedId
            || task.status === "em andamento"
            || (task.scheduled && parseTaskDate(task.startDate)?.getTime() === NOW.getTime())));
        const currentIds = new Set(current.map((task) => task.id));

        const cards = [...current, ...future.filter((task) => !currentIds.has(task.id))].map((task) => {
            const card = template.content.cloneNode(true);
            fillTaskCard(card, task);
            const complete = card.querySelector('[data-action="complete"]');
            const advance = card.querySelector('[data-action="advance"]');
            const canAdvance = !currentIds.has(task.id);
            advance.hidden = !canAdvance;
            let confirmationTimer;

            function resetConfirmation() {
                clearTimeout(confirmationTimer);
                confirmationTimer = undefined;
                complete.textContent = "CONCLUIR";
                advance.hidden = !canAdvance;
            }

            complete.addEventListener("click", () => {
                if (confirmationTimer !== undefined) {
                    resetConfirmation();
                    completeTask(task.id);
                    return;
                }

                cancelConfirmation();
                complete.textContent = "CONFIRMAR CONCLUSÃO";
                advance.hidden = true;
                confirmationTimer = setTimeout(resetConfirmation, CONFIRMATION_MS);
                cancelConfirmation = resetConfirmation;
            });
            advance.addEventListener("click", () => advanceTask(task.id));
            return card;
        });

        list.replaceChildren(...cards);
        empty.hidden = cards.length > 0;
    };
}
