/* eslint-disable @next/next/no-img-element */
import AudioPlayer from 'react-h5-audio-player';
import { useAuth } from '../lib/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import { arrayRemove, arrayUnion, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import { Song } from '../types';

export default function SongBox({ song }: { song: Song }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState<boolean>(false);
  const [reposted, setReposted] = useState<boolean>(false);
  const [likesCount, setLikesCount] = useState(0);
  const [repostCount, setRepostCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    async function updateUserInteractions() {
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);

      const userLikes = userDoc.data().likes || [];
      if (userLikes.some(likedSong => likedSong.path === song.path)) {
        setLiked(true);
      }

      const userReposts = userDoc.data().reposts || [];
      if (userReposts.some(repostedSong => repostedSong.path === song.path)) {
        setReposted(true);
      }

      setLikesCount(song.likes);
      setRepostCount(song.reposts);
    }

    updateUserInteractions();
  }, [song.path, user.uid, song.likes, song.reposts, song.tags])

  const updateLikes = async () => {
    try {
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userLikes = userDoc.data().likes || [];
        if (!userLikes.some(likedSong => likedSong.path === song.path)) {
          await updateDoc(userRef, {
            likes: arrayUnion(song),
          });
          setLiked(true);
        } else {
          await updateDoc(userRef, {
            likes: arrayRemove(song),
          });
          setLiked(false);
        }
      } else {
        console.log('cant find userDoc')
      }
    } catch (error) {
      console.error("Error updating likes:", error);
    }
  }

  const updateReposts = async () => {
    try {
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userReposts = userDoc.data().reposts || [];
        if (!userReposts.some(repostedSong => repostedSong.path === song.path)) {
          await updateDoc(userRef, {
            reposts: arrayUnion(song),
            allContent: arrayUnion(song),
          });
          setReposted(true);
        } else {
          await updateDoc(userRef, {
            reposts: arrayRemove(song),
            allContent: arrayRemove(song),
          });
          setReposted(false);
        }
      }

    } catch (error) {
      console.log('error reposting song', error);
    }
  }

  return (
    <div>
      <div className="flex flex-row bg-bg_blue1 py-2 my-4 rounded-xl items-center justify-center px-8" key={song.path}>
        <div className="w-1/5">
          <img className="rounded object-cover w-[128px] h-[128px]" src={song.imageUrl} alt="album cover" />
        </div>
        <div className="w-4/5 flex flex-col justify-center gap-1">
          <h1 className="text-3xl font-semibold">{song.title}</h1>
          <a onClick={() => router.push(`/user/${song.uploaderId}`)} className='text-gray-400 hover:text-white cursor-pointer'>{song.uploadedBy}</a>
          {/* <audio controls src={song.url} /> */}
          <AudioPlayer
            src={song.audioUrl}
            showJumpControls={false}
            layout="horizontal"
            customAdditionalControls={[]}
            customVolumeControls={[]}
            showDownloadProgress={false}
          />
          <div className='flex flex-row gap-4 mt-2 items-center'>
            <button
              className='flex items-center px-4 py-2 bg-bg_blue2 rounded hover:text-bg_teal1 transition 250 ease-in-out'
              onClick={updateLikes}
            >
              <i className={`fa-solid fa-heart text-xl ${liked ? 'text-bg_teal2' : 'text-white'} hover:text-bg_teal1 transition 0 ease-in-out`}></i>
            </button>
            <h1>{likesCount}</h1>
            <button
              className={`flex items-center px-4 py-2 bg-bg_blue2 rounded hover:text-bg_teal1 transition 250 ease-in-out`}
              onClick={updateReposts}
            >
              <i className={`fa-solid fa-retweet text-xl ${reposted ? 'text-bg_teal2' : 'text-white'} hover:text-bg_teal1 transition 0 ease-in-out`}></i>
            </button>
            <h1>{repostCount}</h1>
            {
              song.tags &&
              <div className='flex flex-row gap-2 ml-4'>
                {song.tags.map((tag, idx) => {
                  console.log(tag);
                  return (
                    <h1 key={idx} className='px-2 py-1 bg-bg_blue2 rounded-lg'>{tag}</h1>
                  )
                })}
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  )
}