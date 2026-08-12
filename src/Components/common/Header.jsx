import React from 'react';
import useTheme from '../../Hooks/useTheme';
import { MoonIcon, SunIcon } from '@phosphor-icons/react';

const Header = () => {
  // const { isDarkOn, toggle } = useTheme();

  return (
    <>
      <div className='w-full h-15 bg-custom-black-2'>
        <div className='w-full h-full max-w-450 px-5 flex justify-center items-center text-custom-white-1 m-auto'>
          {/* <div
            onClick={() => {
              toggle();
            }}
            className={`w-12 max-lg:w-10 max-sm:w-8 h-12 max-lg:h-10 max-sm:h-8 flex justify-center items-center ${isDarkOn ? "bg-custom-black-4 hover:bg-custom-gray-4" : "bg-white hover:bg-white-600"} transition-all duration-100 cursor-pointer rounded-full`}
          >
            {isDarkOn ? <MoonIcon size={25} className='text-white' /> : <SunIcon size={25} className='text-custom-black-1' />}
            <img
            src={isDarkOn ? moonIcon : sunIcon}
            alt="themeIcon"
            className="w-6.75 dark:w-6 max-lg:w-6 dark:max-lg:w-5 max-sm:w-5 dark:max-sm:w-4 h-6.75 dark:h-6 max-lg:h-6 dark:max-lg:h-5 max-sm:h-5 dark:max-sm:h-4"
            />
          </div> */}

          <div className='max-[500px]:w-full h-full flex max-[500px]:justify-center items-center gap-3'>
            <div className='h-10.5 max-[400px]:h-10 px-4 pb-0.5 max-[400px]:pb-0 flex justify-center items-center bg-custom-black-3 text-[16px] max-[400px]:text-[14px] max-[350px]:text-[13px] border-[1.6px] border-custom-red-1 transition-all duration-100 cursor-pointer rounded-xl hover:border-custom-red-2 hover:bg-custom-black-4'>All Songs</div>
            <div className='h-10.5 max-[400px]:h-10 px-4 pb-0.5 max-[400px]:pb-0 flex justify-center items-center bg-custom-black-3 text-[16px] max-[400px]:text-[14px] max-[350px]:text-[13px] border-[1.6px] border-custom-red-1 transition-all duration-100 cursor-pointer rounded-xl hover:border-custom-red-2 hover:bg-custom-black-4'>Playlists</div>
            <div className='h-10.5 max-[400px]:h-10 px-4 pb-0.5 max-[400px]:pb-0 flex justify-center items-center bg-custom-black-3 text-[16px] max-[400px]:text-[14px] max-[350px]:text-[13px] border-[1.6px] border-custom-red-1 transition-all duration-100 cursor-pointer rounded-xl hover:border-custom-red-2 hover:bg-custom-black-4'>Favorites</div>
          </div>
          <div></div>
        </div>
      </div>
    </>
  )
}

export default Header;