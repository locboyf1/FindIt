import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
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
    const [loading, setLoading] = useState(false);

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

        setLoading(true);
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
                userId: auth.currentUser.uid,
                userName: auth.currentUser.displayName,
                userAvatar: auth.currentUser.photoURL
            });

            Alert.alert('Thành công', 'Bài viết đã được đăng!');
            router.back();
        } catch (error) {
            console.error('Lỗi lúc đăng bài: ' + error);
            Alert.alert('Lỗi', 'Không thể đăng bài. Vui lòng thử lại.');
        } finally {
            setLoading(false);
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

                const curProvince = address.city || address.region;
                const curWard = address.subregion;
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

            // console.log(geocode);

        } catch (error) {
            console.error('Lỗi khi lấy vị trí hiện tại: ' + error);
            Alert.alert('Lỗi', 'Không thể lấy vị trí hiện tại. Vui lòng thử lại.');
        }
    }

    const openMap = () => {
        setShowMap(true);

        if (!coords) {
            getLocation(false);
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="close" size={28} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Đăng tin mới</Text>
                    <TouchableOpacity onPress={handleSubmit} disabled={loading}>
                        {loading ? (
                            <ActivityIndicator size="small" color={Colors.light.tint} />
                        ) : (
                            <Text style={styles.postButton}>Đăng</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.content}>

                    <View style={styles.typeSelector}>
                        <TouchableOpacity
                            style={[styles.typeButton, type === 'lost' && styles.typeButtonLost]}
                            onPress={() => setType('lost')}
                        >
                            <Text style={[styles.typeText, type === 'lost' && styles.typeTextActive]}>MẤT ĐỒ</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.typeButton, type === 'found' && styles.typeButtonFound]}
                            onPress={() => setType('found')}
                        >
                            <Text style={[styles.typeText, type === 'found' && styles.typeTextActive]}>NHẶT ĐƯỢC</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                        {image ? (
                            <Image source={{ uri: image }} style={styles.previewImage} />
                        ) : (
                            <View style={styles.imagePlaceholder}>
                                <Ionicons name="camera" size={40} color="#ccc" />
                                <Text style={styles.imageText}>Thêm ảnh</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Khu vực</Text>
                        <View style={{ gap: 10 }}>
                            <TouchableOpacity
                                style={styles.selectBox}
                                onPress={() => openAddressModal('province')}
                            >
                                <Text style={[styles.selectText, !selectedProvince && styles.placeholderText]}>
                                    {selectedProvince ? selectedProvince.name : 'Chọn Tỉnh/Thành phố'}
                                </Text>
                                <Ionicons name="chevron-down" size={16} color="#666" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.selectBox}
                                onPress={() => openAddressModal('ward')}
                            >
                                <Text style={[styles.selectText, !selectedWard && styles.placeholderText]}>
                                    {selectedWard ? selectedWard.name : 'Chọn Phường/Xã (Cơ sở)'}
                                </Text>
                                <Ionicons name="chevron-down" size={16} color="#666" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Tiêu đề</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ví dụ: Tìm thấy ví da màu nâu"
                            value={title}
                            onChangeText={setTitle}
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Ghim định vị: {coords ? <Text style={{ color: 'green' }}>Đã chọn</Text> : <Text style={{ color: 'red' }}>Chưa chọn</Text>}</Text>
                        <TouchableOpacity style={[styles.selectBox, { backgroundColor: '#666' }]} onPress={() => openMap()} >
                            <Text style={{ color: 'white' }}>Chọn vị trí</Text>
                        </TouchableOpacity>
                    </View>


                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Địa điểm</Text>
                        <View style={styles.locationInput}>
                            <Ionicons name="location-outline" size={20} color="#666" style={{ marginRight: 8 }} />
                            <TextInput
                                style={{ flex: 1 }}
                                placeholder="Ví dụ: Canteen B4, Thư viện..."
                                value={location}
                                onChangeText={setLocation}
                            />
                        </View>
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Mô tả chi tiết</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Mô tả thêm về đặc điểm, thời gian..."
                            multiline
                            numberOfLines={4}
                            value={description}
                            onChangeText={setDescription}
                        />
                    </View>

                </ScrollView>
                <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {modalType === 'province' ? 'Chọn Tỉnh/Thành phố' : 'Chọn Phường/Xã'}
                            </Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Text style={styles.closeButton}>Đóng</Text>
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={modalType === 'province' ? provinces : wards}
                            keyExtractor={(item) => item.code.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.modalItem}
                                    onPress={() => handleSelectAddress(item)}
                                >
                                    <Text style={styles.modalItemText}>{item.name}</Text>
                                    <Ionicons name="chevron-forward" size={20} color="#ccc" />
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </Modal>
                <Modal visible={showMap} animationType="slide">
                    <View style={{ flex: 1 }}>
                        <MapView
                            style={{ flex: 1 }}
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

                        <View style={styles.mapActions}>
                            <TouchableOpacity
                                style={[styles.mapBtn, { backgroundColor: '#fff' }]}
                                onPress={() => setShowMap(false)}
                            >
                                <Text style={{ color: '#333' }}>Hủy</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.mapBtn, { backgroundColor: Colors.light.tint }]}
                                onPress={() => setShowMap(false)}
                            >
                                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Xác nhận</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    postButton: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.light.tint,
    },
    content: {
        padding: 20,
    },
    typeSelector: {
        flexDirection: 'row',
        marginBottom: 20,
        gap: 15,
    },
    typeButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        backgroundColor: '#f5f5f5',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    typeButtonLost: {
        backgroundColor: '#ffebee',
        borderColor: '#FF3B30',
    },
    typeButtonFound: {
        backgroundColor: '#e3f2fd',
        borderColor: '#007AFF',
    },
    typeText: {
        fontWeight: 'bold',
        color: '#999',
    },
    typeTextActive: {
        color: '#333',
    },
    imagePicker: {
        width: '100%',
        height: 200,
        backgroundColor: '#f9f9f9',
        borderRadius: 15,
        marginBottom: 25,
        borderWidth: 1,
        borderColor: '#eee',
        borderStyle: 'dashed',
        overflow: 'hidden',
    },
    imagePlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageText: {
        color: '#999',
        marginTop: 5,
    },
    previewImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#f9f9f9',
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#eee',
        fontSize: 16,
    },
    locationInput: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#eee',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    selectBox: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#eee'
    },
    selectText: {
        color: '#333',
        fontSize: 14
    },
    placeholderText: {
        color: '#999',
        fontSize: 14
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 20
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee'
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold'
    },
    closeButton: {
        color: Colors.light.tint,
        fontSize: 16,
        fontWeight: '600'
    },
    modalItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5'
    },
    modalItemText: { fontSize: 16, color: '#333' },
    mapButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, backgroundColor: '#f0f9ff', borderWidth: 1, borderColor: '#bde0fe', borderRadius: 10, gap: 8 },
    mapButtonText: { color: Colors.light.tint, fontWeight: '600' },
    mapActions: { position: 'absolute', bottom: 30, left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between', gap: 15 },
    mapBtn: { flex: 1, padding: 15, borderRadius: 10, alignItems: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 5 },
});