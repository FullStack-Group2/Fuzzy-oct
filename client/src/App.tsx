import React, { useState } from 'react';
import { Login, LoggedInUser } from './app/auth/Login';
import { RegistrationFlow, RegisteredUser } from './app/auth/sign-up/RegistrationFlow';
import { PasswordResetFlow } from './app/auth/PasswordResetFlow';

type AuthView = 'login' | 'register' | 'forgot-password';
type User = LoggedInUser | RegisteredUser | null;

function App() {
  const [currentView, setCurrentView] = useState<AuthView>('login');
  const [user, setUser] = useState<User>(null);

  const handleLoginSuccess = (loggedInUser: LoggedInUser) => {
    setUser(loggedInUser);
    console.log('User logged in:', loggedInUser);
  };

  const handleRegistrationSuccess = (registeredUser: RegisteredUser) => {
    setUser(registeredUser);
    console.log('User registered:', registeredUser);
  };

  const switchToRegister = () => {
    setCurrentView('register');
  };

  const switchToLogin = () => {
    setCurrentView('login');
  };

  const switchToForgotPassword = () => {
    setCurrentView('forgot-password');
  };

  const handleForgotPasswordSuccess = () => {
    // Redirect to login after successful password reset
    setCurrentView('login');
  };

  // If user is logged in, show a simple dashboard
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Welcome to Fuzzy!
          </h1>
          <p className="text-gray-600 mb-6">
            You have successfully logged in.
          </p>
          <button
            onClick={() => setUser(null)}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  // Show login or registration based on current view
  if (currentView === 'login') {
    return (
      <Login
        onLoginSuccess={handleLoginSuccess}
        onSwitchToRegister={switchToRegister}
        onForgotPassword={switchToForgotPassword}
      />
    );
  }

  if (currentView === 'forgot-password') {
    return (
      <PasswordResetFlow
        onPasswordResetComplete={handleForgotPasswordSuccess}
        onBackToLogin={switchToLogin}
      />
    );
  }

  return (
    <RegistrationFlow
      onRegistrationSuccess={handleRegistrationSuccess}
      onSwitchToLogin={switchToLogin}
    />
  );
}

export default App;
