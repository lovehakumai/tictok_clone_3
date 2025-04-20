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
    const [message, setMessage] = useState<any[]>([]);
    const users_key = [user?.id, params.chat_user_id].sort().join(":");

    useEffect(()=>{
        getMessage();
    },[])

    useEffect(() => {
        const channel = supabase.channel(users_key).on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'Chat',
            filter: 'users_key=eq.${users_key}'
        }, (payload)=>{
            setMessage(message => [...message, payload.new])
        }).subscribe()
        return () => {
            supabase.removeChannel(channel)
        }
    }, [users_key]);

    const getMessage = async () => {
        try {
            const {data, error} = await supabase
                .from('Chat')
                .select('*, User(*)')
                .eq('users_key', users_key)
            if(error) {
                console.error("getMessage / error", error);
                return;
            }
            setMessage(data);
            
        }catch (error) {
            console.error("getMessage / error", error);
        }   
    }

    const addMessage = async (text: string) => {
        try {
            const {error} = await supabase
                .from('Chat')
                .insert({           
                    user_id: user?.id,
                    chat_user_id: params.chat_user_id,
                    text,
                    users_key
                });
            if(error) {
                console.error("addMessage / error", error.message);
                return;
            }
            getMessage();
        }catch (error) {
            console.error("error", error);
        }
    }
    
    return (
        <Message messages={message} addMessage={addMessage} title={params.chat_user_name as string}/>
    );
}