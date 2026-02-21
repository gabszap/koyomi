import { config } from "dotenv";
import fs from "fs";
import path from "path";

// Carrega as variáveis do arquivo .env
config();

// Define a interface para as configurações
export interface Config {
    discordToken: string;
    clientId: string;
    guildId: string;
    channelId: string;
    calendarId: string;
    credentialsPath: string;
}

function loadConfig(): Config {
    const { DISCORD_TOKEN, CLIENT_ID, GUILD_ID, CHANNEL_ID, CALENDAR_ID } = process.env;

    if (!DISCORD_TOKEN) throw new Error("A variável de ambiente DISCORD_TOKEN é obrigatória.");
    if (!CLIENT_ID) throw new Error("A variável de ambiente CLIENT_ID é obrigatória.");
    if (!GUILD_ID) throw new Error("A variável de ambiente GUILD_ID é obrigatória.");
    if (!CHANNEL_ID) throw new Error("A variável de ambiente CHANNEL_ID é obrigatória.");
    if (!CALENDAR_ID) throw new Error("A variável de ambiente CALENDAR_ID é obrigatória.");

    const credentialsPath = path.resolve(process.cwd(), "credentials.json");
    if (!fs.existsSync(credentialsPath)) {
        throw new Error(`O arquivo credentials.json não foi encontrado no caminho: ${credentialsPath}`);
    }

    return {
        discordToken: DISCORD_TOKEN,
        clientId: CLIENT_ID,
        guildId: GUILD_ID,
        channelId: CHANNEL_ID,
        calendarId: CALENDAR_ID,
        credentialsPath,
    };
}

// Exporta as configurações carregadas
export const appConfig = loadConfig();
