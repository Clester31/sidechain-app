"use client"

import { useEffect, useState, ChangeEvent } from "react"
import { useAuth } from "../lib/AuthContext"
import { db, storage } from "../../../firebaseConfig";
import { doc, updateDoc } from "firebase/firestore";
import { getDoc } from "firebase/firestore";
import { Bounce, ToastContainer, toast } from 'react-toastify';
import Image from "next/image";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "@firebase/storage";

export default function Profile() {
    const { user } = useAuth();
    const [currentUsername, setCurrentUsername] = useState<string>();
    const [newProfilePicture, setNewProfilePicture] = useState<File | null>(null);
    const [newProfileBanner, setNewProfileBanner] = useState<File | null>(null);
    const [newUsername, setNewUsername] = useState<string>();
    const [userSongs, setUserSongs] = useState([]);

    useEffect(() => {
        const fetchUserInfo = async () => {
            if (user) {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    setCurrentUsername(userDoc.data().username);
                    const fetchedSongs = await fetchUserSongs(user.uid);
                    setUserSongs(fetchedSongs);
                }
            }
        };
        fetchUserInfo();
    }, [user]);

    const changeUsername = async () => {
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
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const currentImageUrl = userDoc.data()?.profileImage;

        if (currentImageUrl) {
            const oldImageRef = ref(storage, currentImageUrl);
            await deleteObject(oldImageRef);
        }

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
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const currentBannerUrl = userDoc.data()?.profileBanner;

        if (currentBannerUrl) {
            const oldBannerRef = ref(storage, currentBannerUrl);
            await deleteObject(oldBannerRef);
        }

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


    const fetchUserSongs = async (userId: string) => {
        try {
            const userDoc = await getDoc(doc(db, "users", userId));

            if (!userDoc.exists()) return [];

            const songIds = userDoc.data().songs;

            // If user has no songs, return empty array
            if (!songIds || songIds.length === 0) return [];

            // Fetch each song document using the IDs
            const songPromises = songIds.map(songId =>
                getDoc(doc(db, "audioFiles", songId))
            );

            const songDocs = await Promise.all(songPromises);

            return songDocs
                .map(doc => {
                    if (!doc.exists()) return null;
                    return {
                        id: doc.id,
                        ...doc.data()
                    };
                })
                .filter(song => song !== null);
        } catch (error) {
            console.error("Error fetching user songs:", error);
            return [];
        }
    }

    const [editUsername, setEditUsername] = useState<boolean>(false)
    return (
        <div className="flex flex-col justify-center items-center h-screen">
            <div className="flex flex-col w-1/2 items-center bg-slate-800 py-4 rounded-xl text-lg px-8 gap-4">
                <ToastContainer />
                <div className="flex flex-row gap-4 items-center">
                    <h1>Username: </h1>
                    <button className="bg-sky-500 px-3 py-2 rounded-xl" onClick={() => setEditUsername(!editUsername)}><i className="fa-solid fa-pencil"></i></button>
                    <input
                        placeholder={currentUsername}
                        className="py-2 px-4 text-black rounded-md"
                        disabled={!editUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                    />
                    {
                        newUsername?.length > 0 &&
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
                    />
                    <button
                        onClick={ChangeProfileImage}
                        className="bg-green-500 p-2 rounded-xl"
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
                    />
                    <button
                        onClick={ChangeProfileBanner}
                        className="bg-green-500 p-2 rounded-xl"
                        disabled={!newProfileBanner}
                    >
                        Update
                    </button>
                </div>
            </div>
        </div>
    )
}