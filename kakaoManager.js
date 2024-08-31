const mariadb = require('mariadb');

const core = mariadb.createPool({
    host: process.env.DB_HOST,
    port: 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PW,
    database: process.env.DB_NAME,
    connectionLimit: 10
});

async function addRoom();
async function getRooms();
async function addMessage();
async function getMessages();
async function removeMessage();
async function addMember();

module.exports = {

}