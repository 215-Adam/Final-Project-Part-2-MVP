import { AuthProvider } from './AuthContext';
import { ExerciseProvider } from './ExerciseContext';
import { WorkoutProvider } from './WorkoutContext';

/** AuthContext wraps everything so any route can check who is logged in. */
function AppProviders({ children }) {
  return (
    <AuthProvider>
      <ExerciseProvider>
        <WorkoutProvider>{children}</WorkoutProvider>
      </ExerciseProvider>
    </AuthProvider>
  );
}

export default AppProviders;
