/* eslint-disable @next/next/no-img-element */
"use client"


import { useState, useRef, ChangeEvent } from "react";
import { storage, db } from '../../../firebaseConfig'
import { uploadBytes, ref, getDownloadURL } from "@firebase/storage";
import { addDoc, updateDoc, arrayUnion, doc, collection, getDoc } from "firebase/firestore";
import { useAuth } from "../lib/AuthContext";

export default function Upload() {
    const [audioURL, setAudioURL] = useState<string | null>(null);
    const [imageURL, setImageURL] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const audioRef = useRef(null);
    const { user } = useAuth();

    const [songTitle, setSongTitle] = useState<string>("");
    const [songDesc, setSongDesc] = useState<string>("");
    const [songTags, setSongTags] = useState<string>("");

    const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setSelectedFile(event.target.files[0]);
        }
    };

    const handleImageSelect = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setSelectedImage(event.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile || !user) return;

        try {
            setIsUploading(true);
            const storageRef = ref(storage, `audio/${selectedFile.name}`);
            await uploadBytes(storageRef, selectedFile);
            const url = await getDownloadURL(storageRef);
            setAudioURL(url);

            const imageStorageRef = ref(storage, `songCovers/${selectedImage.name}`);
            await uploadBytes(imageStorageRef, selectedImage);
            const imgUrl = await getDownloadURL(imageStorageRef);
            setImageURL(imgUrl);

            const splitTags = songTags.split(',').map(tag => tag.trim());

            const userDoc = await getDoc(doc(db, "users", user.uid));

            const songData = {
                title: songTitle,
                description: songDesc,
                audioUrl: url,
                imageUrl: imgUrl,
                uploadedBy: userDoc.data()?.username,
                uploaderId: user?.uid,
                uploadDate: new Date(),
                tags: splitTags,
                comments: [],
                likes: 0,
                resposts: 0,
            };

            const audioFileRef = await addDoc(collection(db, "audioFiles"), songData);
            
            await updateDoc(doc(db, "users", user?.uid), {
                songs: arrayUnion({
                    ...songData,
                    id: audioFileRef.id
                }),
                allContent: arrayUnion({
                    ...songData,
                    id: audioFileRef.id
                })
            });

        } catch (error) {
            console.error("Error uploading file:", error);
        } finally {
            setIsUploading(false);
        }
    }

    return (
        <div className="flex flex-col justify-center items-center h-screen">
            <div className="login-container flex flex-col w-1/2 items-center bg-slate-800 py-4 rounded-xl text-lg px-8 gap-4">
                <label htmlFor="songFile">File</label>
                <input
                    name="songFile"
                    type="file"
                    accept="audio/*"
                    disabled={isUploading}
                    onChange={handleFileSelect}
                />
                <label htmlFor="songCover">Song Cover</label>
                <input
                    name="songCover"
                    type="file"
                    accept="image/jpeg"
                    disabled={isUploading}
                    onChange={handleImageSelect}
                />
                

                <label htmlFor="songTitle">Title</label>
                <input className="text-black" name="songTitle" type="text" onChange={(e) => setSongTitle(e.target.value)} />
                <label htmlFor="songTitle">Description</label>
                <input className="text-black" name="songDesc" type="text" onChange={(e) => setSongDesc(e.target.value)} />
                <label htmlFor="songTags">Tags (separate with comma)</label>
                <input className="text-black" name="songTags" type="text" onChange={(e) => setSongTags(e.target.value)} />

                <button
                    onClick={handleUpload}
                    disabled={!selectedFile || !songTitle || !songDesc || isUploading}
                >
                    Upload
                </button>

                {isUploading && <p>Uploading...</p>}

                {audioURL && (
                    <div>
                        <audio ref={audioRef} controls>
                            <source src={audioURL} type="audio/mpeg" />
                            Your browser does not support the audio element.
                        </audio>
                    </div>
                )}
            </div>
        </div>
    )
}