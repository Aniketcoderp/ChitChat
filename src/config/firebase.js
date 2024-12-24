// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore,doc, setDoc } from "firebase/firestore"; 
import { getAuth,createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut  } from "firebase/auth";
import { toast } from "react-toastify";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCKvr1SJWezqcU19Y2uur_1TWfqDvYPoMI",
  authDomain: "chitchat-c5e6c.firebaseapp.com",
  projectId: "chitchat-c5e6c",
  storageBucket: "chitchat-c5e6c.firebasestorage.app",
  messagingSenderId: "153777966648",
  appId: "1:153777966648:web:06f685028681e744d3e0cd"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth=getAuth(app);
const db=getFirestore(app);

const signup=async(username,email,password)=>{
    try{
        const res=await createUserWithEmailAndPassword(auth,email,password)
        const user=res.user
        await setDoc(doc(db,'user',user.uid),{
            id:user.uid,
            username:username.toLowerCase(),
            email,
            name:'',
            avatar:'',
            bio:'Hey, There i am using ChitChat',
            lastSeen:new Date(),
        })
        await setDoc(doc(db,'chats',user.uid),{
            chatsData:[]
        })
    }catch(error){
        console.error(error)
        toast.error(error.code.split('/')[1].split('-').join(' '))
    }
}

const login=async(email,password)=>{
    try{
        await signInWithEmailAndPassword(auth,email,password)

    }catch(error){
        console.error(error)
        toast.error(error.code.split('/')[1].split('-').join(' '))
    }
}
const logout=async()=>{
    try{
        await signOut(auth)
    }catch(error){
        console.error(error)
        toast.error(error.code.split('/')[1].split('-').join(' '))
    }
}
export {signup,login,logout,auth,db}