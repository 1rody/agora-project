import { getSessionProfileId, showStartupContent } from "./Session.js";
import { getTasksByProfile, subscribeToTasks } from "../data/MockTask.js";
import { dateKey, formatTaskPeriod, parseTaskDate } from "../data/TaskDates.js";
import { NOW } from "../data/AgoraMock.js";
import { getUpcomingTasks, isInQueue } from "./Recommendation.js";
import { createTaskActions, fillTaskCard } from "./UpcomingTasks.js";

const page = document.querySelector("[data-page]");
const feedback = document.querySelector("#task-feedback");
const actions = createTaskActions(feedback);
const template = document.querySelector("#task-card");
const collator = new Intl.Collator("pt-BR", { sensitivity: "base" });
const priorityRank = { high: 0, medium: 1, low: 2 };

function canAdvance(task, tasks) {
    return getUpcomingTasks(tasks, NOW).some((item) => item.id === task.id);
}
function makeCard(task, tasks, interactive = true) {
    const card = template.content.cloneNode(true);
    fillTaskCard(card, task);
    card.querySelector('[data-field="link"]').href = `./TarefaAberta.html?id=${encodeURIComponent(task.id)}`;
    if (interactive) actions.bindActions(card, task, canAdvance(task, tasks));
    else card.querySelector(".task-btns").remove();
    return card;
}
function renderList(tasks) {
    const order = document.querySelector("#task-order").value;
    const priority = document.querySelector("#task-priority").value;
    const date = document.querySelector("#task-date").value;
    const filtered = tasks.filter(isInQueue).filter((task) => !priority || task.priority === priority).filter((task) => {
        if (!date) return true;
        const start = dateKey(task.startDate), end = dateKey(task.endDate);
        return Boolean((start || end) && (!start || start <= date) && (!end || date <= end));
    });
    filtered.sort((a, b) => {
        if (order === "priority") return priorityRank[a.priority] - priorityRank[b.priority] || collator.compare(a.name, b.name);
        if (order === "deadline") return (parseTaskDate(a.endDate, true)?.getTime() ?? Infinity) - (parseTaskDate(b.endDate, true)?.getTime() ?? Infinity) || collator.compare(a.name, b.name);
        return collator.compare(a.name, b.name);
    });
    document.querySelector("#task-list").replaceChildren(...filtered.map((task) => makeCard(task, tasks)));
    document.querySelector("#task-empty").hidden = filtered.length > 0;
}
function renderDetail(tasks) {
    const task = tasks.find((item) => item.id === new URLSearchParams(location.search).get("id"));
    const detail = document.querySelector("#task-detail");
    document.querySelector("#task-not-found").hidden = Boolean(task);
    detail.hidden = !task;
    if (!task) return;
    fillTaskCard(document.querySelector("main"), task);
    detail.querySelector('[data-field="priority"]').textContent = detail.querySelector('[data-field="priority"]').textContent.replace(/^Prioridade /, "");
    detail.querySelector('[data-field="status"]').textContent = task.status.toLocaleUpperCase("pt-BR");
    detail.querySelector('[data-field="description"]').textContent = task.description?.trim() ?? "";
    const linked = task.idsVinculados.map((id) => tasks.find((item) => item.id === id)).filter(Boolean);
    document.querySelector("#linked-list").replaceChildren(...linked.map((item) => makeCard(item, tasks)));
    document.querySelector("#linked-empty").hidden = linked.length > 0;
}
function render() {
    actions.cancelConfirmation();
    const tasks = getTasksByProfile(getSessionProfileId());
    if (page.dataset.page === "tasks") renderList(tasks);
    else renderDetail(tasks);
}
for (const filter of document.querySelectorAll(".tasks-filters select, .tasks-filters input")) filter.addEventListener("change", render);
subscribeToTasks(render);
window.addEventListener("pageshow", render);
render();
showStartupContent();
