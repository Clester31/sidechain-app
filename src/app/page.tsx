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
            if (!querySnapshot.empty) {
              metadata = querySnapshot.docs[0].data();
            }

            return {
              name: item.name,
              title: metadata.title || "null",
              url: url,
              path: item.fullPath,
              image: metadata.imageUrl || './profile.jpg',
              description: metadata.description || "null",
              uploadedBy: metadata.uploadedBy || "null",
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
      <div className="p-8 w-3/5 flex flex-col">
        {
          !user ?
            <div>
              <h1>Join Sidechain Today</h1>
              <p>Start getting valuable feedback</p>
            </div>
            :
            <h1 className="text-2xl text-center">Hello, {username}</h1>
        }
        <div className="song-listing flex flex-col">
          {shuffle.map((song) => (
            <div className="flex flex-row bg-bg_blue1 px-32 py-2 my-4 rounded-xl items-center justify-center gap-4" key={song.path}>
              <div>
                <img width={'128px'} height={'128px'} src={song.image} alt="album cover"/>
              </div>
              <div>
                <p>{song.title}</p>
                <p>{song.description}</p>
                <audio controls src={song.url} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}