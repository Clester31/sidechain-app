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
                    setProfileImage(userDoc.data().profileImage);
                }
            }
        }
        fetchProfileImage();
    }, [user])


    return (
        <div className="flex flex-row bg-bg_blue1 items-center justify-between px-8 py-2 border-b-2 border-bg_blue2">
            <div className="w-1/6 justify-start">
                <Image onClick={() => router.push('/')} className="cursor-pointer hover:scale-110 transition 500" src='/sidechain_icon.png' width={48} height={48} alt={'Sidechain Logo'} />
            </div>
            <div className="flex justify-center gap-4">
                <button className="py-2 px-6 flex justify-center items-center text-center bg-bg_blue2 border-2 border-bg_teal1 hover:border-bg_teal2 transition 250 rounded-2xl h-8 w-8"><i className="fa-solid fa-shuffle"></i></button>
                <input placeholder="search for songs" type="text" className="rounded-2xl w-96 h-8 bg-bg_blue2 border-2 border-bg_teal1 hover:border-bg_teal2 transition 250 px-8 py-2 text-center" />
                <button 
                className="py-2 px-6 flex justify-center items-center text-center bg-bg_blue2 border-2 border-bg_teal1 hover:border-bg_teal2 transition 250 rounded-2xl h-8 w-8"
                onClick={() => router.push('/upload')}
                ><i className="fa-solid fa-plus"></i></button>
            </div>
            <div className="w-1/6 flex justify-end">
                {
                user ? 
                    <Image onClick={() => setShowProfileWidget(!showProfileWidget)} className="cursor-pointer rounded-full border-4 border-bg_teal1 hover:border-bg_teal2 transition 250" src={profileImage} width={48} height={48} alt="profile picture" />
                :
                    <button 
                    className="border-bg_teal1 px-4 py-1 border-2 rounded-2xl bg-bg_blue2 hover:bg-bg_teal1 hover:border-bg_teal2 hover:text-black transition 250"
                    onClick={() => router.push('./login')}
                    >
                        Log in / Sign Up
                    </button>
                }
            </div>
            <div className="absolute right-0">
                {
                    showProfileWidget && <UserSettingsWidget />
                }
            </div>
        </div>
    )
}