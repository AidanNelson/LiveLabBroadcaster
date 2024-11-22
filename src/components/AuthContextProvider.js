"use client";
import { createContext, useContext } from 'react';
import { useUser } from '@/hooks/useUser';

// Create the AuthContext
const AuthContext = createContext();

// Create the AuthContextProvider component
export const AuthContextProvider = ({ children }) => {
    const { user, displayName, setDisplayName, displayColor, setDisplayColor } = useUser();
    return (
        <AuthContext.Provider value={{ user, displayName, setDisplayName, displayColor, setDisplayColor }}>
            {children}
        </AuthContext.Provider>
    );
};

// Create the useAuthContext hook
// export const myuseAuthContext = () => {
//     return useContext(AuthContext);
// };
export const useAuthContext = () => {
    return useContext(AuthContext);
}