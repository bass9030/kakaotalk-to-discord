/*
 * k2d.js created with Project StarLight ✦
 * Created on 03/09/24 12:19 AM
 */
 
const config = {
    address: '172.30.1.13',
    port: 21332
};
 
let token;

const socket = new java.net.DatagramSocket();
const address = java.net.InetAddress.getByName(config.address);
const buffer = java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE, 65535);
const inPacket = new java.net.DatagramPacket(buffer, buffer.length);

const receiveThread = new java.lang.Thread({
    run() {
        sendPacket('CONNECT', 'afds')
        while(true) {
            socket.receive(inPacket);
                const message = decodeURIComponent(
                String(
                    new java.lang.String(
                        inPacket.getData(),
                        inPacket.getOffset(),
                        inPacket.getLength(),
                    ),
                ),
            );
            receiveMessage(message);
        }
    }
})

function getBytes(str) {
    return new java.lang.String(str).getBytes();
}

function sendPacket(event, data) {
    const bytes = getBytes(JSON.stringify({ event, token, data }));
    const outPacket = new java.net.DatagramPacket(
        bytes,
        bytes.length,
        address,
        config.port,
      );
      socket.send(outPacket);
}

function receiveMessage(data) {
    try {
        data = JSON.parse(data);
        switch(data.event) {
            case 'AUTH_INFO':
                if(!!!token) token = data.data.token;
                break;
            case 'SEND_MESSAGE':
                //TODO: send message
                break;
        }
    }catch(e){
        Log.e('failed to process data: ' + e);
    }
}

function event2json(event) {
    //TODO: detect event.image
    let stream;
    let byteArr;
    Log.d(event.image != undefined)
    if(event.image != undefined) {
        stream = new java.io.ByteArrayOutputStream();
        event.image.compress(android.graphics.Bitmap.CompressFormat.PNG, 100, stream);
        byteArr = stream.toByteArray();
    }
    
    return {
        message: event.message,
        image: byteArr,
        sender: {
            name: event.sender.name,
            id: event.sender.id,
            //profileBitmap: event.sender.profileBitmap,
            //profileBase64: event.sender.profileBase64,
            profileHash: event.sender.profileHash
        },
        room: {
            id: event.room.id,
            name: event.room.name,
            isGroupChat: event.room.isGroupChat,
        },
        hasMention: event.room.hasMention,
        chatLogId: java.lang.Long.toString(event.chatLogId) + ''
    };
}

/**
 * Called when a message with appropriate options was received.
 * Visit URL below for further options on event structure:
 * https://gist.github.com/mooner1022/4473bc39241a9b4af6ebf44fb17a2f26
 */
function onMessage(event) {
    sendPacket("RECEIVE_MSG", event2json(event));
    if(event.sender.id == 'c754150652481e7cf54c2178b296fbc146f9ae4444d061938ec7b3ae77062200') {
        if(event.image != null)
            event.room.send(event.image);
    }
    if(event.message.startsWith('!e ')) {
        try {
            let res = eval(event.message.substring(3));
            event.room.send(res);
        }catch(e){
            event.room.send(e);
        }
    }
}

function onMessageDeleted(event) {
    
}

function onStartCompile() {
    return receiveThread.interrupt();
}

receiveThread.start();