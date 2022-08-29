import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import SwiperCore, { Navigation, Pagination, Scrollbar, A11y } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
// import "swiper/swiper-bundle.css";
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import 'swiper/css/a11y';
import { getDoc, doc, setDoc, updateDoc } from 'firebase/firestore';
import { getAuth, setPersistence } from 'firebase/auth';
import { db } from '../config';
import Spinner from '../components/Spinner';
import shareIcon from '../assets/svg/shareIcon.svg';
import ReactStars from 'react-rating-stars-component';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Modal, Typography, Box } from '@mui/material';

import axios from 'axios';
const Listing = () => {
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shareLinkCopied, setShareLinkCopied] = useState(false);
  const [value, setValue] = useState();
  const [price, setPrice] = useState(null);
  const [processing, setProcessing] = useState(null);
  const [succeeded, setSucceeded] = useState(null);
  const [error, setError] = useState(null);
  const [newValue, setNewValue] = useState(null);
  const [userId, setUserId] = useState(null);
  const [accountId, setAccountId] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [open, setOpen] = useState(false);
  const [sellerEmail, setSellerEmail] = useState('');
  const [result, setResult] = useState(0);
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    if (!processing) {
      setOpen(false);
    }
  };
  const elements = useElements();
  const stripe = useStripe();
  const navigate = useNavigate();
  const params = useParams();
  const auth = getAuth();

  useEffect(() => {
    const fetchListing = async () => {
      const docRef = doc(db, 'listing', params.listingId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        console.log(docSnap.data());
        const data = docSnap.data();
        var price = data.discountedPrice
          ? data.discountedPrice
          : data.regularPrice;
        setPrice(price);
        setListing(docSnap.data());
        setLoading(false);
        setUserId(data.userRef);
        if (docSnap.data()?.rating) {
          setValue(docSnap.data()?.rating);
        }
      }
    };
    // Getting stripe accountid from firestore
    const retrieveAccountId = async () => {
      const docSnap = doc(db, 'users', userId);
      const document = await getDoc(docSnap);
      setAccountId(document.data()?.accountId);
      setSellerEmail(document.data()?.email);

      console.log(document.data());
    };
    fetchListing();
    if (userId) {
      retrieveAccountId();
      console.log('accountId', accountId);
    }
    console.log(value);
  }, [params.listingId, userId, accountId]);

  // change rating
  const submitRating = async () => {
    const docRef = doc(db, 'listing', params.listingId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      // console.log(docSnap.data());
      let rating = [];
      if (value) {
        rating = [value];
      }

      const rating2 = rating.push(newValue);
      console.log(rating);
      // calculate rating
      function CalculateRating() {
        let sum = 0;

        for (let i = 0; i < rating.length; i++) {
          sum += rating[i];
          var stars = sum / rating.length;
        }
        return stars;
      }
      CalculateRating();
      console.log('func', CalculateRating());
      const stars = CalculateRating();
      // const formDataCopy = { ...docSnap.data(), rating };
      await updateDoc(docRef, { rating: stars });
    }
  };
  // pay
  const pay = async () => {
    // do all the fancy stripe stuff...

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }
    setProcessing(true);

    const res = await axios.post(
      'http://localhost:5001/housemarketplace-9456a/us-central1/api/pay',
      { price, accountId }
    );
    const clientSecret = res.data.clientSecret;

    // clientS();

    const payload = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
        billing_details: {
          name,
          email,
        },
      },
    });
    if (payload.error) {
      console.log(error);
      setError(`Payment failed ${payload.error.message}`);
      setProcessing(false);
    } else {
      setError('');
      setProcessing(false);
      setSucceeded(true);
      // setClientSecret("");
      await setDoc(doc(db, 'buyers', userId), { sellerEmail, price });
    }
  };
  if (loading) {
    return <Spinner />;
  }
  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 600,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  };
  return (
    <main>
      {/* SLIDER */}
      <Swiper
        modules={[Navigation, Pagination, Scrollbar, A11y]}
        slidesPerView={1}
        pagination={{ clickable: true }}
        navigation
        style={{ height: '500px' }}
      >
        {listing.imgUrls.map((url, index) => {
          return (
            <SwiperSlide key={index}>
              <div
                className='swiperSlideDiv'
                style={{
                  background: `url(${listing.imgUrls[index]}) center no-repeat`,
                  backgroundSize: '100%',
                }}
              ></div>
            </SwiperSlide>
          );
        })}
      </Swiper>
      <div
        className='shareIconDiv'
        onClick={() => {
          navigator.clipboard.writeText(window.location.href);
          setShareLinkCopied(true);
          setTimeout(() => {
            setShareLinkCopied(false);
          }, 2000);
        }}
      >
        <img src={shareIcon} alt='' />
      </div>
      {shareLinkCopied && <p className='linkCopied'>Link Copied</p>}
      <div className='listingDetails'>
        <p className='listingName'>
          {listing.name} -$
          {listing.offer
            ? listing.discountedPrice
                .toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
            : listing.regularPrice
                .toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
        </p>
        <p className='listingLocation'>{listing.location}</p>
        <p className='listingType'>
          for {listing.type === 'rent' ? 'Rent' : 'Sale'}{' '}
        </p>
        {/* Rating */}
        <ReactStars
          count={5}
          onChange={(newRating) => {
            setNewValue(newRating);
            console.log(newValue);
          }}
          size={28}
          value={value}
          activeColor='#ffd700'
        />
        <button onClick={submitRating} className='RatingBtn'>
          Submit Rating
        </button>
        <button onClick={handleOpen} className='RatingBtn'>
          {listing.type === 'rent' ? 'rent now' : 'Buy now'}{' '}
        </button>
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby='modal-modal-title'
          aria-describedby='modal-modal-description'
        >
          <Box sx={style}>
            <div className='inputsDiv'>
              <input
                className='ModalInput'
                value={name}
                placeholder='name'
                onChange={(e) => {
                  setName(e.target.value);
                }}
              />
              <input
                className='ModalInput'
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
                placeholder='Email'
              />
            </div>

            <div className='CardElement'>
              <CardElement />
            </div>
            <div className='btnDiv'>
              <button
                disabled={processing || succeeded}
                className='payBtn'
                onClick={pay}
              >
                {processing ? 'processing' : succeeded ? 'succeeded' : 'pay'}
              </button>
            </div>

            <p style={{ color: 'red', fontWeight: 'bold' }}>
              {' '}
              Contact owner before paying
            </p>
          </Box>
        </Modal>
        {listing.offer && (
          <p className='discountedPrice'>
            ${listing.regulaPrice - listing.discountedPrice}
            discount
          </p>
        )}
        <ul className='listingDetailsList'>
          <li>
            {listing.bedrooms > 1
              ? `${listing.bedrooms} Bedrooms`
              : '1 Bedroom'}
          </li>
          <li>
            {listing.bathrooms > 1
              ? `${listing.bathrooms} Bathrooms`
              : '1 Bathroom'}
          </li>
          <li>{listing.parking && 'Parking Spot'}</li>
          <li> {listing.furnished && 'Furnished'}</li>
        </ul>
        <p className='listingLocationTitle'>Location</p>
        <div className='leafletContainer'>
          <MapContainer
            style={{ height: '100%', width: '100%' }}
            center={[listing.geoLocation.lat, listing?.geoLocation.lng]}
            zoom={13}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy;<a href="http://osm.org/copyright">OpenStreetMap</a>Contributors'
              url='https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png'
            />
            <Marker
              position={[listing?.geoLocation.lat, listing?.geoLocation.lng]}
            >
              <Popup>{listing.location}</Popup>
            </Marker>
          </MapContainer>
        </div>
        {auth.currentUser?.uid !== listing.userRef && (
          <Link
            to={`/contact/${listing.userRef}?listingName=${listing.name}&listingLocation=${listing.location}`}
            className='primaryButton'
          >
            Contact Landlord
          </Link>
        )}
      </div>
    </main>
  );
};

export default Listing;
