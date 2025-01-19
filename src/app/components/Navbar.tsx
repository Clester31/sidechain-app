/* eslint-disable @next/next/no-img-element */
"use client"

import { doc } from "firebase/firestore";
import Image from "next/image"
import { useEffect, useState } from "react"
import { db } from "../../../firebaseConfig";
import { getDoc } from "firebase/firestore";
import { useAuth } from "../lib/AuthContext";
import { useRouter } from "next/navigation";
import UserSettingsWidget from "./UserSettingsWidget";

export default function Navbar() {
    const { user } = useAuth();
    const router = useRouter(); 
    const [profileImage, setProfileImage] = useState<string>();
    const [showProfileWidget, setShowProfileWidget] = useState<boolean>(false);

    useEffect(() => {
        const fetchProfileImage = async () => {
            if (user) {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    const imageUrl = userDoc.data().profileImage;
                    console.log('profile image link', imageUrl);
                    setProfileImage(imageUrl);
                }
            }
        }
        fetchProfileImage();
    }, [user])


    return (
        <div className="w-screen flex flex-row bg-bg_blue1 items-center justify-between px-8 py-2 border-b-2 border-bg_blue2">
            <div className="w-1/6 justify-start">
                <Image onClick={() => router.push('/')} className="cursor-pointer hover:scale-110 transition 500" src='/sidechain_icon.png' width={48} height={48} alt={'Sidechain Logo'} />
            </div>
            <div className="flex justify-center gap-4">
                <button 
                className="py-4 px-6 flex w-48 justify-center items-center text-center bg-bg_blue2 border-2 border-bg_teal1 hover:border-bg_teal2 transition 250 rounded-2xl h-8"
                onClick={() => router.push('/')}
                >My Shuffle</button>
                <button 
                className="py-4 px-6 flex w-48 justify-center items-center text-center bg-bg_blue2 border-2 border-bg_teal1 hover:border-bg_teal2 transition 250 rounded-2xl h-8"
                onClick={() => router.push('/search')}
                >Search</button>
                
                <button 
                className="py-4 px-6 flex w-48 justify-center items-center text-center bg-bg_blue2 border-2 border-bg_teal1 hover:border-bg_teal2 transition 250 rounded-2xl h-8"
                onClick={() => router.push('/upload')}
                >Upload</button>
                <button 
                className="py-4 px-6 flex w-48 justify-center items-center text-center bg-bg_blue2 border-2 border-bg_teal1 hover:border-bg_teal2 transition 250 rounded-2xl h-8"
                onClick={() => router.push(`user/${user.uid}`)}
                >My Songs</button>
            </div>
            <div className="w-1/6 flex justify-end">
                {user ? (
                    <img
                        onClick={() => setShowProfileWidget(!showProfileWidget)}
                        className="cursor-pointer rounded-full border-4 border-bg_teal1 hover:border-bg_teal2 transition 250 w-12 h-12 object-cover"
                        src={profileImage}
                        alt="profile picture"
                    />
                ) : (
                    <button
                        className="border-bg_teal1 px-4 py-1 border-2 rounded-2xl bg-bg_blue2 hover:bg-bg_teal1 hover:border-bg_teal2 hover:text-black transition 250 ease-in-out"
                        onClick={() => router.push('./login')}
                    >
                        Log in / Sign Up
                    </button>
                )}
            </div>
            <div className="absolute right-0">
                {
                    showProfileWidget && <UserSettingsWidget setShowProfileWidget={setShowProfileWidget} />
                }
            </div>
        </div>
    )
}