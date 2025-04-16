import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { useAuth } from '@/providers/AuthProvider';
import { useLocalSearchParams } from 'expo-router';
import Header from '@/components/header';

export default function postUser() {
  const params = useLocalSearchParams();
  console.log("postUser / params", params);
  
  return (
    <SafeAreaView>
      <Header title="Username" color="black" goBack/>
      <Text className='text-black font-bold text-xl text-center'>Profile Here</Text>
    </SafeAreaView>
  );
}