import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import App from './App.jsx'
import Login from './components/login/Login.jsx'
import { auth } from './lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import "./index.css"
import LoginScreen, { loginScreenAction } from './components/login/LoginScreen.jsx';

const AuthGuard = ({ children }) => {
  // const [isAuthenticated, setIsAuthenticated] = React.useState(null);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // setIsAuthenticated(!!user);
    });

    return () => unsubscribe();
  }, []);

  // if (isAuthenticated === null) return <div className="loading">Loading...</div>;

  // return isAuthenticated ? children : <Navigate to="/login" />;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/login",
    element: <LoginScreen />,
    action: loginScreenAction,
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
