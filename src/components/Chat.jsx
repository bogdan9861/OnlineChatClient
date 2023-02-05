import React from 'react'
import io from 'socket.io-client'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import EmojiPicker from "emoji-picker-react";
import Messages from './Messages';

import styles from '../styles/Chat.module.css'
import ico from '../images/emoji.svg'
const socket = io.connect('http://localhost:5000')


export const Chat = () => {

  const { search } = useLocation();
  const [params, setParams] = useState({ room: '', user: '' });
  const [state, setState] = useState([]);
  const [message, setMessage] = useState('');
  const [isOpen, setOpen] = useState(false);
  const [users, setUsers] = useState(0)

  const navigate = useNavigate();

  useEffect(() => {
    const searchParams = Object.fromEntries(new URLSearchParams(search));
    setParams(searchParams);
    socket.emit("join", searchParams);
  }, [search]);

  useEffect(() => {
    socket.on("message", ({ data }) => {
      setState((_state) => [..._state, data]);
    });
  }, []);

  useEffect(() => {
    socket.on("joinRoom", ({ data: { users } }) => {
      setUsers(users.length);
    });
  }, []);

  console.log(state);

  const handleChange = ({ target: { value } }) => { setMessage(value) }

  const onEmojiClick = ({ emoji }) => { setMessage(`${message} ${emoji}`) };


  const handleSubmt = (e) => {
    e.preventDefault();

    if (!message) return;

    socket.emit('sendMessage', { message, params });
    setMessage("");
  }

  const leftRoom = () => {
    socket.emit('leftRoom', {params});
    navigate('/');
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div className={styles.title}>
          {params.room}
        </div>
        <div className={styles.users}>
          {users} users in this room
        </div>
        <button className={styles.left} onClick={leftRoom}>
          exit
        </button>
      </div>

      <div className={styles.messages}>
        <Messages messages={state} name={params.name} />
      </div>

      <form className={styles.form} onSubmit={handleSubmt}>
        <div className={styles.input}>
          <input
            type="text"
            name="message"
            placeholder="Write your message"
            value={message}
            onChange={handleChange}
            autoComplete="off"
            required
          />
        </div>

        <div className={styles.emoji} >
          <img src={ico} alt="" onClick={() => setOpen(!isOpen)} />

          {isOpen && (
            <div className={styles.emojies}>
              <EmojiPicker onEmojiClick={onEmojiClick} />
            </div>
          )}


        </div>

        <div className={styles.button}>
          <input type="submit" value="Send a message" onSubmit={handleSubmt} />
        </div>
      </form>
    </div>
  )
} 