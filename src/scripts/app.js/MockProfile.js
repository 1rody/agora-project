console.log("MockProfile carregou");

const profile = {
    name: "Lucas",
    lastTimeOnline: "14/11/2026 : 14:07",
};

const header = document.querySelector("[data-profile]");
console.log("header encontrado:", header);

header.querySelectorAll("[data-field]").forEach(el => {
    el.textContent = profile[el.dataset.field];
});