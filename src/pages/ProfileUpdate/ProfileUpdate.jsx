import React, { useEffect, useState } from "react";
import'./ProfileUpdate.css'
import assets from "../../assets/assets";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../config/firebase";
import { Await, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import { useContext } from "react";
import { AppContext } from "../../Context/AppContext";

const ProfileUpdate=()=>{
    const navigate=useNavigate()
    const [image,setImage]=useState(false)
    const [name,setName]=useState("")
    const [bio,setBio]=useState('')
    const [uid,setUid]=useState('')
    const [prevImage,setPrevImage]=useState('')
    const {setUserData}=useContext(AppContext)

    const profileUpdate=async(e)=>{
        e.preventDefault()
        try{
            if(!prevImage && !image){
                toast.error('upload Profile Successfully')
        }
        const docRef=doc(db,'user',uid)
        let imgUrl = prevImage;     
        if(image){
            imgUrl = URL.createObjectURL(image);
            setPrevImage(imgUrl)
        await updateDoc(docRef,{
            avatar:imgUrl,
            bio:bio,
            name:name
        })}
        else{
            await updateDoc(docRef,{
                bio:bio,
                name:name
            })
        }
        const snap=await getDoc(docRef)
        setUserData(snap.data())
        navigate('/chat')
    }catch(error){
        console.error(error)
       toast.error(error.message) 
        }
    }

    useEffect(()=>{
        onAuthStateChanged(auth,async(user)=>{
            if (user){
                setUid(user.uid)
                const docRef=doc(db,'user',user.uid)
                const docSnap= await getDoc(docRef)
                if(docSnap.data().name){
                    setName(docSnap.data().name)
                }
                if(docSnap.data().bio){
                    setBio(docSnap.data().bio)
                }
                if(docSnap.data().avatar){
                    setPrevImage(docSnap.data().avatar)
                }
            }
            else{
                navigate('/')
            }
        })
    })

    return(
        <>
        <div className="profile">
            <div className="profile-container">
                <form onSubmit={profileUpdate}>
                    <h3>Profile Details</h3>
                    <label htmlFor="avatar">
                        <input onChange={(e)=>setImage(e.target.files[0])} type="file" id="avatar" accept=".png,.jpg,.jpeg" hidden/>
                        <img src={
                image
                  ? URL.createObjectURL(image)
                  : prevImage
                  ? prevImage
                  : assets.avatar_icon
              } alt="" />
                        upload profile image
                    </label>
                    <input onChange={(e)=>setName(e.target.value)} value={name} type="text" placeholder="your name" required/>
                    <textarea onChange={(e)=>setBio(e.target.bio)} value={bio} type="" placeholder="Write profile bio" ></textarea>
                    <button type="submit">Save</button>

                </form>
                <img className='profile-pic' src={image?URL.createObjectURL(image):prevImage?prevImage : assets.chitchat} alt="" />
            </div>
        </div>

        </>
    )
}

export default ProfileUpdate