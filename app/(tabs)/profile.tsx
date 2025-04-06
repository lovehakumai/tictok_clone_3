import { View, Text, TouchableOpacity } from 'react-native';
import { useAuth } from '@/providers/AuthProvider';

export default function profile() {
  const  { user, signOut } = useAuth();
  return (
    <View className='flex-1 items-center justify-center bg-white'>
      <Text className='font-bold text-3xl'>{user?.username}</Text>
      <TouchableOpacity className='bg-black px-4 py-2 rounded-lg' onPress={() => signOut()}>
        <Text className='font-semibold text-white text-lg text-center'>Sign out</Text>
      </TouchableOpacity>
    </View>
  );
}