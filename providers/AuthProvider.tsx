import { supabase } from "@/utils/supabase";
import { useRouter } from "expo-router";
import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";

export const AuthContext = createContext({
  user: null,
  signIn: async (email: string, password: string) => {},
  signUp: async (username: string, email: string, password: string) => {},
  signOut: async () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState(null);
  const router = useRouter();

  const getUser = async (id: string) => {
    const { data, error } = await supabase.from('User').select('*').eq('id', id).single();
    if (error) {
      console.error(error);
      return null;
    }
    setUser(data);
    console.log(data);
    router.push("/(tabs)");
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    if (error) {
      console.error(error);
      return;
    }
    getUser(data.user?.id);
  };

  const signUp = async (username: string, email: string, password: string) => {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
        });
        if (error) {
            console.error(error);
            return;
        }
        const { data: userData, error: userError } = await supabase.from("User").insert({
            id: data.user?.id,
            email: email,
            username: username,
        });
        if (userError) {
            console.error(userError);
            return;
        }
        setUser(userData);
        router.back();
        router.push("/(tabs)");
    };

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error(error);
            return;
        }
        setUser(null);
        router.push("/(auth)");
    };

    useEffect(() => {
        const {data: authData} = supabase.auth.onAuthStateChange(async (event, session) => {
            if(!session){
                return router.push("/(auth)");
            }
            getUser(session?.user?.id);
          })
          return () => {
            authData.subscription.unsubscribe();
          };
      }, []);

  return (
    <AuthContext.Provider value={{ user, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};