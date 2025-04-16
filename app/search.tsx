import Header from "@/components/header";
import { supabase } from "@/utils/supabase";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { Image, SafeAreaView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { FlatList } from "react-native";

export default function SearchScreen() {
    const [text, setText] = useState<string>("");
    const [results, setResults] = useState<any[]>([]);
    const search = async () => {
        console.log(text);
        const { data, error } = await supabase
            .from('User')
            .select('*')
            .eq('username', text);
        if (error) {
            console.error(error);
            return;
        }
        setResults(data);
    }

    return (
        <SafeAreaView className="flex-1">
            <Header title="Search" color="black" goBack />
            <View className="flex-row gap-2 mt-5 mx-2">
                <TextInput
                    placeholder="Add a comment"
                    onChangeText={(i) => setText(i)}
                    value={text}
                    className="bg-white p-4 rounded-3xl border border-gray-300 flex-1"
                />
                <TouchableOpacity onPress={search}>
                    <Ionicons name="arrow-forward-circle" size={50} color={"red"} />
                </TouchableOpacity>
            </View>
            <FlatList
                data={results}
                renderItem={({ item }) => (
                    <View className="flex-row gap-2 items-center w-full m-3">
                        <Image
                            source={{ uri: 'https://placehold.co/40x40' }}
                            className="w-10 h-10 rounded-full bg-black"
                        />
                        <View>
                            <Text className="font-bold text-base">{item.username}</Text>
                        </View>
                    </View>
                )}
            />
        </SafeAreaView>
    )
}