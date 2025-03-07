import './addUser.css'
import { db } from '../../../../lib/firebase'
import { query, collection, where, getDocs, setDoc, serverTimestamp, doc, updateDoc, arrayUnion } from 'firebase/firestore'
import { useEffect, useRef, useState } from 'react'
import { useUserStore } from "../../../../lib/userStore"


const AddUser = () => {

    const [user, setUser] = useState(null)
    const hasRun = useRef(false);

    useEffect(() => {
        if (currentUser && !hasRun.current) {
            hasRun.current = true;
            handleAdd();
        }
    }, []);

    const { currentUser } = useUserStore()
    console.log(currentUser.matchedWith)

    const handleSearch = async e => {
        e.preventDefault()
        const formData = new FormData(e.target)
        const username = formData.get("username")

        try {
            const userRef = collection(db, "users");

            const q = query(userRef, where("username", "==", username));

            const querySnapShot = await getDocs(q)

            if (!querySnapShot.empty) {
                setUser(querySnapShot.docs[0].data())
            }
        } catch (err) {
            console.log(err)
        }
    }


    const handleAdd = async () => {

        const chatRef = collection(db, "chats")
        const userChatsRef = collection(db, "userchats")

        try {
            const newChatRef = doc(chatRef)

            await setDoc(newChatRef, {
                ceatedAt: serverTimestamp(),
                messages: []
            })

            await updateDoc(doc(userChatsRef, currentUser.matchedWith), {
                chats: arrayUnion({
                    chatId: newChatRef.id,
                    lastMessage: "",
                    receiverId: currentUser.id,
                    updatedAt: Date.now()
                })
            })
            await updateDoc(doc(userChatsRef, currentUser.id), {
                chats: arrayUnion({
                    chatId: newChatRef.id,
                    lastMessage: "",
                    receiverId: currentUser.matchedWith,
                    updatedAt: Date.now()
                })
            })

        } catch (err) {
            console.log(err)
        }
    }

    return (
        <div className="addUser">
            <form onSubmit={handleSearch}>
                <input type="text" placeholder='Username' name='username' />
                <button>Search</button>
            </form>
            {user && <div className="user">
                <div className="detail">
                    <img src="./avatar.png" alt="" />
                    <span>{user.username}</span>
                </div>
            </div>}
            <button onClick={handleAdd}>Add User</button>
        </div>
    )
}

export default AddUser