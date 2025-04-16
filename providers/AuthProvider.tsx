import { LikesType } from "@/types";
import { supabase } from "@/utils/supabase";
import { useRouter } from "expo-router";
import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";

export const AuthContext = createContext({
  user: null,
  signIn: async (email: string, password: string) => { },
  signUp: async (username: string, email: string, password: string) => { },
  signOut: async () => { },
  likes: [] as LikesType[],
  getLikes: async (userId: string) => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState(null);
  const router = useRouter();
  const [likes, setLikes] = useState<LikesType[]>([]);

  const getLikes = async (userId: string) => {
    const { data, error } = await supabase
      .from('Like')
      .select('*')
      .eq('user_id', userId);

    if (!error) setLikes(data);
  }

  const getUser = async (id: string) => {
    const { data, error } = await supabase
      .from('User')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error(error);
      return null;
    }

    setUser(data);
    getLikes(data.id);
    console.log("getUser / data", data);
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
    console.log("signIn / data", data);
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
    const { data: authData } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!session) {
        return router.push("/(auth)");
      }
      getUser(session?.user?.id);
    })
    return () => {
      authData.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, signIn, signUp, signOut, likes, getLikes }}>
      {children}
    </AuthContext.Provider>
  );
};