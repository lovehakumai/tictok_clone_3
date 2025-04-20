import Header from "@/components/header";
import { useAuth } from "@/providers/AuthProvider";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { FlatList, Image, SafeAreaView, Text, TouchableOpacity, View } from "react-native";

export default function Followers() {
    const router = useRouter();
    const { followers } = useAuth();
    return (
        <SafeAreaView className='flex-1 items-center'>
            <Header color={"black"} title="Followers" goBack />
            <FlatList
                data={followers}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        className='flex-row gap-2 items-center w-full m-1'
                        onPress={() => router.push(`/user?user_id=${item.User.id}`)}
                    >
                        <View className='flex-row items-center justify-between w-full pr-5'>
                            <View className='flex-row gap-2'>
                                <Image 
                                    source = {{ uri: 'https://placehold.co/40x40' }}
                                    className="w-12 h-12 rounded-full bg-black" 
                                />
                                <View>
                                    <Text className='font-bold text-xl'>{item.User.username}</Text>
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