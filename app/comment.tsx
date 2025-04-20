import Header from "@/components/header";
import Message from "@/components/messages";
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

    useEffect(() => {
        getComments();
    }, []);

    const getComments = async () => {
        try {
            const {data, error} = await supabase
                .from('Comment')
                .select('*, User(*)')
                .eq('video_id', params.video_id)
            if(error) {
                console.error("getVIdeos / error", error);
                return;
            }
            setComments(data);
            
        }catch (error) {
            console.error("getVIdeos / error", error);
        }   
    }

    const addComments = async (text: string) => {
        try {
            const {error} = await supabase
                .from('Comment')
                .insert({           
                    user_id: user?.id,
                    video_id: params.video_id,
                    video_user_id: params.user_id,
                    text: text,
                });
            if(error) {
                console.error("addComments / error", error.message);
                return;
            }
            getComments();
        }catch (error) {
            console.error("error", error);
        }
    }
    
    return (
        <Message messages={comments} addMessage={addComments} title="Comment"/>
    );
}