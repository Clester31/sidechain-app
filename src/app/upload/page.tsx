/* eslint-disable @next/next/no-img-element */
"use client"


import { useState, useRef, ChangeEvent } from "react";
import { storage, db } from '../../../firebaseConfig'
import { uploadBytes, ref, getDownloadURL } from "@firebase/storage";
import { addDoc, updateDoc, arrayUnion, doc, collection, getDoc } from "firebase/firestore";
import { useAuth } from "../lib/AuthContext";
import { v4 as uuidv4 } from 'uuid'

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
            const storageRef = ref(storage, `audioFiles/${selectedFile.name}`);
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

            const audioFileRef = await addDoc(collection(db, "audioFiles"), {
                ...songData,
                id: ""
            });

            // Update the document with the generated id
            await updateDoc(audioFileRef, { id: audioFileRef.id });

            await updateDoc(doc(db, "users", user?.uid), {
                songs: arrayUnion(audioFileRef.id),
                allContent: arrayUnion(audioFileRef.id),
            });

        } catch (error) {
            console.error("Error uploading file:", error);
        } finally {
            setIsUploading(false);
        }
    }

    return (
        <div className="flex flex-row justify-center items-center h-screen gap-32">
            {/* Image Upload Component */}
            <div className="relative w-96 h-96 border-2 border-white rounded-md flex justify-center items-center overflow-hidden hover:border-bg_teal2 transition 250 ease-in-out">
                {!selectedImage ? (
                    <label
                        htmlFor="songCover"
                        className="cursor-pointer text-white text-center hover:text-bg_teal2 transition 250 ease-in-out"
                    >
                        Click to upload your song cover
                        <input
                            id="songCover"
                            name="songCover"
                            type="file"
                            accept="image/jpeg"
                            disabled={isUploading}
                            className="hidden"
                            onChange={handleImageSelect}
                        />
                    </label>
                ) : (
                    <div className="relative w-full h-full">
                        <img
                            src={URL.createObjectURL(selectedImage)}
                            alt="Preview"
                            className="w-full h-full object-cover"
                        />
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute top-2 right-2 w-8 h-8 font-bold bg-red-600 hover:bg-red-500 text-white rounded-full px-2 py-1 text-xs"
                        >
                            X
                        </button>
                    </div>
                )}
            </div>

            {/* Form Inputs */}
            <div className="flex flex-col gap-8 mt-6 w-96">
                <input
                    className="text-black p-2 rounded"
                    name="songTitle"
                    type="text"
                    placeholder="Song Title"
                    onChange={(e) => setSongTitle(e.target.value)}
                />
                <input
                    className="text-black p-2 rounded"
                    name="songDesc"
                    type="text"
                    placeholder="Song Description"
                    onChange={(e) => setSongDesc(e.target.value)}
                />
                <input
                    className="text-black p-2 rounded"
                    name="songTags"
                    type="text"
                    placeholder="Tags (comma-separated, max: 5)"
                    onChange={(e) => setSongTags(e.target.value)}
                />
                <div>
                    <label
                        htmlFor="songFile"
                        className="flex cursor-pointer text-white justify-center px-4 py-2 rounded hover:border-bg_teal2 transition 250 rounded bg-bg_blue1 border-2 border-bg_teal1 hover:border-bg_teal2"
                    >
                        Select Audio File
                    </label>
                    <input
                        id="songFile"
                        name="songFile"
                        type="file"
                        accept="audio/*"
                        disabled={isUploading}
                        className="hidden" 
                        onChange={handleFileSelect}
                    />
                    {selectedFile && (
                        <p className="mt-2 text-sm text-gray-400">
                            Selected: {selectedFile.name}
                        </p>
                    )}
                </div>
                <button
                    onClick={handleUpload}
                    disabled={!selectedFile || !songTitle || !songDesc || isUploading}
                    className="flex cursor-pointer bg-bg_teal1 text-white justify-center px-4 py-2 rounded hover:bg-bg_teal2 transition 250 hover:text-black"
                >
                    {isUploading ? "Uploading..." : "Upload"}
                </button>
            </div>
        </div>
    );
}