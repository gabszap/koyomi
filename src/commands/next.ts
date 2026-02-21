import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { getUpcomingEvents } from "../services/googleCalendar.js";
import { getEventTime, formatTime } from "../utils/dateHelper.js";

export const data = new SlashCommandBuilder()
    .setName("next")
    .setDescription("Mostra o próximo anime agendado no calendário.");

export async function execute(interaction: ChatInputCommandInteraction) {
    // Resposta deferida, pois a API do Google pode demorar um pouco
    await interaction.deferReply();

    try {
        const events = await getUpcomingEvents(1);

        if (events.length === 0) {
            return interaction.editReply("Não há episódios de anime agendados próximos.");
        }

        const nextEvent = events[0];
        const eventTime = getEventTime(nextEvent.start);
        const timeFormatted = formatTime(eventTime);

        const embed = new EmbedBuilder()
            .setTitle(`⏭ Próximo Anime: ${nextEvent.summary}`)
            .setDescription(nextEvent.description || "Sem descrição")
            .setColor("#0099ff")
            .addFields(
                { name: "Horário Agendado", value: `🕒 ${timeFormatted} (UTC-4)`, inline: true }
            )
            .setFooter({ text: "Horário baseado no Google Calendar" });

        await interaction.editReply({ embeds: [embed] });
    } catch (error) {
        console.error("Erro ao executar /next:", error);
        await interaction.editReply("Houve um erro ao buscar as informações no calendário.");
    }
}
