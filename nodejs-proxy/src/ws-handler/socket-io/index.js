export const socketIoHandler = (goSocket, io, clients) => {
    io.on("connection", (socket) => {
        console.log("Client connected:", socket.id);
        clients[socket.id] = socket;

        socket.onAny((event, payload) => {
            console.log("Event: ", event);
            console.log("Payload: ", payload);
            // Forward to Go
            const ctx = {
                clientId: socket.id,
                event,
                payload,
            };
            console.log("Sending message to Go socket: ", ctx);
            const msg = JSON.stringify(ctx);
            goSocket.send(msg);
        });
        const updater = setInterval(() => {
            goSocket.send({ "Connected clients": clients });
        }, 6000);

        socket.on("stop_update_interval", (stopData) => {
            const c = clients[socket.id];
            console.log("Stop request: ", c);
            console.log("Stop data: ", stopData);
            if (stopData.id) {
                clearInterval(updater);
            }
        });
        socket.on("disconnect", () => {
            delete clients[socket.id];
            const ctx = {
                clientId: socket.id,
                event: "disconnect",
            };
            console.log("Disconneted socket: ", ctx);
            const msg = JSON.stringify(ctx);
            goSocket.send(msg);
        });
    });
};
