import React, { useState, useEffect } from "react";
import { storage } from "../config";
import { ref, uploadBytes, listAll, getDownloadURL } from "firebase/storage";
import { v4 } from "uuid";
const UploadImg = () => {
  const [ImageUpload, setImageUpload] = useState(null);
  const [ImageList, setImagesList] = useState([]);

  const imageListRef = ref(storage, "images/");
  // upload inage to firebase storage
  const UploadImage = () => {
    if (ImageUpload === null) {
      return;
    }
    const imageRef = ref(storage, `images/${ImageUpload.name + v4()}`);
    uploadBytes(imageRef, ImageUpload).then((snapshot) => {
      alert("imageUploaded");
      getDownloadURL(snapshot.ref).then((url) => {
        setImagesList((prev) => [...prev, url]);
      });
    });
  };
  // useEffect
  useEffect(() => {
    listAll(imageListRef).then((response) => {
      console.log(response);
      response.items.forEach((item) => {
        getDownloadURL(item).then((url) => {
          setImagesList((prev) => [...prev, url]);
        });
      });
    });
  }, []);

  return (
    <div style={{ overflowX: "scroll" }}>
      <input
        type="file"
        onChange={(e) => {
          setImageUpload(e.target.files[0]);
        }}
      />
      <button onClick={UploadImage}>Upload Image</button>
      {ImageList.map((url) => {
        return <img src={url} alt="" />;
      })}{" "}
      */}
      <div>
        <img src={ImageList[0]} />
      </div>
    </div>
  );
};

export default UploadImg;
