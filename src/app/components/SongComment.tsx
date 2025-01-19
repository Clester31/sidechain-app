/* eslint-disable @next/next/no-img-element */
import { doc, getDoc } from "firebase/firestore"
import { useEffect, useState } from "react"
import { db } from "../../../firebaseConfig"
import { UserInfo } from "../types";
import { useRouter } from 'next/navigation'

export default function SongComment({ content, userId }) {
    const [userInfo, setUserInfo] = useState<UserInfo | null>();

    const router = useRouter();

    useEffect(() => {
        async function getUserInfo() {
            try {
                const userDoc = await getDoc(doc(db, "users", userId));
                if (userDoc.exists()) {
                    setUserInfo(userDoc.data() as UserInfo);
                }
            } catch (error) {
                console.error("Error fetching user info:", error);
            }
        };

        getUserInfo();
    })

    return (
        <div className="flex flex-row items-center gap-4 bg-slate-800/75 p-1 rounded-lg">
            <div className="flex flex-row items-center gap-1">
                {
                    userInfo?.profileImage &&
                    <img className="flex object-cover w-8 h-8 rounded-full border-bg_blue1 border-2" src={userInfo.profileImage} alt="profile picture" />
                }
                {
                    userInfo?.username &&
                    <h1 className="font-semibold text-gray-300 hover:text-white cursor-pointer" onClick={() => router.push(`/user/${userId}`)}>{userInfo.username}</h1>
                }
            </div>
            <h1>{content}</h1>
        </div>
    )
}