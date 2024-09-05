const { Client, GatewayIntentBits, ChannelType } = require('discord.js');
require('dotenv').config();
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const kakaoManager = require('./kakaoManager');
const dgram = require('node:dgram');
const crypto = require('crypto');
const si = require('systeminformation');


client.on('ready', () => {
    kakaoManager.initDB();
    console.log(`Logged in as ${client.user.tag}!`);
});

const server = dgram.createSocket('udp4');
let vaildToken;

server.on('error', (err) => {
  console.error(`server error:\n${err.stack}`);
  server.close();
});

function sendPacket(data, rinfo) {
    server.send(JSON.stringify(data), rinfo.port, rinfo.address);
}

server.on('message', async (msg, rinfo) => {
    try {
        // console.log(msg);
        let data = JSON.parse(msg);
        if(data.event == 'CONNECT') {
            vaildToken = crypto.createHash('sha256').update(`${new Date().toISOString()} ${await si.cpu()}`).digest('base64');
            sendPacket({event: "AUTH_INFO", data: {token: vaildToken}}, rinfo);
            return;
        }

        if(data.token != vaildToken) return;

        switch(data.event) {
            case 'RECEIVE_MSG':
                console.log(data);
                let serverId;
                let server = await client.guilds.fetch(process.env.DISCORD_SERVER_ID);

                if(!!!kakaoManager.getRoomById(data.data.room.id).length) {
                    //TODO: create channel
                    let isGroupChat = data.data.room.isGroupChat;
                    let name = data.data.room.name;
                    serverId = (await server.channels.create({
                        parent: (isGroupChat ? (await kakaoManager.getConfig('group_category')) : (await kakaoManager.getConfig('dm_category'))),
                        name: name
                    })).id;
                    await kakaoManager.addRoom(data.data.room.id, name, isGroupChat, serverId);
                }else{
                    serverId = (await kakaoManager.getRoomById(data.data.room.id))[0].dchannel_id;
                }

                //TODO: send message
                let messageId = (await (await server.channels.fetch(serverId)).send(data.data.message)).id;
                kakaoManager.addMessage(data.data.chatLogId, data.data.sender.id, data.data.room.id, data.data.message, messageId);
                break;
        }
    }catch(e) {
        console.log('failed to parse data:', e);
    }
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