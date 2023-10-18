import { PeerContext } from "@/components/PeerContext";

import {useState, useEffect} from "react";


export const useDocument = ({id}) => {
    const socket = useContext(PeerContext);
    const [document, setDocument] = useState(null);

    useEffect(() => {
        socket.emit('subscribe',{id});

        const handleUpdate = (data) => {
            console.log(data);
        }

        socket.on(id,handleUpdate)

        return () => {
            socket.emit('unsubscribe', {id});
            socket.off(id, handleUpdate);
        }
    },[id]);


    return document;
}