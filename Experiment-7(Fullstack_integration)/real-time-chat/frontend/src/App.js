import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

function App() {
  const [socket, setSocket] = useState(null);
  const [name, setName] = useState('');
  const [joined, setJoined] = useState(false);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const endRef = useRef(null);

  useEffect(() => {
    const s = io(SOCKET_URL, { autoConnect: false });
    setSocket(s);
    return () => s.disconnect();
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on('connect', () => console.log('connected', socket.id));
    socket.on('init_messages', (msgs) => setMessages(msgs));
    socket.on('message', (msg) => setMessages((p) => [...p, msg]));
    socket.on('users', (list) => setUsers(list));
    return () => socket.disconnect();
  }, [socket]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  function join() {
    if (!name.trim()) return alert('Enter your name');
    socket.connect();
    socket.emit('set_username', name.trim());
    setJoined(true);
  }

  function send() {
    if (!text.trim()) return;
    socket.emit('send_message', text.trim());
    setText('');
  }

  return (
    <div style={{ maxWidth: 900, margin: '20px auto', fontFamily: 'Arial' }}>
      <h2>Realtime Chat</h2>
      {!joined ? (
        <div>
          <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Your name" />
          <button onClick={join}>Join</button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ width: 220, border: '1px solid #ddd', padding: 8 }}>
            <h4>Users</h4>
            <ul>{users.map((u,i)=> <li key={i}>{u}</li>)}</ul>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ height: 400, overflowY: 'auto', border: '1px solid #ddd', padding: 8 }}>
              {messages.map(m => (
                <div key={m.id} style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 12, color: '#666' }}>{new Date(m.time).toLocaleTimeString()}</div>
                  <b>{m.name}</b>: {m.text}
                </div>
              ))}
              <div ref={endRef} />
            </div>
            <div style={{ display: 'flex', marginTop: 8 }}>
              <input style={{ flex: 1 }} value={text} onChange={(e)=>setText(e.target.value)}
                     onKeyDown={(e)=>e.key==='Enter' && send()} placeholder="Type a message"/>
              <button onClick={send}>Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
