import { REST, Routes } from 'discord.js';
import 'dotenv/config';


const commands = [
  {
    name: 'init',
    description: '방 설정',
  },
  {
    name: 'list',
    description: '방 인원',
  },
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

try {
  console.log('Started refreshing application (/) commands.');

  await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });

  console.log('Successfully reloaded application (/) commands.');
} catch (error) {
  console.error(error);
}