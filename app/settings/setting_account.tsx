import { DEFAULT_AVATAR } from "@/configs/account-config";
import { auth, storage } from "@/configs/firebase-config";
import { Colors } from "@/constants/theme";
import { updateUserInPost } from "@/services/post-service";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import { router } from "expo-router";
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword, updateProfile } from "firebase/auth";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function edit_profile() {

    const user = auth.currentUser;
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [avatar, setAvatar] = useState<string | null>(null);

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loadingPassword, setLoadingPassword] = useState(false);

    useEffect(() => {
        if (user) {
            setName(user.displayName || '');
            setEmail(user.email || '');
            setAvatar(user.photoURL || null);
            setLoading(false);
        }
    }, [user]);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5
        })

        if (!result.canceled) {
            setAvatar(result.assets[0].uri);
        }
    }

    const uploadImage = async (image: string) => {
        try {
            const response = await fetch(image);
            const blob = await response.blob();

            const filename = 'avatars/' + Date.now() + '-' + Math.random().toString(36).substring(7) + '.jpg';
            const storageRef = ref(storage, filename);

            await uploadBytes(storageRef, blob);

            const downloadUrl = await getDownloadURL(storageRef);
            return downloadUrl;
        } catch (error) {
            console.log("Có lỗi khi upload ảnh: ", error);
            throw error;
        }
    }

    const handleSave = async () => {
        if (!user) {
            Alert.alert('Lỗi', 'Bạn chưa đăng nhập');
            return;
        }

        if (!name.trim()) {
            Alert.alert('Lỗi', 'Tên hiển thị không được để trống.');
            return;
        }

        setLoading(true);
        try {
            const oldPhotoUrl = user.photoURL;
            let finalPhotoUrl = oldPhotoUrl;
            let hasNewImage = false;
            if (avatar && !avatar.startsWith('http')) {
                finalPhotoUrl = await uploadImage(avatar);
                hasNewImage = true;
            }
            await updateProfile(user, {
                displayName: name,
                photoURL: finalPhotoUrl
            })

            updateUserInPost(user.uid, name, finalPhotoUrl || '');

            if (hasNewImage && oldPhotoUrl && oldPhotoUrl.includes('firebasestorage.googleapis.com')) {
                try {
                    const oldImageRef = ref(storage, oldPhotoUrl);
                    await deleteObject(oldImageRef);
                } catch (delError) {
                    console.log("Lỗi khi xóa tệp ảnh đại diện: ", delError);
                }
            }

            Alert.alert('Thành công', 'Cập nhật thông tin thành công');
            router.back();
        } catch (error) {
            console.log("Có lỗi khi cập nhật thông tin: ", error);
            Alert.alert('Lỗi', 'Có lỗi khi cập nhật thông tin.');
        } finally {
            setLoading(false);
        }
    }

    const handleChangePassword = async () => {
        if (!user) {
            Alert.alert('Lỗi', 'Bạn chưa đăng nhập');
            return;
        }

        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ mật khẩu hiện tại, mật khẩu mới và xác nhận mật khẩu mới');
            return;
        }

        if (newPassword.length < 8) {
            Alert.alert('Lỗi', 'Mật khẩu mới phải có ít nhất 8 ký tự');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Lỗi', 'Mật khẩu mới và xác nhận mật khẩu mới không khớp');
            return;
        }

        setLoadingPassword(true);
        try {
            const credential = EmailAuthProvider.credential(user.email || '', currentPassword);
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, newPassword);
            Alert.alert('Thành công', 'Đổi mật khẩu thành công');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            console.log("Có lỗi khi đổi mật khẩu: ", error);

            Alert.alert('Lỗi', 'Sai mật khẩu');
            setCurrentPassword('');
        } finally {
            setLoadingPassword(false);
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}>

                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
                        <Ionicons name="arrow-back" size={26} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Cài đặt tài khoản</Text>
                    <TouchableOpacity onPress={handleSave} disabled={loading} style={styles.headerButton}>
                        {loading ? (
                            <ActivityIndicator size="small" color={Colors.light.tint} />
                        ) : (
                            <Text style={styles.saveButton}>Lưu</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>

                    <View style={styles.section}>
                        <View style={styles.avatarSection}>
                            <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
                                <Image source={avatar ? { uri: avatar } : DEFAULT_AVATAR} style={styles.avatar} />
                                <View style={styles.cameraIconContainer}>
                                    <Ionicons name="camera" size={16} color="#fff" />
                                </View>
                            </TouchableOpacity>
                            <Text style={styles.avatarHint}>Chạm để đổi ảnh đại diện</Text>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Tên hiển thị</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Nhập tên của bạn"
                                value={name}
                                onChangeText={setName}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Email</Text>
                            <TextInput
                                style={[styles.input, styles.inputDisabled]}
                                value={email}
                                editable={false}
                            />
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Đổi mật khẩu</Text>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Mật khẩu hiện tại</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Nhập mật khẩu cũ..."
                                value={currentPassword}
                                onChangeText={setCurrentPassword}
                                secureTextEntry
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Mật khẩu mới</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Tối thiểu 6 ký tự..."
                                value={newPassword}
                                onChangeText={setNewPassword}
                                secureTextEntry
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Xác nhận mật khẩu mới</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Nhập lại mật khẩu mới..."
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry
                            />
                        </View>

                        <TouchableOpacity
                            style={styles.passwordButton}
                            onPress={handleChangePassword}
                            disabled={loadingPassword}
                        >
                            {loadingPassword ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.passwordButtonText}>Cập nhật mật khẩu</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    <View style={{ height: 40 }} />

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        backgroundColor: '#fff',
    },
    headerButton: {
        width: 60,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333'
    },
    saveButton: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.light.tint
    },
    section: {
        padding: 20,
        backgroundColor: '#fff',
    },
    divider: {
        height: 1,
        backgroundColor: '#eee',
        marginVertical: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    avatarSection: {
        alignItems: 'center',
        marginBottom: 30,
    },
    avatarContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        borderWidth: 3,
        borderColor: '#fff',
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: 60,
    },
    cameraIconContainer: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: Colors.light.tint,
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#fff',
    },
    avatarHint: {
        marginTop: 15,
        fontSize: 14,
        color: '#888',
    },
    formGroup: {
        width: '100%',
        marginBottom: 16
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#555',
        marginBottom: 8,
        marginLeft: 4,
    },
    input: {
        backgroundColor: '#f9f9f9',
        padding: 15,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#eee',
        fontSize: 16,
        color: '#333',
    },
    inputDisabled: {
        backgroundColor: '#f0f0f0',
        color: '#999',
    },
    passwordButton: {
        backgroundColor: Colors.light.tint,
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
        shadowColor: Colors.light.tint,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 4,
    },
    passwordButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    }
})