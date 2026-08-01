import React from 'react';
import useTheme from '../../Hooks/useTheme';

const Header = () => {
  const { isDarkOn, toggle } = useTheme();

  return (
    <>
      <div className='w-full h-20 max-w-450 bg-red-500 m-auto'>
        <div
          onClick={() => {
            toggle();
          }}
          className={`w-12 max-lg:w-10 max-sm:w-8 h-12 max-lg:h-10 max-sm:h-8 flex justify-center items-center ${isDarkOn ? "bg-custom-gray-6 hover:bg-custom-gray-4" : "bg-white-100 hover:bg-white-600"} transition-all duration-100 cursor-pointer rounded-full`}
        >
          {/* <img
            src={isDarkOn ? moonIcon : sunIcon}
            alt="themeIcon"
            className="w-6.75 dark:w-6 max-lg:w-6 dark:max-lg:w-5 max-sm:w-5 dark:max-sm:w-4 h-6.75 dark:h-6 max-lg:h-6 dark:max-lg:h-5 max-sm:h-5 dark:max-sm:h-4"
          /> */}
        </div>
      </div>
    </>
  )
}

export default Header;