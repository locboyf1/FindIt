import LoadingOverlay from "@/components/loading-layout";
import { auth, storage } from "@/configs/firebase-config";
import { Colors } from "@/constants/theme";
import { DEFAULT_AVATAR } from "@/constants/user";
import { updateUserInPost } from "@/services/post-service";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import { router } from "expo-router";
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword, updateProfile } from "firebase/auth";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function edit_profile() {

    const user = auth.currentUser;
    const [isLoading, setIsLoading] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [avatar, setAvatar] = useState<string | null>(null);

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        setIsLoading(true);
        if (user) {
            setName(user.displayName || '');
            setEmail(user.email || '');
            setAvatar(user.photoURL || null);
        }
        setIsLoading(false);
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

        setIsLoading(true);
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
            setIsLoading(false);
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

        setIsLoading(true);
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
            setIsLoading(false);
        }
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}>

                <View className="flex-row justify-between items-center px-5 py-[15px] border-b border-[#eee] bg-white">
                    <TouchableOpacity onPress={() => router.back()} className="w-[60px] items-center">
                        <Ionicons name="arrow-back" size={26} color="#333" />
                    </TouchableOpacity>
                    <Text className="text-[18px] font-bold text-[#333]">Cài đặt tài khoản</Text>
                    <TouchableOpacity onPress={handleSave} disabled={isLoading} className="w-[60px] items-center">
                        {isLoading ? (
                            <ActivityIndicator size="small" color={Colors.light.tint} />
                        ) : (
                            <Text className="text-base font-bold text-[#007AFF]">Lưu</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>

                    <View className="p-5 bg-white">
                        <View className="items-center mb-[30px]">
                            <TouchableOpacity onPress={pickImage} className="w-[120px] h-[120px] rounded-full bg-[#f0f0f0] justify-center items-center relative shadow-lg elevation-5 border-[3px] border-white">
                                <Image source={avatar ? { uri: avatar } : DEFAULT_AVATAR} className="w-full h-full rounded-full" />
                                <View className="absolute bottom-0 right-0 bg-[#007AFF] w-9 h-9 rounded-full justify-center items-center border-[3px] border-white">
                                    <Ionicons name="camera" size={16} color="#fff" />
                                </View>
                            </TouchableOpacity>
                            <Text className="mt-[15px] text-sm text-[#888]">Chạm để đổi ảnh đại diện</Text>
                        </View>

                        <View className="w-full mb-4">
                            <Text className="text-sm font-semibold text-[#555] mb-2 ml-1">Tên hiển thị</Text>
                            <TextInput
                                className="bg-[#f9f9f9] p-[15px] rounded-[12px] border border-[#eee] text-base text-[#333]"
                                placeholder="Nhập tên của bạn"
                                value={name}
                                onChangeText={setName}
                            />
                        </View>

                        <View className="w-full mb-4">
                            <Text className="text-sm font-semibold text-[#555] mb-2 ml-1">Email</Text>
                            <TextInput
                                className="bg-[#f0f0f0] p-[15px] rounded-[12px] border border-[#eee] text-base text-[#999]"
                                value={email}
                                editable={false}
                            />
                        </View>
                    </View>

                    <View className="h-px bg-[#eee] my-5" />

                    <View className="p-5 bg-white">
                        <View className="flex-row items-center mb-5 gap-2">
                            <Text className="text-[18px] font-bold text-[#333]">Đổi mật khẩu</Text>
                        </View>

                        <View className="w-full mb-4">
                            <Text className="text-sm font-semibold text-[#555] mb-2 ml-1">Mật khẩu hiện tại</Text>
                            <TextInput
                                className="bg-[#f9f9f9] p-[15px] rounded-[12px] border border-[#eee] text-base text-[#333]"
                                placeholder="Nhập mật khẩu cũ..."
                                value={currentPassword}
                                onChangeText={setCurrentPassword}
                                secureTextEntry
                            />
                        </View>

                        <View className="w-full mb-4">
                            <Text className="text-sm font-semibold text-[#555] mb-2 ml-1">Mật khẩu mới</Text>
                            <TextInput
                                className="bg-[#f9f9f9] p-[15px] rounded-[12px] border border-[#eee] text-base text-[#333]"
                                placeholder="Tối thiểu 8 ký tự..."
                                value={newPassword}
                                onChangeText={setNewPassword}
                                secureTextEntry
                            />
                        </View>

                        <View className="w-full mb-4">
                            <Text className="text-sm font-semibold text-[#555] mb-2 ml-1">Xác nhận mật khẩu mới</Text>
                            <TextInput
                                className="bg-[#f9f9f9] p-[15px] rounded-[12px] border border-[#eee] text-base text-[#333]"
                                placeholder="Nhập lại mật khẩu mới..."
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry
                            />
                        </View>

                        <TouchableOpacity
                            className="bg-[#007AFF] py-[15px] rounded-[12px] items-center mt-2.5 shadow-md elevation-4"
                            onPress={handleChangePassword}
                            disabled={isLoading}
                        >
                            <Text className="text-white text-base font-bold">Cập nhật mật khẩu</Text>
                        </TouchableOpacity>
                    </View>

                    <View className="h-10" />

                </ScrollView>
            </KeyboardAvoidingView>
            <LoadingOverlay isLoading={isLoading} />
        </SafeAreaView>
    );
}

