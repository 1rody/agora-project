import { getProfile } from "../data/AccountMock.js";
import { getTasksByProfile } from "../data/MockTask.js";

const profile = getProfile("01");
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
myTasks.forEach((task) => {
    const card = document.createElement("article");
    card.innerHTML = `
        <div class="flex flex-col p-2 glass-second rounded-md">
            <div class="w-full text-right">
                <h3 class="text-xl" data-field="name"></h3>
                <span data-field="priority"></span>
            </div>
            <div class="flex">
                <div>
                    <span data-field="estimatedTime"></span>
                    <p class="text-sm">21/07 as 11:00 ate 22/07</p>
                </div>
            </div>
        </div>
    `;
    card.querySelector('[data-field="name"]').textContent = task.name;
    card.querySelector('[data-field="priority"]').textContent = task.priority;
    card.querySelector('[data-field="estimatedTime"]').textContent = `${task.estimatedTime} min`;

    tasksSection.append(card);
});