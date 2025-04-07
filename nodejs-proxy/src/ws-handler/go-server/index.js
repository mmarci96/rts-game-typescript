export const goSocketHandler = (goSocket, clients) => {
    goSocket.onmessage = (msg) => {
        try {
            const payload = JSON.parse(msg.data);
            console.log("From Go:", payload);

            if (payload.type === "pong") {
                // Test echo from Go
                console.log("Pong from Go received.");
            }

            // Optional: broadcast to socket.io clients
            Object.values(clients).forEach((socket) => {
                socket.emit("from-go", payload);
            });
        } catch (e) {
            console.error("Invalid message from Go:", msg.data);
        }
    };
};
