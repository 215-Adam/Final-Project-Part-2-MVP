import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import CoachDashboardPage from './pages/CoachDashboardPage';
import ExerciseDetailPage from './pages/ExerciseDetailPage';
import ExerciseLibraryPage from './pages/ExerciseLibraryPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import MyWorkoutsPage from './pages/MyWorkoutsPage';
import NotFoundPage from './pages/NotFoundPage';
import RegisterPage from './pages/RegisterPage';
import WorkoutDetailPage from './pages/WorkoutDetailPage';

/** Route table. Providers and the Router live in main.jsx (see AppProviders). */
function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="exercises" element={<ExerciseLibraryPage />} />
        <Route path="exercises/:id" element={<ExerciseDetailPage />} />
        <Route
          path="workouts"
          element={
            <ProtectedRoute>
              <MyWorkoutsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="workouts/:id"
          element={
            <ProtectedRoute>
              <WorkoutDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="coach"
          element={
            <ProtectedRoute role="coach">
              <CoachDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
