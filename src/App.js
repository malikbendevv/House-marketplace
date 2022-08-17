import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Explore from './pages/Explore';
import Offers from './pages/Offers';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import Profile from './pages/Profile';
import Category from './pages/Category';
import PrivateRoute from './components/PrivateRoute';
import CreateListing from './pages/CreateListing';
import Listing from './pages/Listing';
import Contact from './pages/Contact';
import EditListing from './pages/EditListing';
import NavBar from './components/NavBar';
import { Toaster } from 'react-hot-toast';
import UploadImg from './components/UploadImg';

function App() {
  return (
    <>
      <Toaster />
      <Router>
        <Routes>
          <Route path='/' element={<PrivateRoute />}>
            <Route path='/' element={<Explore />} />
          </Route>{' '}
          <Route path='/sign-in' element={<SignIn />} />
          <Route path='/sign-up' element={<SignUp />} />
          <Route path='/forgot-password' element={<ForgotPassword />} />
          <Route path='/offers' element={<Offers />} />
          <Route path='/category/:categoryName/' element={<Category />} />
          <Route path='/create-listing/' element={<CreateListing />} />
          <Route path='/edit-listing/:listingId' element={<EditListing />} />
          <Route path='/Contact/:landlordId' element={<Contact />} />
          <Route path='/profile' element={<PrivateRoute />}>
            <Route path='/profile' element={<Profile />} />
          </Route>{' '}
          <Route
            path='/category/:categoryName/:listingId'
            element={<Listing />}
          />
        </Routes>
        {/* //NavBar */}
        <NavBar />
      </Router>
    </>
  );
}

export default App;
