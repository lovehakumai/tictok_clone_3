import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/utils/supabase";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Image, KeyboardAvoidingView, Platform, SafeAreaView, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function Comment() {
    const { user } = useAuth();
    const params = useLocalSearchParams();
    const [comments, setComments] = useState<any[]>([]);
    const [message, setMessage] = useState<string>("");
    const [text, setText] = useState<string>("");

    useEffect(() => {
        console.log("useEffect");
        getComments();
    }, []);

    console.log( "user", user);
    console.log( "params", params);

    const getComments = async () => {
        try {
            console.log("getComments");
            
            const {data, error} = await supabase
                .from('Comment')
                .select('*, User(*)')
                .eq('video_id', params.video_id)
            if(error) {
                console.error("getVIdeos / error", error);
                return;
            }
            setComments(data);
            console.log("getComments / data", data);
            
        }catch (error) {
            console.error("getVIdeos / error", error);
        }   
    }

    const addComments = async () => {
        try {
            const {error} = await supabase
                .from('Comment')
                .insert({           
                    user_id: user?.id,
                    video_id: params.video_id,
                    text: text,
                });
            if(error) {
                console.error("addComments / error", error.message);
                return;
            }
            setText("");
            getComments();
        }catch (error) {
            console.error("error", error);
        }
    }
    
    return (
        <KeyboardAvoidingView
            className="flex-1"
            behavior="padding"
        >
            <SafeAreaView className="flex-1 bg-white">
                <FlatList
                    data={comments}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                        <View className="flex-row gap-2 items-center p-4 border-b border-gray-200">
                            <Image 
                                source={{ uri: 'https://placehold.co/40x40' }}
                                className="w-10 h-10 rounded-full bg-black"
                            />
                            <View>
                                <Text className="text-gray-500 font-bold">{item.User.username}</Text>
                                <Text>{item.text}</Text>
                                
                            </View>
                        </View>
                    )}
                />
                <View className="flex-row gap-2 items-center justify-between mx-2 mb-4">
                    <TextInput
                        placeholder="Add a comment"
                        onChangeText={(i) => setText(i)}
                        value={text}
                        className="bg-white p-4 rounded-3xl border border-gray-300 flex-1"
                    />
                    <TouchableOpacity onPress={addComments}>
                        <Ionicons name="arrow-forward-circle" size={50} color="red"/>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
}