import { getCurrentProfile } from "../data/AccountMock.js";
import { getTasksByProfile } from "../data/MockTask.js";

const profile = getCurrentProfile();
const myTasks = getTasksByProfile(profile.id);

console.log(profile.name, myTasks);


//exibicao do perfil
const header = document.querySelector("#profile");
header.querySelector('[data-field="name"]').textContent = profile.name;
header.querySelector('[data-field="lastTimeOnline"]').textContent = profile.lastTimeOnline;

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