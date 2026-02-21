import { DateTime } from "luxon";

// Fuso horário configurado estritamente para UTC-4
const TIMEZONE = "America/Porto_Velho";

/**
 * Retorna o DateTime atual no fuso horário configurado.
 */
export function getCurrentTime(): DateTime {
    return DateTime.now().setZone(TIMEZONE);
}

/**
 * Converte uma data/hora local em formato ISO para um DateTime no fuso horário configurado.
 * Útil para comparar datas de eventos do Google Calendar, que já retornam a data em UTC ou offset.
 */
export function getEventTime(isoString: string): DateTime {
    return DateTime.fromISO(isoString).setZone(TIMEZONE);
}

/**
 * Formata um DateTime para uma string legível para humanos.
 */
export function formatTime(dt: DateTime): string {
    return dt.toFormat("dd/MM/yyyy HH:mm:ss");
}

/**
 * Verifica se um evento deve começar dentro do próximo minuto.
 */
export function isStartingSoon(eventStartIso: string): boolean {
    const now = getCurrentTime();
    const eventTime = getEventTime(eventStartIso);

    // Calcula a diferença em minutos
    const diffInMinutes = eventTime.diff(now, "minutes").minutes;

    // Se o evento está entre 0 (agora) e 1 minuto no futuro
    return diffInMinutes > 0 && diffInMinutes <= 1;
}
