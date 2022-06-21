import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { getAuth, updateProfile } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import { db } from "../config";
import ListingItem from "../components/ListingItem";
import {
  updateDoc,
  doc,
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  orderBy,
} from "firebase/firestore";
import arrowRight from "../assets/svg/keyboardArrowRightIcon.svg";
import homeIcon from "../assets/svg/homeIcon.svg";

const Profile = () => {
  // auth
  const auth = getAuth();
  //navigate
  const navigate = useNavigate();
  // state
  const [changeDetails, setChangeDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState(true);

  const [formData, setFormData] = useState({
    name: auth.currentUser.displayName,
    email: auth.currentUser.email,
  });
  const { name, email } = formData;
  //useEffect
  useEffect(() => {
    const fetchUserListings = async () => {
      const listingsRef = collection(db, "listing");
      const q = query(
        listingsRef,
        where("userRef", "==", auth.currentUser.uid),
        orderBy("timestamp", "desc")
      );
      const querySnap = await getDocs(q);

      let listings = [];
      querySnap.forEach((doc) => {
        return listings.push({
          id: doc.id,
          data: doc.data(),
        });
      });
      console.log(listings);
      setListings(listings);
      setLoading(false);
    };

    fetchUserListings();
  }, [auth.currentUser.uid]);
  // logout
  const onLogout = () => {
    auth.signOut();
    navigate("/");
  };
  // onsubmit
  const onSubmit = async () => {
    try {
      if (auth.currentUser.displayName !== name) {
        await updateProfile(auth.currentUser, {
          displayName: name,
        });
        //Update in firestore
        const userRef = doc(db, "users", auth.currentUser.uid);
        await updateDoc(userRef, {
          name,
        });
      }
    } catch (error) {
      console.log(error);
      toast.error("Could not Update profile details");
    }
  };
  // on change
  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }));
  };
  // on Delete
  const onDelete = async (listingId) => {
    if (window.confirm("Are you sure you want to delete ?")) {
      await deleteDoc(doc(db, "listing", listingId));
      const updatedListings = listings.filter(
        (listing) => listing.id !== listingId
      );
      setListings(updatedListings);
      toast.success("Sucessfully deleted listing");
    }
  };
  // Edit
  const onEdit = (listingId) => {
    navigate(`/edit-listing/${listingId}`);
  };
  return (
    <div className="profile">
      <header className="profileHeader">
        <p className="pageHeader">{auth ? name : ""}</p>
        <button type="button" className="logOut" onClick={onLogout}>
          Logout
        </button>
      </header>
      <main>
        <div className="profileDetailsHeader">
          <p className="profileDetailsText">Personal details </p>
          <p
            className="changePersonalDetails"
            onClick={() => {
              changeDetails && onSubmit();
              setChangeDetails((prevState) => !prevState);
            }}
          >
            {changeDetails ? "done" : "change"}
          </p>
        </div>
        <div className="profileCard">
          <form>
            <input
              type="text"
              id="name"
              className={!changeDetails ? "profileName" : "profileNameActive"}
              disabled={!changeDetails}
              value={name}
              onChange={onChange}
            />
            <input
              type="text"
              id="email"
              className={!changeDetails ? "profileName" : "profileNameActive"}
              disabled={!changeDetails}
              value={email}
              onChange={onChange}
            />
          </form>
        </div>
        <Link to="/create-listing" className="createListing">
          <img src={homeIcon} alt="home" />
          <p>sell or rent your home </p>
          <img src={arrowRight} alt="arrow right" />
        </Link>
        {!loading && listings?.length > 0 && (
          <>
            <p className="listingText">Your Listings</p>
            <ul className="listingsList">
              {listings.map((listing) => (
                <ListingItem
                  id={listing.id}
                  listing={listing.data}
                  key={listing.id}
                  onDelete={() => onDelete(listing.id)}
                  onEdit={() => onEdit(listing.id)}
                />
              ))}
            </ul>
          </>
        )}
      </main>
    </div>
  );
};

export default Profile;
