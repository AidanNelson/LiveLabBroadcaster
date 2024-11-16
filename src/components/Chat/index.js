import { useState, useEffect, useRef, useCallback } from "react";
import styles from "./Chat.module.css";
// import { useUser } from "@/hooks/useUser";
import { useChatState } from "./useChatState";
import { useAuthContext } from "../AuthContextProvider";


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
    return (<div className={`${styles.chatMessageContainer} ${chatMessage.isFromMe ? styles.myMessage : ""}`}>
        {!chatMessage.isFromMe && (<div className={styles.chatSenderName}>{chatMessage.displayName}</div>)}
        <div className={styles.chatMessage}>{chatMessage.message}</div>
    </div>)

};

export const Chat = ({closeChat}) => {
    const { user } = useAuthContext();
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
                        <ChatMessage chatMessage={msg} key={i} />
                    ))
                    }
                </div>
                <button className={styles.closeChatButton} onClick={() => { closeChat(); }}>Close X</button>
            </div>
        </>
    )
}