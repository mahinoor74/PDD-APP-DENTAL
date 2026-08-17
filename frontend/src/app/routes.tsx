import { createBrowserRouter } from "react-router";
import SplashScreen from "./components/SplashScreen";
import AuthScreen from "./components/AuthScreen";
import DemographicsScreen from "./components/DemographicsScreen";
import LanguageScreen from "./components/LanguageScreen";
import CohortScreen from "./components/CohortScreen";
import AssessmentScreen from "./components/AssessmentScreen";
import PrescriptionScreen from "./components/PrescriptionScreen";
import SuccessScreen from "./components/SuccessScreen";
import DashboardScreen from "./components/DashboardScreen";
import ChatbotScreen from "./components/ChatbotScreen";
import ProfileScreen from "./components/ProfileScreen";
import SignUp from "./components/SignUp";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: SplashScreen,
  },
  {
    path: "/auth",
    Component: AuthScreen,
  },
  {
    path: "/signup",
    Component: SignUp,
  },
  {
    path: "/demographics",
    Component: DemographicsScreen,
  },
  {
    path: "/language",
    Component: LanguageScreen,
  },
  {
    path: "/cohort",
    Component: CohortScreen,
  },
  {
    path: "/assessment",
    Component: AssessmentScreen,
  },
  {
    path: "/prescription",
    Component: PrescriptionScreen,
  },
  {
    path: "/success",
    Component: SuccessScreen,
  },
  {
    path: "/dashboard",
    Component: DashboardScreen,
  },
  {
    path: "/chatbot",
    Component: ChatbotScreen,
  },
  {
    path: "/profile",
    Component: ProfileScreen,
  },
]);
