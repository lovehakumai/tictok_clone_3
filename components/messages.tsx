import Header from "@/components/header";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/utils/supabase";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Image, KeyboardAvoidingView, Platform, SafeAreaView, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function Message({
    messages,
    addMessage,
    title
}: {
    messages: any[];
    addMessage: (text: string) => Promise<void>
    title: string
}) {
    const { user } = useAuth();
    const [text, setText] = useState<string>("");

    return (
        <KeyboardAvoidingView
            className="flex-1"
            behavior="padding"
        >
            <SafeAreaView className="flex-1 bg-white">
                <Header title={title} color="black" goBack />
                <FlatList
                    data={messages}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                        <View className="flex-row gap-2 items-center p-4">
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
                    <TouchableOpacity
                        onPress={() => {
                            
                            addMessage(text)
                            setText("")
                        }}
                    >
                        <Ionicons name="arrow-forward-circle" size={50} color="red" />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
}