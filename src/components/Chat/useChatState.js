import { useState, useEffect } from "react";
import { supabase } from "../SupabaseClient";
import { useStageContext } from "../StageContext";
import { useUser } from "@/hooks/useUser";

import debug from "debug";
const logger = debug("broadcaster:useChatState");

export const useChatState = () => {
    const {user} = useUser();
    const [messages, setMessages] = useState([]);
    const [displayNames, setDisplayNames] = useState([]);
    const [messagesWithDisplayNames, setMessagesWithDisplayNames] = useState([]);


    useEffect(() => {
        if (!messages.length) return;

        const combined = messages.map(msg => {
            const displayName = displayNames.find(dn => dn.user_id === msg.sender_id);
            return {
                ...msg,
                displayName: displayName ? displayName.display_name : 'Unknown',
                isFromMe: msg.sender_id === user?.id
            }
        });

        // Sort by created_at
        combined.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

        setMessagesWithDisplayNames(combined);
    }, [displayNames, messages, user]);

    const { stageInfo } = useStageContext();


    useEffect(() => {
        if (!stageInfo) return;
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
            setMessages(prevMessages => [...prevMessages, data.new]);
        };

        const handleChatDeleted = (data) => {
            setMessages(prevMessages => prevMessages.filter(msg => msg.id !== data.old.id));
        }
        // TODO: handle updates and deletes
        const channel = supabase
            .channel('chat_messages_realtime')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `stage_id=eq.${stageInfo.id}` }, handleChatInserted)
            .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'chat_messages', filter: `stage_id=eq.${stageInfo.id}` }, handleChatDeleted)
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
                setDisplayNames(data);
            }
        };

        fetchDisplayNames();

        // Listen for updates
        const handleDisplayNameInserts = (data) => {
            setDisplayNames(prevDisplayNames => [...prevDisplayNames, data.new]);
        };
        const handleDisplayNameUpdates = (data) => {
            setDisplayNames(prevDisplayNames => prevDisplayNames.map(dn => dn.id === data.new.id ? data.new : dn));
        }
        const handleDisplayNameDeletions = (data) => {
            setDisplayNames(prevDisplayNames => prevDisplayNames.filter(dn => dn.id !== data.old.id));
        }

        // TODO: handle updates and deletes

        const channel = supabase
            .channel('display_names_realtime')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'display_names' }, handleDisplayNameInserts)
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'display_names' }, handleDisplayNameUpdates)
            .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'display_names' }, handleDisplayNameDeletions)
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
            logger('Message sent.');
        }
    };

    return {
        messagesWithDisplayNames,
        sendMessage
    };
};