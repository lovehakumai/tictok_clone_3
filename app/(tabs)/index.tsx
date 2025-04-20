import { View, Dimensions, Share, Text } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { PostgrestError } from '@supabase/supabase-js';
import { FlatList } from 'react-native';
import VideoPlayer from '@/components/video';
import { useAuth } from '@/providers/AuthProvider';
import { VideoRow } from '@/types';
import Header from '@/components/header';
import Ionicons from '@expo/vector-icons/Ionicons';


export default function HomeScreen() {
  const [videos, setVideos] = useState<VideoRow[]>([]);
  const {user} = useAuth();
  const [activeIndex, setActiveIndex] = useState<string | null>(null);

  useEffect(()=>{
    getVideos();
  },[])

  const getVideos = async () => {
    try {
      const {data, error}:{ data: VideoRow[] | null; error: PostgrestError | null; } = await supabase
      .from('Video')
      .select('*, User(*)')
      .order('created_at', { ascending: false })

      if(data){
        getSignUrls(data);
      }
      if(error){
        console.error("getVideo / error", error);
      }
    } catch (error) {
      console.error("getVideos / error", error);
    }
  }

  const getSignUrls = async (videos: VideoRow[]): Promise<void> => {
    try {
      const { data, error } = await supabase
      .storage
      .from('videos')
      .createSignedUrls(
        videos.map((video) => video.uri),
        60 * 60 * 24 * 7 // 7 days  
      );

      const videoUrls = videos.map((video) => {
        video.signedUrl = data?.find((signedUrl) => signedUrl.path === video.uri)?.signedUrl;
        return video;
      });

      setVideos(videoUrls);
    
    if (error) {
      console.error("getSignUrls / error", error);
      return;
    }
    } catch (error) {
      error instanceof Error && console.error("getSignUrls / error", error);
    }
  }

  return (
    <View className='flex-1 items-center justify-center bg-white'>
      <View className='absolute top-16 left-0 right-0 z-10'>
        <Header title='For You' color='white'/>
      </View>
      <FlatList 
        data={videos}
        snapToInterval={Dimensions.get('window').height}
        snapToStart={true}
        decelerationRate={"fast"}
        onViewableItemsChanged={e => setActiveIndex(e.viewableItems[0].key)}
        renderItem={({item}) => <VideoPlayer item={item} isViewable={activeIndex === item.id}/>}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
                  <View className='flex-1 h-full items-center justify-center bg-black'>
                    <Ionicons name='sad' size={20} color={"white"}/>
                    <Text className='text-white'>No Videos Found</Text>
                  </View>
                }
      />
    </View>
  );
}