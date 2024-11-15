import { useState, useEffect, useRef } from "react";
import styles from "./Chat.module.css";

const SAMPLE_MESSAGES = [
    {
        senderId: "726e591f-9ec5-4f59-b5d2-1423d6589719",
        senderName: "Alice",
        message: "Hey Bob! It's been a while. How have you been?"
    },
    {
        senderId: "fcea72fe-7258-4e97-bd52-39475a892501",
        senderName: "Bob",
        message: "Hi Alice! I've been good, just busy with work. How about you?"
    },
    {
        senderId: "726e591f-9ec5-4f59-b5d2-1423d6589719",
        senderName: "Alice",
        message: "I've been great! Just got back from a vacation. We should catch up soon."
    },
    {
        senderId: "fcea72fe-7258-4e97-bd52-39475a892501",
        senderName: "Bob",
        message: "That sounds awesome! I'd love to hear all about it. Let's plan something this weekend."
    },
    {
        senderId: "726e591f-9ec5-4f59-b5d2-1423d6589719",
        senderName: "Alice",
        message: "I've been great! Just got back from a vacation. We should catch up soon."
    },
    {
        senderId: "fcea72fe-7258-4e97-bd52-39475a892501",
        senderName: "Bob",
        message: "That sounds awesome! I'd love to hear all about it. Let's plan something this weekend."
    },
    {
        senderId: "726e591f-9ec5-4f59-b5d2-1423d6589719",
        senderName: "Alice",
        message: "Hey Bob! It's been a while. How have you been?"
    },
    {
        senderId: "fcea72fe-7258-4e97-bd52-39475a892501",
        senderName: "Bob",
        message: "Hi Alice! I've been good, just busy with work. How about you?"
    },
    {
        senderId: "726e591f-9ec5-4f59-b5d2-1423d6589719",
        senderName: "Alice",
        message: "I've been great! Just got back from a vacation. We should catch up soon."
    },
    {
        senderId: "fcea72fe-7258-4e97-bd52-39475a892501",
        senderName: "Bob",
        message: "That sounds awesome! I'd love to hear all about it. Let's plan something this weekend."
    },
    {
        senderId: "726e591f-9ec5-4f59-b5d2-1423d6589719",
        senderName: "Alice",
        message: "I've been great! Just got back from a vacation. We should catch up soon."
    }
];

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

const ChatMessage = ({ chatMessage }) => {
    const [myId] = useState(localStorage.getItem("localId"));

    const [isMyMessage, setIsMyMessage] = useState(false);

    useEffect(() => {
        setIsMyMessage(myId == chatMessage.senderId);
    }, []);

    return (<div className={`${styles.chatMessageContainer} ${isMyMessage ? styles.myMessage : ""}`}>
        {!isMyMessage && (<div className={styles.chatSenderName}>{chatMessage.senderName}</div>)}
        <div className={styles.chatMessage}>{chatMessage.message}</div>
    </div>)

};

export const Chat = () => {
    const [messages, setMessages] = useState(SAMPLE_MESSAGES);
    const chatMessagesContainerRef = useRef();


    useEffect(() => {
        if (!chatMessagesContainerRef.current) return;
        chatMessagesContainerRef.current.scrollTop = chatMessagesContainerRef.current.scrollHeight;
    }, [messages]);

    const handleSend = (message) => {
        console.log('Sending message:', message);
        setMessages([...messages, {
            senderId: localStorage.getItem("localId"),
            senderName: localStorage.getItem("displayName"),
            message
        }]);
    };
    return (
        <>
            <div className={styles.chatContainer}>
                <ChatInput onSend={handleSend} />
                <div ref={chatMessagesContainerRef} className={styles.allChatsContainer}>
                    {messages.map((msg, i) => (
                        <ChatMessage chatMessage={msg} key={i} />
                    ))
                    }
                </div>
                <button className={styles.closeChatButton} onClick={() => { console.log('Close chat') }}>Close X</button>
            </div>
        </>

    )
}