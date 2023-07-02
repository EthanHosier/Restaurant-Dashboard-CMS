import { createContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, signOut, GoogleAuthProvider, getAuth, signInWithPopup } from 'firebase/auth';
import app from "../firebase/config";

const AuthContext = createContext({user: {uid: "", displayName: ""}, loading: true});
const auth = getAuth(app);

export const AuthProvider = ({ children }: {children: any}) => {

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true)

  useEffect(() => {

    let unsubBookingData: any = null;
    const authUnsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
      
        setUser(user);
        //console.log(user);

      } else {
        // User not logged in
        setUser(null);
        console.log('logout');
      }
      setLoading(false);
    });

    return () => {
      authUnsubscribe();
      if (unsubBookingData) {
        unsubBookingData();
      }
    };
  }, []);


  const memoedValue = useMemo(() => ({
    loading,
    user,
  }), [user, loading])


  return (
      <AuthContext.Provider value={{...memoedValue}}>
        {children}
      </AuthContext.Provider>

  )

}

export default AuthContext;