import { useState } from "react";
import styles from "./Chat.module.css";


const ChatInput = ({ onSend }) => {
    const [message, setMessage] = useState('');
  
    const handleSend = () => {
      if (message.trim()) {
        onSend(message);
        setMessage(''); // Clear the input after sending
      }
    };
  
    const handleKeyPress = (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    };
  
    return (
      <div className={styles.chatInputContainer}>
        <textarea
          className={styles.chatInput}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Message"
            rows="1"
        />
        <button className={styles.sendButton} onClick={handleSend}>
          Send
        </button>
      </div>
    );
  };
  
export const Chat = () => {
    return (
        <>
            <div className={styles.chatContainer}>
                <ChatInput />
                {/* <ChatMessages /> */}
            </div>
        </>

    )
}