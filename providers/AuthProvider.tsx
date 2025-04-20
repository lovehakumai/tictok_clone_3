import { FollowingType, LikesType, UserType } from "@/types";
import { supabase } from "@/utils/supabase";
import { useRouter } from "expo-router";
import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";

interface AuthContextType {
  user: UserType | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (username: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  getLikes: (userId: string) => Promise<void>;
  likes: LikesType[];
  getFollowing: (userId: string) => Promise<void>;
  following: FollowingType[];
  getFollowers: (userId: string) => Promise<void>;
  followers: any[];
  getFriends: () => Promise<void>;
  friends: any[]
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  signIn: async (email: string, password: string) => { },
  signUp: async (username: string, email: string, password: string) => { },
  signOut: async () => { },
  getLikes: async (userId: string) => { },
  likes: [] as LikesType[],
  getFollowing: async (userId: string) => { },
  following: [] as FollowingType[],
  getFollowers: async (userId: string) => { },
  followers: [] as any[],
  getFriends: async() => {},
  friends: [] 
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState(null);
  const router = useRouter();
  const [likes, setLikes] = useState<LikesType[]>([]);
  const [following, setFollowing] = useState<FollowingType[]>([]);
  const [followers, setFollowers] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);

  const getFriends = async() => {
    console.log("authProvider / followings", following);
    console.log("authProvider / followers", followers);
    
    const followingIds = following.map(f => f.user_id); // ユーザがフォローしているユーザのids
    const followerIds = followers.map(f => f.follower_user_id); // ユーザをフォローしているユーザのids
    const duplicates = followingIds.filter(id => followerIds.includes(id)); // ユーザをフォローしているユーザの中でユーザがフォローしているユーザ
    setFriends(duplicates);
    console.log("authProvider / dupulicates", duplicates);
  }

  const getLikes = async (userId: string) => {
    const { data, error } = await supabase
      .from('Like')
      .select('*')
      .eq('user_id', userId);

    if (!error) setLikes(data);
  }

  const getFollowing = async (userId: string) => {
    if(!userId) return;
    const { data, error } = await supabase
      .from('Follower')
      .select('*, User(*)')
      .eq('follower_user_id', userId);
    
    if(!error) setFollowing(data);
  }

  const getFollowers = async (userId: string) => {
    if(!userId) return;
    const { data, error } = await supabase
      .from('Follower')
      .select('*, User(*)')
      .eq('user_id', userId);
    
    if(!error) setFollowers(data);
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
    getFollowers(data.id);
    getFollowing(data.id);
    getFriends();
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

  useEffect(()=> {
    getFriends()
  }, [following, followers])

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        signIn, 
        signUp, 
        signOut, 
        likes, 
        getLikes,
        getFollowing,
        getFollowers,
        following,
        followers,
        getFriends,
        friends
       }}
    >
      {children}
    </AuthContext.Provider>
  );
};