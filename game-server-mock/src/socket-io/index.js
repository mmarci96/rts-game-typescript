const connections = {};

const websocketController = (io) => {
    io.on("connection", (socket) => {
        console.log("New connection: ", socket.id);
        connections[socket.id] = {};
        socket.on("pending_commands", (data) => {
            connections[socket.id].commands = data;
            console.log("Socket on pending_commands: ", connections[socket.id]);
        });
        socket.on("load_game", (data) => {
            connections[socket.id].load = data;
            console.log("Socket on load_game: ", connections[socket.id]);
        });

        socket.on("disconnect", async () => {
            console.log("Disconnected socket: ", connections[socket.id]);
            delete connections[socket.id];
        });
    });
};
export default websocketController;
