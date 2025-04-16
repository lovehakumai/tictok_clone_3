import { Dimensions, Share, Text, TouchableOpacity, View } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { ResizeMode, Video } from 'expo-av';
import { VideoRow } from '@/types';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/providers/AuthProvider';

export default function VideoPlayer({item, isViewable}: { item: VideoRow, isViewable: boolean }) {
  const { user, likes, getLikes } = useAuth();
  const videoRef = useRef<Video>(null); 
  const router = useRouter();
  console.log("likes", likes);
  

  useEffect(() => {
    if (isViewable) {
      videoRef.current?.playAsync();
    } else {
      videoRef.current?.pauseAsync();
    }
  }, [isViewable]);

  const shareVideo = async () => {
    try {
      await Share.share({message: `Check out this video: ${item.title}`});
    }catch (error) {
      console.error("shareVideo / error", error);
    }
  };

  const likeVideo = async () => {
    try {
      const { data, error } = await supabase
        .from('Like')
        .insert({ 
          user_id: user?.id, 
          video_id: item.id,
          video_user_id: item.User.id,
        });

      if(!error) getLikes(user?.id);
      console.log("likeVideo / success");
    } catch (error) {
      console.error("likeVideo / error", error);
    }
  }

  const unlikeVideo = async () => {
    try {
      const { data, error } = await supabase
        .from('Like')
        .delete()
        .eq('user_id', user?.id)
        .eq('video_id', item.id);

      if(!error) getLikes(user?.id);
      console.log("unlikeVideo / success");
    } catch (error) {
      console.error("unlikeVideo / error", error);
    }
  }

  return (
    <View>
      <Video
        ref={videoRef}
        source={{ uri: item.signedUrl as string }}
        style={{ 
            flex: 1, 
            width: Dimensions.get('window').width,
            height: Dimensions.get('window').height,
        }}
        resizeMode={ResizeMode.COVER}
        isLooping
      />
      <View className='absolute bottom-28 left-0 right-0'>
        <View className='flex-1 flex-row items-end justify-between'>
          <View>
            <Text className='text-white text-2xl font-bold mt-18'>{item.User.username}</Text>
            <Text className='text-white text-xl font-bold mt-18'>{item.title}</Text>
          </View>
          <View className='right-6'>
            <TouchableOpacity className='my-6' onPress={() => router.push(`/user?user_id=${item.User.username}`)}>
              <Ionicons name='person' size={40} color="white" />
            </TouchableOpacity>
              {likes.filter((like: any)=> like.video_id === item.id).length > 0 ? 
              (
                <TouchableOpacity onPress={unlikeVideo}>
                  <Ionicons name='heart' size={40} color="white" />
                </TouchableOpacity>
              ):(
                <TouchableOpacity onPress={likeVideo}>
                  <Ionicons name='heart-outline' size={40} color="white" />
                </TouchableOpacity>
              )}
            <TouchableOpacity className='my-6' onPress={() => router.push(`/comment?video_id=${item.id}`)}>
              <Ionicons name='chatbubble-ellipses' size={40} color="white" />
            </TouchableOpacity>
            <TouchableOpacity className='my-6' onPress={shareVideo}>
              <FontAwesome name='share' size={40} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}