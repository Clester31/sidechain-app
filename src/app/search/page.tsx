"use client"

import { useState } from "react";
import { Song } from "../types";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import SongBox from "../components/SongBox";

export default function Search() {
    const [searchTerm, setSearchTerm] = useState<string>();
    const [searchedSongs, setSearchedSongs] = useState<Song[]>([]);

    const fetchSearchedSongs = async () => {
        try {
            const audioFileRef = collection(db, "audioFiles");
            const q = query(audioFileRef, where("tags", "array-contains", searchTerm));
            const querySnapshot = await getDocs(q);
            const songs: Song[] = [];

            querySnapshot.forEach((doc) => {
                songs.push({ id: doc.id, ...doc.data() } as Song);
            })

            setSearchedSongs(songs);
        } catch (error) {
            console.log('error fetching songs:', error);
        }
    }

    return (
        <div className="flex flex-col justify-center items-center">
            <div className="p-8 flex flex-col w-screen justify-center m-auto items-center">
                <form className="flex justify-center w-full" onSubmit={(e) => {
                    e.preventDefault();
                    if (searchTerm) {
                        fetchSearchedSongs();
                    }
                }}>
                    <input
                        placeholder="Search for Tags"
                        type="text"
                        className="flex rounded-3xl w-1/2 h-12 text-lg bg-bg_blue2 border-2 border-bg_teal1 hover:border-bg_teal2 transition 250 px-8 py-2 text-center"
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </form>
                <div className="song-listing flex flex-col w-3/5">
                    {
                        searchedSongs.length > 0 &&
                        searchedSongs.map((song) => {
                            return (
                                <SongBox key={song.id} song={song} />
                            )
                        })
                    }
                </div>

            </div>
        </div>
    )
}