import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { isAuthenticated, getUser } from "./utils/auth";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MotherDashboard from "./pages/MotherDashboard";
import WorkerDashboard from "./pages/WorkerDashboard";
import MotherProfile from "./pages/MotherProfile";
import MyChildren from "./pages/MyChildren";
import ChildProfile from "./pages/ChildProfile";
import Visits from "./pages/Visits";
import Vaccinations from "./pages/Vaccinations";
import RecordVisit from "./pages/RecordVisit";
import RecordVaccination from "./pages/RecordVaccination";
import RegisterChild from "./pages/RegisterChild";
import MyPatients from "./pages/MyPatients";
import PatientDetails from "./pages/PatientDetails";
import WorkerAppointments from "./pages/WorkerAppointments";
import AppointmentDetails from "./pages/AppointmentDetails";
import SearchRecords from "./pages/SearchRecords";
import "./App.css";
import EditMotherProfile from "./pages/EditMotherProfile";
import PregnancyTips from "./pages/PregnancyTips";

// Protected Route Component
const ProtectedRoute = ({
  children,
  allowedRoles,
}: {
  children: JSX.Element;
  allowedRoles?: string[];
}) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles) {
    const user = getUser();
    if (!allowedRoles.includes(user?.role)) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

// Public Route Component (redirect if authenticated)
const PublicRoute = ({ children }: { children: JSX.Element }) => {
  if (isAuthenticated()) {
    const user = getUser();
    if (user?.role === "mother") {
      return <Navigate to="/mother-dashboard" replace />;
    } else if (user?.role === "health_worker") {
      return <Navigate to="/worker-dashboard" replace />;
    }
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        {/* Mother Routes */}
        <Route
          path="/mother-dashboard"
          element={
            <ProtectedRoute allowedRoles={["mother"]}>
              <MotherDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-profile"
          element={
            <ProtectedRoute allowedRoles={["mother"]}>
              <MotherProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-children"
          element={
            <ProtectedRoute allowedRoles={["mother"]}>
              <MyChildren />
            </ProtectedRoute>
          }
        />
        <Route
          path="/child/:id"
          element={
            <ProtectedRoute allowedRoles={["mother"]}>
              <ChildProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-appointments"
          element={
            <ProtectedRoute allowedRoles={["mother"]}>
              <Visits />
            </ProtectedRoute>
          }
        />

        <Route
          path="/visit/:id"
          element={
            <ProtectedRoute allowedRoles={["health_worker"]}>
              <AppointmentDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/pregnancy-tips"
          element={
            <ProtectedRoute allowedRoles={["mother"]}>
              <PregnancyTips />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vaccinations"
          element={
            <ProtectedRoute allowedRoles={["mother"]}>
              <Vaccinations />
            </ProtectedRoute>
          }
        />

        {/* Health Worker Routes */}
        <Route
          path="/worker-dashboard"
          element={
            <ProtectedRoute allowedRoles={["health_worker"]}>
              <WorkerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-profile/:id"
          element={
            <ProtectedRoute allowedRoles={["health_worker"]}>
              <EditMotherProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/record-visit"
          element={
            <ProtectedRoute allowedRoles={["health_worker"]}>
              <RecordVisit />
            </ProtectedRoute>
          }
        />
        <Route
          path="/record-vaccination"
          element={
            <ProtectedRoute allowedRoles={["health_worker"]}>
              <RecordVaccination />
            </ProtectedRoute>
          }
        />
        <Route
          path="/register-child"
          element={
            <ProtectedRoute allowedRoles={["health_worker"]}>
              <RegisterChild />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-patients"
          element={
            <ProtectedRoute allowedRoles={["health_worker"]}>
              <MyPatients />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/:id"
          element={
            <ProtectedRoute allowedRoles={["health_worker"]}>
              <PatientDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/appointments"
          element={
            <ProtectedRoute allowedRoles={["health_worker"]}>
              <WorkerAppointments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/appointment/:id"
          element={
            <ProtectedRoute allowedRoles={["health_worker"]}>
              <AppointmentDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/search-records"
          element={
            <ProtectedRoute allowedRoles={["health_worker"]}>
              <SearchRecords />
            </ProtectedRoute>
          }
        />

        {/* Default Route */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* 404 Route */}
        <Route
          path="*"
          element={
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                <p className="text-gray-600 mb-4">Page not found</p>
                <a href="/" className="text-blue-600 hover:text-blue-700">
                  Go Home
                </a>
              </div>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
