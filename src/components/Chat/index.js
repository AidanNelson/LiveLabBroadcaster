import { useState } from "react";
import styles from "./Chat.module.css";

const SAMPLE_MESSAGES = [
    {
        senderName: "Alice",
        message: "Hey Bob! It's been a while. How have you been?"
    },
    {
        senderName: "Bob",
        message: "Hi Alice! I've been good, just busy with work. How about you?"
    },
    {
        senderName: "Alice",
        message: "I've been great! Just got back from a vacation. We should catch up soon."
    },
    {
        senderName: "Bob",
        message: "That sounds awesome! I'd love to hear all about it. Let's plan something this weekend."
    },
    {
        senderName: "Alice",
        message: "I've been great! Just got back from a vacation. We should catch up soon."
    },
    {
        senderName: "Bob",
        message: "That sounds awesome! I'd love to hear all about it. Let's plan something this weekend."
    }
]

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
    const [messages, setMessages] = useState(SAMPLE_MESSAGES);
    return (
        <>
            <div className={styles.chatContainer}>
                <ChatInput />
                {/* <ChatMessages /> */}
                <div className={styles.allChatsContainer}>
                    {messages.map((msg, i) => (
                        <>
                            <div className={styles.chatMessageContainer} key={i}>
                                <div className={styles.chatSenderName}>{msg.senderName}</div>
                                <div className={styles.chatMessage}>{msg.message}</div>
                            </div>
                        </>
                    ))
                    }
                </div>

                <button className={styles.closeChatButton} onClick={() => { console.log('Close chat') }}>Close X</button>
            </div>
        </>

    )
}