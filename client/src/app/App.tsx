import AppRouter from './Router';
import { AuthProvider } from '../stores/AuthProvider';
const App = () => {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
};

export default App;
