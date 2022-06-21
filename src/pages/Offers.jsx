import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
} from "firebase/firestore";
import { db } from "../config";
import toast from "react-hot-toast";
import Spinner from "../components/Spinner";
import ListingItem from "../components/ListingItem";

const Offers = () => {
  const [listings, setListings] = useState();
  const [loading, setLoading] = useState(true);
  const [lastFetchListing, setLastFetchListing] = useState(null);

  const params = useParams();

  useEffect(() => {
    const fetchListings = async () => {
      try {
        // get reference
        const listingsRef = collection(db, "listing");

        //Create a query
        const q = query(
          listingsRef,
          where("offer", "==", true),
          orderBy("timestamp", "desc"),
          limit(10)
        );
        // Execute query
        const querySnap = await getDocs(q);
        const lastVisible = querySnap.docs[querySnap.docs.length - 1];
        setLastFetchListing(lastVisible);
        // empty array
        let listings = [];

        querySnap.forEach((doc) => {
          return listings.push({
            id: doc.id,
            data: doc.data(),
          });
        });
        setListings(listings);
        setLoading(false);
      } catch (error) {
        toast.error("Could not fetch listings");
        console.log(error);
      }
    };
    fetchListings();
  }, []);

  const onFetchMoreListings = async () => {
    try {
      // get reference
      const listingsRef = collection(db, "listing");

      //Create a query
      const q = query(
        listingsRef,
        where("type", "==", true),
        orderBy("timestamp", "desc"),
        startAfter(lastFetchListing),
        limit(10)
      );
      // Execute query
      const querySnap = await getDocs(q);
      const lastVisible = querySnap.docs[querySnap.docs.length - 1];
      setLastFetchListing(lastVisible);
      // empty array
      let listings = [];

      querySnap.forEach((doc) => {
        return listings.push({
          id: doc.id,
          data: doc.data(),
        });
      });

      setListings((prevState) => [...prevState, ...listings]);
      // console.log(listings[0].data.name);
      setLoading(false);
    } catch (error) {
      toast.error("Could not fetch listings");
      console.log(error);
    }
  };
  return (
    <div className="category">
      <header>
        <p className="pageHeader">Offers</p>
      </header>
      {loading ? (
        <Spinner />
      ) : listings && listings.length > 0 ? (
        <>
          <main>
            <ul className="categoryListings">
              {listings.map((listing) => (
                <ListingItem
                  id={listing.id}
                  listing={listing.data}
                  key={listing.id}
                />
              ))}
            </ul>
          </main>
          {lastFetchListing && (
            <p className="loadMore" onClick={onFetchMoreListings}>
              Load more
            </p>
          )}
        </>
      ) : (
        <p> There are no current offers</p>
      )}
    </div>
  );
};

export default Offers;
