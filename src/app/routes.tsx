import { createBrowserRouter } from "react-router";
import RootLayout from "./components/RootLayout";
import SplashPage from "./pages/SplashPage";
import Home from "./pages/Home";
import Activities from "./pages/Activities";
import Profile from "./pages/Profile";
import Store from "./pages/Store";
import CleanAndEarn from "./pages/CleanAndEarn";
import CategoryDetail from "./pages/CategoryDetail";
import PostItem from "./pages/PostItem";
import Chat from "./pages/Chat";
import ChooseLocation from "./pages/ChooseLocation";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import EditProfile from "./pages/EditProfile";
import NotFound from "./pages/NotFound";

let _router: ReturnType<typeof createBrowserRouter> | null = null;

export function getRouter() {
  if (!_router) {
    _router = createBrowserRouter([
      {
        path: "/",
        Component: RootLayout,
        children: [
          {
            index: true,
            Component: SplashPage,
          },
          {
            path: "login",
            Component: Login,
          },
          {
            path: "signup",
            Component: Signup,
          },
          {
            path: "home",
            Component: Home,
          },
          {
            path: "activities",
            Component: Activities,
          },
          {
            path: "clean-earn",
            Component: CleanAndEarn,
          },
          {
            path: "store",
            Component: Store,
          },
          {
            path: "profile",
            Component: Profile,
          },
          {
            path: "edit-profile",
            Component: EditProfile,
          },
          {
            path: "category/:categoryId",
            Component: CategoryDetail,
          },
          {
            path: "post-item/:categoryId",
            Component: PostItem,
          },
          {
            path: "chat/:chatId",
            Component: Chat,
          },
          {
            path: "choose-location",
            Component: ChooseLocation,
          },
          {
            path: "*",
            Component: NotFound,
          },
        ],
      },
    ]);
  }
  return _router;
}
