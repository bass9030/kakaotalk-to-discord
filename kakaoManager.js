const pool = require('./utils/db.js');

async function initDB() {
    try {
        let db = await pool.getConnection();
        db.prepare('CREATE TABLE rooms (BIGINT id AUTO_INCREMENT PRIMARY KEY NOT NULL, )')
    }catch(e){}
}

async function addRoom(id, name) {
    try {
        let db = await pool.getConnection();
        db.prepare('INSERT ')
    }catch(e) {
    }
}

async function getRooms(page) {

}

async function addMessage(senderId, message) {

}

async function getMessages(page) {

}

async function removeMessage(messageId) {

}

async function addMember(id, name) {

}

module.exports = {
    addRoom,
    getRooms,
    addMessage,
    getMessages,
    removeMessage,
    addMember
};