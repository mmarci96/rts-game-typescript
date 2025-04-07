package server

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
	"github.com/mmarci96/rts-game-monorepo/rp-server-go/internal/configs"
)

type Message struct {
	Type string `json:"type"`
	Data string `json:"data"`
}

func Run() error {
	config, err := configs.NewConfiguration()
	if err != nil {
		return fmt.Errorf("Could not load configs!")
	}

	setupRoutes()
	addr := config.Server.Host + ":" + config.Server.Port
	fmt.Println("Server started on: ", addr)
	if err := http.ListenAndServe(addr, nil); err != nil {
		return fmt.Errorf("Error starting server")
	}
	return nil
}

func setupRoutes() {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "Simple Server")
	})
	// mape our `/ws` endpoint to the `serveWs` function
	http.HandleFunc("/ws", serveWs)
}

// We'll need to define an Upgrader
// this will require a Read and Write buffer size
var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,

	// We'll need to check the origin of our connection
	// this will allow us to make requests from our React
	// development server to here.
	// For now, we'll do no checking and just allow any connection
	CheckOrigin: func(r *http.Request) bool { return true },
}


func reader(conn *websocket.Conn) {
	defer conn.Close()

	for {
		_, msg, err := conn.ReadMessage()
		if err != nil {
			log.Println("read error:", err)
			break
		}

		var message Message
		if err := json.Unmarshal(msg, &message); err != nil {
			log.Println("invalid json:", string(msg))
			continue
		}

		log.Printf("Received: %s - %s\n", message.Type, message.Data)

		switch message.Type {
		case "log":
			// Save logs, send to dashboard, etc.
			log.Println("Log entry from node:", message.Data)

		case "ping":
			conn.WriteJSON(Message{Type: "pong", Data: "hello from go"})

		default:
			log.Println("Unknown message type:", message.Type)
		}
	}
}
}

func serveWs(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("WebSocket Upgrade error:", err)
		return
	}
	log.Println("WebSocket client connected")

	go reader(conn) // async read loop
}
