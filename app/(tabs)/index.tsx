import { View, Text } from 'react-native';
import "../../global.css";

export default function HomeScreen() {
  return (
    <View className='flex-1 items-center justify-center bg-white'>
      <Text className='font-bold text-3xl'>Home</Text>
    </View>
  );
}