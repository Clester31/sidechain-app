"use client"

import { useEffect, useState } from "react"
import { useAuth } from "../lib/AuthContext"
import { db } from "../../../firebaseConfig";
import { doc, updateDoc } from "firebase/firestore";
import { getDoc } from "firebase/firestore";

export default function Settings() {
    const { user } = useAuth();
    const [currentUsername, setCurrentUsername] = useState<string>();
    const [newUsername, setNewUsername] = useState<string>();

    useEffect(() => {
        const fetchUsername = async () => {
            if (user) {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    setCurrentUsername(userDoc.data().username);
                }
            }
        };
        fetchUsername();
    }, [user]);

    const changeUsername = async () => {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, { username: newUsername });
        setCurrentUsername(newUsername); 
        setNewUsername(""); 
        setEditUsername(false); 
    }

    const [editUsername, setEditUsername] = useState<boolean>(false)
    return (
        <div className="flex flex-col justify-center items-center h-screen">
            <div className="login-container flex flex-col w-1/2 items-center bg-slate-800 py-4 rounded-xl text-lg px-8">
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
        </div>
    )
}