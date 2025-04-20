import Header from "@/components/header";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/utils/supabase";
import Ionicons from "@expo/vector-icons/Ionicons";
import { PostgrestError } from "@supabase/supabase-js";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Image, SafeAreaView, Text, TouchableOpacity, View } from "react-native";

export default function Activity() {
    const router = useRouter();
    const { user } = useAuth();
    const params = useLocalSearchParams();
    const [activity, setActivity] = useState<any>([]);

    useEffect(() => {
        getComments();
    }, []);

    const getComments = async () => {
        try {
            const { data, error }: { data: any[] | null; error: PostgrestError | null } = await supabase
                .from('Comment')
                .select('*, User(*)')
                .eq('video_user_id', user?.id)
                .order('created_at', { ascending: false })
            if (!!data && !error) getLikes(data);
        } catch (error) {
            console.error("getComments / error", error);
        }
    };

    const getLikes = async (comments: any) => {
        try {
            const { data, error }: { data: any[] | null; error: PostgrestError | null } = await supabase
                .from('Like')
                .select('*, User(*)')
                .eq('video_user_id', user?.id)
                .order('created_at', { ascending: false })
                .limit(10);

            if (error) console.error("getLikes / error", error);
            if (!!data) setActivity(comments.concat(data));

        } catch (error) {
            console.error("getLikes / error", error);
        }
    };
    return (
        <SafeAreaView className='flex-1 items-center'>
            <Header color={"black"} title="Activities" goBack />
            <FlatList
                data={activity}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        className='flex-row gap-2 items-center w-full m-1'
                        onPress={() => router.push(`/user?user_id=${item.User.id}`)}
                    >
                        <View className='flex-row items-center justify-between w-full pr-5'>
                            <View className='flex-row gap-2'>
                                <Image
                                    source={{ uri: 'https://placehold.co/40x40' }}
                                    className="w-12 h-12 rounded-full bg-black"
                                />
                                <View>
                                    <Text className='font-bold text-xl'>{item.User.username}</Text>
                                    <Text>{item.text || 'Liked Your Video'}</Text>
                                    <Text className="text-gray-500 text-xs">{item.created_at}</Text>
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