import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { createContext, useEffect, useState } from "react";
import { auth, db } from "../config/firebase";
import { useNavigate } from "react-router-dom";

export const AppContext = createContext();

const AppContextProvider = (props) => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [chatData, setChatData] = useState(null);
    const [messagesId, setMessagesId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [chatUser, setChatUser] = useState(null);
    let lastSeenInterval = null;

    const loadUserData = async (uid) => {
        try {
            const userRef = doc(db, 'user', uid);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                console.error("User data not found.");
                return;
            }

            const userData = userSnap.data();
            setUserData(userData);

            if (userData.name) {
                navigate('/chat');
            } else {
                navigate('/profile');
            }

            // Update last seen initially
            await updateDoc(userRef, {
                lastSeen: Date.now(),
            });

            // Set interval to update lastSeen every 60 seconds
            if (!lastSeenInterval) {
                lastSeenInterval = setInterval(async () => {
                    if (auth.currentUser) {
                        try {
                            await updateDoc(userRef, {
                                lastSeen: Date.now(),
                            });
                        } catch (error) {
                            console.error("Error updating last seen:", error);
                        }
                    }
                }, 60000);
            }
        } catch (error) {
            console.error("Error loading user data:", error);
        }
    };

    useEffect(() => {
        if (!userData) return;

        const chatRef = doc(db, 'chats', userData.id);
        const unSub = onSnapshot(
            chatRef,
            async (snapshot) => {
                try {
                    const chatItems = snapshot.data()?.chatsData || [];
                    const tempData = await Promise.all(
                        chatItems.map(async (item) => {
                            const recipientId = item.rId || item.rid;
                            if (!recipientId) return null;

                            const userRef = doc(db, 'user', recipientId);
                            const userSnap = await getDoc(userRef);

                            if (userSnap.exists()) {
                                return { ...item, userData: userSnap.data() };
                            }
                            return null;
                        })
                    );

                    setChatData(tempData.filter(Boolean).sort((a, b) => b.updatedAt - a.updatedAt));
                } catch (error) {
                    console.error("Error loading chat data:", error);
                }
            },
            (error) => console.error("Snapshot listener failed:", error)
        );

        return () => {
            unSub(); // Cleanup snapshot listener
        };
    }, [userData]);

    useEffect(() => {
        return () => {
            if (lastSeenInterval) {
                clearInterval(lastSeenInterval); // Cleanup interval on unmount
            }
        };
    }, []);

    const value = {
        userData,
        setUserData,
        chatData,
        setChatData,
        loadUserData,
        messagesId,
        setMessagesId,
        messages,
        setMessages,
        chatUser,
        setChatUser,
    };

    console.log("chatUser:", chatUser);

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    );
};

export default AppContextProvider;
