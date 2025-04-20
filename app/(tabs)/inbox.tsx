import { useAuth } from '@/providers/AuthProvider';
import { UserType } from '@/types';
import { supabase } from '@/utils/supabase';
import Ionicons from '@expo/vector-icons/Ionicons';
import { PostgrestError } from '@supabase/supabase-js';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, FlatList, Image } from 'react-native';

export default function inbox() {
  const router = useRouter();
  const { user:authUser, friends } = useAuth();
  const [users, setUsers] = useState<UserType[] | null>([]);

  useEffect(() => {
    getUsers();
  },[])

  const getUsers = async () => {
    console.log("inbox / friends: ", friends);
    
    const { data, error }: { data: UserType[] | null, error: PostgrestError | null } = await supabase
      .from('User')
      .select('*')
      .in('id', friends);
    if (error) {
      console.log("getUsers / Error :", error);
      return
    }
    setUsers(data);
  }

  return (
    <SafeAreaView className='flex-1 items-center'>
      <Text className='text-black font-bold text-3xl'>Inbox</Text>
      <TouchableOpacity className='flex-row gap-2 items-center w-full m-1'
        onPress={() => router.push('/followers')}
      >
        <View className='flex-row justify-between w-full items-center pr-3'>
          <View className='flex-row gap-2'>
            <View className='w-12 h-12 rounded-full bg-blue-400 items-center justify-center'>
              <Ionicons name="people" size={24} color={"white"} />
            </View>
            <View>
              <Text className='font-bold text-base'>New followers</Text>
              <Text>Say hi</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={"black"} />
        </View>
      </TouchableOpacity>
      <TouchableOpacity className='flex-row gap-2 items-center w-full m-1'
        onPress={() => router.push('/activity')}
      >
        <View className='flex-row justify-between w-full items-center pr-3'>
          <View className='flex-row gap-2'>
            <View className='w-12 h-12 rounded-full bg-red-400 items-center justify-center'>
              <Ionicons name="time" size={24} color={"white"} />
            </View>
            <View>
              <Text className='font-bold text-base'>Activity</Text>
              <Text>Check comments on your contents</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={"black"} />
        </View>
      </TouchableOpacity>

      <FlatList
        data={users}
        className='mt-1'
        renderItem={({ item }) => (
          <TouchableOpacity
            className='flex-row gap-2 items-center w-full m-0'
            onPress={() => router.push(`/chat?chat_user_id=${item.id}&chat_user_name=${item.username}`)}
          >
            <View className='flex-row justify-between w-full items-center pr-3'>
              <View className='flex-row gap-2'>
                <Image
                  source={{ uri: `${process.env.EXPO_PUBLIC_BUCKET}/avatars/${authUser?.id}/avatar.jpg`||'https://placehold.co/40x40' }}
                  className="w-12 h-12 rounded-full bg-black items-center justify-center"
                />
                <View>
                  <Text className='font-bold text-base'>{item.username}</Text>
                  <Text >Say hi</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={"black"} />
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}