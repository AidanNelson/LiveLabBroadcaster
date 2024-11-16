import { useState, useEffect } from "react";
import { supabase } from "../SupabaseClient";
import { useStageContext } from "../StageContext";

// import { useUser } from "@/hooks/useUser";
// import { usePeerContext } from "../PeerContext";
// import { useLocalId } from "@/hooks/useLocalId";

// const useChatState = () => {
//     const [messages, setMessages] = useState([]);
//     const [displayNames, setDisplayNames] = useState([]);

//     const { stageInfo } = useStageContext();
//     const { socket } = usePeerContext();
//     const { localId } = useLocalId();

//     useEffect(() => {

//         if (!socket) return;

//         socket.emit('setDisplayNameForChat', { senderId: localId, displayName:"Aidan" });

//     }, [socket]);

//     useEffect(() => {
//         if (!socket) return;
//         console.log('adding socket listeners for chat');

//         const chatInfoListener = (data) => {
//             setMessages(data.chats);
//             setDisplayNames(data.displayNames);
//             console.log("Got chats!",data);
//         }
//         socket.on('chat', chatInfoListener)

//         socket.emit('getChatHistory', { stageId: stageInfo.id });

//         return () => {
//             socket.off('chat', chatInfoListener);
//         }

//     }, [socket]);

//     const sendMessage = useCallback((message) => {
//         console.log('sending message:', message);
//         socket.emit('chat', {
//             message: message,
//             stageId: stageInfo.id,
//             senderId: localId
//         });
//     }, [socket])

//     return {
//         messages,
//         displayNames,
//         sendMessage
//     };
// };

export const useChatState = () => {
    const [messages, setMessages] = useState([]);
    const [displayNames, setDisplayNames] = useState([]);
    const [messagesWithDisplayNames, setMessagesWithDisplayNames] = useState([]);


    useEffect(() => {
        if (!messages.length) return;

        const combined = messages.map(msg => {
            const displayName = displayNames.find(dn => dn.user_id === msg.sender_id);
            return {
                ...msg,
                displayName: displayName ? displayName.display_name : 'Unknown'
            }
        });

        setMessagesWithDisplayNames(combined);
    }, [displayNames, messages]);

    const { stageInfo } = useStageContext();


    useEffect(() => {
        const fetchMessages = async () => {
            const { data, error } = await supabase
                .from('chat_messages')
                .select('*')
                .eq('stage_id', stageInfo.id)
                .order('created_at', { ascending: true });

            if (error) {
                console.error('Error fetching messages:', error);
            } else {
                setMessages(data);
            }
        };

        fetchMessages();

        // Listen for updates
        const handleChatInserted = (data) => {
            console.log("Got new chat info:", data);
            setMessages(prevMessages => [...prevMessages, data.new]);
        };

        // TODO: handle updates and deletes
        const channel = supabase
            .channel('chat_messages_realtime')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `stage_id=eq.${stageInfo.id}` }, handleChatInserted)
            // .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'chat_messages', filter: `stage_id=eq.${stageInfo.id}` }, handleRecordUpdated)
            // .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'chat_messages', filter: `stage_id=eq.${stageInfo.id}` }, handleRecordDeleted)
            .subscribe()

        return () => {
            supabase.removeChannel(channel);
        }

    }, []);

    useEffect(() => {
        const fetchDisplayNames = async () => {
            const { data, error } = await supabase
                .from('display_names')
                .select('*')
                .order('created_at', { ascending: true });

            if (error) {
                console.error('Error fetching messages:', error);
            } else {
                console.log('got Initial displayNames:', data);
                setDisplayNames(data);
            }
        };

        fetchDisplayNames();

        // Listen for updates
        const handleDisplayNameUpdates = (data) => {
            console.log("Got new display names:", data);
            setDisplayNames(prevDisplayNames => [...prevDisplayNames, data.new]);
        };

        // TODO: handle updates and deletes

        const channel = supabase
            .channel('display_names_realtime')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'display_names' }, handleDisplayNameUpdates)
            // .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'display_names' }, handleDisplayNames)
            // .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'display_names' }, handleDisplayNames)
            .subscribe()

        return () => {
            supabase.removeChannel(channel);
        }

    }, []);

    const sendMessage = async (message) => {
        const { data, error } = await supabase
            .from('chat_messages')
            .insert([
                {
                    message,
                    stage_id: stageInfo.id,
                }
            ]);

        if (error) {
            console.error('Error sending message:', error);
        } else {
            console.log('Message sent.');
        }
    };

    return {
        messagesWithDisplayNames,
        sendMessage
    };
};