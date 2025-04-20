import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export default function Header({ title, color, goBack = false }: { title?: string, color: string, goBack?: boolean }) {
    const router = useRouter();
    return (
        <View className="flex-row w-full items-center justify-between px-4 py-2">
            <View className="w-10">
                {goBack && (
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="chevron-back" size={30} color={color} />
                    </TouchableOpacity>
                )}
            </View>
            <Text className={`text-${color} font-bold text-3xl`}>{title}</Text>
            <View className="w-10">
                <TouchableOpacity onPress={() => router.push('/search')}>
                    <Ionicons name="search" size={28} color={color} />
                </TouchableOpacity>
            </View>
        </View>
    );

}