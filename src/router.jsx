import { createBrowserRouter } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import AllSongsView from "./Pages/AllSongsView";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <AllSongsView /> },
      { path: '/playlists', element: '' },
      { path: '/favorites', element: '' },
    ],
  },
]);

export default router;