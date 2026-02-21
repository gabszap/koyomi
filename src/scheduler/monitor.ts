import { Client, EmbedBuilder, TextChannel } from "discord.js";
import { appConfig } from "../config/index.js";
import { getUpcomingEvents } from "../services/googleCalendar.js";
import { isStartingSoon, formatTime, getEventTime } from "../utils/dateHelper.js";

// Usando um Set em memória para deduplicar as notificações e evitar spam.
// Em cenários com reinicializações frequentes, seria ideal salvar em um arquivo JSON.
const notifiedEvents = new Set<string>();

/**
 * Função principal do scheduler. Realiza o polling do Google Calendar
 * e dispara notificações.
 */
export async function checkTriggersAndNotify(client: Client) {
    try {
        const events = await getUpcomingEvents(10); // Busca os próximos 10 eventos

        for (const event of events) {
            if (notifiedEvents.has(event.id)) {
                continue; // Já foi notificado
            }

            // Verifica se falta até 1 minuto para o início (usando nosso dateHelper em UTC-4)
            if (isStartingSoon(event.start)) {
                await sendNotification(client, event);
                notifiedEvents.add(event.id);
            }
        }
    } catch (error) {
        console.error("Erro no ciclo de monitoramento do calendário:", error);
    }
}

/**
 * Monta e envia um embed bem formatado para o Discord.
 */
async function sendNotification(client: Client, event: any) {
    try {
        const channel = await client.channels.fetch(appConfig.channelId) as TextChannel;

        if (!channel || channel.type !== 0) { // 0 = GUILD_TEXT
            console.error("O canal configurado é inválido ou não é um canal de texto.");
            return;
        }

        const eventTime = getEventTime(event.start);
        const timeFormatted = formatTime(eventTime);

        const embed = new EmbedBuilder()
            .setTitle(`🔴 Anime Começando: ${event.summary}`)
            .setDescription(event.description || "Nenhuma descrição fornecida.")
            .setColor("#FF0000") // Vermelho de "Ao Vivo"
            .addFields(
                { name: "Horário", value: `🕒 ${timeFormatted} (UTC-4)`, inline: true }
            )
            .setTimestamp();

        await channel.send({ embeds: [embed] });
        console.log(`[Monitor] Notificação enviada para o evento: ${event.summary}`);
    } catch (error) {
        console.error("[Monitor] Falha ao enviar notificação no Discord:", error);
    }
}

/**
 * Inicia o loop (polling) a cada 60 segundos.
 */
export function startMonitoring(client: Client) {
    console.log(`[Monitor] Inicializando job de polling a cada 60s`);
    // Primeira checagem imediata
    checkTriggersAndNotify(client);

    // Agendamento para cada 60 segundos (60000 ms)
    setInterval(() => {
        checkTriggersAndNotify(client);
    }, 60 * 1000);
}
