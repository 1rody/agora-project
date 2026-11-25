const TIME_ZONE = "America/Bahia";
const LOCAL_OFFSET = "-03:00";

export const MINUTE_MS = 60_000;
export const DAY_MS = 24 * 60 * MINUTE_MS;

const dateFormat = new Intl.DateTimeFormat("pt-BR", {
    timeZone: TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit",
});
const timeFormat = new Intl.DateTimeFormat("pt-BR", {
    timeZone: TIME_ZONE, hour: "2-digit", minute: "2-digit",
});

export function parseTaskDate(value, endOfDay = false) {
    if (value instanceof Date) return Number.isFinite(value.getTime()) ? value : null;
    if (typeof value !== "string") return null;

    let text = value.trim();
    const traditional = /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[ T](\d{1,2}):(\d{2}))?$/.exec(text);
    if (traditional) {
        const [, day, month, year, hour, minute] = traditional;
        text = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
        if (hour !== undefined) text += `T${hour.padStart(2, "0")}:${minute}`;
    }

    const match = /^(\d{4}-\d{2}-\d{2})(?:[T ](\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?)(Z|[+-]\d{2}:\d{2})?)?$/.exec(text);
    if (!match) return null;

    const [, day, time, offset] = match;
    const midnight = new Date(`${day}T00:00:00Z`);
    if (!Number.isFinite(midnight.getTime()) || midnight.toISOString().slice(0, 10) !== day) return null;
    if (time && time >= "24:00") return null;

    const date = new Date(`${day}T${time ?? (endOfDay ? "23:59:59.999" : "00:00")}${offset ?? LOCAL_OFFSET}`);
    return Number.isFinite(date.getTime()) ? date : null;
}

export function dateKey(value) {
    const date = parseTaskDate(value);
    return date ? dateFormat.format(date).split("/").reverse().join("-") : "";
}

export function formatDate(value) {
    const date = parseTaskDate(value);
    return date ? dateFormat.format(date) : "";
}

export function formatDateTime(value) {
    const date = parseTaskDate(value);
    return date ? `${dateFormat.format(date)} às ${timeFormat.format(date)}` : "";
}

export function formatTaskPeriod({ startDate, endDate }) {
    const format = (value) => {
        if (typeof value !== "string") return formatDateTime(value);
        const formatted = value.includes(":") ? formatDateTime(value) : formatDate(value);
        return formatted || value.trim();
    };
    const start = format(startDate);
    const end = format(endDate);

    if (start && end) return `${start} até ${end}`;
    if (start) return `Início em ${start}`;
    if (end) return `Até ${end}`;
    return "Período não informado";
}
