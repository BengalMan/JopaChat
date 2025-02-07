import { useEffect, useRef, useState } from 'react'
import './chat.css'
import EmojiPicker from 'emoji-picker-react'
import { arrayUnion, collection, deleteDoc, deleteField, doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore'
import { auth, db } from "../../lib/firebase"
import { useChatStore } from '../../lib/chatStore'
import { useUserStore } from '../../lib/userStore'
import { useNavigate } from 'react-router'
import Report from '../waiting/Report'

const Chat = () => {
    const [chat, setChat] = useState();
    const [text, setText] = useState("");
    const [messageCount, setMessageCount] = useState(0);
    const navigate = useNavigate();
    const endRef = useRef(null);

    const { currentUser } = useUserStore();
    const { chatId, setChatId, user, changeChat } = useChatStore();

    useEffect(() => {
        const fetchMatchedChat = async () => {
            if (!currentUser) return;

            try {
                const userRef = doc(db, "users", currentUser.id);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    const matchedWith = userSnap.data().matchedWith;

                    if (matchedWith) {
                        const matchedChatId = matchedWith < currentUser.id ? `${matchedWith}_${currentUser.id}` : `${currentUser.id}_${matchedWith}`;
                        setChatId(matchedChatId);

                        const matchedUserRef = doc(db, "users", matchedWith);
                        const matchedUserSnap = await getDoc(matchedUserRef);

                        if (matchedUserSnap.exists()) {
                            changeChat(matchedChatId, matchedUserSnap.data(), currentUser);
                        }
                    }
                }
            } catch (err) {
                console.error("Error fetching matched chat:", err);
            }
        };

        fetchMatchedChat();
    }, [currentUser, setChatId, changeChat]);

    useEffect(() => {
        if (!chatId) return;
        const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
            setChat(res.data());

            // Pronalazimo koliko je trenutni korisnik već poslao poruka
            const userMessages = res.data()?.messages?.filter(msg => msg.senderId === currentUser.id) || [];
            setMessageCount(userMessages.length);
        });
        return () => unSub();
    }, [chatId]);

    const handleSend = async () => {
        if (text === "" || messageCount >= 5) return; // Sprečavamo slanje ako je dostignut limit

        try {
            await updateDoc(doc(db, "chats", chatId), {
                messages: arrayUnion({
                    senderId: currentUser.id,
                    text,
                    createdAt: new Date(),
                })
            });
            setMessageCount(prev => prev + 1);
            setText("");
        } catch (err) {
            console.log(err);
        }
    };

    const handleLogout = () => {
        auth.signOut();
        navigate("/login");
    };

    const handleSkip = async () => {
        console.log(user.matchedWith)
        console.log(currentUser.matchedWith)

        const userRef = collection(db, "users")
        const chatsRef = doc(db, "chats", chatId);


        try {
            deleteDoc(chatsRef)
            await updateDoc(doc(userRef, currentUser.id), {
                matchedWith: ""
            })
            await updateDoc(doc(userRef, currentUser.matchedWith), {
                matchedWith: ""
            })
        } catch (err) {
            console.log(err)
        }
    }

    return (
        <div className="chat">
            <div className="top">
                <div className="user">
                    <Report />
                    <button onClick={handleSkip}>Skip</button>
                    <div className="texts">
                        <span>{user?.username || "Unknown"}</span>
                        <p>Mozes poslat jos {5 - messageCount} poruka.</p>
                    </div>
                </div>
                <div className="icons">
                    <button className='Logout' onClick={handleLogout}>Logout</button>
                </div>
            </div>
            <div className="center">
                {chat?.messages?.map((message, index) => (
                    <div className={message.senderId === currentUser?.id ? "message own" : "message"} key={index}>
                        <div className="texts">
                            <p>{message.text}</p>
                        </div>
                    </div>
                ))}
                <div ref={endRef}></div>
            </div>
            <div className="bottom">
                <input type="text"
                    value={text}
                    placeholder='Type a message...'
                    onChange={e => setText(e.target.value)}
                    disabled={messageCount == 6}
                    minLength={20}
                />
                <button
                    className='sendButton'
                    onClick={handleSend}
                    disabled={messageCount > 5}
                >
                    Send
                </button>
            </div>
        </div>
    );
};

export default Chat;
