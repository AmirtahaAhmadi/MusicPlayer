import React, { Fragment } from 'react';
import { Transition, Dialog } from '@headlessui/react';
import { useMusicStore } from '../../Store/useMusicStore';

const PermissionModal = () => {
  const requestAccess = useMusicStore(state => state.requestAccess);
  const denyAccess = useMusicStore(state => state.denyAccess);
  const reconfirmAccess = useMusicStore(state => state.reconfirmAccess);
  const hasAskedPermission = useMusicStore(state => state.hasAskedPermission);
  const permissionGranted = useMusicStore(state => state.permissionGranted);
  const needsReconfirm = useMusicStore(state => state.needsReconfirm);
  const storageError = useMusicStore(state => state.storageError);

  const isFirstRun = !hasAskedPermission && !permissionGranted;
  const isReconfirm = permissionGranted && needsReconfirm;
  const isHandleLost = permissionGranted && storageError === 'handle-lost';

  const show = isFirstRun || isReconfirm || isHandleLost;

  let title = 'Access Your Music';
  let description = 'Select the folder of musics';
  let primaryLabel = 'Choose Folder';
  let primaryAction = requestAccess;
  let showSecondary = true;

  if (isReconfirm) {
    title = 'Confirm Access Again';
    description = 'Your browser needs you to re-confirm access to your music folder. Nothing was deleted — just click below to continue.';
    primaryLabel = 'Confirm Access';
    primaryAction = reconfirmAccess;
    showSecondary = false;
  } else if (isHandleLost) {
    title = 'Reconnect Your Music Folder';
    description = "Your browser cleared its reference to the folder (this can happen after the browser data is cleared or the folder was moved). Your files are safe — just pick the folder again.";
    primaryLabel = 'Choose Folder';
    primaryAction = requestAccess;
    showSecondary = false;
  }

  return (
    <Transition appear show={show} as={Fragment}>
      <Dialog as="div" onClose={() => { }} className='relative z-50'>
        <Transition.Child
          as={Fragment}
          enter='ease-out duration-300'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='ease-in duration-200'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'
        >
          <div className='fixed inset-0 bg-black/50' />
        </Transition.Child>
        <div className='fixed inset-0 p-4 flex items-center justify-center'>
          <Transition.Child
            as={Fragment}
            enter='ease-out duration-300'
            enterFrom='opacity-0 scale-95'
            enterTo='opacity-100 scale-100'
            leave='ease-in duration-200'
            leaveFrom='opacity-100 scale-100'
            leaveTo='opacity-0 scale-95'
          >
            <Dialog.Panel className='w-full max-w-sm p-6 bg-white shadow-xl rounded-2xl'>
              <Dialog.Title className='text-lg font-semibold mb-2'>
                {title}
              </Dialog.Title>
              <Dialog.Description className='text-gray-600 text-sm mb-6'>
                {description}
              </Dialog.Description>

              <div className='flex gap-3'>
                {showSecondary && (
                  <button type="button" onClick={() => { denyAccess() }} className='p-1.5 px-2 pb-2 bg-custom-black-3 text-custom-white-1 transition-all duration-100 cursor-pointer rounded-xl hover:bg-custom-black-4'>Not Now</button>
                )}
                <button type="button" onClick={() => { primaryAction() }} className='p-1.5 px-2 pb-2 bg-custom-black-3 text-custom-white-1 transition-all duration-100 cursor-pointer rounded-xl hover:bg-custom-black-4'>{primaryLabel}</button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  )
}

export default PermissionModal;