/* eslint-disable @next/next/no-img-element */
"use client"

import { collection, getDoc, getDocs } from "firebase/firestore";
import { useState } from "react";
import { doc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { useAuth } from "./lib/AuthContext";
import { useEffect } from "react";
import { useRouter } from 'next/navigation'
import { Song } from "./types";
import 'react-h5-audio-player/lib/styles.css';
import SongBox from "./components/SongBox";

export default function Home() {

  const { user } = useAuth() as { user: { uid: string } | null };
  const [username, setUsername] = useState<string>("");
  const [shuffle, setShuffle] = useState<Song[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchUsername = async () => {
      if (user) {
        const uid = user.uid;
        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists()) {
          setUsername(userDoc.data().username);
        }
      }
    };
 
    const fetchShuffle = async () => {
      try {
        const audioCollection = collection(db, "audioFiles");
        const audioSnapshot = await getDocs(audioCollection);

        const songs: Song[] = audioSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Song[];

        setShuffle(songs);
      } catch (error) {
        console.error("Error fetching songs:", error);
      }
    }

    fetchUsername();
    fetchShuffle();

  }, [user, shuffle]);

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="p-8 flex flex-col w-screen justify-center m-auto items-center">
        {
          !user ?
            <div className="flex flex-col gap-4 text-center">
              <h1 className="font-semibold text-3xl">Join Sidechain Today</h1>
              <p className="text-lg">Start getting valuable feedback</p>
              <button className="bg-bg_teal1 text-white px-4 py-2 rounded hover:bg-bg_teal2 hover:text-black transition 250 ease-in-out" onClick={() => router.push("/login")}>
                Sign In
              </button>
            </div>
            :
            <h1 className="text-2xl text-center">Hello, {username}</h1>
        }
        <div className="song-listing flex flex-col w-3/5">
          {shuffle.map((song) => (
            <SongBox key={song.id} songId={song.id} />
          ))}
        </div>
      </div>
    </div>
  )
}