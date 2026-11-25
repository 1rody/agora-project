import { DAY_MS, dateKey, parseTaskDate } from "../data/TaskDates.js";

const DEADLINE = /(?:\b(?:prazo(?:\s+(?:para|até))?|at[eé]|para(?:\s+o\s+dia)?)\s*[:=]?\s*)?\b(hoje|amanh[ãa]|\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}(?:\/\d{4})?)(?:(?:T|\s+(?:[àa]s\s+)?)(\d{1,2})(?::(\d{2})|h(\d{2})?))?(?![\d/])/iu;
const DURATION = /(?:\b(?:tempo(?:\s+estimado)?|estimativa|dura[çc][ãa]o|leva(?:r[aá])?)\s*[:=]?\s*)?\b(?:(\d+(?:[.,]\d+)?)\s*(?:horas?|h)(?:\s*(?:e\s+)?(\d+)\s*(?:min(?:utos?)?)?)?|(\d+)\s*min(?:utos?)?)\b/iu;
const MINUTES_WITH_LABEL = /\b(?:tempo(?:\s+estimado)?|estimativa|dura[çc][ãa]o)\s*[:=]\s*(\d+)\b/iu;
const PRIORITY = /\b(?:com\s+)?prioridade\s*[:=]?\s*(alta|m[eé]dia|baixa)\b|(^|[,;\n])\s*(alta|m[eé]dia|baixa)\s*(?=[,;\n.!]|$)/iu;

export const TASK_FIELDS = {
    endDate: "o prazo",
    name: "o título",
    estimatedTime: "o tempo estimado",
    priority: "a prioridade",
};

function getDeadline(day, hour, minute, now) {
    const lower = day.toLowerCase();
    if (lower === "hoje" || lower.startsWith("amanh")) {
        day = dateKey(new Date(now.getTime() + (lower === "hoje" ? 0 : DAY_MS)));
    } else if (/^\d{1,2}\/\d{1,2}$/.test(day)) {
        day += "/" + dateKey(now).slice(0, 4);
    }

    const value = hour === undefined ? day : day + " " + hour.padStart(2, "0") + ":" + (minute ?? "00");
    const date = parseTaskDate(value);
    if (!date) return undefined;
    return hour === undefined ? dateKey(date) : date.toISOString();
}

export function readTaskMessage(message, now, missingFields = Object.keys(TASK_FIELDS)) {
    const fields = {};

    let title = message.replace(DEADLINE, (_, day, hour, minute, hourMinutes) => {
        fields.endDate = getDeadline(day, hour, minute ?? hourMinutes, now);
        return ",";
    });

    const duration = DURATION.exec(title);
    if (duration) {
        const [, hours, remainingMinutes, minutes] = duration;
        const total = minutes ? Number(minutes)
            : Math.round(Number(hours.replace(",", ".")) * 60) + Number(remainingMinutes ?? 0);
        if (Number.isSafeInteger(total) && total > 0) fields.estimatedTime = total;
        title = title.replace(DURATION, ",");
    } else {
        const labeled = MINUTES_WITH_LABEL.exec(title);
        const onlyMinutesMissing = missingFields.length === 1 && missingFields[0] === "estimatedTime";
        const bare = onlyMinutesMissing && /^\d+$/.test(title.trim()) ? title.trim() : "";
        if (labeled || bare) {
            const total = Number(labeled?.[1] ?? bare);
            if (Number.isSafeInteger(total) && total > 0) fields.estimatedTime = total;
            title = labeled ? title.replace(MINUTES_WITH_LABEL, ",") : "";
        }
    }

    title = title.replace(PRIORITY, (_, named, separator, standalone) => {
        fields.priority = (named ?? standalone).toLowerCase();
        return separator ?? ",";
    });

    const name = title
        .replace(/\b(?:t[íi]tulo|tarefa)\s*[:=]\s*/giu, "")
        .split(/[,;\n]+/)
        .map((part) => part.trim().replace(/^(?:e(?:\s+(?:com|para|em|até))?|com|para|em|até)$/iu, ""))
        .filter((part) => /[\p{L}\p{N}]/u.test(part)
            && !/^(?:sim|claro|de dura[çc][ãa]o|(?:(?:quero|desejo)\s+)?(?:criar|cadastrar|adicionar)\s+(?:uma\s+)?tarefa)[.!?]*$/iu.test(part))
        .join(", ")
        .replace(/^["“]|["”.!?]+$/gu, "")
        .trim();
    if (name) fields.name = name;

    return Object.fromEntries(Object.entries(fields).filter(([, value]) => value !== undefined));
}
