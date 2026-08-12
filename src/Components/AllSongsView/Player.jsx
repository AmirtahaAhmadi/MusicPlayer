// components/Player.jsx
import { useEffect, useRef, useState } from 'react';
import { Pause, Play, SkipBack, SkipForward, SpeakerHigh } from '@phosphor-icons/react';
import { useMusicStore } from '../../Store/useMusicStore';
import musicImg from '/Images/MusicImg.jpg';

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const Player = () => {
  const tracks = useMusicStore((state) => state.tracks);
  const currentTrackId = useMusicStore((state) => state.currentTrackId);
  const isPlaying = useMusicStore((state) => state.isPlaying);
  const volume = useMusicStore((state) => state.volume);
  const togglePlay = useMusicStore((state) => state.togglePlay);
  const nextTrack = useMusicStore((state) => state.nextTrack);
  const prevTrack = useMusicStore((state) => state.prevTrack);
  const setVolume = useMusicStore((state) => state.setVolume);

  const audioRef = useRef(null);
  const currentTrack = tracks.find((t) => t.id === currentTrackId);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);

  useEffect(() => {
    if (audioRef.current && currentTrack) {
      audioRef.current.play();
    }
    setCurrentTime(0);
    setDuration(0);
  }, [currentTrackId]);

  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const handleTimeUpdate = () => {
    if (!isSeeking && audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeekChange = (e) => {
    setCurrentTime(parseFloat(e.target.value));
  };

  const handleSeekCommit = (e) => {
    const newTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
    setIsSeeking(false);
  };

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-custom-black-2 text-custom-white-1 p-2 px-5 flex flex-col gap-1 overflow-hidden">
      <div className="flex items-center gap-2 text-xs">
        <span className="text-right tabular-nums">{formatTime(currentTime)}</span>
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={currentTime}
          onMouseDown={() => setIsSeeking(true)}
          onTouchStart={() => setIsSeeking(true)}
          onChange={handleSeekChange}
          onMouseUp={handleSeekCommit}
          onTouchEnd={handleSeekCommit}
          className="flex-1 cursor-pointer accent-custom-red-3"
        />
        <span className="tabular-nums">{formatTime(duration)}</span>
      </div>

      <div className="w-full flex justify-between items-center">
        <div className='flex items-center gap-3'>
          <img src={currentTrack.coverUrl || musicImg} alt="" className="w-15 h-15 shadow-sm rounded-xl" />
          <div className="flex flex-col flex-1 min-w-0">
            <span className="truncate">{currentTrack.title}</span>
            <span className="text-sm truncate">{currentTrack.artist}</span>
          </div>
        </div>

        <div className='flex items-center gap-3'>
          <button onClick={prevTrack} className="text-custom-red-3 transition-all duration-75 cursor-pointer hover:text-custom-red-4">
            <SkipBack size={20} weight="fill" />
          </button>

          <button
            onClick={togglePlay}
            className="w-10 h-10 flex justify-center items-center bg-custom-red-3 text-white shadow-[0px_0px_8px_0px_#3D3D3D] transition-all duration-75 cursor-pointer rounded-full hover:bg-custom-red-4"
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>

          <button onClick={nextTrack} className="text-custom-red-3 transition-all duration-75 cursor-pointer hover:text-custom-red-4">
            <SkipForward size={20} weight="fill" />
          </button>

          <div className="flex items-center gap-1">
            <button className="text-custom-red-3 transition-all duration-75 cursor-pointer hover:text-custom-red-4">
              <SpeakerHigh size={20} />
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="flex-1 cursor-pointer accent-custom-red-3"
            />
          </div>
        </div>
      </div>

      <audio
        ref={audioRef}
        src={currentTrack.url}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={nextTrack}
      />
    </div>
  );
};

export default Player;