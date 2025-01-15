import { useEffect, useRef, useState } from "react";

export default function AudioPlayer({ src }) {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [duration, setDuration] = useState<number>(0);
    const [currentTime, setCurrentTime] = useState<number>(0);

    const handlePlay = () => {
        if(!isPlaying) {
            audioRef.current.play();
            setIsPlaying(true);
        } else {
            audioRef.current.pause();
            setIsPlaying(false);
        }
    };

    useEffect(() => {
        const audio = audioRef.current;
        const handleTimeUpdate = () => {
            setCurrentTime(audio.currentTime);
        }

        audio.addEventListener('timeupdate', handleTimeUpdate);

        return () => {
            audio.removeEventListener('timeUpdate', handleTimeUpdate);
        }
    }, [])

    return (
        <div>
            <audio ref={audioRef} src={src} onLoadedMetadata={(e) => setDuration(e.target.duration)} />
            <button onClick={handlePlay}>{isPlaying ? 'Pause' : 'Play'}</button>
            <progress value={currentTime} max={duration} />
        </div>
    )
}