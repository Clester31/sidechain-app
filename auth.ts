import { createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { auth, db } from "./firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import { getDownloadURL, getStorage, ref} from "@firebase/storage";

const setDefaultProfileImages = async () => {
    const storage = getStorage();
    const profileRef = ref(storage, 'defaultImages/profile.jpg');
    const bannerRef = ref(storage, 'defaultImages/default_banner.png');

    const [profileUrl, bannerUrl] = await Promise.all([
        getDownloadURL(profileRef),
        getDownloadURL(bannerRef)
    ])

    return { profileUrl, bannerUrl };
}

export const signUpWithEmail = async (email: string, username: string, password: string) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const { profileUrl, bannerUrl } = await setDefaultProfileImages();

        await setDoc(doc(db, "users", user.uid), {
            username,
            email: user.email,
            profileImage: profileUrl,
            profileBanner: bannerUrl,
            songs: [],
            likes: [],
            reposts: [],
            allContent: [],
            bio: '',
            links: [],
        });

    } catch (error) {
        if (error instanceof Error) {
            throw error.message;
        } else {
            throw String(error);
        }
    }
};

export const signInWithEmail = async (email: string, password: string) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error) {
        if (error instanceof Error) {
            throw error.message;
        } else {
            throw String(error);
        }
    }
}

export const signInWithGoogle = async () => {
    try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        const { profileUrl, bannerUrl } = await setDefaultProfileImages();

        await setDoc(doc(db, "users", user.uid), {
            username: `${(user.displayName ?? 'User').split(' ').join('')}${Math.floor(Math.random() * 900) + 100}`,
            email: user.email,
            profileImage: profileUrl,
            profileBanner: bannerUrl,
            songs: [],
            likes: [],
            reposts: [],
            allContent: [],
            bio: '',
            links: [],
        });
        return user;
    } catch (error) {
        if (error instanceof Error) {
            throw error.message;
        } else {
            throw String(error);
        }
    }
}

export const logOut = async () => {
    try {
        signOut(auth);
    } catch (error) {
        if (error instanceof Error) {
            throw error.message;
        } else {
            throw String(error);
        }
    }
}