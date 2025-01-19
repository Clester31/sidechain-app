/* eslint-disable @next/next/no-img-element */
import AudioPlayer from 'react-h5-audio-player';
import { useAuth } from '../lib/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import { arrayRemove, arrayUnion, doc, getDoc, increment, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import { comment, Song } from '../types';
import SongComment from './SongComment';

export default function SongBox({ songId }: { songId: string }) {
  const { user } = useAuth() as { user: { uid: string } | null };
  const [song, setSong] = useState<Song>();
  const [liked, setLiked] = useState<boolean>(false);
  const [reposted, setReposted] = useState<boolean>(false);
  const [likesCount, setLikesCount] = useState(0);
  const [repostCount, setRepostCount] = useState(0);
  const [comments, setComments] = useState<comment[]>([]);
  const [newComment, setNewComment] = useState<string>();

  const router = useRouter();

  useEffect(() => {
    async function fetchSongData() {
      const audioRef = doc(db, "audioFiles", songId);
      const audioDoc = await getDoc(audioRef);
      const audioData = audioDoc.data();

      if (audioData) {
        setSong(audioData as Song);
        setComments(audioData.comments || []);
        setLikesCount(audioData.likes || 0);
        setRepostCount(audioData.reposts || 0);
      }
    }

    async function updateUserInteractions() {
      if (!user) return;
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();

      if (userData) {
        const userLikes = userData.likes || [];
        setLiked(userLikes.includes(songId));

        const userReposts = userData.reposts || [];
        setReposted(userReposts.includes(songId));
      }
    }

    fetchSongData();

    if (user) {
      updateUserInteractions();
    }
  }, [songId, user])

  const updateLikes = async () => {
    if (!user || !song) return;

    try {
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);

      const audioRef = doc(db, 'audioFiles', song.id);

      if (userDoc.exists()) {
        const userLikes = userDoc.data().likes || [];
        if (!userLikes.includes(song.id)) {
          // like
          setLikesCount(prev => prev + 1);
          await updateDoc(userRef, {
            likes: arrayUnion(song.id),
          });
          await updateDoc(audioRef, {
            likes: increment(1)
          })
          setLiked(true);
        } else {
          // unlike
          setLikesCount(prev => prev - 1);
          await updateDoc(userRef, {
            likes: arrayRemove(song.id),
          });
          await updateDoc(audioRef, {
            likes: increment(-1)
          })
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
    if (!user || !song) return;

    try {
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);

      const audioRef = doc(db, 'audioFiles', song.id);

      if (userDoc.exists()) {
        const userReposts = userDoc.data().reposts || [];
        if (!userReposts.includes(song.id)) {
          setRepostCount(prev => prev + 1);
          await updateDoc(userRef, {
            reposts: arrayUnion(song.id),
            allContent: arrayUnion(song.id),
          });
          await updateDoc(audioRef, {
            reposts: increment(1)
          })
          setReposted(true);
        } else {
          setRepostCount(prev => prev - 1);
          await updateDoc(userRef, {
            reposts: arrayRemove(song.id),
            allContent: arrayRemove(song.id),
          });
          await updateDoc(audioRef, {
            reposts: increment(-1)
          })
          setReposted(false);
        }
      }

    } catch (error) {
      console.log('error reposting song', error);
    }
  }

  const submitComment = async () => {
    if (!newComment || newComment.trim() === '' || !user || !song) return;

    const date = new Date().toISOString();
    const userId = user.uid;
    const commentData: comment = {
      userId,
      content: newComment,
      date: date
    }

    console.log(commentData);

    try {
      const audioRef = doc(db, 'audioFiles', song.id);
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

  return (
    <div className="flex flex-col my-4">
      {
        song &&
        <div>
          <div
            className="flex flex-row bg-bg_blue1 py-2 rounded-t-xl items-center justify-center px-8"
          >
            <div className="w-1/5">
              <img
                className="rounded object-cover w-[128px] h-[128px]"
                src={song.imageUrl}
                alt="album cover"
              />
            </div>

            <div className="w-4/5 flex flex-col justify-center gap-1">
              <h1
                className="text-3xl font-semibold cursor-pointer hover:text-bg_teal2"
                onClick={() => router.push(`/song/${song.id}`)}
              >
                {song.title}
              </h1>
              <a
                onClick={() => router.push(`/user/${song.uploaderId}`)}
                className="text-gray-400 hover:text-white cursor-pointer"
              >
                {song.uploadedBy}
              </a>
              <AudioPlayer
                src={song.audioUrl}
                showJumpControls={false}
                layout="horizontal"
                customAdditionalControls={[]}
                showDownloadProgress={false}
              />

              <div className="flex flex-row gap-4 mt-2 items-center">
                <button
                  disabled={!user || user.uid === song.uploaderId}
                  className="flex items-center px-4 py-2 bg-bg_blue2 rounded hover:text-bg_teal1 transition 250 ease-in-out"
                  onClick={updateLikes}
                >
                  <i
                    className={`fa-solid fa-heart text-xl ${liked ? 'text-bg_teal2' : 'text-white'
                      } hover:text-bg_teal1 transition 0 ease-in-out`}
                  />
                </button>
                <h1>{likesCount}</h1>
                <button
                  disabled={!user || user.uid === song.uploaderId}
                  className="flex items-center px-4 py-2 bg-bg_blue2 rounded hover:text-bg_teal1 transition 250 ease-in-out"
                  onClick={updateReposts}
                >
                  <i
                    className={`fa-solid fa-retweet text-xl ${reposted ? 'text-bg_teal2' : 'text-white'
                      } hover:text-bg_teal1 transition 0 ease-in-out`}
                  />
                </button>
                <h1>{repostCount}</h1>
                {song.tags && (
                  <div className="flex flex-row gap-2 ml-4">
                    {song.tags.map((tag, idx) => {
                      return (
                        <h1
                          key={idx}
                          className="px-2 py-1 bg-bg_blue2 rounded-lg"
                        >
                          {tag}
                        </h1>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>

          </div>
          <div className="bg-bg_blue2 p-2 rounded-b-xl">
            <h1 className='font-semibold text-xl'>Feedback</h1>
            {
              comments.length > 0 ?
                <div className='my-2'>
                  <SongComment
                    content={comments[0].content}
                    userId={comments[0].userId}
                  />
                </div>
                :
                <p className='mx-8 my-2 text-gray-400'>No Comments</p>
            }
            <h1
              className='flex justify-center text-center my-1 hover:text-bg_teal2 cursor-pointer'
              onClick={() => router.push(`/song/${song.id}`)}
            >
              See More Comments
            </h1>
            {
              user &&
              <div className='flex flex-row items-center gap-2'>
                <input
                  type='text'
                  placeholder='Add Some Feedback'
                  defaultValue={newComment} onChange={(e) => setNewComment(e.target.value)}
                  value={newComment}
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
      }

    </div>
  )
}