import { io, Socket } from 'socket.io-client';

const socketHandler = (socket: Socket) => {
    socket.on('connect', () => {
        console.log("connected");
    })
}


const getIdFromUrl = (url: string) => {
    const arr = url.split("/");
    const lastIndex = arr.length - 1

    return {
        gameId: arr[lastIndex - 1],
        userId: arr[lastIndex]
    }
}
const loadEvent = async () => {
    document.addEventListener('contextmenu', e => e.preventDefault());
    const url = window.location.pathname;
    const { gameId, userId } = getIdFromUrl(url);

    console.log("gameId", gameId);
    console.log("userid", userId);
    const socket = io();
    socketHandler(socket);


    console.log("Hello world!")
}

window.addEventListener("load", loadEvent);
