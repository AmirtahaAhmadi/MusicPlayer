import { createBrowserRouter } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import HomePage from "./Pages/HomePage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { path: "/", element: <HomePage /> },
    ],
  },
]);

export default router;