import {
    doc,
    getFirestore,
    setDoc,
} from "firebase/firestore";

const db = getFirestore();

export const saveUser = async (userId, user) => {
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, user, { merge: true })
}