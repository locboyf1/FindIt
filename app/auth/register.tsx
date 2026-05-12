import { AntDesign } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Keyboard, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";


import { auth } from "@/configs/firebase-config";
import { Colors } from "@/constants/theme";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Register() {
    const router = useRouter();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {

        if (!name || !email || !password || !confirmPassword) {
            Alert.alert('Vui lòng nhập đầy đủ tên, email, mật khẩu và xác nhận mật khẩu');
            return;
        }

        if (password.length < 8) {
            Alert.alert('Mật khẩu phải có ít nhất 8 ký tự');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Mật khẩu không khớp');
            return;
        }

        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await updateProfile(user, {
                displayName: name,
            });
            Alert.alert('Đăng ký thành công!');
            router.replace('/(tabs)');
        } catch (error: any) {

            console.log(error.message);

            let msg = error.message;

            if (msg.includes('auth/invalid-email')) msg = 'Email không hợp lệ';
            if (msg.includes('auth/email-already-in-use')) msg = 'Email đã tồn tại';
            if (msg.includes('auth/weak-password')) msg = 'Mật khẩu không hợp lệ';

            Alert.alert('Đăng ký không thành công!', msg);
        } finally {
            setLoading(false);
        }

    };

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen
                options={{
                    headerShown: false,
                }} />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}>
                <TouchableWithoutFeedback
                    onPress={Keyboard.dismiss}>
                    <View style={styles.innerContainer}>
                        <View style={styles.contentContainer}>
                            <TouchableOpacity onPress={() => router.replace('/auth/login')} style={styles.backButton}>
                                <AntDesign name="left" size={20} color={Colors.light.text} />
                            </TouchableOpacity>

                            <View style={styles.form}>
                                <View>
                                    <Text style={styles.title}>Đăng ký tài khoản</Text>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Tên</Text>
                                    <TextInput style={styles.input}
                                        placeholder="John Doe"
                                        placeholderTextColor="#999"
                                        value={name}
                                        onChangeText={setName}
                                        autoCapitalize="none"
                                    />
                                </View>

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

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Xác nhận mật khẩu</Text>
                                    <TextInput style={styles.input}
                                        placeholder="********"
                                        placeholderTextColor="#999"
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
                                        secureTextEntry
                                    />
                                </View>

                                <TouchableOpacity onPress={handleRegister} style={styles.primaryButton}
                                    disabled={loading}
                                >
                                    <Text style={styles.primaryButtonText}>Đăng ký</Text>
                                </TouchableOpacity>
                            </View>

                        </View>
                    </View>

                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView >
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
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    }
});
