import { useRealtimeContext } from "../RealtimeContext";
import { useEffect, useState } from "react";
import styles from "./AmbientCopresence.module.scss";
import { IoIosHeartEmpty } from "react-icons/io";
import { IoEllipseOutline } from "react-icons/io5";
import { IoAlert } from "react-icons/io5";
import { GoEye } from "react-icons/go";
import { CiNoWaitingSign } from "react-icons/ci";

const getAudienceMemberPosition = (index, randomOffset=0) => {
    const spacing = 40;
    const side = index % 2 === 0 ? 1 : -1;
    const offset = (Math.floor((index + 1) / 2) * spacing * side)   + randomOffset;
    return `calc(50% + ${offset}px)`;
}
const Emote = () => {
    return (
        <div
            style={{
                position: "absolute",
                top: Math.random() * 100 + "%",
                left: Math.random() * 100 + "%",
                transform: "translate(-50%, -50%)",
                pointerEvents: "none",
            }}
        >
            🫠
        </div>
    );
}
export const AmbientCopresenceOverlay = () => {
    const { socket } = useRealtimeContext();
    const [emotes, setEmotes] = useState([]);
    const [audience, setAudience] = useState([]);

    useEffect(() => {
        if (!socket) return;
        const handleEmote = (data) => {
            console.log("Received emote data:", data);
            const emoteId = `${Date.now().toString() + data.from}`;
            data.id = emoteId;
            data.randomOffset = Math.random() * 10; // Generate once
            setEmotes((prev) => [...prev, data]);

            setTimeout(() => {
                setEmotes((prev) => prev.filter((e) => e.id !== emoteId));
            }, 5000);
        }
        socket.on('emote', handleEmote);

        const onAudienceUpdate = (ids) => {
            console.log("Audience updated:", ids);
            setAudience(ids);
        }
        socket.on('currentAudience', onAudienceUpdate);

        socket.emit('getCurrentAudience');

        const onClick = (e) => {
            console.log("Sending emote data");
            let type = "heart";
            if (e.key === "1"){
                type = 'heart';
            } else if (e.key === "2") {
                type = 'eye';
            } else if (e.key === "3") {
                type = 'surprise';
            } else if (e.key === "4") {
                type = 'bad';
            }
            socket.emit('emote', {
                from: socket.id,
                type
            });
        }

        document.body.addEventListener('keydown', onClick);

        return () => {
            socket.off('emote', handleEmote);
            socket.off('currentAudience', onAudienceUpdate);
            document.body.removeEventListener('keydown', onClick);
        };
    }, [socket, setEmotes])

    return (
        <div
            className={styles.emoteContainer}
        >
            {audience && audience.map((id, index) => {
                if (!id) return null; // Skip if id is null or undefined
                return (<div key={id} className={styles.audienceMember} style={{ left: getAudienceMemberPosition(index) }}>
                    <IoEllipseOutline />
                </div>);

            })}
            {emotes.map((emote) => {
                const index = audience.findIndex((id) => id === emote.from);
                if (index === -1) return null;
                return (
                    <div
                        key={emote.id}
                        className={styles.floatingEmote}
                        style={{ left: getAudienceMemberPosition(index, emote.randomOffset), rotate: `${emote.randomOffset/5}deg` }}
                    >
                        {emote.type === "heart" && <IoIosHeartEmpty />}
                        {emote.type === "surprise" && <IoAlert />}
                        {emote.type === "eye" && <GoEye />}
                        {emote.type === "bad" && <CiNoWaitingSign />}
                    </div>
                );
            })}
        </div>
    );
}