import { google, calendar_v3 } from "googleapis";
import { appConfig } from "../config/index.js"; // Bun suporta ext .js para imports locais
import { getCurrentTime } from "../utils/dateHelper.js";

// Inicializa a autenticação usando Service Account
const auth = new google.auth.GoogleAuth({
    keyFile: appConfig.credentialsPath,
    scopes: ["https://www.googleapis.com/auth/calendar.readonly"],
});

const calendar = google.calendar({ version: "v3", auth });

export interface UpcomingEvent {
    id: string;
    summary: string;
    description?: string;
    start: string; // ISO string
}

/**
 * Busca os próximos eventos agendados no Google Calendar ordenados por hora de início.
 */
export async function getUpcomingEvents(maxResults: number = 10): Promise<UpcomingEvent[]> {
    try {
        // Pegamos a hora atual convertida para ISO no timezone correto
        const nowIso = getCurrentTime().toUTC().toISO();

        if (!nowIso) {
            throw new Error("Falha ao converter o horário atual para ISO.");
        }

        const response = await calendar.events.list({
            calendarId: appConfig.calendarId,
            timeMin: nowIso,
            maxResults,
            singleEvents: true,
            orderBy: "startTime",
        });

        const events = response.data.items || [];

        return events.map(event => ({
            id: event.id || "unknown",
            summary: event.summary || "Sem título",
            description: event.description || "",
            start: event.start?.dateTime || event.start?.date || "", // event.start.date seria para o dia todo, mas esperamos dateTime
        })).filter(e => e.start !== "");

    } catch (error) {
        console.error("Erro ao buscar eventos no Google Calendar:", error);
        return [];
    }
}
