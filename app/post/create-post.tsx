import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    Alert,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import MapView, { Marker } from 'react-native-maps';

import { auth } from "../../configs/firebase-config";
import { createPost } from "../../services/post-service";

import provinceData from "../../assets/data/provinces.json";
import wardData from "../../assets/data/wards.json";

import LoadingOverlay from "@/components/loading-layout";
import * as Location from 'expo-location';
import { isMatchLocation } from "../../services/utilities-service";

type AddessItem = {
    id: number;
    name: string;
}

type Coords = {
    latitude: number;
    longitude: number;
}

export default function CreatePostScreen() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [type, setType] = useState<'lost' | 'found'>('lost');
    const [image, setImage] = useState<string | null>(null);

    const [provinces, setProvinces] = useState<any[]>([]);
    const [wards, setWards] = useState<any[]>([]);

    const [selectedProvince, setSelectedProvince] = useState<AddessItem | null>(null);
    const [selectedWard, setSelectedWard] = useState<AddessItem | null>(null);

    const [showMap, setShowMap] = useState(false);
    const mapRef = useRef<MapView>(null);
    const [coords, setCoords] = useState<Coords | null>(null);

    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState<'province' | 'ward'>('province');


    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.5,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    useEffect(() => {
        setProvinces(provinceData);
        checkLocation();
    }, []);

    const checkLocation = async () => {
        let { status } = await Location.getForegroundPermissionsAsync();
        if (status === 'granted') {
            getLocation();
        }
    };

    const handleSubmit = async () => {
        if (!title || !selectedProvince || !selectedWard || !image || !location) {
            Alert.alert('Thiếu thông tin', 'Vui lòng nhập tiêu đề, địa điểm và chọn ảnh.');
            return;
        }

        if (!auth.currentUser) {
            Alert.alert('Lỗi', 'Bạn cần đăng nhập để thực hiện chức năng này.');
            return;
        }

        setIsLoading(true);
        try {
            await createPost({
                title,
                description,
                location,
                province: selectedProvince,
                ward: selectedWard,
                coords: coords,
                type,
                image: image,
            });

            Alert.alert('Thành công', 'Bài viết đã được đăng!');
            router.back();
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể đăng bài. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    const openAddressModal = (type: 'province' | 'ward') => {
        if (type === 'ward' && !selectedProvince) {
            Alert.alert('Thông báo', 'Vui lòng chọn Tỉnh/Thành phố trước.');
            return;
        }
        setModalType(type);
        setModalVisible(true);
    };

    const handleSelectAddress = (item: any) => {
        if (modalType === 'province') {
            setSelectedProvince({ id: item.code, name: item.name });
            setSelectedWard(null);

            const wardList = wardData.filter((w: any) => w.province_code === item.code);
            setWards(wardList);
        } else {
            setSelectedWard({ id: item.code, name: item.name });
        }
        setModalVisible(false);
    };

    const getLocation = async (showAlert = false) => {

        setIsLoading(true);
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                if (showAlert) {
                    Alert.alert('Lỗi', 'Không có quyền truy cập vị trí');
                }
                return;
            }
            let location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });

            const currentCoords = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            }

            setCoords(currentCoords);

            if (mapRef.current) {
                mapRef.current.animateToRegion({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                });
            }

            let geocode = await Location.reverseGeocodeAsync(currentCoords);

            if (geocode.length > 0) {
                const address = geocode[0];

                const curProvince = address.region || address.city;
                const curWard = address.subregion || address.city;
                if (curProvince) {
                    const matchedProvince = provinceData.find(p => isMatchLocation(p.name, curProvince));
                    if (matchedProvince) {
                        setSelectedProvince({ id: matchedProvince.code, name: matchedProvince.name });
                        setWards(wardData.filter(w => w.province_code === matchedProvince.code));
                        
                        if (curWard) {
                            const matchedWard = wardData.find(w => isMatchLocation(w.name, curWard) && w.province_code === matchedProvince.code);
                            if (matchedWard) {
                                setSelectedWard({ id: matchedWard.code, name: matchedWard.name });
                            }
                        }
                        if (address.street) {
                            setLocation(address.street);
                        }
                    }
                }

            }
        } catch (error) {
            console.error('Lỗi khi lấy vị trí hiện tại: ' + error);
            Alert.alert('Lỗi', 'Không thể lấy vị trí hiện tại. Vui lòng thử lại.');
        }finally{
            setIsLoading(false);
        }
    }

    const openMap = () => {
        setShowMap(true);

        if (!coords) {
            getLocation(false);
        }
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <View className="flex-row justify-between items-center px-5 py-[15px] border-b border-[#eee]">
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="close" size={28} color="#333" />
                    </TouchableOpacity>
                    <Text className="text-[18px] font-bold text-[#333]">Đăng tin mới</Text>
                    <TouchableOpacity onPress={handleSubmit} disabled={isLoading}>
                        <Text className="text-base font-bold text-[#007AFF]">Đăng</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={{ padding: 20 }}>

                    <View className="flex-row mb-5 gap-[15px]">
                        <TouchableOpacity
                            className={`flex-1 py-3 rounded-[10px] bg-[#f5f5f5] items-center border border-transparent ${type === 'lost' ? 'bg-[#ffebee] border-[#FF3B30]' : ''}`}
                            onPress={() => setType('lost')}
                        >
                            <Text className={`font-bold text-[#999] ${type === 'lost' ? 'text-[#333]' : ''}`}>MẤT ĐỒ</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className={`flex-1 py-3 rounded-[10px] bg-[#f5f5f5] items-center border border-transparent ${type === 'found' ? 'bg-[#e3f2fd] border-[#007AFF]' : ''}`}
                            onPress={() => setType('found')}
                        >
                            <Text className={`font-bold text-[#999] ${type === 'found' ? 'text-[#333]' : ''}`}>NHẶT ĐƯỢC</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity className="w-full h-[200px] bg-[#f9f9f9] rounded-[15px] mb-[25px] border border-[#eee] border-dashed overflow-hidden" onPress={pickImage}>
                        {image ? (
                            <Image source={{ uri: image }} className="w-full h-full" resizeMode="cover" />
                        ) : (
                            <View className="flex-1 justify-center items-center">
                                <Ionicons name="camera" size={40} color="#ccc" />
                                <Text className="text-[#999] mt-[5px]">Thêm ảnh</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    <View className="mb-5">
                        <Text className="text-sm font-semibold text-[#333] mb-2">Khu vực</Text>
                        <View className="gap-[10px]">
                            <TouchableOpacity
                                className="flex-row justify-between items-center bg-[#f9f9f9] p-3 rounded-[10px] border border-[#eee]"
                                onPress={() => openAddressModal('province')}
                            >
                                <Text className={`text-sm ${!selectedProvince ? 'text-[#999]' : 'text-[#333]'}`}>
                                    {selectedProvince ? selectedProvince.name : 'Chọn Tỉnh/Thành phố'}
                                </Text>
                                <Ionicons name="chevron-down" size={16} color="#666" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                className="flex-row justify-between items-center bg-[#f9f9f9] p-3 rounded-[10px] border border-[#eee]"
                                onPress={() => openAddressModal('ward')}
                            >
                                <Text className={`text-sm ${!selectedWard ? 'text-[#999]' : 'text-[#333]'}`}>
                                    {selectedWard ? selectedWard.name : 'Chọn Phường/Xã (Cơ sở)'}
                                </Text>
                                <Ionicons name="chevron-down" size={16} color="#666" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View className="mb-5">
                        <Text className="text-sm font-semibold text-[#333] mb-2">Tiêu đề</Text>
                        <TextInput
                            className="bg-[#f9f9f9] p-3 rounded-[10px] border border-[#eee] text-base"
                            placeholder="Ví dụ: Tìm thấy ví da màu nâu"
                            value={title}
                            onChangeText={setTitle}
                        />
                    </View>

                    <View className="mb-5">
                        <Text className="text-sm font-semibold text-[#333] mb-2">Ghim định vị: {coords ? <Text className="text-green-600">Đã chọn</Text> : <Text className="text-red-600">Chưa chọn</Text>}</Text>
                        <TouchableOpacity className="flex-row justify-between items-center bg-[#666] p-3 rounded-[10px] border border-[#eee]" onPress={() => openMap()} >
                            <Text className="text-white">Chọn vị trí</Text>
                        </TouchableOpacity>
                    </View>


                    <View className="mb-5">
                        <Text className="text-sm font-semibold text-[#333] mb-2">Địa điểm</Text>
                        <View className="flex-row items-center bg-[#f9f9f9] p-3 rounded-[10px] border border-[#eee]">
                            <Ionicons name="location-outline" size={20} color="#666" className="mr-2" />
                            <TextInput
                                className="flex-1"
                                placeholder="Ví dụ: Canteen B4, Thư viện..."
                                value={location}
                                onChangeText={setLocation}
                            />
                        </View>
                    </View>

                    <View className="mb-5">
                        <Text className="text-sm font-semibold text-[#333] mb-2">Mô tả chi tiết</Text>
                        <TextInput
                            className="bg-[#f9f9f9] p-3 rounded-[10px] border border-[#eee] text-base h-[100px]"
                            style={{ textAlignVertical: 'top' }}
                            placeholder="Mô tả thêm về đặc điểm, thời gian..."
                            multiline
                            numberOfLines={4}
                            value={description}
                            onChangeText={setDescription}
                        />
                    </View>

                </ScrollView>
                <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
                    <View className="flex-1 bg-white pt-5">
                        <View className="flex-row justify-between items-center px-5 pb-[15px] border-b border-[#eee]">
                            <Text className="text-[18px] font-bold">
                                {modalType === 'province' ? 'Chọn Tỉnh/Thành phố' : 'Chọn Phường/Xã'}
                            </Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Text className="text-[#007AFF] text-base font-semibold">Đóng</Text>
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={modalType === 'province' ? provinces : wards}
                            keyExtractor={(item) => item.code.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    className="flex-row justify-between items-center py-[15px] px-5 border-b border-[#f5f5f5]"
                                    onPress={() => handleSelectAddress(item)}
                                >
                                    <Text className="text-base text-[#333]">{item.name}</Text>
                                    <Ionicons name="chevron-forward" size={20} color="#ccc" />
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </Modal>
                <Modal visible={showMap} animationType="slide">
                    <View className="flex-1">
                        <MapView
                            className="flex-1"
                            initialRegion={coords ? {
                                latitude: coords.latitude,
                                longitude: coords.longitude,
                                latitudeDelta: 0.05,
                                longitudeDelta: 0.05,
                            } : {
                                latitude: 21.0285,
                                longitude: 105.8542,
                                latitudeDelta: 0.05,
                                longitudeDelta: 0.05,
                            }}
                            onPress={(e) => setCoords(e.nativeEvent.coordinate)}
                        >
                            {coords && <Marker coordinate={coords} title="Vị trí vật phẩm" />}
                        </MapView>

                        <View className="absolute bottom-[30px] left-5 right-5 flex-row justify-between gap-[15px]">
                            <TouchableOpacity
                                className="flex-1 p-[15px] rounded-[10px] items-center shadow-md elevation-5 bg-white"
                                onPress={() => setShowMap(false)}
                            >
                                <Text className="text-[#333]">Hủy</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="flex-1 p-[15px] rounded-[10px] items-center shadow-md elevation-5 bg-[#007AFF]"
                                onPress={() => setShowMap(false)}
                            >
                                <Text className="text-white font-bold">Xác nhận</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </KeyboardAvoidingView>
            <LoadingOverlay isLoading={isLoading} />
        </SafeAreaView>
    );
}

