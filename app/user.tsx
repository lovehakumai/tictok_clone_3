import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { useAuth } from '@/providers/AuthProvider';
import { useLocalSearchParams } from 'expo-router';
import Header from '@/components/header';
import Profile from '@/components/profile';
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { FollowingType, LikesType, UserType } from '@/types';
import { PostgrestError } from '@supabase/supabase-js';

export default function postUser() {
  const [user, setUser] = useState<UserType | null>(null);
  const [following, setFollowing] = useState<FollowingType[] | null>([]);
  const [followers, setFollowers] = useState<UserType[] | null>([]);
  const [likes, setLikes] = useState<LikesType[] | null>([]);

  const params = useLocalSearchParams();
  useEffect(() => {
    if (params.user_id) {
      getUserInfo(params.user_id as string);
    }
  }, [params.user_id]);

  const getUserInfo = async (id: string) => {
    try {
      const { data: VideoOwner, error: ViewerError }: { data: UserType | null, error: PostgrestError | null } = await supabase
        .from('User')
        .select('*')
        .eq('id', id)
        .single();
      if (ViewerError) {
        console.error("getUser / error", ViewerError);
        return null;
      }
      setUser(VideoOwner);
      // Following
      const {data: FollowingUser, error: FollowingError}:{data: FollowingType[] | null; error: PostgrestError | null;} = await supabase
        .from('Follower')
        .select('*')
        .eq('follower_user_id', id);
        
      if (FollowingError) {
        console.error("getUser / error", FollowingError);
        return null;
      }
      
      setFollowing(FollowingUser);
      // Followers
      const {data: FollowersUser, error: FollowersError}:{data: any[] | null; error: PostgrestError | null;} = await supabase
        .from('Follower')
        .select('*')
        .eq("user_id", id);
      if (FollowersError) {
        console.error("getUser / error", FollowersError);
        return null;
      }
      setFollowers(FollowersUser);
      // Likes
      const {data: LikesUser, error: LikesError}:{data: LikesType[] | null; error: PostgrestError | null;} = await supabase
        .from('Like')
        .select('*')
        .eq('user_id', id);
      if (LikesError) {
        console.error("getUser / error", LikesError);
        return null;
      }
      setLikes(LikesUser);
    }

    catch (error) {
      console.error("getUser / error", error);
      return null;
    }
  }


  return (
    <SafeAreaView className='flex-1 bg-white'>
      <Header title={user?.username} color="black" goBack/>
      {
        <Profile
          user={user}
          following={following}
          followers={followers}
          likes={likes}
        />
      }
    </SafeAreaView>
  );
}