import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import { UserInfo } from "../types";
import { useState } from "react";

interface NewLinkDisplayProps {
    setShowAddLink: (show: boolean) => void;
    setUserInfo: (userInfo: UserInfo) => void;
    uid: string;
}

export default function NewLinkDisplay({ setShowAddLink, setUserInfo, uid }: NewLinkDisplayProps) {
    const [urlText, setUrlText] = useState<string>('');
    const [nameText, setNameText] = useState<string>('');

    const addLink = async () => {
        if (!urlText || !nameText) {
            return;
        }

        const newLink = {
            url: urlText,
            name: nameText,
        }

        try {
            const userDoc = await getDoc(doc(db, "users", uid));
            if (userDoc.exists()) {
                const userInfo = userDoc.data() as UserInfo;
                userInfo.links.push(newLink);
                await updateDoc(doc(db, "users", uid), {
                    links: userInfo.links,
                });
                setUserInfo(userInfo);
                setShowAddLink(false);
            }
        } catch (error) {
            console.error("Error adding link:", error);
        }
    }

    return (
        <div className="relative flex flex-col py-4 px-12 bg-bg_blue1 items-center text-center justify-center">
            <h1
                onClick={() => setShowAddLink(false)}
                className="absolute top-2 right-2 flex rounded-full text-md w-4 h-4 bg-red-500 hover:bg-red-400 justify-center items-center"
            >
                X
            </h1>
            <h1 className="text-center mb-6">Add a New Link</h1>
            <div className="flex flex-row w-full items-center mb-4">
                <label className="w-1/3 text-left pr-2" htmlFor="url">URL</label>
                <input
                    className="text-black w-2/3 h-8 p-2 border rounded focus:outline-none focus:ring focus:ring-bg_teal2"
                    type="text"
                    name="url"
                    id="url"
                    onChange={(e) => setUrlText(e.target.value)}
                />
            </div>
            <div className="flex flex-row w-full items-center">
                <label className="w-1/3 text-left pr-2" htmlFor="name">Name</label>
                <input
                    className="text-black w-2/3 h-8 p-2 border rounded focus:outline-none focus:ring focus:ring-bg_teal2"
                    type="text"
                    name="location"
                    id="location"
                    onChange={(e) => setNameText(e.target.value)}
                />
            </div>
            <button onClick={addLink}>Add Link</button>
        </div>
    )
}