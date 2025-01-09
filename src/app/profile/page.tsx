"use client"

import { useEffect, useState } from "react"
import { useAuth } from "../lib/AuthContext"
import { db } from "../../../firebaseConfig";
import { doc, updateDoc } from "firebase/firestore";
import { getDoc } from "firebase/firestore";
import { Bounce, ToastContainer, toast } from 'react-toastify';
import Image from "next/image";

export default function Profile() {
    const { user } = useAuth();
    const [currentUsername, setCurrentUsername] = useState<string>();
    const [currentProfilePicture, setCurrentProfilePicture] = useState<string>();
    const [newProfilePicture, setNewProfilePicture] = useState<string>();
    const [newUsername, setNewUsername] = useState<string>();
    const [userSongs, setUserSongs] = useState([]);

    useEffect(() => {
        const fetchUserInfo = async () => {
            if (user) {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    setCurrentUsername(userDoc.data().username);
                    setCurrentProfilePicture(userDoc.data().profileImage)
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

    const changeProfilePicture = async () => {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, { profileImage: newProfilePicture });
        toast.success("Profile Pciture Updated", {
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

            </div>
            <div>
                <h2>My Uploads</h2>
                <div className="songs-grid">
                    {userSongs.map(song => (
                        <div key={song.id} className="song-card">
                            <h3>{song.title}</h3>
                            <p>{song.description}</p>
                            <audio controls src={song.audioUrl} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}