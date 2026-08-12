import { Outlet } from "react-router-dom";
import Header from "../Components/common/Header";
import PermissionModal from '../Components/AllSongsView/PermissionModal';
import { useEffect } from "react";
import { useMusicStore } from "../Store/useMusicStore";

const MainLayout = () => {
  useEffect(() => {
    useMusicStore.getState().initAccess()
  }, [])

  return (
    <>
      <Header />
      <PermissionModal />
      <Outlet />
    </>
  );
};

export default MainLayout;