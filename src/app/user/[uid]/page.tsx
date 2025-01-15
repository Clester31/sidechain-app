/* eslint-disable @next/next/no-img-element */
"use client"

import { doc, getDoc } from "firebase/firestore";
import { UserInfo } from "../../types";
import { useEffect, useState, use } from "react";
import { db } from "../../../../firebaseConfig";
import { Song } from "../../types";
import SongBox from "../../components/SongBox";
import ProfileHeader from "@/app/components/ProfileHeader";
import ProfileNav from "@/app/components/ProfileNav";

export default function UserProfile({ params }: { params: { uid: string } }) {
    const { uid } = use(params);
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [selectedTab, setSelectedTab] = useState<number>(0);

    useEffect(() => {
        const getUserInfo = async () => {
            try {
                const userDoc = await getDoc(doc(db, "users", uid));
                if (userDoc.exists()) {
                    setUserInfo(userDoc.data() as UserInfo);
                }
            } catch (error) {
                console.error("Error fetching user info:", error);
            }
        };

        getUserInfo();
    }, [uid]);

    if (!userInfo) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <div className="flex justify-center mt-4">
                <ProfileHeader userInfo={userInfo} />
            </div>
            <div className="flex justify-center">
                <ProfileNav setSelectedTab={setSelectedTab} />
            </div>
            <div className="flex flex-col w-3/5 m-auto">
                {
                    selectedTab === 0 && userInfo.allContent &&
                    userInfo.allContent.map((song, idx) => {
                        return (
                            <SongBox key={song.id} song={song} />
                        )
                    })
                }
                {
                    selectedTab === 1 && userInfo.songs &&
                    userInfo.songs.map((song, idx) => {
                        return (
                            <SongBox key={song.id} song={song} />
                        )
                    })
                }
                {
                    selectedTab === 2 && userInfo.likes &&
                    userInfo.likes.map((song, idx) => {
                        return (
                            <SongBox key={song.id} song={song} />
                        )
                    })
                }
                {
                    selectedTab === 3 && userInfo.reposts &&
                    userInfo.reposts.map((song, idx) => {
                        return (
                            <SongBox key={song.id} song={song} />
                        )
                    })
                }
            </div>

        </div>
    )
}