import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import { useChatStore } from "../../lib/chatStore";

const Report = () => {
    const [matchedWith, setMatchedWith] = useState(null);
    const userId = localStorage.getItem("userId");
    const { user } = useChatStore();

    useEffect(() => {
        const fetchUserData = async () => {
            const userRef = doc(db, "users", userId);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                setMatchedWith(userSnap.data().matchedWith);
            }
        };

        fetchUserData();
    }, [userId]);

    const handleReport = async () => {
        if (!matchedWith || !user?.id) return;

        const userRef = doc(db, "users", matchedWith);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const userData = userSnap.data();
            const reports = userData.reports || 0;
            const reportedBy = userData.reportedBy || [];

            // Check if the current user has already reported
            if (reportedBy.includes(user.id)) {
                alert("Već ste prijavili ovog korisnika.");
                return;
            }

            await updateDoc(userRef, {
                reports: reports + 1,
                reportedBy: arrayUnion(user.id) // Add user to reportedBy array
            });

            alert("Korisnik je prijavljen.");
        }
    };

    return (
        <button
            onClick={handleReport}
            className="mt-4 w-48 py-2 px-4 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600"
        >
            Prijavi korisnika
        </button>
    );
};

export default Report;
