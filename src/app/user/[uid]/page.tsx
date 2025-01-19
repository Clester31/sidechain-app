/* eslint-disable @next/next/no-img-element */
"use client"

import { doc, getDoc } from "firebase/firestore";
import { UserInfo } from "../../types";
import { useEffect, useState } from "react";
import { db } from "../../../../firebaseConfig";
import SongBox from "../../components/SongBox";
import ProfileHeader from "@/app/components/ProfileHeader";
import ProfileNav from "@/app/components/ProfileNav";
import NewLinkDisplay from "@/app/components/NewLinkDisplay";
import { useAuth } from "@/app/lib/AuthContext";

export default function UserProfile({ params }: { params: { uid: string } }) {
    const { user } = useAuth() as { user: { uid: string } | null };
    const { uid } = params;
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [selectedTab, setSelectedTab] = useState<number>(0);
    const [linkRow, setLinkRow] = useState<{ url: string; name: string }[]>([]);
    const [showAddLink, setShowAddLink] = useState<boolean>(false);

    useEffect(() => {
        const getUserInfo = async () => {
            try {
                const userDoc = await getDoc(doc(db, "users", uid));
                if (userDoc.exists()) {
                    setUserInfo(userDoc.data() as UserInfo);
                    setLinkRow(userDoc.data().links);
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
            {
                showAddLink &&
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                    <NewLinkDisplay setShowAddLink={setShowAddLink} setUserInfo={setUserInfo} uid={uid} />
                </div>

            }
            <div className="flex justify-center mt-4">
                <ProfileHeader userInfo={userInfo} />
            </div>
            <div className="flex justify-center">
                <ProfileNav setSelectedTab={setSelectedTab} />
            </div>
            <div className="flex flex-row m-auto bg-blue-500/10 p-4 rounded-b-xl justify-between" style={{ width: '1024px' }}>
                <div className="flex flex-col gap-4 w-2/5">
                    <p className="text-gray-300">{userInfo.bio}</p>
                </div>
                <div className="flex flex-row gap-4 h-1/3">
                    {
                        linkRow && linkRow.length > 0 &&
                        linkRow.map((link, idx) => {
                            return (
                                <a
                                    className="flex flex-row gap-1 items-center px-4 py-1 rounded-2xl bg-blue-500/15"
                                    key={idx}
                                    href={link.url}
                                    target="_blank"
                                >
                                    <i className="fa-solid fa-link"></i>{link.name}
                                </a>
                            )
                        })
                    }
                    {
                        user && user.uid === uid &&
                        <button
                            className="flex items-center justify-center bg-bg_teal1 w-8 h-8 rounded-full font-bold text-2xl"
                            onClick={() => setShowAddLink(!showAddLink)}
                        >
                            +
                        </button>
                    }

                </div>
            </div>
            <div className="flex flex-col w-3/5 m-auto">
                {
                    selectedTab === 0 && userInfo.allContent &&
                    userInfo.allContent.map((songId) => {
                        return (
                            <SongBox key={songId} songId={songId} />
                        )
                    })
                }
                {
                    selectedTab === 1 && userInfo.songs &&
                    userInfo.songs.map((songId) => {
                        return (
                            <SongBox key={songId} songId={songId} />
                        )
                    })
                }
                {
                    selectedTab === 2 && userInfo.likes &&
                    userInfo.likes.map((songId) => {
                        return (
                            <SongBox key={songId} songId={songId} />
                        )
                    })
                }
                {
                    selectedTab === 3 && userInfo.reposts &&
                    userInfo.reposts.map((songId) => {
                        return (
                            <SongBox key={songId} songId={songId} />
                        )
                    })
                }
            </div>

        </div>
    )
}