/* eslint-disable @next/next/no-img-element */
"use client"

import { arrayUnion, doc, getDoc, updateDoc } from "firebase/firestore";
import { use, useEffect, useState } from "react";
import { db } from "../../../../firebaseConfig";
import { comment, Song } from "@/app/types";
import AudioPlayer from 'react-h5-audio-player';
import { useAuth } from "@/app/lib/AuthContext";
import SongComment from "@/app/components/SongComment";

export default function Song({ params }: { params: { sid: string } }) {
    const { user } = useAuth();
    const { sid } = use(params);

    const [songData, setSongData] = useState<Song[]>([]);
    const [newComment, setNewComment] = useState<string>();
    const [comments, setComments] = useState<comment[]>([]);

    useEffect(() => {
        async function getSongInfo() {
            try {
                const audioDoc = await getDoc(doc(db, "audioFiles", sid));
                if (audioDoc.exists()) {
                    setSongData(audioDoc.data() as Song)
                    setComments(audioDoc.data().comments || []);
                }
            } catch (error) {
                console.log('error fetching song', error)
            }
        }

        getSongInfo();
    }, [sid])

    const submitComment = async () => {
        if (!newComment || newComment.trim() === '') return;

        const date = new Date();
        const userId = user.uid;
        const commentData: comment = {
            userId,
            content: newComment,
            date: date.toISOString()
        }

        console.log(commentData);

        try {
            const audioRef = doc(db, 'audioFiles', sid);
            await updateDoc(audioRef, {
                comments: arrayUnion(commentData)
            })
            console.log('comment submitted');

            setComments([...comments, commentData]);
            setNewComment('');

        } catch (error) {
            console.log('error adding comment', error)
        }
    }

    if (!songData) {
        return <div>Loading...</div>
    }

    return (
        <div className="p-8">
            <div className="bg-bg_blue1/100 rounded-xl flex flex-col w-3/4 m-auto">
                <div className="relative flex flex-row justify-between p-8 overflow-hidden rounded-t-xl">
                    <div
                        className="absolute top-0 left-0 right-0 bottom-0"
                        style={{
                            backgroundImage: `url(${songData.imageUrl})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            filter: 'blur(35px)',
                            zIndex: -1,
                            borderTopLeftRadius: '1rem',
                            borderTopRightRadius: '1rem',
                        }}
                    ></div>
                    <div className="flex flex-col text-2xl gap-4 z-10">
                        <h1 className="bg-black/50 p-2 w-max font-semibold">{songData.title}</h1>
                        <h2 className="bg-black/50 p-2 w-max">{songData.uploadedBy}</h2>
                    </div>
                    <div className="z-10">
                        <img src={songData.imageUrl} className="w-72 rounded shadow-xl" alt="album cover" />
                    </div>
                </div>

                <div>
                    <AudioPlayer
                        src={songData.audioUrl}
                        showJumpControls={false}
                        layout="horizontal"
                        customAdditionalControls={[]}
                        showDownloadProgress={false}
                    />
                </div>

                <div className="bg-bg_blue2 p-2">
                    {comments.map((comment, idx) => {
                        return (
                            <div key={idx}>
                                <div className="my-2 text-lg">
                                    <SongComment
                                        content={comment.content}
                                        userId={comment.userId}
                                    />
                                </div>
                            </div>
                        )
                    })}
                    {
                        user &&
                        <div className='flex flex-row items-center gap-2'>
                            <input
                                type='text'
                                placeholder='Add Some Feedback'
                                defaultValue={newComment} onChange={(e) => setNewComment(e.target.value)}
                                className='text-white bg-bg_blue1 w-screen rounded-xl py-2 px-4 h-8'
                            />
                            <button
                                className='px-2 py-1 bg-bg_teal1 text-white hover:bg-bg_teal2 hover:text-black transition 250 ease-in-out rounded-xl'
                                onClick={submitComment}
                            >
                                Post
                            </button>
                        </div>
                    }
                </div>
            </div>
        </div>
    )
}