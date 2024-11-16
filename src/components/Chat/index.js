import { useState, useEffect, useRef, useCallback } from "react";
import styles from "./Chat.module.css";
// import { supabase } from "../SupabaseClient";
import { useStageContext } from "../StageContext";
import { useUser } from "@/hooks/useUser";
import { usePeerContext } from "../PeerContext";
import { useLocalId } from "@/hooks/useLocalId";


const useChatState = () => {
    const [messages, setMessages] = useState([]);
    const [displayNames, setDisplayNames] = useState([]);

    const { stageInfo } = useStageContext();
    const { socket } = usePeerContext();
    const { localId } = useLocalId();

    useEffect(() => {
        if (!socket) return;
        console.log('adding socket listeners for chat');

        const chatInfoListener = (data) => {
            // setMessages(data.chats);
            console.log("Got chats!",data);
        }
        socket.on('chat', chatInfoListener)

        socket.emit('getChatHistory', { stageId: stageInfo.id });

        return () => {
            socket.off('chat', chatInfoListener);
        }

    }, [socket]);

    const sendMessage = useCallback((message) => {
        console.log('sending message:', message);
        socket.emit('chat', {
            message: message,
            stageId: stageInfo.id,
            senderId: localId
        });
    }, [socket])

    return {
        messages,
        displayNames,
        sendMessage
    };
};

// const useChatState = () => {
//     const [messages, setMessages] = useState([]);
//     const [displayNames, setDisplayNames] = useState([]);


//     const { stageInfo } = useStageContext();


//     useEffect(() => {
//         const fetchMessages = async () => {
//             const { data, error } = await supabase
//                 .from('chat_messages')
//                 .select('*')
//                 .eq('stage_id', stageInfo.id)
//                 .order('created_at', { ascending: true });

//             if (error) {
//                 console.error('Error fetching messages:', error);
//             } else {
//                 setMessages(data);
//             }
//         };

//         fetchMessages();

//         // const subscription = supabase
//         //     .from('messages')
//         //     .on('INSERT', payload => {
//         //         setMessages(prevMessages => [...prevMessages, payload.new]);
//         //     })
//         //     .subscribe();

//         // Listen for updates
//         const handleChatInserted = (data) => {
//             console.log("Got new chat info:", data);
//             setMessages(prevMessages => [...prevMessages, data.new]);
//         };

//         // TODO: handle updates and deletes
//         supabase
//             .channel('supabase_realtime')
//             .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `stage_id=eq.${stageInfo.id}` }, handleChatInserted)
//             // .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'chat_messages', filter: `stage_id=eq.${stageInfo.id}` }, handleRecordUpdated)
//             // .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'chat_messages', filter: `stage_id=eq.${stageInfo.id}` }, handleRecordDeleted)
//             .subscribe()

//     }, []);

//     useEffect(() => {
//         const fetchDisplayNames = async () => {
//             const { data, error } = await supabase
//                 .from('display_names')
//                 .select('*')
//                 .order('created_at', { ascending: true });

//             if (error) {
//                 console.error('Error fetching messages:', error);
//             } else {
//                 console.log('got Initial displayNames:',data);
//                 setDisplayNames(data);
//             }
//         };

//         fetchDisplayNames();

//         // Listen for updates
//         const handleDisplayNameUpdates = (data) => {
//             console.log("Got new display names:", data);
//             setDisplayNames(prevDisplayNames => [...prevDisplayNames, data.new]);
//         };

//         // TODO: handle updates and deletes
//         supabase
//             .channel('supabase_realtime')
//             .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'display_names' }, handleDisplayNameUpdates)
//             // .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'display_names' }, handleDisplayNames)
//             // .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'display_names' }, handleDisplayNames)
//             .subscribe()

//     }, []);

//     const sendMessage = async (message) => {
//         const { data, error } = await supabase
//             .from('chat_messages')
//             .insert([
//                 {
//                     message,
//                     stage_id: stageInfo.id,
//                 }
//             ]);

//         if (error) {
//             console.error('Error sending message:', error);
//         } else {
//             console.log('Message sent.');
//         }
//     };

//     return {
//         messages,
//         sendMessage
//     };
// };

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
    // const user = {id: null};

    const [isMyMessage, setIsMyMessage] = useState(false);

    useEffect(() => {
        if (!user) return;
        setIsMyMessage(user.id == chatMessage.sender_id);
    }, [user]);

    return (<div className={`${styles.chatMessageContainer} ${isMyMessage ? styles.myMessage : ""}`}>
        {!isMyMessage && (<div className={styles.chatSenderName}>{chatMessage.senderName}</div>)}
        <div className={styles.chatMessage}>{chatMessage.message}</div>
    </div>)

};

export const Chat = () => {
    const user = useUser();
    const { messages, sendMessage } = useChatState();

    // const [messages, setMessages] = useState(SAMPLE_MESSAGES);
    const chatMessagesContainerRef = useRef();


    useEffect(() => {
        if (!chatMessagesContainerRef.current) return;
        chatMessagesContainerRef.current.scrollTop = chatMessagesContainerRef.current.scrollHeight;
    }, [messages]);

    const handleSend = (message) => {
        console.log('Sending message:', message);
        sendMessage(message);
        // setMessages([...messages, {
        //     senderId: localStorage.getItem("localId"),
        //     senderName: localStorage.getItem("displayName"),
        //     message
        // }]);
    };
    return (
        <>
            <div className={styles.chatContainer}>
                <ChatInput onSend={handleSend} />
                <div ref={chatMessagesContainerRef} className={styles.allChatsContainer}>
                    {messages.map((msg, i) => (
                        <ChatMessage user={user} chatMessage={msg} key={i} />
                    ))
                    }
                </div>
                <button className={styles.closeChatButton} onClick={() => { console.log('Close chat') }}>Close X</button>
            </div>
        </>

    )
}