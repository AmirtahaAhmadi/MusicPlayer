import React from 'react';
import { useMusicStore } from '../../Store/useMusicStore';
import { Pause, Play } from '@phosphor-icons/react';
import musicImg from '/Images/MusicImg.jpg';

const MusicLibrary = () => {
  const tracks = useMusicStore(state => state.tracks);
  const isLoading = useMusicStore(state => state.isLoading);
  const currentTrackId = useMusicStore(state => state.currentTrackId);
  const isPlaying = useMusicStore(state => state.isPlaying);
  const playTrack = useMusicStore(state => state.playTrack);

  if (isLoading) return <p className='w-full text-sm text-center text-custom-white-1'>Loading tracks...</p>

  if (tracks.length == 0) return <p className='w-full text-sm text-center text-custom-white-1'>No tracks found.</p>

  return (
    <>
      <div className='w-full flex justify-center items-center'>
        <ul className='w-150 max-[600px]:w-[98%] p-4 flex flex-col gap-1 text-custom-gray-1 mt-2'>
          {tracks.map((track) => {
            const isCurrent = track.id === currentTrackId;
            return (
              <li
                key={track.id}
                onClick={() => { playTrack(track.id) }}
                className={`w-full h-15 px-3 flex items-center gap-2 text-custom-white-1 shadow-[0px_0px_15px_0px_#3D3D3D] transition-all duration-100 cursor-pointer rounded-lg overflow-hidden ${isCurrent ? 'bg-custom-red-3' : 'bg-custom-black-4 hover:bg-custom-black-3'}`}
              >
                <div className={`w-11 h-11 flex shrink-0 justify-center items-center object-cover ${isCurrent && 'border border-custom-white-1'} rounded-xl`}>
                  {isCurrent ? (
                    <>
                      {isPlaying ? <span className='text-custom-white-1 text-sm'><Pause size={24} /></span> : <span className='text-custom-white-1 text-sm'><Play size={24} /></span>}
                    </>
                  ) : (
                    <img src={track.coverUrl || musicImg} alt="" className='w-full h-full rounded-xl' />
                  )}
                </div>
                <div className='w-[90%] max-[500px]:w-[80%] flex flex-col'>
                  <span className="w-full truncate text-[16px]">{track.title}</span>
                  <span className="w-full truncate text-[14px] text-custom-white-1/70">{track.artist}</span>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </>
  )
}

export default MusicLibrary;