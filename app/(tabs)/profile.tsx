import { View, Text, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { useAuth } from '@/providers/AuthProvider';
import Profile from '@/components/profile';

export default function profile() {
  const { user: authUser, signOut, followers, following, likes } = useAuth();

  return (
    <Profile 
      user={authUser}
      followers={followers}
      following={following}
      likes={likes}
    />
  );
}