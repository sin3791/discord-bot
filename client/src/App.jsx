import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import "./App.css";

const socket = io(import.meta.env.VITE_SERVER_URL || undefined, {
  autoConnect: false,
});

function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    function handleConnect() {
      setIsConnected(true);
      setError("");
    }

    function handleDisconnect() {
      setIsConnected(false);
    }

    function handleMessage(newMessage) {
      setMessages((currentMessages) => [
        ...currentMessages,
        newMessage,
      ]);
    }

    function handleError(errorMessage) {
      setError(errorMessage);
    }

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("chat:message", handleMessage);
    socket.on("chat:error", handleError);

    socket.connect();

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("chat:message", handleMessage);
      socket.off("chat:error", handleError);
      socket.disconnect();
    };
  }, []);

  function handleSubmit(event) {
    event.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      return;
    }

    setError("");

    socket.emit(
      "chat:send",
      { text: trimmedMessage },
      (response) => {
        if (!response?.ok) {
          setError(
            response?.error || "메시지를 전송하지 못했습니다."
          );
          return;
        }

        setMessage("");
      }
    );
  }

  return (
    <main className="app">
      <header className="header">
        <p className="language">한국어 ↔ 日本語</p>
        <h1>실시간 번역 채팅</h1>
        <p>
          웹사이트와 Discord를 연결하여 실시간으로 번역합니다.
        </p>

        <p className={isConnected ? "status connected" : "status"}>
          {isConnected ? "서버 연결됨" : "서버 연결 대기 중"}
        </p>
      </header>

      <section className="chat">
        <h2>대화 내용</h2>

        <div className="messages">
          {messages.length === 0 ? (
            <p className="empty-message">
              아직 메시지가 없습니다.
            </p>
          ) : (
            messages.map((item) => (
              <article
                className={`message ${item.source}`}
                key={item.id}
              >
                <strong>{item.author}</strong>
                <p>{item.original}</p>
                <p className="translated">
                  {item.translated}
                </p>
              </article>
            ))
          )}
        </div>

        <form className="message-form" onSubmit={handleSubmit}>
          <label htmlFor="message-input">
            한국어 메시지
          </label>

          <div className="input-group">
            <input
              id="message-input"
              type="text"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              maxLength={1000}
              placeholder="메시지를 입력하세요"
              disabled={!isConnected}
            />

            <button type="submit" disabled={!isConnected}>
              전송
            </button>
          </div>

          {error && <p className="error-message">{error}</p>}
        </form>
      </section>
    </main>
  );
}

export default App;
