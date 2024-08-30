import { Client, GatewayIntentBits } from 'discord.js';
import 'dotenv/config';
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;


    //TODO: init server room setting
    if (interaction.commandName === 'init') {

    }

    //TODO: get room member
    if (interaction.commandName == 'list') {

    }
});

client.on('messageCreate', async message => {
    //TODO: processing message
})

client.login(process.env.DISCORD_TOKEN);