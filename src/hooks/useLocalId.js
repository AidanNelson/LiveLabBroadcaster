import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

export const useLocalId = () => {
    const [localId, setLocalId] = useState(localStorage.getItem('localId'));

    useEffect(() => {
        if (localId) return;
        const id = uuidv4();
        localStorage.setItem('localId', id);
        setLocalId(id);
    }, []);

    useEffect(() => {
        console.log('Local ID:', localId);
    }, [localId]);

    return { localId };
};

