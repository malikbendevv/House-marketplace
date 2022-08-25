import React from 'react';
import { useState } from 'react';
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config';
import { Link, useNavigate } from 'react-router-dom';
import { ReactComponent as ArrowRightIcon } from '../assets/svg/keyboardArrowRightIcon.svg';
import visibilityIcon from '../assets/svg/visibilityIcon.svg';
import toast from 'react-hot-toast';
import OAuth from '../components/OAuth';
import axios from 'axios';
const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const { name, email, password } = formData;
  const navigate = useNavigate();

  // onChange
  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }));
  };
  // Register user
  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        'http://localhost:5001/housemarketplace-9456a/us-central1/api/Create-stripe-account',
        {
          email,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      const accountId = await res.data.accountId;
      if (!res.data.error) {
        const auth = getAuth();
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;
        updateProfile(auth.currentUser, {
          displayName: name,
        });
        const formDataCopy = { ...formData };
        delete formDataCopy.password;

        formDataCopy.timestamp = serverTimestamp();
        console.log(res);
        console.log(accountId, typeof accountId);
        formDataCopy.accountId = accountId;
        await setDoc(doc(db, 'users', user.uid), formDataCopy);
        navigate('/profile');
      }
    } catch (error) {
      console.log(error);
      toast.error('Something went wrong with registration');
    }
  };
  return (
    <>
      <div className='pageContainer'>
        <header>
          <p className='pageHeader'>Welcome Back</p>
        </header>
        <form onSubmit={onSubmit}>
          <input
            type='name'
            className='nameInput'
            placeholder='Name'
            id='name'
            value={name}
            onChange={onChange}
          />
          <input
            type='email'
            className='emailInput'
            placeholder='Email'
            id='email'
            value={email}
            onChange={onChange}
          />
          <div className='passwordInputDiv'>
            <input
              type={showPassword ? 'text' : 'password'}
              className='passwordInput'
              placeholder='Password'
              id='password'
              onChange={onChange}
            />
            <img
              src={visibilityIcon}
              alt='show password'
              className='showPassword'
              onClick={() => {
                setShowPassword((prevState) => !prevState);
              }}
            />
          </div>
          <Link to='/forgot-password' className='forgotPasswordLink'>
            Forgot Password
          </Link>
          <div className='SignupBar'>
            <p className='signUpText'>Sign up</p>
            <button className='signInButton'>
              <ArrowRightIcon fill='#ffffff' width='34px' height='34px' />
            </button>
          </div>
        </form>
        {/* Google Auth */}
        <OAuth />
        <Link to='/sign-in' className='registerLink'>
          Sign in instead
        </Link>
      </div>
    </>
  );
};

export default Signup;
