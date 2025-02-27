import { Server, Socket } from "socket.io";

export const websocketController = (io: Server) => {
    io.on('connection', (socket: Socket) => {
        console.log("New connection: ", socket.id);

        socket.on('disconnect', () => {
            console.log('Connection ended: ', socket.id)
        })
    })
}
