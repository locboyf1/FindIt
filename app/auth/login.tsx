import { AntDesign } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Image, Keyboard, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";


import { auth } from "@/configs/firebase-config";
import { Colors } from "@/constants/theme";
import { signInWithEmailAndPassword } from "firebase/auth";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Login() {
    const router = useRouter();

    const [showLoginForm, setShowLoginForm] = useState(false);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {

        if (!email || !password) {
            Alert.alert('Vui lòng nhập đầy đủ email và mật khẩu');
            return;
        }

        if (!email.includes('@')) {
            Alert.alert('Email không hợp lệ');
            return;
        }

        if (password.length < 8) {
            Alert.alert('Mật khẩu không hợp lệ');
            return;
        }

        setLoading(true);
        try {

            await signInWithEmailAndPassword(auth, email, password);
            router.replace('/(tabs)');

        } catch (error: any) {
            console.log(error.message);

            let msg = error.message;

            if (msg.includes('auth/invalid-email')) msg = 'Email không hợp lệ';
            if (msg.includes('auth/invalid-credential')) msg = 'Sai email hoặc mật khẩu';
            if (msg.includes('auth/user-not-found')) msg = 'Tài khoản không tồn tại';
            if (msg.includes('auth/wrong-password')) msg = 'Sai mật khẩu';

            Alert.alert('Đăng nhập thất bại!', msg);
        } finally {
            setLoading(false);
        }
    };

    const handleSocialLogin = (platform: string) => {
        Alert.alert('Tính năng đang phát triển', `Đăng nhập bằng ${platform} sẽ sớm ra mắt!`);
    };

    const renderLogo = () => {
        return (
            <View style={styles.logoContainer}>
                <Image
                    source={require('../../assets/images/icon.png')}
                    style={styles.logo} />
            </View>
        );
    };

    const renderWelcomeView = () => {
        return (<View style={styles.contentContainer}>
            {renderLogo()}

            <View style={styles.buttonGroup}>
                <TouchableOpacity style={styles.primaryButton} onPress={() => setShowLoginForm(true)}>
                    <Text style={styles.primaryButtonText}>Đăng nhập</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondaryButton} onPress={() => router.replace('/auth/register')}>
                    <Text style={styles.secondaryButtonText}>Đăng ký</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.dividerContainer}>
                <View style={styles.dividerLine}></View>
                <Text style={styles.dividerText}>Hoặc</Text>
                <View style={styles.dividerLine}></View>
            </View>

            <View style={styles.socialGroup}>
                <TouchableOpacity style={styles.socialButton} onPress={() => handleSocialLogin('Google')}>
                    <AntDesign name="google" size={20} color="black" />
                    <Text style={styles.socialButtonText}>Đăng nhập với Google</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialButton} onPress={() => handleSocialLogin('Github')}>
                    <AntDesign name="github" size={20} color="black" />
                    <Text style={styles.socialButtonText}>Đăng nhập với Github</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialButton} onPress={() => handleSocialLogin('Apple')}>
                    <AntDesign name="apple" size={20} color="black" />
                    <Text style={styles.socialButtonText}>Đăng nhập với Apple</Text>
                </TouchableOpacity>
            </View>
        </View>)
    };

    const renderLoginForm = () => {
        return (
            <View style={styles.contentContainer}>
                <TouchableOpacity onPress={() => setShowLoginForm(false)} style={styles.backButton}>
                    <AntDesign name="left" size={20} color={Colors.light.text} />
                </TouchableOpacity>
                {renderLogo()}

                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput style={styles.input}
                            placeholder="john.doe@example.com"
                            placeholderTextColor="#999"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Mật khẩu</Text>
                        <TextInput style={styles.input}
                            placeholder="********"
                            placeholderTextColor="#999"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    <TouchableOpacity onPress={handleLogin} style={styles.primaryButton}
                        disabled={loading}
                    >
                        <Text style={styles.primaryButtonText}>Đăng nhập</Text>
                    </TouchableOpacity>
                </View>

            </View>)
    };

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}>
                <TouchableWithoutFeedback
                    onPress={Keyboard.dismiss}>
                    <View style={styles.innerContainer}>
                        {showLoginForm ? renderLoginForm() : renderWelcomeView()}
                    </View>

                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    innerContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 10,
    },
    contentContainer: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1
    },
    logoContainer: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40,
    },
    logo: {
        width: 80,
        height: 80,
        resizeMode: 'contain',
        borderRadius: 20
    },
    buttonGroup: {
        width: '80%',
        gap: 30
    },
    primaryButton: {
        height: 50,
        width: '100%',
        backgroundColor: Colors.light.tint,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: '#999',
        borderWidth: 1
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500'
    },
    secondaryButton: {
        height: 50,
        backgroundColor: '#caf4ffff',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        outlineColor: Colors.light.tint,
        outlineWidth: 1
    },
    secondaryButtonText: {
        color: Colors.light.tint,
        fontSize: 16,
        fontWeight: '500'
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 50,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        maxWidth: '20%',
        backgroundColor: '#888',
    },
    dividerText: {
        marginHorizontal: 10,
        color: '#888',
    },
    socialGroup: {
        width: '80%',
        gap: 20
    },
    socialButton: {
        flexDirection: 'row',
        height: 50,
        width: '100%',
        backgroundColor: '#F9FAFB',
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#E0E0E0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    socialButtonText: {
        marginLeft: 10,
        fontWeight: '600',
        color: '#333',
    },
    backButton: {
        position: 'absolute',
        top: 0,
        left: 20
    },
    form: {
        width: '80%',
        gap: 40
    },
    inputGroup: {
        width: '100%',
    },
    label: {
        fontWeight: '600',
        marginBottom: 8,
        marginTop: 15,
        color: '#333',
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 10,
        paddingHorizontal: 15,
        fontSize: 16,
        width: '100%'
    }
});
