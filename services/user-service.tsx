import { auth, db, storage } from "@/configs/firebase-config";
import { createUserWithEmailAndPassword, EmailAuthProvider, GoogleAuthProvider, reauthenticateWithCredential, signInWithCredential, signInWithEmailAndPassword, updatePassword, updateProfile } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc, writeBatch } from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { updateUserInPost } from "./post-service";
import { formatTime, uploadImage } from "./utilities-service";

export const registerAccount = async (data: {
    email: string;
    password: string;
    userName: string;
    confirmPassword: string;
}) => {
    try {
        if (!data.userName || !data.email || !data.password) {
            throw new Error('Vui lòng nhập đầy đủ tên, email, mật khẩu và xác nhận mật khẩu');
        }

        if (data.password.length < 8) {
            throw new Error('Mật khẩu phải có ít nhất 8 ký tự');
        }

        if (data.password !== data.confirmPassword) {
            throw new Error('Mật khẩu không khớp');
        }
        const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
        try {
            const docRef = await setDoc(doc(db, 'users', userCredential.user.uid), {
                userName: data.userName,
                email: data.email,
                userId: userCredential.user.uid || '',
                isBanned: false,
                role: 'user',
                createdAt: serverTimestamp(),
                userAvatar: null,
            });
        } catch (error) {
            console.log(error);
            throw new Error('Lỗi khi tạo tài khoản');
        }
        const user = userCredential.user;
        await signInWithEmailAndPassword(auth, data.email, data.password);
    } catch (error: any) {
        let msg = error.message;

        if (msg.includes('auth/invalid-email')) msg = 'Email không hợp lệ';
        if (msg.includes('auth/email-already-in-use')) msg = 'Email đã tồn tại';
        if (msg.includes('auth/weak-password')) msg = 'Mật khẩu không hợp lệ';

        throw new Error(msg);
    }
}

export const loginAccount = async (data: {
    email: string;
    password: string;
}) => {
    if (!data.email || !data.password) {
        throw new Error('Vui lòng nhập đầy đủ email và mật khẩu');
    }

    if (!data.email.includes('@')) {
        throw new Error('Email không hợp lệ');
    }

    if (data.password.length < 8) {
        throw new Error('Mật khẩu không hợp lệ');
    }

    try {

        await signInWithEmailAndPassword(auth, data.email, data.password);
        // const user = auth.currentUser;
        // const docRef = doc(db, 'users', user?.uid || '');
        // await setDoc(docRef, {
        //     userName: user?.displayName || '',
        //     email: user?.email,
        //     isBanned: false,
        //     role: 'user',
        //     createdAt: serverTimestamp(),
        //     userAvatar: user?.photoURL || null,
        // })

    } catch (error: any) {
        console.log(error.message);

        let msg = error.message;

        if (msg.includes('auth/invalid-email')) msg = 'Email không hợp lệ';
        if (msg.includes('auth/invalid-credential')) msg = 'Sai email hoặc mật khẩu';
        if (msg.includes('auth/user-not-found')) msg = 'Tài khoản không tồn tại';
        if (msg.includes('auth/wrong-password')) msg = 'Sai mật khẩu';

        throw new Error(msg);
    }
}

export const changePassword = async (data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}) => {
    try {
        const user = auth.currentUser;
        if (!user) {
            throw new Error('Bạn chưa đăng nhập');
        }

        if (!data.currentPassword || !data.newPassword || !data.confirmPassword) {
            throw new Error('Vui lòng nhập đầy đủ mật khẩu hiện tại, mật khẩu mới và xác nhận mật khẩu mới');
        }

        if (data.newPassword.length < 8) {
            throw new Error('Mật khẩu mới phải có ít nhất 8 ký tự');
        }

        if (data.newPassword !== data.confirmPassword) {
            throw new Error('Mật khẩu mới và xác nhận mật khẩu mới không khớp');
        }

        const credential = EmailAuthProvider.credential(user.email || '', data.currentPassword);
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, data.newPassword);
    } catch (error: any) {
        console.log("Có lỗi khi đổi mật khẩu: ", error);
        if (error.message.includes('auth/invalid-credential')) {
            throw new Error('Sai mật khẩu hiện tại');
        } else {
            throw error;
        }
    }
}

export const updateAccount = async (data: {
    name: string;
    avatar: string | null;
}) => {
    try {
        const user = auth.currentUser;
        if (!user) {
            throw new Error('Bạn chưa đăng nhập');
        }

        if (!data.name) {
            throw new Error('Tên hiển thị không được để trống.');
        }
        const oldPhotoUrl = user.photoURL;
        let finalPhotoUrl = oldPhotoUrl;
        let hasNewImage = false;
        if (data.avatar && !data.avatar.startsWith('http')) {
            finalPhotoUrl = await uploadImage(data.avatar, 'avatars');
            hasNewImage = true;
        }
        await updateProfile(user, {
            displayName: data.name,
            photoURL: finalPhotoUrl
        })

        updateUserInPost(user.uid, data.name, finalPhotoUrl || '');

        if (hasNewImage && oldPhotoUrl && oldPhotoUrl.includes('firebasestorage.googleapis.com')) {
            try {
                const oldImageRef = ref(storage, oldPhotoUrl);
                await deleteObject(oldImageRef);
            } catch (delError) {
                console.log("Lỗi khi xóa tệp ảnh đại diện: ", delError);
            }
        }
        const docRef = doc(db, 'users', user.uid);
        const docSnapshot = await getDoc(docRef);

        const batch = writeBatch(db);
        batch.update(docSnapshot.ref, {
            userName: data.name,
            userAvatar: finalPhotoUrl
        });
        await batch.commit();
    } catch (error: any) {
        console.log("Có lỗi khi cập nhật thông tin: ", error);
        throw error;
    }
}

export const getUserById = async (userId: string) => {
    try {
        const docRef = doc(db, 'users', userId);
        const docSnapshot = await getDoc(docRef);
        if (docSnapshot.exists()) {
            const data = docSnapshot.data();
            return {
                ...data,
                time: formatTime(data.createdAt),
            };
        } else {
            return null;
        }
    } catch (error) {
        console.log("Có lỗi khi lấy thông tin người dùng: ", error);
        throw new Error('Lỗi khi lấy thông tin người dùng');
    }
}

export const loginWithGoogle = async (idToken: string) => {
    try {
        const credential = GoogleAuthProvider.credential(idToken);
        const userCredential = await signInWithCredential(auth, credential);
        const user = userCredential.user;

        // const userDoc = await getUserById(user.uid);
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        if (!userDoc.exists()) {
            await setDoc(userRef, {
                userName: user.displayName,
                email: user.email,
                userId: user.uid,
                isBanned: false,
                role: 'user',
                createdAt: serverTimestamp(),
                userAvatar: user.photoURL,
            });
        }
        return user;
    } catch (error) {
        console.log("Có lỗi khi đăng nhập bằng Google: ", error);
        throw error;
    }
}