import { getProfile } from "../data/AccountMock.js";
import { getTasksByProfile } from "../data/MockTask.js";
import { getUsageByProfile, setMood } from "../data/UsageMock.js";

const profile = getProfile("01");
const myTasks = getTasksByProfile(profile.id);
const usage = getUsageByProfile(profile.id);

console.log(profile.name, myTasks);


//exibicao do perfil
const header = document.querySelector("#profile");
header.querySelector('[data-field="name"]').textContent = profile.name;
header.querySelector('[data-field="lastTimeOnline"]').textContent = profile.lastTimeOnline;

//exibicao das estatisticas (as barras sao o simbolo de cada card no figma)
const stats = [
    { field: "oldTasks", label: "Tarefas antigas", bars: [23, 29, 16, 20, 29, 16] },
    { field: "doneTasks", label: "Tarefas concluidas", bars: [23, 29, 29, 20, 16, 16] },
    { field: "blockedTasks", label: "bloqueadas", bars: [23, 29, 16, 29] },
];

const statCards = document.querySelector("#stat-cards");
stats.forEach((stat) => {
    const card = document.createElement("article");
    card.className = "stat-card glass rounded-md";
    card.innerHTML = `
        <div class="stat-top">
            <span class="stat-number" data-field="value"></span>
            <div class="stat-bars"></div>
        </div>
        <span class="text-sm" data-field="label"></span>
    `;
    card.querySelector('[data-field="value"]').textContent = usage[stat.field];
    card.querySelector('[data-field="label"]').textContent = stat.label;

    stat.bars.forEach((height) => {
        const bar = document.createElement("i");
        bar.className = "stat-bar";
        bar.style.height = `${height}px`;
        card.querySelector(".stat-bars").append(bar);
    });

    statCards.append(card);
});

//seletor de disposicao do dia, a escolha fica salva no mock de uso
const moods = [
    { value: "good", icon: "FaceSmile.svg", label: "Disposto" },
    { value: "neutral", icon: "FaceGrin.svg", label: "Normal" },
    { value: "bad", icon: "FaceFrown.svg", label: "Sem disposicao" },
];

const moodSelector = document.querySelector("#mood-selector");
moods.forEach((mood) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "mood-btn";
    button.dataset.mood = mood.value;
    button.setAttribute("aria-label", mood.label);
    button.setAttribute("aria-pressed", String(usage.mood === mood.value));
    button.innerHTML = `<img src="../assets/icons/${mood.icon}" alt="">`;

    button.addEventListener("click", () => {
        setMood(profile.id, mood.value);
        moodSelector.querySelectorAll(".mood-btn").forEach((other) => {
            other.setAttribute("aria-pressed", String(other === button));
        });
    });

    moodSelector.append(button);
});

//formata minutos em horas (220 -> 3h 40 min)
const formatMinutes = (total) => {
    const hours = Math.floor(total / 60);
    const minutes = total % 60;
    return hours ? `${hours}h ${minutes} min` : `${minutes} min`;
};

//prioridade em portugues e na cor do figma
const priorityLabels = { low: "BAIXA", medium: "MEDIA", high: "ALTA" };
const showPriority = (element, priority) => {
    element.textContent = priorityLabels[priority];
    element.classList.add(`priority-${priority}`);
};

//exibicao do tempo ate a proxima tarefa e da recomendacao para agora
const next = document.querySelector("#next");
next.querySelector('[data-field="timeUntilNext"]').textContent = formatMinutes(usage.timeUntilNext);
showPriority(next.querySelector('[data-field="recommendedPriority"]'), usage.recommendedPriority);

const recommendation = next.querySelector("#recommendation");
recommendation.querySelector('[data-field="name"]').textContent = usage.recommendation.name;
recommendation.querySelector('[data-field="estimatedTime"]').textContent = formatMinutes(usage.recommendation.estimatedTime);
recommendation.querySelector('[data-field="date"]').textContent = usage.recommendation.date;
recommendation.querySelector('[data-field="reason"]').textContent = usage.recommendation.reason;

//exibicao das tarefas
const tasksSection = document.querySelector("#tasks");


//gera a task quando ela for criada (apos uma criada ela e adicionada ao array sempre comecndo com 0 se ha task perfeito;
//se ha task task surge e e criada seguindo a estrutura do article)
myTasks.forEach((task) => {
    const card = document.createElement("article");
    card.innerHTML = `
        <div class="flex flex-col p-2 glass rounded-md">
            <div class="w-full text-right">
                <h3 class="task-title text-primary" data-field="name"></h3>
                <p class="text-xs"><span class="text-secondary">PRIORIDADE</span> <span class="priority" data-field="priority"></span></p>
            </div>
            <div class="flex w-full items-center justify-between gap-1 pt-5">
                <div class="flex flex-col">
                    <span class="task-time" data-field="estimatedTime"></span>
                    <p class="text-xs">21/07 as 11:00 ate 22/07</p>
                </div>
                <div class="task-btns flex items-center gap-1">
                    <button class="secondary-btn glass" type="button">Concluir</button>
                    <button class="secondary-btn glass" type="button">Adiantar</button>
                </div>
            </div>
        </div>
    `;
    card.querySelector('[data-field="name"]').textContent = task.name;
    showPriority(card.querySelector('[data-field="priority"]'), task.priority);
    card.querySelector('[data-field="estimatedTime"]').textContent = formatMinutes(task.estimatedTime);

    tasksSection.append(card);
});