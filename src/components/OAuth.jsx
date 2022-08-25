import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config';
import toast from 'react-hot-toast';
import googleIcon from '../assets/svg/googleIcon.svg';
import axios from 'axios';
const OAuth = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const onGoogleClick = async () => {
    try {
      const auth = getAuth();
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // check for user
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      // if user does'nt exist then create user
      if (!docSnap.exists()) {
        const res = await axios.post(
          'http://localhost:5001/housemarketplace-9456a/us-central1/api/Create-stripe-account',
          {
            email: user.email,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        const accountId = await res.data.accountId;
        await setDoc(docRef, {
          name: user.displayName,
          email: user.email,
          accountId,
          timeStamp: serverTimestamp(),
        });
      }
      navigate('/profile');
    } catch (error) {
      toast.error('could not authorize with Google');
    }
  };
  return (
    <div className='socialLogin'>
      <p>Sign {location.pathname === '/sign-up' ? 'up' : 'in'} with</p>
      <button className='socialIconDiv' onClick={onGoogleClick}>
        <img src={googleIcon} className='socialIconImg' alt='google' />
      </button>
    </div>
  );
};

export default OAuth;
