import { DEFAULT_AVATAR } from "@/configs/account-config";
import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export type Post = {
    id: string;
    title: string;
    type: 'lost' | 'found' | 'returned' | 'resolved';
    location: string;
    time: string;
    image: string;
    userId: string;
    userName?: string;
    userAvatar?: string;
}

export default function PostCard({ item, onPress }: { item: Post, onPress: () => void }) {

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
    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={styles.card}>
            <View style={styles.imageContainer}>
                <Image source={{ uri: item.image }} style={styles.image} />
                <View style={[styles.labelContainer, { backgroundColor: getStatusColor(item.type) }]}>
                    <Text style={styles.label}>{getStatusLabel(item.type)}</Text>
                </View>
                <View style={styles.infoContainer}>
                    <View style={styles.infoLeft}>
                        <Text style={styles.title}>{item.title}</Text>
                        <View style={styles.infoRow}>
                            <Ionicons name="location" size={14} color="#333" />
                            <Text style={styles.infoText}>{item.location}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Ionicons name="time" size={14} color="#333" />
                            <Text style={styles.infoText}>{item.time}</Text>
                        </View>
                    </View>
                    <View style={styles.userContainer}>
                        <Image source={item.userAvatar ? { uri: item.userAvatar } : DEFAULT_AVATAR} style={styles.userAvatar} />
                        <Text style={styles.userName}>{item.userName}</Text>
                    </View>
                </View>

            </View>

        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.light.background,
        borderRadius: 16,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        overflow: 'hidden',
        height: 300,
    },
    imageContainer: {
        width: '100%',
        height: '60%',
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    labelContainer: {
        position: 'absolute',
        bottom: 10,
        left: 10,
        padding: 5,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
    },
    label: {
        color: '#fff',
        fontWeight: 'bold',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
        gap: 5,
    },
    infoText: {
        fontSize: 14,
        color: '#666',
        flex: 1,
        fontFamily: 'Nunito-Regular',
    },
    infoContainer: {
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.light.text,
        marginBottom: 8,
        fontFamily: 'Nunito-Bold',
    },
    infoLeft: {
        flex: 1
    },
    userName: {
        fontSize: 13,
        color: '#666',
        fontFamily: 'Nunito-Bold',
    },
    userAvatar: {
        width: 50,
        height: 50,
        resizeMode: 'contain',
        borderRadius: 50,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    userContainer: {
        width: 'auto',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 5,
    }

});