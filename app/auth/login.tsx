import { AntDesign } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Image, Keyboard, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";


import LoadingOverlay from "@/components/loading-layout";
import { Colors } from "@/constants/theme";
import { loginAccount } from "@/services/user-service";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Login() {
    const router = useRouter();

    const [showLoginForm, setShowLoginForm] = useState(false);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        setIsLoading(true);
        try {
            await loginAccount({
                email: email.trim(),
                password: password.trim()
            });
            setIsLoading(false);
            Alert.alert('Thông báo', 'Đăng nhập thành công!');
            router.replace('/(tabs)');
        } catch (error: any) {
            setIsLoading(false);
            Alert.alert('Lỗi', error.message);
        }
    };

    const handleSocialLogin = (platform: string) => {
        Alert.alert('Tính năng đang phát triển', `Đăng nhập bằng ${platform} sẽ sớm ra mắt!`);
    };

    const renderLogo = () => {
        return (
            <View className="w-full items-center justify-center mb-10">
                <Image
                    source={require('../../assets/images/icon.png')}
                    className="w-20 h-20 rounded-[20px]"
                    resizeMode="contain" />
            </View>
        );
    };

    const renderWelcomeView = () => {
        return (
            <View className="w-full items-center justify-center flex-1">
                {renderLogo()}

                <View className="w-[80%] items-center gap-[30px]">
                    <TouchableOpacity className="h-[50px] w-full bg-[#007AFF] rounded-[10px] items-center justify-center border border-[#999]" onPress={() => setShowLoginForm(true)}>
                        <Text className="text-white text-base font-medium">Đăng nhập</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="h-[50px] w-full bg-[#caf4ffff] rounded-[10px] items-center justify-center" onPress={() => router.replace('/auth/register')}>
                        <Text className="text-[#007AFF] text-base font-medium">Đăng ký</Text>
                    </TouchableOpacity>
                </View>

                <View className="flex-row items-center my-[50px]">
                    <View className="flex-1 h-px max-w-[20%] bg-[#888]"></View>
                    <Text className="mx-2.5 text-[#888]">Hoặc</Text>
                    <View className="flex-1 h-px max-w-[20%] bg-[#888]"></View>
                </View>

                <View className="w-[80%] items-center gap-5">
                    <TouchableOpacity className="flex-row h-[50px] w-full bg-[#F9FAFB] rounded-[10px] border-2 border-[#E0E0E0] items-center justify-center" onPress={() => handleSocialLogin('Google')}>
                        <AntDesign name="google" size={20} color="black" />
                        <Text className="ml-2.5 font-semibold text-[#333]">Đăng nhập với Google</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-row h-[50px] w-full bg-[#F9FAFB] rounded-[10px] border-2 border-[#E0E0E0] items-center justify-center" onPress={() => handleSocialLogin('Github')}>
                        <AntDesign name="github" size={20} color="black" />
                        <Text className="ml-2.5 font-semibold text-[#333]">Đăng nhập với Github</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-row h-[50px] w-full bg-[#F9FAFB] rounded-[10px] border-2 border-[#E0E0E0] items-center justify-center" onPress={() => handleSocialLogin('Apple')}>
                        <AntDesign name="apple" size={20} color="black" />
                        <Text className="ml-2.5 font-semibold text-[#333]">Đăng nhập với Apple</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    };

    const renderLoginForm = () => {
        return (
            <View className="w-full items-center justify-center flex-1">
                <TouchableOpacity onPress={() => setShowLoginForm(false)} className="absolute top-0 left-5">
                    <AntDesign name="left" size={20} color={Colors.light.text} />
                </TouchableOpacity>
                {renderLogo()}

                <View className="w-[80%] items-center gap-10">
                    <View className="w-full">
                        <Text className="font-semibold mb-2 mt-[15px] text-[#333]">Email</Text>
                        <TextInput className="h-[50px] border border-[#E0E0E0] rounded-[10px] px-[15px] text-base w-full"
                            placeholder="john.doe@example.com"
                            placeholderTextColor="#999"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>
                    <View className="w-full">
                        <Text className="font-semibold mb-2 mt-[15px] text-[#333]">Mật khẩu</Text>
                        <TextInput className="h-[50px] border border-[#E0E0E0] rounded-[10px] px-[15px] text-base w-full"
                            placeholder="********"
                            placeholderTextColor="#999"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    <TouchableOpacity onPress={handleLogin} className="h-[50px] w-full bg-[#007AFF] rounded-[10px] items-center justify-center border border-[#999]"
                        disabled={isLoading}
                    >
                        <Text className="text-white text-base font-medium">Đăng nhập</Text>
                    </TouchableOpacity>
                </View>

            </View>)
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <Stack.Screen options={{ headerShown: false }} />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}>
                <TouchableWithoutFeedback
                    onPress={Keyboard.dismiss}>
                    <View className="flex-1 justify-center px-2.5">
                        {showLoginForm ? renderLoginForm() : renderWelcomeView()}
                    </View>

                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
            <LoadingOverlay isLoading={isLoading} />
        </SafeAreaView>
    );
}

