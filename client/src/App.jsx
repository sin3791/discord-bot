import { useState } from "react";
import "./App.css";

function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  function handleSubmit(event) {
    event.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      return;
    }

    const newMessage = {
      id: Date.now(),
      text: trimmedMessage,
    };

    setMessages((currentMessages) => [
      ...currentMessages,
      newMessage,
    ]);

    setMessage("");
  }

  return (
    <main className="app">
      <header className="header">
        <p className="language">한국어 ↔ 日本語</p>
        <h1>실시간 번역 채팅</h1>
        <p>
          웹사이트와 Discord를 연결하여 실시간으로 번역합니다.
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
              <article className="message" key={item.id}>
                <strong>웹 사용자</strong>
                <p>{item.text}</p>
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
            />

            <button type="submit">
              전송
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

export default App;