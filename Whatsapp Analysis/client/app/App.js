"use client";
import React, { useState } from "react";
import ReactLoading from "react-loading";

export const App = () => {
  const [file, setFile] = useState();
  const [response, setResponse] = useState();
  const [loading, setLoading] = useState(false);

  return (
    <div className="bg-black h-[100vh] text-white flex items-start justify-center">
      {loading && (
        <div className="absolute top-0 left-0 h-[100vh] w-full backdrop-blur-sm flex items-center justify-center">
          <ReactLoading type={"spin"} color={"#fff"} height={40} width={40} />
        </div>
      )}
      <div className="w-3/12 px-10 py-6">
        <h1 className="font-bold text-center text-2xl mb-5 cursor-pointer">
          Whatsapp Analyzer
        </h1>{" "}
        <p className="mb-1">Select a File :-</p>
        <input
          type="file"
          onChange={(e) => {
            setFile(e.target.files[0]);
          }}
          className="mb-4"
        />
        <button
          onClick={(e) => {
            if (file) {
              setLoading(true);
              const formData = new FormData();
              formData.set("file", file);

              fetch("http://localhost:5000/post", {
                method: "POST",
                body: formData,
              })
                .then((response) => {
                  if (!response.ok) {
                    throw new Error("Network response was not ok");
                  }
                  return response.json();
                })
                .then((data) => {
                  console.log(data);
                  setResponse(data);
                  setLoading(false);
                })
                .catch((error) => {
                  console.error(
                    "There was a problem with your fetch operation:",
                    error
                  );
                });
            } else {
            }
          }}
          className="bg-white text-black w-full py-1 rounded-md shadow-md shadow-gray-500 hover:scale-105 transition-all"
        >
          Submit
        </button>
      </div>
      <div className="w-9/12 h-full py-6 ml-[2vw]">
        <div>{response?.messages}</div>
        {/* <div>{?.}</div> */}
      </div>
    </div>
  );
};
