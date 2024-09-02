const pool = require('./utils/db.js');

async function initDB() {
    let db;
    try {
        db = await pool.getConnection();
        // === config ===
        await db.execute('CREATE TABLE IF NOT EXISTS config (`key` TEXT UNIQUE KEY NOT NULL, `value` TEXT NOT NULL);')

        // === rooms ===
        await (await db.prepare('CREATE TABLE IF NOT EXISTS rooms (room_id BIGINT PRIMARY KEY NOT NULL,' + 
            'room_name TEXT NOT NULL, group_chat BOOLEAN NOT NULL, dchannel_id BIGINT NOT NULL);')).execute();

        // === senders ===
        await (await db.prepare('CREATE TABLE IF NOT EXISTS senders (sender_id BIGINT PRIMARY KEY NOT NULL,' +
            'room_id BIGINT NOT NULL, profileImg TEXT, sender_name TEXT NOT NULL,' +
            'FOREIGN KEY(room_id) REFERENCES rooms(room_id));')).execute()

        // === messages ===
        await (await db.prepare('CREATE TABLE IF NOT EXISTS messages (chat_id BIGINT PRIMARY KEY NOT NULL,' + 
            'sender_id BIGINT NOT NULL, room_id BIGINT NOT NULL, message TEXT NOT NULL,' + 
            'time TIMESTAMP NOT NULL, dmessage_id BIGINT NOT NULL, isDeleted BOOLEAN NOT NULL,' +
            'FOREIGN KEY(sender_id) REFERENCES senders(sender_id),' +
            'FOREIGN KEY(room_id) REFERENCES rooms(room_id));')).execute();
    }catch(e){console.error(e)}finally{
        if(!!db)db.end();
    }
}

async function addRoom(id, name, isGroupChat, dChannelId) {
    let db;
    try {
        db = await pool.getConnection();
        await db.execute('INSERT INTO rooms VALUES (?, ?, ?, ?);', [id, name, isGroupChat, dChannelId]);
    }catch(e) {
    }finally{
        if(!!db) db.end();
    }
}

async function setConfig(key, value) {
    let db;
    try {
        db = await pool.getConnection();
        await db.execute('INSERT INTO config VALUES (?, ?) ON DUPLICATE KEY UPDATE `key` = ?, `value` = ?;', [key, value, key, value]);
    }catch(e) {
    }finally{
        if(!!db) db.end();
    }
}

async function getConfig(key) {
    let db;
    try {
        db = await pool.getConnection();
        return (await db.execute('SELECT * FROM config WHERE `key` = ?;', [key]))[0].value;
    }catch(e) {
    }finally{
        if(!!db) db.end();
    }
}

async function getRooms(page) {
    let db;
    try {
        db = await pool.getConnection();
        let rows;
        if(!!page) {
            if(page == 1) 
                rows = await db.query('SELECT * FROM rooms WHERE LIMIT 25;');
            else
                rows = await db.query('SELECT * FROM rooms WHERE LIMIT 25 OFFSET ?;', [(10 * page) + 1]);
        }else{
            rows = await db.query('SELECT * FROM rooms;');
        }
        
        return rows;
    }catch(e) {
    }finally{
        if(!!db) db.end();
    }
}

async function addMessage(id, senderId, roomId, message, dMessageId) {
    let db;
    try {
        db = await pool.getConnection();
        await db.execute('INSERT INTO messages VALUES (?, ?, ?, ?, ?, ?, 0);', [id, senderId, roomId, message, new Date().getTime(), dMessageId]);
    }catch(e) {
    }finally{
        if(!!db) db.end();
    }
}

async function getMessages(roomId, page) {
    let db;
    try {
        db = await pool.getConnection();
        let rows;
        if(!!page) {
            if(page == 1) 
                rows = await db.query('SELECT * FROM messages WHERE room_id = ? AND LIMIT 25;', [roomId]);
            else
                rows = await db.query('SELECT * FROM messages WHERE room_id = ? AND LIMIT 25 OFFSET ?;', [roomId, (10 * page) + 1]);
        }else{
            rows = await db.query('SELECT * FROM messages WHERE room_id = ?;');
        }
        
        return rows;
    }catch(e) {
    }finally{
        if(!!db) db.end();
    }
}

async function removeMessage(id) {
    let db;
    try {
        db = await pool.getConnection();
        await db.execute('UPDATE messages SET isDeleted = 1 WHERE chat_id = ?;', [id]);
    }catch(e) {
    }finally{
        if(!!db) db.end();
    }
}

async function addMember(id, roomId, profileImg, name) {
    let db;
    try {
        db = await pool.getConnection();
        //sender_id, room_id, profileImg, sender_name
        await db.execute('INSERT INTO senders VALUES (?, ?, ?, ?)', [id, roomId, profileImg, name]);
    }catch(e) {
    }finally{
        if(!!db) db.end();
    }
}

async function getMembers(roomId, page) {
    let db;
    try {
        db = await pool.getConnection();
        let rows;
        if(!!page) {
            if(page == 1) 
                rows = await db.query('SELECT * FROM senders WHERE room_id = ? AND LIMIT 25;', [roomId]);
            else
                rows = await db.query('SELECT * FROM senders WHERE room_id = ? AND LIMIT 25 OFFSET ?;', [roomId, (10 * page) + 1]);
        }else{
            rows = await db.query('SELECT * FROM senders WHERE room_id = ?;');
        }
        
        return rows;
    }catch(e) {
    }finally{
        if(!!db) db.end();
    }
}

module.exports = {
    initDB,
    addRoom,
    getRooms,
    addMessage,
    getMessages,
    removeMessage,
    addMember,
    getConfig,
    setConfig
};