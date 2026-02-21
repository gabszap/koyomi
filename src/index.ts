import { Client, GatewayIntentBits, REST, Routes, Events, Collection, Interaction } from "discord.js";
import { appConfig } from "./config/index.js";
import { startMonitoring } from "./scheduler/monitor.js";
import * as nextCommand from "./commands/next.js";

// Extensão do Client para suportar commands
interface CustomClient extends Client {
    commands: Collection<string, any>;
}

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
}) as CustomClient;

client.commands = new Collection();
client.commands.set(nextCommand.data.name, nextCommand);

// Quando o bot estiver pronto
client.once(Events.ClientReady, async (readyClient) => {
    console.log(`[Discord] Bot logado como ${readyClient.user.tag}`);

    try {
        // Registro dos comandos slash LOCALMENTE (por servidor/guild) para atualização rápida
        console.log(`[Discord] Começando a registrar comandos slash locais para o servidor: ${appConfig.guildId}`);

        const rest = new REST({ version: "10" }).setToken(appConfig.discordToken);

        await rest.put(
            Routes.applicationGuildCommands(appConfig.clientId, appConfig.guildId),
            { body: [nextCommand.data.toJSON()] }
        );

        console.log(`[Discord] Comandos locais registrados com sucesso no servidor!`);
    } catch (error) {
        console.error("[Discord] Erro ao registrar os comandos slash:", error);
    }

    // Inicia o job que monitora o calendário
    startMonitoring(client);
});

// Listener de interações (comandos slash)
client.on(Events.InteractionCreate, async (interaction: Interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = (interaction.client as CustomClient).commands.get(interaction.commandName);

    if (!command) {
        console.error(`O comando ${interaction.commandName} não foi encontrado.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'Houve um erro ao executar esse comando!', ephemeral: true });
        } else {
            await interaction.reply({ content: 'Houve um erro ao executar esse comando!', ephemeral: true });
        }
    }
});

// Login no Discord
client.login(appConfig.discordToken).catch((error) => {
    console.error("[Discord] Falha ao fazer login:", error);
});
