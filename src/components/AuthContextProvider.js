import { createContext, useContext } from 'react';

// Create the AuthContext
const AuthContext = createContext();

// Create the AuthContextProvider component
export const AuthContextProvider = ({ user, children }) => {
    return (
        <AuthContext.Provider value={{user}}>
            {children}
        </AuthContext.Provider>
    );
};

// Create the useAuthContext hook
// export const myuseAuthContext = () => {
//     return useContext(AuthContext);
// };
export const useAuthContext = () => {
    const { user } = useContext(AuthContext);
  
    return { user }
  }