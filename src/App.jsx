import { createBrowserRouter, RouterProvider } from "react-router-dom";
import RootLayout from "./components/Layout/RootLayout";

import Home from "./pages/Home";
import Discover from "./pages/Discover";
import Library from "./pages/Library";
import Profile from "./pages/Profile";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import AnimeDetail from "./pages/AnimeDetail";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "discover",
        element: <Discover />,
      },
      {
        path: "library",
        element: <Library />,
      },
      {
        path: "profile",
        element: <Profile />,
      },
      {
        path: "anime/:animeId",
        element: <AnimeDetail />,
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
