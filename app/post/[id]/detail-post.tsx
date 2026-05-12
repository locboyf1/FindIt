import { DEFAULT_AVATAR } from "@/configs/account-config";
import { auth } from "@/configs/firebase-config";
import { Colors } from "@/constants/theme";
import { getPostById } from "@/services/post-service";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DetailPostScreen() {
    const { id } = useLocalSearchParams();
    const [post, setPost] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            getPost(id as string);
        }
        else {
            Alert.alert('Lỗi', 'Có gì đó không đúng');
            router.back();
        }
    }, [id])

    const getPost = async (postId: string) => {
        try {
            const data = await getPostById(postId);
            if (data) {
                setPost(data);
            } else {
                Alert.alert('Lỗi', 'Không tìm thấy bài viết');
                router.back();
            }
        } catch (error) {
            console.error('Lỗi lúc lấy bài viết: ' + error);
            Alert.alert('Lỗi', 'Không tìm thấy bài viết');
            router.back();
        } finally {
            setLoading(false);
        }
    }

    const getStatusColor = (type: string) => {
        switch (type) {
            case 'lost': return '#fa675fff';
            case 'found': return '#3293fbff';
            case 'resolved': return Colors.light.success;
            case 'returned': return Colors.light.success;
            default: return Colors.light.tint;
        }
    };

    const getStatusLabel = (type: string) => {
        switch (type) {
            case 'lost': return 'Mất đồ';
            case 'found': return 'Tìm thấy';
            case 'resolved': return 'Đã giải quyết';
            case 'returned': return 'Đã trả lại';
            default: return type.toUpperCase();
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.light.tint} />
            </View>
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
                    <Ionicons name="arrow-back" size={26} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Chi tiết bài viết</Text>
                {post.userId == auth.currentUser?.uid ? (
                    <TouchableOpacity onPress={() => { router.push({ pathname: '/post/[id]/update-post', params: { id: post.id } }) }} disabled={loading} style={styles.headerButton}>
                        <Text style={styles.saveButton}>Sửa</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity onPress={() => { Alert.alert('Thông báo', 'Chức năng chưa thêm') }} disabled={loading} style={styles.headerButton}>
                        <Text style={styles.saveButton}>Báo cáo</Text>
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView showsVerticalScrollIndicator={false} bounces={false} style={{ flex: 1 }}>
                <Image source={{ uri: post.image }} style={styles.coverImage} />

                <View style={styles.contentContainer}>

                    <View style={styles.badgeRow}>
                        <View style={[styles.badge, { backgroundColor: getStatusColor(post.type) }]}>
                            <Text style={styles.badgeText}>{getStatusLabel(post.type)}</Text>
                        </View>
                        <Text style={styles.timeText}>{post.time}</Text>
                    </View>

                    <Text style={styles.title}>{post.title}</Text>

                    <View style={styles.infoRow}>
                        <View style={styles.iconBox}>
                            <Ionicons name="location" size={20} color={Colors.light.tint} />
                        </View>
                        <View style={styles.infoTextContainer}>
                            <Text style={styles.infoLabel}>Địa điểm</Text>
                            <Text style={styles.infoValue}>
                                {post.location}
                                {post.wardName ? ', ' + post.wardName : ''}
                                {post.provinceName ? ', ' + post.provinceName : ''}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.userRow}>
                        <Image
                            source={post.userAvatar ? { uri: post.userAvatar } : DEFAULT_AVATAR}
                            style={styles.avatar}
                        />
                        <View style={styles.userInfo}>
                            <Text style={styles.userName}>{post.userName || 'Người dùng ẩn danh'}</Text>
                            <Text style={styles.userRole}>Người đăng bài</Text>
                        </View>
                        {post.userId != auth.currentUser?.uid && (
                            <TouchableOpacity style={styles.contactButton} onPress={() => { Alert.alert('Thông báo', 'Tính năng chưa thêm') }}>
                                <Ionicons name="chatbubble-ellipses" size={20} color={'#fff'} />
                                <Text style={styles.contactButtonText}>Liên hệ</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    <View style={styles.divider} />

                    <Text style={styles.sectionTitle}>Mô tả chi tiết</Text>
                    <Text style={styles.description}>
                        {post.description || 'Không có mô tả chi tiết cho bài viết này.'}
                    </Text>

                    {post.geo && (
                        <View style={styles.mapSection}>
                            <Text style={styles.sectionTitle}>Vị trí trên bản đồ</Text>
                            <View style={styles.mapContainer}>
                                <MapView
                                    style={styles.map}
                                    initialRegion={{
                                        latitude: post.geo.lat,
                                        longitude: post.geo.lng,
                                        latitudeDelta: 0.005,
                                        longitudeDelta: 0.005,
                                    }}
                                    scrollEnabled={false}
                                >
                                    <Marker
                                        coordinate={{ latitude: post.geo.lat, longitude: post.geo.lng }}
                                        title="Vị trí vật phẩm"
                                    />
                                </MapView>
                            </View>
                        </View>
                    )}

                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    coverImage: {
        width: '100%',
        height: 350,
        resizeMode: 'cover',
    },
    contentContainer: {
        flex: 1,
        backgroundColor: '#fff',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        marginTop: -30,
        padding: 20,
    },
    badgeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    badgeText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12,
    },
    timeText: {
        color: '#888',
        fontSize: 14,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#222',
        marginBottom: 20,
        lineHeight: 32,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#f0f9ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    infoTextContainer: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        color: '#888',
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 15,
        color: '#333',
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: '#eee',
        marginVertical: 20,
    },
    userRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 15,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    userRole: {
        fontSize: 13,
        color: '#888',
        marginTop: 2,
    },
    contactButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.light.tint,
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 20,
        gap: 5,
    },
    contactButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    description: {
        fontSize: 15,
        color: '#555',
        lineHeight: 24,
    },
    mapSection: {
        marginTop: 25,
    },
    mapContainer: {
        width: '100%',
        height: 200,
        borderRadius: 15,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#eee',
    },
    map: {
        width: '100%',
        height: '100%',
    },
})

