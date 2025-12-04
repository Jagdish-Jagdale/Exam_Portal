import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import UserRoute from "./routes/UserRoute.jsx";
import UserDashboard from "./pages/UserDashboard.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import DashboardHome from "./pages/user/DashboardHome.jsx";
import AboutExam from "./pages/user/AboutExam.jsx";
import ImportantDates from "./pages/user/ImportantDates.jsx";
import Notes from "./pages/user/Notes.jsx";
import OldPapers from "./pages/user/OldPapers.jsx";
import SamplePapers from "./pages/user/SamplePapers.jsx";
import ProfileCard from "./components/User/ProfileCard.jsx";
import AdminDashboard from "./pages/admin/Dashboard.jsx";
import AdminAboutExamPage from "./pages/admin/AboutExamPage.jsx";
import AdminImportantDatesPage from "./pages/admin/ImportantDatesPage.jsx";
import AdminNotesPage from "./pages/admin/AdminNotesPage.jsx";
import AdminOldPapersPage from "./pages/admin/AdminOldPapersPage.jsx";
import AdminPaperQuestionsPage from "./pages/admin/AdminPaperQuestionsPage.jsx";
import AdminSamplePapersPage from "./pages/admin/AdminSamplePapersPage.jsx";
import Banners from "./pages/admin/Banners.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route element={<UserRoute />}>
            <Route path="/dashboard" element={<UserDashboard />}>
              <Route index element={<DashboardHome />} />
              <Route path="about-exam" element={<AboutExam />} />
              <Route path="important-dates" element={<ImportantDates />} />
              <Route path="notes" element={<Notes />} />
              <Route path="old-papers" element={<OldPapers />} />
              <Route path="sample-papers" element={<SamplePapers />} />
              <Route path="profile" element={<ProfileCard />} />
            </Route>
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<App />}>
              <Route index element={<AdminDashboard />} />
              <Route path="about-exams" element={<AdminAboutExamPage />} />
              <Route
                path="important-dates"
                element={<AdminImportantDatesPage />}
              />
              <Route path="banners" element={<Banners />} />
              <Route path="notes" element={<AdminNotesPage />} />
              <Route path="old-papers" element={<AdminOldPapersPage />} />
              <Route
                path="old-papers/:paperId/questions"
                element={<AdminPaperQuestionsPage />}
              />
              <Route path="sample-papers" element={<AdminSamplePapersPage />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
