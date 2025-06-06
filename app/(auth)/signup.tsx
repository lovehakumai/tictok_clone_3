
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import "../../global.css";
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/providers/AuthProvider';

export default function () {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userName, setUserName] = useState("");
  const { signUp } = useAuth();

  return (
    <View className='flex-1 items-center justify-center bg-white'>
      <View className='w-full p-4'>
        <Text className='text-black font-bold text-3xl text-center mb-4'>Signup</Text>
        <TextInput 
            placeholder='Username'
            value={userName}
            onChangeText={setUserName}
            className='bg-white p-4 rounded-lg border border-gray-300 w-full mb-4'
        />
        <TextInput 
            placeholder='Email'
            value={email}
            onChangeText={setEmail}
            className='bg-white p-4 rounded-lg border border-gray-300 w-full mb-4'
        />
        <TextInput 
            secureTextEntry={true}
            placeholder='Password'
            value={password}
            onChangeText={setPassword}
            className='bg-white p-4 rounded-lg border border-gray-300 w-full mb-4'
        />
        <TouchableOpacity 
          className='bg-black px-4 py-2 rounded-lg'
          onPress={()=>signUp(userName, email, password)}
        >
          <Text className='text-white font-bold text-lg text-center'>Signup</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={()=>router.push("/")}
        >
          <Text className='text-black font-semibold text-lg text-center mt-3'>Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}