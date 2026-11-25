const STORAGE_KEY = "agora-disposition";
const POSITIONS = ["high", "medium", "low"];

export function getDisposition() {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    return POSITIONS.includes(saved) ? saved : "medium";
}

export function bindDisposition(group, onChange) {
    const buttons = [...group.querySelectorAll("[data-disposition]")];

    function renderSelection() {
        const activeIndex = POSITIONS.indexOf(getDisposition());
        buttons.forEach((button, index) => {
            const active = index === activeIndex;
            button.setAttribute("aria-pressed", String(active));
            button.classList.toggle("glass", !active);
            button.classList.toggle("bg-foreground", active);
            button.querySelector("[data-active-ring]").setAttribute("visibility", active ? "visible" : "hidden");
        });
    }

    buttons.forEach((button, index) => {
        button.addEventListener("click", () => {
            const changed = POSITIONS[index] !== getDisposition();
            sessionStorage.setItem(STORAGE_KEY, POSITIONS[index]);
            renderSelection();
            onChange(changed);
        });
    });
    window.addEventListener("pageshow", (event) => {
        if (event.persisted) renderSelection();
    });

    renderSelection();
}
