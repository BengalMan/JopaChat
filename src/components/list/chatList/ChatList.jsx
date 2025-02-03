import { useEffect, useState } from 'react';
import './chatList.css';
import AddUser from './addUser/AddUser';
import { useUserStore } from "../../../lib/userStore";
import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useChatStore } from '../../../lib/chatStore';

const ChatList = () => {
    const [chats, setChats] = useState([]);
    const [addMode, setAddMode] = useState(false);
    const { currentUser } = useUserStore();
    const { changeChat } = useChatStore();

    useEffect(() => {
        if (!currentUser || !currentUser.id) return; // Ensure currentUser is available

        const userChatsRef = doc(db, "userchats", currentUser.id);

        const unSub = onSnapshot(userChatsRef, async (res) => {
            if (!res.exists()) return; // Prevent errors if userchats doc doesn't exist

            const items = res.data().chats || [];

            const promises = items.map(async (item) => {
                const userDocRef = doc(db, "users", item.receiverId);
                const userDocSnap = await getDoc(userDocRef);

                if (!userDocSnap.exists()) return null; // Handle missing user docs

                const user = userDocSnap.data();
                return { ...item, user };
            });

            const chatData = (await Promise.all(promises)).filter(Boolean);

            setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt));
        });

        return () => unSub();
    }, [currentUser]);

    const handleSelect = async (chat) => {
        if (!currentUser) return;

        const userChats = chats.map(item => {
            const { user, ...rest } = item;
            return rest;
        });

        const chatIndex = userChats.findIndex(item => item.chatId === chat.chatId);
        if (chatIndex === -1) return;

        userChats[chatIndex].isSeen = true;

        const userChatsRef = doc(db, "userchats", currentUser.id);

        try {
            await updateDoc(userChatsRef, { chats: userChats });
            changeChat(chat.chatId, chat.user);
        } catch (err) {
            console.log(err);
        }
    };

    if (!currentUser) {
        return <div className="loading">Loading chats...</div>; // Prevent errors during initial load
    }

    return (
        <div className="chatList">
            <div className="search">
                <div className="searchBar">
                    <img src="/search.png" alt="" />
                    <input type="text" placeholder='Search' />
                </div>
                <img
                    src={addMode ? './minus.png' : './plus.png'}
                    alt="" className='add'
                    onClick={() => setAddMode((prev) => !prev)}
                />
            </div>
            {chats.map((chat) => (
                <div className="item" key={chat.chatId} onClick={() => handleSelect(chat)}
                    style={{
                        backgroundColor: chat?.isSeen ? "transparent" : "#5183fe",
                    }}
                >
                    <img src="./avatar.png" alt="" />
                    <div className="texts">
                        <span>{chat.user?.username || "Unknown User"}</span>
                        <p>{chat.lastMessage}</p>
                    </div>
                </div>
            ))}
            {addMode && <AddUser />}
        </div>
    );
};

export default ChatList;
