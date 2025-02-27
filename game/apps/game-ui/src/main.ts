import { io, Socket } from 'socket.io-client';

const socketHandler = (socket: Socket, playerId: string, gameId: string) => {
    socket.on('connect', () => {
        console.log("connected");
        const data = { playerId, gameId };
        socket.emit('load_game', data);
    })
}


const getIdFromUrl = (url: string) => {
    const arr = url.split("/");
    const lastIndex = arr.length - 1

    return {
        gameId: arr[lastIndex - 1],
        playerId: arr[lastIndex]
    }
}
const loadEvent = async () => {
    document.addEventListener('contextmenu', e => e.preventDefault());
    const url = window.location.pathname;
    const { gameId, playerId } = getIdFromUrl(url);

    console.log("gameId", gameId);
    console.log("userid", playerId);
    const socket = io();
    socketHandler(socket, playerId, gameId);

}

window.addEventListener("load", loadEvent);
