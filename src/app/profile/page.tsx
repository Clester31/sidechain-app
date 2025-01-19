"use client"

import { useEffect, useState, ChangeEvent } from "react"
import { useAuth } from "../lib/AuthContext"
import { db, storage } from "../../../firebaseConfig";
import { doc, updateDoc } from "firebase/firestore";
import { getDoc } from "firebase/firestore";
import { Bounce, ToastContainer, toast } from 'react-toastify';
import { deleteObject, getDownloadURL, ref, uploadBytes } from "@firebase/storage";

export default function Profile() {
    const { user } = useAuth() as { user: { uid: string } | null };
    const [currentUsername, setCurrentUsername] = useState<string>();
    const [newProfilePicture, setNewProfilePicture] = useState<File | null>(null);
    const [newProfileBanner, setNewProfileBanner] = useState<File | null>(null);
    const [newUsername, setNewUsername] = useState<string>();

    useEffect(() => {
        const fetchUserInfo = async () => {
            if (user) {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    setCurrentUsername(userDoc.data().username);
                }
            }
        };
        fetchUserInfo();
    }, [user]);

    const changeUsername = async () => {
        if (!user || !newProfilePicture) return;
        
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, { username: newUsername });
        setCurrentUsername(newUsername);
        setNewUsername("");
        setEditUsername(false);
        toast.success("Username Updated", {
            position: "top-right",
            theme: "dark",
            transition: Bounce,
        });
    }

    const updateNewProfileImage = async (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setNewProfilePicture(event.target.files[0]);
        }
    }

    const updateNewBanner = async (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setNewProfileBanner(event.target.files[0]);
        }
    }

    const ChangeProfileImage = async () => {
        if (!user || !newProfilePicture) return;

        const userDoc = await getDoc(doc(db, "users", user.uid));
        const currentImageUrl = userDoc.data()?.profileImage;

        console.log(currentImageUrl);

        // if (currentImageUrl && !currentImageUrl.startsWith('defaultImages/')) {
        //     const oldImageRef = ref(storage, currentImageUrl);
        //     await deleteObject(oldImageRef);
        // }

        const imageStorageRef = ref(storage, `profilePictures/${newProfilePicture.name}`);
        await uploadBytes(imageStorageRef, newProfilePicture);
        const imgUrl = await getDownloadURL(imageStorageRef);

        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, { profileImage: imgUrl });

        toast.success("Profile Picture Updated", {
            position: "top-right",
            theme: "dark",
            transition: Bounce,
        });
    }

    const ChangeProfileBanner = async () => {
        if (!user) return;

        const userDoc = await getDoc(doc(db, "users", user.uid));
        const currentBannerUrl = userDoc.data()?.profileBanner;

        if (currentBannerUrl && !currentBannerUrl.startsWith('defaultImages/')) {
            const oldBannerRef = ref(storage, currentBannerUrl);
            await deleteObject(oldBannerRef);
        }

        if (newProfileBanner) {
            const imageStorageRef = ref(storage, `profileBanners/${newProfileBanner.name}`);
            await uploadBytes(imageStorageRef, newProfileBanner);
            const imgUrl = await getDownloadURL(imageStorageRef);

            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, { profileBanner: imgUrl });

            toast.success("Profile Banner Updated", {
                position: "top-right",
                theme: "dark",
                transition: Bounce,
            });
        }
    }

    const [editUsername, setEditUsername] = useState<boolean>(false)
    return (
        <div className="flex flex-col justify-center items-center h-screen">
            <h1 className="mb-2 text-xl font-semibold">User Profile Settings</h1>
            <div className="flex flex-col w-1/2 items-center bg-slate-800 py-4 rounded-xl text-lg px-8 gap-4">
                <ToastContainer />
                <div className="flex flex-row gap-8 items-center">
                    <h1>Username: </h1>
                    <input
                        placeholder={currentUsername}
                        className="py-2 px-4 text-black rounded-md"
                        disabled={!editUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                    />
                    <button
                        className="bg-sky-500 px-3 py-2 rounded-xl"
                        onClick={() => setEditUsername(!editUsername)}>
                        <i className="fa-solid fa-pencil"></i>
                    </button>
                    {
                        (newUsername?.length ?? 0) > 0 &&
                        <button onClick={changeUsername} className="bg-green-500 p-2 rounded-xl">Change</button>
                    }
                </div>
                <div className="flex flex-row gap-4 items-center">
                    <h1>Change Profile Picture</h1>
                    <input
                        name="profileImage"
                        type="file"
                        accept="image/jpeg"
                        onChange={updateNewProfileImage}
                        className="hidden"
                        id="profileImageInput"
                    />
                    <label htmlFor="profileBannerInput" className="bg-bg_teal1 hover:bg-bg_teal2 hover:text-black transition 250 ease-in-out p-2 rounded-xl cursor-pointer">
                        Choose File
                    </label>
                    <button
                        onClick={ChangeProfileImage}
                        className="bg-green-500 p-2 rounded-xl disabled:hidden"
                        disabled={!newProfilePicture}
                    >
                        Update
                    </button>
                </div>
                <div className="flex flex-row gap-4 items-center">
                    <h1>Change Profile Banner</h1>
                    <input
                        name="profileBanner"
                        type="file"
                        accept="image/jpeg"
                        onChange={updateNewBanner}
                        className="hidden"
                        id="profileBannerInput"
                    />
                    <label htmlFor="profileBannerInput" className="bg-bg_teal1 hover:bg-bg_teal2 hover:text-black transition 250 ease-in-out p-2 rounded-xl cursor-pointer">
                        Choose File
                    </label>
                    <button
                        onClick={ChangeProfileBanner}
                        className="bg-green-500 p-2 rounded-xl disabled:hidden"
                        disabled={!newProfileBanner}
                    >
                        Update
                    </button>
                </div>
            </div>
        </div>
    )
}