import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { createContext, useEffect, useState } from "react";
import { auth, db } from "../config/firebase";
import { useNavigate } from "react-router-dom";

export const AppContext = createContext();

const AppContextProvider = (props) => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [chatData, setChatData] = useState(null);

    const loadUserData = async (uid) => {
        try {
            const userRef = doc(db, 'user', uid);
            const userSnap = await getDoc(userRef);
            const userData = userSnap.data();
            setUserData(userData);

            if (userData.name) {
                navigate('/chat');
            } else {
                navigate('/profile');
            }

            await updateDoc(userRef, {
                lastSeen: Date.now(),
            });

            setInterval(async () => {
                if (auth.currentUser) {
                    await updateDoc(userRef, {
                        lastSeen: Date.now(),
                    });
                }
            }, 60000);
        } catch (error) {
            console.error("Error loading user data:", error);
        }
    };

    useEffect(() => {
        if (userData) {
            const chatRef = doc(db, 'chats', userData.id);
            const unSub = onSnapshot(chatRef, async (res) => {
                try {
                    const chatItems = res.data()?.chatsData || [];
                    const tempData = [];

                    for (const item of chatItems) {
                        const recipientId = item.rId || item.rid;
                        if (!recipientId) {
                            console.warn("Missing rId or rid in chat item:", item); 
                            continue;
                        }

                        const userRef = doc(db, 'user', recipientId);
                        const userSnap = await getDoc(userRef);

                        if (userSnap.exists()) {
                            const userData = userSnap.data();
                            tempData.push({ ...item, userData });
                        } else {
                            console.warn("No user found for recipientId:", recipientId);
                        }
                    }

                    setChatData(tempData.sort((a, b) => b.updatedAt - a.updatedAt));
                } catch (error) {
                    console.error("Error loading chat data:", error);
                }
            });

            return () => {
                unSub();
            };
        }
    }, [userData]);

    const value = {
        userData,
        setUserData,
        chatData,
        setChatData,
        loadUserData,
    };

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    );
};

export default AppContextProvider;
