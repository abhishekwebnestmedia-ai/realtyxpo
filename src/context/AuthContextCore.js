import { createContext } from 'react';

// Separate file so Fast Refresh only sees a simple context export here
export const AuthContext = createContext();
export default AuthContext;
