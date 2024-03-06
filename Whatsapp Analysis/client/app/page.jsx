"use client";
import React, { useEffect, useState } from "react";
import ReactLoading from "react-loading";
import { CiLink } from "react-icons/ci";
import ReactModal from "./Charts/modal";
import MonthlyTimeline from "./Charts/MonthlyTimeline";
import DailyTimeline from "./Charts/DailyTimeline";
import MostUsedWords from "./Charts/MostUsedWords";
import MostBusyUser from "./Charts/MostBusyUser";
import TopEmojis from "./Charts/TopEmojis";

const App = () => {
  const [file, setFile] = useState();
  const [response, setResponse] = useState();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState("All Users");
  const [allUsers, setAllUsers] = useState([]);
  const [modalIsOpen, setIsOpen] = useState(false);
  let url = "http://localhost:5000";
  // let url = "https://ml-learning-drfk.onrender.com";

  useEffect(() => {
    if (
      response?.top_5_users &&
      Object.keys(response?.top_5_users).length > 1
    ) {
      const dataArray = Object.entries(response?.top_5_users);
      dataArray.sort((a, b) => b[1] - a[1]);
      const sortedObject = Object.fromEntries(dataArray);
      setResponse({ ...response, top_5_users: sortedObject });
    }
  }, [loading]);

  return (
    <div className="bg-black h-[100vh] text-white flex md:flex-row flex-col items-start justify-center">
      <ReactModal
        modalIsOpen={modalIsOpen}
        setIsOpen={setIsOpen}
        links={response?.total_links}
      />
      {loading && (
        <div className="absolute top-0 left-0 h-[100vh] w-full backdrop-blur-sm flex items-center justify-center">
          <ReactLoading type={"spin"} color={"#fff"} height={40} width={40} />
        </div>
      )}
      <div className="w-full md:w-3/12 px-6 md:px-10 py-6">
        <h1 className="font-bold text-center text-2xl mb-5 cursor-pointer">
          Whatsapp Chat Analyzer
        </h1>{" "}
        <p className="mb-1">Select a File :-</p>
        <input
          type="file"
          onChange={(e) => {
            setLoading(true);
            setFile(e.target.files[0]);
            const formData = new FormData();
            formData.set("file", e.target.files[0]);

            fetch(`${url}/get-users`, {
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
                setAllUsers(data["users"]);
                setLoading(false);
              })
              .catch((error) => {
                console.error(
                  "There was a problem with your fetch operation:",
                  error
                );
              });
          }}
          className="mb-4"
        />
        {allUsers?.length > 1 && (
          <>
            <p>Analyse w.r.t.</p>
            <select
              value={user}
              onChange={(e) => {
                setUser(e.target.value);
              }}
              className="text-white bg-transparent w-full outline-none border px-3 mb-4 mt-1 py-1 rounded-md"
            >
              {["All Users", ...allUsers].map((e, i) => {
                return (
                  <option key={i} value={e} className="bg-black text-white">
                    {e}
                  </option>
                );
              })}
            </select>
          </>
        )}
        <button
          onClick={(e) => {
            if (file) {
              setLoading(true);
              const formData = new FormData();
              formData.set("file", file);

              fetch(`${url}/post?name=${user}`, {
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
      <div className="md:w-9/12 h-full py-6 md:px-0 px-4 pb-10 md:ml-[3vw] w-full overflow-y-auto">
        {response?.total_words &&
          response?.top_msg_df &&
          response?.top_emojis &&
          response?.top_5_users && (
            <div>
              <h1 className="text-xl flex items-center">
                Chat Analysis of{" "}
                <span className="ml-1.5 font-semibold">{user}</span>
              </h1>
              <div className="grid grid-cols-2 md:grid-cols-4 items-center md:gap-y-0 gap-y-5 gap-x-5 px-2 md:px-5 mt-3">
                {[
                  { title: "Total Messages", value: response?.messages },
                  { title: "Total Words Count", value: response?.total_words },
                  { title: "Total Media Shared", value: response?.media_count },
                ].map((e, i) => {
                  return (
                    <div
                      key={i}
                      className="w-full h-full border rounded-md flex items-center cursor-pointer flex-col justify-center py-4 md:px-0 px-4 text-center md:py-3"
                    >
                      {e?.title} :-{" "}
                      <p className="font-semibold text-lg">{e?.value}</p>
                    </div>
                  );
                })}
                <div
                  onClick={(e) => {
                    setIsOpen(!modalIsOpen);
                  }}
                  className="w-full h-full border rounded-md flex items-center cursor-pointer flex-col justify-center py-4 md:px-0 px-4 text-center md:py-3"
                >
                  Total Links Shared :-{" "}
                  <p className="font-semibold text-lg flex items-center">
                    {response?.total_links?.length}{" "}
                    <CiLink className="ml-2 text-2xl" />
                  </p>
                </div>
              </div>
              <h1 className="text-xl font-semibold mt-10 mb-2">
                Monthly Analysis
              </h1>
              <div className="px-2 md:px-5 w-full">
                <MonthlyTimeline
                  data={response?.monthly_timeline_value}
                  labels={response?.monthly_timeline_time}
                />
              </div>
              <h1 className="text-xl font-semibold mt-10 mb-2">
                Daily Analysis
              </h1>
              <div className="px-2 md:px-5 w-full">
                <DailyTimeline
                  data={response?.daily_timeline_value}
                  labels={response?.daily_timeline_time}
                />
              </div>
              <h1 className="text-xl font-semibold mt-10 mb-2">
                Most Busy Users
              </h1>
              <div className="px-5">
                <MostBusyUser
                  data={Object.values(response?.top_5_users)}
                  labels={Object.keys(response?.top_5_users)}
                />
              </div>
              {response?.top_msg_df["0"] && (
                <>
                  {" "}
                  <h1 className="text-xl font-semibold mt-10 mb-2">
                    Most Common Words Used
                  </h1>
                  <div className="px-5 flex items-start md:flex-row flex-col justify-between">
                    <div className="w-full md:block hidden md:w-10/12">
                      <MostUsedWords
                        data={Object.values(response?.top_msg_df["1"]).slice(
                          0,
                          20
                        )}
                        labels={Object.values(response?.top_msg_df["0"]).slice(
                          0,
                          20
                        )}
                      />
                    </div>
                    <div className="w-full md:hidden block md:w-10/12">
                      <MostUsedWords
                        data={Object.values(response?.top_msg_df["1"]).slice(
                          0,
                          5
                        )}
                        labels={Object.values(response?.top_msg_df["0"]).slice(
                          0,
                          5
                        )}
                      />
                    </div>
                    <div className="md:w-2/12 border py-2 px-4 md:ml-5 overflow-y-auto rounded-md md:mt-0 mt-3 h-[20vh] w-full md:h-[60vh]">
                      {Object.values(response?.top_msg_df["0"]).map((e, i) => {
                        return (
                          <p
                            key={i}
                            className="py-1 transition-all md:text-base text-sm px-3 rounded-md cursor-pointer hover:bg-gray-600"
                          >
                            {i + 1}. {e} ({response?.top_msg_df["1"][i]})
                          </p>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
              {response?.top_emojis["0"] && (
                <>
                  <h1 className="text-xl font-semibold mt-10 mb-2">
                    Top Emojis Used
                  </h1>
                  <div className="px-5 flex items-start md:flex-row flex-col justify-between">
                    <div className="w-full md:block hidden md:w-8/12">
                      <TopEmojis
                        data={Object.values(response?.top_emojis["1"]).slice(
                          0,
                          10
                        )}
                        labels={Object.values(response?.top_emojis["0"]).slice(
                          0,
                          10
                        )}
                      />
                    </div>
                    <div className="w-full md:hidden block md:w-8/12">
                      <TopEmojis
                        data={Object.values(response?.top_emojis["1"]).slice(
                          0,
                          5
                        )}
                        labels={Object.values(response?.top_emojis["0"]).slice(
                          0,
                          5
                        )}
                      />
                    </div>
                    <div className="w-full md:w-3/12 md:mt-0 mt-3 border py-2 px-4 overflow-y-auto rounded-md h-[20vh] md:h-[90vh]">
                      {Object.values(response?.top_emojis["0"]).map((e, i) => {
                        return (
                          <p
                            key={i}
                            className="py-1 md:text-base text-sm transition-all px-3 rounded-md cursor-pointer hover:bg-gray-600"
                          >
                            {i + 1}. {e} ({response?.top_emojis["1"][i]})
                          </p>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
      </div>
    </div>
  );
};

export default App;
