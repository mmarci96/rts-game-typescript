export const goSocketHandler = (goSocket, clients) => {
    // --- Relay messages from GO to client(s) ---
    goSocket.on("message", (data) => {
        const { clientId, event, payload } = JSON.parse(data);
        const client = clients[clientId];
        if (client) {
            client.emit(event, payload);
        }
    });
};
