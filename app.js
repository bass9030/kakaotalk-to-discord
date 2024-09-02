const { Client, GatewayIntentBits, ChannelType } = require('discord.js');
require('dotenv').config();
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const kakaoManager = require('./kakaoManager');
const dgram = require('node:dgram');


client.on('ready', () => {
    kakaoManager.initDB();
    console.log(`Logged in as ${client.user.tag}!`);
});

const server = dgram.createSocket('udp4');

server.on('error', (err) => {
  console.error(`server error:\n${err.stack}`);
  server.close();
});

server.on('message', (msg, rinfo) => {
  console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
});

server.on('listening', () => {
  const address = server.address();
  console.log(`server listening ${address.address}:${address.port}`);
});

server.bind(21332);

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;


    //TODO: init server room setting
    if (interaction.commandName === 'init') {
        await interaction.deferReply({ephemeral: true});
        let dm_id = await kakaoManager.getConfig('dm_category');
        let group_id = await kakaoManager.getConfig('group_category');

        if(!!dm_id && !!group_id) {
            await interaction.editReply({content: '이미 설정되었습니다.', ephemeral: true});
            return;
        }
        const dm_category_id = (await interaction.guild.channels.create({name: '개인채팅', type: ChannelType.GuildCategory})).id;
        const group_category_id = (await interaction.guild.channels.create({name: '단체채팅', type: ChannelType.GuildCategory})).id;

        await kakaoManager.setConfig('dm_category', dm_category_id);
        await kakaoManager.setConfig('group_category', group_category_id);
        let rooms = await kakaoManager.getRooms();
        rooms.forEach(e => {
            if(e.isGroupChat) {
                interaction.guild.channels.create({
                    name: e.room_name,
                    parent: group_category_id
                })
            }else{
                interaction.guild.channels.create({
                    name: e.room_name,
                    parent: dm_category_id
                })
            }
        })

        interaction.editReply({content: '기본 설정이 완료되었습니다.', ephemeral: true});
    }

    //TODO: get room member
    if (interaction.commandName == 'list') {

    }
});

client.on('messageCreate', async message => {
    //TODO: processing message
    console.log(message);
})

client.login(process.env.DISCORD_TOKEN);