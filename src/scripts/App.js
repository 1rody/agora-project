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

//exibicao das tarefas
const tasksSection = document.querySelector("#tasks");


//gera a task quando ela for criada (apos uma criada ela e adicionada ao array sempre comecndo com 0 se ha task perfeito;
//se ha task task surge e e criada seguindo a estrutura do article)
myTasks.forEach((task, index) => {
    const isNow = index === 0;
    const card = document.createElement("article");
    card.innerHTML = isNow ? `
        <div class="flex flex-col p-2 glass rounded-md">
            <div class="flex w-full items-center justify-between gap-1">
                <div class="flex flex-col">
                    <span data-field="estimatedTime"></span>
                    <p class="text-sm">21/07 as 11:00 ate 22/07</p>
                </div>
                <div class="text-right">
                    <h3 class="text-lg text-primary" data-field="name"></h3>
                    <span data-field="priority"></span>
                </div>
            </div>
            <div class="task-btns task-btns-full flex w-full items-center gap-1 pt-5">
                <button class="secondary-btn glass" type="button">Iniciar</button>
                <button class="primary-btn" type="button">Proxima</button>
            </div>
        </div>
    ` : `
        <div class="flex flex-col p-2 glass rounded-md">
            <div class="w-full text-right">
                <h3 class="text-lg text-primary" data-field="name"></h3>
                <span data-field="priority"></span>
            </div>
            <div class="flex w-full items-center justify-between gap-1 pt-5">
                <div class="flex flex-col">
                    <span data-field="estimatedTime"></span>
                    <p class="text-sm">21/07 as 11:00 ate 22/07</p>
                </div>
                <div class="task-btns flex items-center gap-1">
                    <button class="secondary-btn glass" type="button">Concluir</button>
                    <button class="primary-btn" type="button">Adiantar</button>
                </div>
            </div>
        </div>
    `;
    card.querySelector('[data-field="name"]').textContent = task.name;
    card.querySelector('[data-field="priority"]').textContent = task.priority;
    card.querySelector('[data-field="estimatedTime"]').textContent = `${task.estimatedTime} min`;

    tasksSection.append(card);
});