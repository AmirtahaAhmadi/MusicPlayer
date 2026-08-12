import { useEffect, useRef, useState } from 'react';
import { Transition } from '@headlessui/react';
import { CaretDown, Pause, Play, SkipBack, SkipForward, SpeakerHigh, SpeakerX } from '@phosphor-icons/react';
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
  const isPlayerExpanded = useMusicStore((state) => state.isPlayerExpanded);
  const setPlayerExpanded = useMusicStore((state) => state.setPlayerExpanded);

  const audioRef = useRef(null);
  const previousVolumeRef = useRef(volume > 0 ? volume : 1);
  const currentTrack = tracks.find((t) => t.id === currentTrackId);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const isMuted = volume === 0;

  useEffect(() => {
    if (volume > 0) previousVolumeRef.current = volume;
  }, [volume]);

  const toggleMute = () => {
    if (isMuted) {
      setVolume(previousVolumeRef.current || 1);
    } else {
      previousVolumeRef.current = volume;
      setVolume(0);
    }
  };

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

  useEffect(() => {
    if (isPlayerExpanded) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isPlayerExpanded]);

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
    <>
      {/* Mini bar — tap anywhere on it (except the interactive controls) to expand */}
      <div
        onClick={() => setPlayerExpanded(true)}
        className="fixed bottom-0 left-0 right-0 bg-custom-black-2 text-custom-white-1 p-2 px-5 flex flex-col gap-1 overflow-hidden cursor-pointer"
      >
        <div className="flex items-center gap-2 text-xs" onClick={(e) => e.stopPropagation()}>
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

          <div className='flex items-center gap-3' onClick={(e) => e.stopPropagation()}>
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
              <button
                onClick={toggleMute}
                className="text-custom-red-3 transition-all duration-75 cursor-pointer hover:text-custom-red-4"
              >
                {isMuted ? <SpeakerX size={20} /> : <SpeakerHigh size={20} />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                disabled={isMuted}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className={`flex-1 cursor-pointer accent-custom-red-3 ${isMuted ? 'opacity-40 cursor-not-allowed' : ''}`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Full-screen player — slides up from the bottom, collapses back on chevron tap */}
      <Transition
        show={isPlayerExpanded}
        as="div"
        className="fixed inset-0 z-40 bg-custom-black-2 text-custom-white-1 flex flex-col p-6"
        enter="transition-transform duration-300 ease-out"
        enterFrom="translate-y-full"
        enterTo="translate-y-0"
        leave="transition-transform duration-250 ease-in"
        leaveFrom="translate-y-0"
        leaveTo="translate-y-full"
      >
        <div className="flex-1 flex flex-col items-center justify-center gap-8 max-w-md w-full mx-auto">
          <div className="relative w-full max-w-xs aspect-square mx-auto">
            <button
              onClick={() => setPlayerExpanded(false)}
              className="p-2 absolute top-2 left-2 text-custom-red-3 transition-all duration-75 cursor-pointer rounded-full z-10 hover:text-custom-red-4"
              aria-label="Collapse player"
            >
              <CaretDown size={24} />
            </button>

            <div
              className="absolute inset-0 rounded-full bg-black shadow-[0px_0px_24px_0px_#3D3D3D] animate-[spin_9s_linear_infinite]"
              style={{ animationPlayState: isPlaying ? 'running' : 'paused' }}
            >
              <div className="absolute inset-[6%] rounded-full border border-white/10" />
              <div className="absolute inset-[13%] rounded-full border border-white/10" />
              <div className="absolute inset-[20%] rounded-full border border-white/10" />
              <div className="absolute inset-[27%] rounded-full border border-white/10" />

              <div className="absolute inset-[25%] rounded-full overflow-hidden shadow-inner">
                <img
                  src={currentTrack.coverUrl || musicImg}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="absolute top-1/2 left-1/2 w-[3%] aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full bg-custom-black-2" />
            </div>
          </div>

          <div className="flex flex-col items-center gap-1 w-full min-w-0">
            <span className="text-xl font-semibold truncate max-w-full">{currentTrack.title}</span>
            <span className="text-custom-white-1/70 truncate max-w-full">{currentTrack.artist}</span>
          </div>

          <div className="w-full flex flex-col gap-1">
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
              className="w-full cursor-pointer accent-custom-red-3"
            />
            <div className="flex justify-between text-xs">
              <span className="tabular-nums">{formatTime(currentTime)}</span>
              <span className="tabular-nums">{formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={prevTrack} className="text-custom-red-3 transition-all duration-75 cursor-pointer hover:text-custom-red-4">
              <SkipBack size={28} weight="fill" />
            </button>

            <button
              onClick={togglePlay}
              className="w-16 h-16 pt-px pr-px flex justify-center items-center bg-custom-red-3 text-white shadow-[0px_0px_8px_0px_#3D3D3D] transition-all duration-75 cursor-pointer rounded-full hover:bg-custom-red-4"
            >
              {isPlaying ? <Pause size={28} /> : <Play size={28} />}
            </button>

            <button onClick={nextTrack} className="text-custom-red-3 transition-all duration-75 cursor-pointer hover:text-custom-red-4">
              <SkipForward size={28} weight="fill" />
            </button>
          </div>

          <div className="w-full flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="text-custom-red-3 transition-all duration-75 cursor-pointer hover:text-custom-red-4"
            >
              {isMuted ? <SpeakerX size={20} /> : <SpeakerHigh size={20} />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              disabled={isMuted}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className={`flex-1 cursor-pointer accent-custom-red-3 ${isMuted ? 'opacity-40 cursor-not-allowed' : ''}`}
            />
          </div>
        </div>
      </Transition>

      <audio
        ref={audioRef}
        src={currentTrack.url}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={nextTrack}
      />
    </>
  );
};

export default Player;