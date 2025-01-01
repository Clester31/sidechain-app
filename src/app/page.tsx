"use client"

import { getDoc } from "firebase/firestore";
import { useState } from "react";
import { doc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { useAuth } from "./lib/AuthContext";
import { useEffect } from "react";
import { logOut } from "../../auth";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const [username, setUsername] = useState("");

  useEffect(() => {
    const fetchUsername = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUsername(userDoc.data().username);
        }
      }
    };
    fetchUsername();
  }, [user]);

  return (
    <div>
      <div>
        {
          !user ?
            <h1>Welcome</h1>
            :
            <h1>Hello, {username}</h1>
        }
      </div>
      {
        user ?
        <button onClick={logOut} className="bg-red-500 p-2 rounded-xl">Log Out</button>
        :
        <button onClick={() => router.push('/login')} className="bg-green-500 p-2 rounded-xl">Log In/Sign Up</button>
      }
    </div>
  )
}