import React from 'react'
import { useState } from 'react';
import { useEffect } from 'react';
import { io } from 'socket.io-client';
import Editor from '@monaco-editor/react';
import { Toaster, toast } from 'react-hot-toast';

let socket;

const App = () => {
  const [code, setCode] = useState("");
  const [user, setUser] = useState("");
  const [users, setUsers] = useState([]);
  const [room, setRoom] = useState("");
  const [isUser, setIsUser] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const [language, setLanguage] = useState("javascript");

  useEffect(() => {
    socket = io('https://codecollab-backend-84as.onrender.com');

    socket.on('connect', () => {});

    socket.on('sendCode', (data) => {
      setCode(data.code);
    })

    socket.on('handleUser', (data) => {
      toast.success(`${data.newUser} has joined`);
    });

    socket.on('handleRoom', (data) => {
      setCode(data.code);
      toast.success(`${data.userName} Has Join Room: ${data.room}`)
    })

    socket.on('leaveRoom', (data) => {
      toast.error(`${data.userName} Has Leave ${data.room}`)
    })

    socket.on('updateUserList', (userList) => {
      setUsers(userList);
    });

    socket.on('userTyping', (data) => {
      if (data.userName !== user) {
        setTypingUser(data.userName);
      }
      setTimeout(() => setTypingUser(null), 3000);
    })

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleCodeChange = (value) => {
    const newCode = value;
    setCode(newCode);
    sendCode(newCode);
    socket.emit("userTyping", { user });
  }

  const sendCode = (newCode) => {
    socket.emit('sendCode', { code: newCode });
  }

  const handleUser = () => {
    if (user == "") return;
    socket.emit("handleUser", { user });
    setIsUser(true);
  }

  const handleRoom = () => {
    socket.emit('handleRoom', { room });
  }

  const leaveRoom = () => {
    socket.emit('leaveRoom', { room, user });
    setRoom("");
    setUsers([]);
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="notification">
        <Toaster 
          position="top-right" 
          reverseOrder={false}
          toastOptions={{
            style: {
              background: '#1e293b',
              color: '#f8fafc',
              border: '1px solid #1e40af'
            }
          }} 
        />
      </div>
      
      {isUser == false ? (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-6">
          <div className="w-full max-w-md bg-gray-800 rounded-lg border border-blue-700 p-8 space-y-6">
            <h1 className="text-2xl font-bold text-center text-blue-400">Welcome to CodeCollab</h1>
            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
                  Enter Your Name
                </label>
                <input
                  type="text"
                  id="username"
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-100"
                  placeholder="Your display name"
                />
              </div>
              <button
                onClick={handleUser}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out"
              >
                Continue to Editor
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-blue-400">CodeCollab</h1>
              <p className="text-gray-400">Real-time collaborative code editor</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="flex-1">
                <input
                  type="text"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-100"
                  placeholder="Enter room name"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleRoom}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out whitespace-nowrap"
                >
                  Join Room
                </button>
                {room && (
                  <button
                    onClick={leaveRoom}
                    className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out border border-gray-600 whitespace-nowrap"
                  >
                    Leave Room
                  </button>
                )}
              </div>
            </div>
          </header>

          {/* Main Content */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar */}
            <div className="lg:w-64 flex flex-col gap-6">
              {/* Language Selector */}
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Language
                </label>
                <select
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-100"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="html">HTML</option>
                  <option value="css">CSS</option>
                  <option value="json">JSON</option>
                  <option value="cpp">C++</option>
                  <option value="java">Java</option>
                </select>
              </div>

              {/* Room Members */}
              <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                <div className="bg-gray-700 px-4 py-3 border-b border-gray-600">
                  <h2 className="font-semibold text-blue-400">Room Members</h2>
                </div>
                <ul className="divide-y divide-gray-700">
                  {users.length > 0 ? (
                    users.map((val, index) => (
                      <li key={index} className="px-4 py-3 flex items-center">
                        <span className={`inline-block w-2 h-2 rounded-full mr-2 ${val.userName === user ? 'bg-green-500' : 'bg-blue-500'}`}></span>
                        {val.userName === user ? (
                          <span className="text-gray-100">You</span>
                        ) : (
                          <span className="text-gray-300">{val.userName}</span>
                        )}
                      </li>
                    ))
                  ) : (
                    <li className="px-4 py-3 text-gray-400 text-sm">No members in room</li>
                  )}
                </ul>
              </div>
              { typingUser && user !== typingUser &&(
                <div className="mb-2 text-sm text-blue-400 font-medium flex items-center">
                  <span className="animate-pulse mr-1">✏️</span>
                  {typingUser} is typing...
                </div>
              )}
              
            </div>

            {/* Editor Area */}
            <div className="flex-1">
              
              <div className="rounded-lg overflow-hidden border border-gray-700">
                <Editor
                  height="70vh"
                  theme="vs-dark"
                  language={language}
                  value={code}
                  onChange={handleCodeChange}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    wordWrap: 'on',
                    automaticLayout: true,
                  }}
                />
              </div>
            </div>
          </div>
          <footer className="bg-gray-800 border-t border-gray-700 py-6 mt-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-lg font-semibold text-blue-400">CodeCollab</h3>
            <p className="text-gray-400 text-sm">Real-time collaborative code editor</p>
          </div>
          <div className="text-gray-400 text-sm text-center md:text-right">
            <p>Created by <a className="text-blue-400" href='https://santoshhadiya.github.io/santosh/'>Santosh Hadiya</a></p>
            <p>BCA Student at Som-Lalit Institute of Computer Application</p>
            <p>Ahmedabad | <a href="mailto:santoshhadiya333@gmail.com" className="hover:text-blue-400">santoshhadiya333@gmail.com</a></p>
          </div>
        </div>
      </div>
    </footer>
        </div>
      )}
    </div>
  )
}

export default App