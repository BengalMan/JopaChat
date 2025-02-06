import { useState, useEffect } from "react";
import Chat from "./components/chat/Chat";
import List from "./components/list/List";
import Login from "./components/login/Login";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./lib/firebase";
import { useUserStore } from "./lib/userStore";
import { useChatStore } from "./lib/chatStore";
import { useNavigate } from "react-router-dom";
import LoginScreen from "./components/login/LoginScreen";

const App = () => {
  const { currentUser, isLoading, fetchUserInfo } = useUserStore();
  const { chatId } = useChatStore();
  const navigate = useNavigate();
  const [checkingAuth, setCheckingAuth] = useState(true); // Track authentication check

  useEffect(() => {
    const unSub = onAuthStateChanged(auth, (user) => {
      fetchUserInfo(user?.uid);
      if (user) {
        navigate("/"); // Redirect to home after login
      }
      setCheckingAuth(false); // Done checking
    });

    return () => {
      unSub();
    };
  }, [fetchUserInfo, navigate]);

  if (isLoading || checkingAuth) return <div className="loading">Loading...</div>;

  return (
    <div className="containers">
      {currentUser ? (
        <>
          <List />
          {chatId && <Chat />}
        </>
      ) : (
        <div style={{ visibility: "hidden", position: "absolute" }}>
          <LoginScreen />
        </div>
      )}
    </div>
  );
};

export default App;
