/* eslint-disable @next/next/no-img-element */
"use client"

import { collection, getDoc, getDocs, query, where } from "firebase/firestore";
import { useState } from "react";
import { doc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { useAuth } from "./lib/AuthContext";
import { useEffect } from "react";

import { Song } from "./types";
import { getDownloadURL, getStorage, listAll, ref } from "@firebase/storage";
import 'react-h5-audio-player/lib/styles.css';
import SongBox from "./components/SongBox";

export default function Home() {

  const { user } = useAuth();
  const [username, setUsername] = useState<string>("");
  const [shuffle, setShuffle] = useState<Song[]>([]);

  useEffect(() => {
    const fetchUsername = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUsername(userDoc.data().username);
        }
      }
    };

    const fetchShuffle = async () => {
      try {
        const storage = getStorage();
        const audioRef = ref(storage, 'audio');
        const result = await listAll(audioRef);

        const songsData = await Promise.all(
          result.items.map(async (item) => {
            const url = await getDownloadURL(item);

            // Fetch metadata from Firestore
            const songsRef = collection(db, "audioFiles");
            const q = query(songsRef, where("audioUrl", "==", url));
            const querySnapshot = await getDocs(q);

            let metadata = {};
            let docId = '';
            if (!querySnapshot.empty) {
              metadata = querySnapshot.docs[0].data();
              docId = querySnapshot.docs[0].id; // Get the actual Firestore document ID
            }

            return {
              id: docId, // Use the actual Firestore document ID
              name: item.name,
              title: metadata.title || "null",
              audioUrl: url,
              path: item.fullPath,
              imageUrl: metadata.imageUrl || './profile.jpg',
              description: metadata.description || "null",
              uploadedBy: metadata.uploadedBy || "null",
              uploaderId: metadata.uploaderId || "null",
              uploadDate: metadata.uploadDate || "null",
              comments: metadata.comments || [],
              likes: metadata.likes || 0,
              reposts: metadata.reposts || 0,
              tags: metadata.tags || [],
            };
          })
        );

        setShuffle(songsData);
      } catch (error) {
        console.error("Error fetching songs:", error);
      }
    }

    fetchUsername();
    fetchShuffle();

  }, [user]);

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="p-8 flex flex-col w-screen justify-center m-auto items-center">
        {
          !user ?
            <div>
              <h1>Join Sidechain Today</h1>
              <p>Start getting valuable feedback</p>
            </div>
            :
            <h1 className="text-2xl text-center">Hello, {username}</h1>
        }
        <div className="song-listing flex flex-col w-3/5">
          {shuffle.map((song) => (
            <SongBox key={song.id} song={song} />
          ))}
        </div>
      </div>
    </div>
  )
}