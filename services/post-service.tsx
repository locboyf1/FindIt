import { addDoc, collection, doc, getDoc, getDocs, orderBy, query, serverTimestamp, updateDoc, where, writeBatch } from "firebase/firestore";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "../configs/firebase-config";
import { formatTime } from "./utilities-service";

export const createPost = async (data: {
    title: string;
    description: string;
    location: string;
    province: { id: number, name: string } | null;
    ward: { id: number, name: string } | null;
    coords?: { latitude: number, longitude: number } | null;
    type: 'lost' | 'found';
    image: string;
    userId: string;
    userName?: string | null;
    userAvatar?: string | null;
}) => {
    try {
        const imageUrl = await uploadImage(data.image);

        const docRef = await addDoc(collection(db, 'posts'), {
            title: data.title,
            description: data.description,
            location: data.location,
            provinceId: data.province?.id,
            provinceName: data.province?.name,
            wardId: data.ward?.id,
            wardName: data.ward?.name,
            geo: data.coords ? {
                lat: data.coords.latitude,
                lng: data.coords.longitude
            } : null,
            type: data.type,
            image: imageUrl,
            userId: data.userId,
            userName: data.userName,
            userAvatar: data.userAvatar || null,
            createdAt: serverTimestamp(),
            status: 'open',
            isHidden: false,
            isBanned: false,
        });
    } catch (error) {
        console.log("Có lỗi khi tạo bài viết: ", error);
        throw error;
    }

}

const uploadImage = async (image: string) => {
    try {
        const response = await fetch(image);
        const blob = await response.blob();

        const filename = 'posts/' + Date.now() + '-' + Math.random().toString(36).substring(7) + '.jpg';
        const storageRef = ref(storage, filename);

        await uploadBytes(storageRef, blob);

        const downloadUrl = await getDownloadURL(storageRef);
        return downloadUrl;
    } catch (error) {
        console.log("Có lỗi khi upload ảnh: ", error);
        throw error;
    }
}


export const getPosts = async () => {
    try {
        const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                title: data.title,
                type: data.type,
                location: data.location,
                province: {
                    id: data.provinceId,
                    name: data.provinceName
                },
                ward: {
                    id: data.wardId,
                    name: data.wardName
                },
                geo: data.geo,
                image: data.image,
                time: formatTime(data.createdAt),
                userName: data.userName,
                userAvatar: data.userAvatar,
            };
        }).filter((post: any) => !post.isHidden && !post.isBanned);
    } catch (error) {
        console.log("Có lỗi khi lấy bài viết: ", error);
        throw error;
    }
}

export const updateUserInPost = async (userId: string, userName: string, userAvatar: string) => {
    try {
        const q = query(collection(db, 'posts'), where('userId', '==', userId));
        const querySnapshot = await getDocs(q);

        const batch = writeBatch(db);

        querySnapshot.forEach(async (doc) => {
            batch.update(doc.ref, {
                userName: userName,
                userAvatar: userAvatar,
            });
        });

        await batch.commit();
    } catch (error) {
        console.log("Có lỗi khi cập nhật bài viết: ", error);
        throw error;
    }
}

export const getPostById = async (postId: string) => {
    try {
        const docRef = doc(db, 'posts', postId);
        const docSnapshot = await getDoc(docRef);

        if (docSnapshot.exists()) {
            const data = docSnapshot.data();
            return {
                id: docSnapshot.id,
                ...data,
                time: formatTime(data.createdAt),
            };
        }
        else {
            return null;
        }
    } catch (error) {
        console.log("Có lỗi khi lấy bài viết: ", error);
        throw error;
    }
}

export const updatePost = async (id: string, data: any) => {
    try {
        const docRef = doc(db, 'posts', id);
        const docSnap = await getDoc(docRef);
        const oldImage = docSnap.data()?.image;
        let finalImageUrl = data.image;
        let hasNewImage = false;

        if (data.image !== oldImage && data.image !== null) {
            hasNewImage = true;
            finalImageUrl = await uploadImage(data.image);
        }

        await updateDoc(docRef, {
            title: data.title,
            description: data.description,
            location: data.location,
            provinceId: data.province?.id,
            provinceName: data.province?.name,
            wardId: data.ward?.id,
            wardName: data.ward?.name,
            geo: data.coords ? {
                lat: data.coords.latitude,
                lng: data.coords.longitude
            } : null,
            type: data.type,
            image: finalImageUrl,
            userId: data.userId,
            userName: data.userName,
            userAvatar: data.userAvatar,
        });

        if (hasNewImage && oldImage && oldImage.includes('firebasestorage.googleapis.com')) {
            try {
                const oldImageRef = ref(storage, oldImage);
                await deleteObject(oldImageRef);
            } catch (delError) {
                console.log("Lỗi khi xóa tệp ảnh bài đăng: ", delError);
            }
        }
    } catch (error) {
        console.log("Có lỗi khi cập nhật bài viết: ", error);
        throw error;
    }
}