import { io, Socket } from 'socket.io-client';

const socketHandler = (socket: Socket) => {
    socket.on('connect', () => {
        console.log("connected");
    })
}

const loadEvent = async () => {
    document.addEventListener('contextmenu', e => e.preventDefault());
    const url = window.location.pathname;
    console.log(url);
    const socket = io();
    socketHandler(socket);


    console.log("Hello world!")
}

window.addEventListener("load", loadEvent);
