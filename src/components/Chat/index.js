import { useState, useEffect, useRef, useCallback } from "react";
import styles from "./Chat.module.css";
import { useUser } from "@/hooks/useUser";
import { useChatState } from "./useChatState";


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

const ChatMessage = ({ chatMessage, user }) => {

    const [isMyMessage, setIsMyMessage] = useState(false);

    useEffect(() => {
        if (!user) return;
        setIsMyMessage(user.id == chatMessage.sender_id);
    }, [user]);

    return (<div className={`${styles.chatMessageContainer} ${isMyMessage ? styles.myMessage : ""}`}>
        {!isMyMessage && (<div className={styles.chatSenderName}>{chatMessage.displayName}</div>)}
        <div className={styles.chatMessage}>{chatMessage.message}</div>
    </div>)

};

export const Chat = () => {
    const { user } = useUser();
    const { messagesWithDisplayNames, sendMessage } = useChatState();

    const chatMessagesContainerRef = useRef();

    useEffect(() => {
        if (!chatMessagesContainerRef.current) return;
        chatMessagesContainerRef.current.scrollTop = chatMessagesContainerRef.current.scrollHeight;
    }, [messagesWithDisplayNames]);
    
    return (
        <>
            <div className={styles.chatContainer}>
                <ChatInput onSend={sendMessage} />
                <div ref={chatMessagesContainerRef} className={styles.allChatsContainer}>
                    {messagesWithDisplayNames.map((msg, i) => (
                        <ChatMessage user={user} chatMessage={msg} key={i} />
                    ))
                    }
                </div>
                <button className={styles.closeChatButton} onClick={() => { console.log('Close chat') }}>Close X</button>
            </div>
        </>

    )
}