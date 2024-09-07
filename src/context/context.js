import React, { useState, useEffect, useContext } from "react";
import mockUser from "./mockData.js/mockUser";
import mockRepos from "./mockData.js/mockRepos";
import mockFollowers from "./mockData.js/mockFollowers";
import axios from "axios";

const rootUrl = "https://api.github.com";

const GithubContext = React.createContext();

const GithubProvider = ({ children }) => {
  const [githubUser, setGithubUser] = useState(mockUser);
  const [repos, setRepos] = useState(mockRepos);
  const [followers, setFollowers] = useState(mockFollowers);
  const [user, setUser] = useState("");
  const [requests, setRequests] = useState(0);
  const [error, setError] = useState({ show: false, msg: "" });
  const [loading, setLoading] = useState(false);

  const searchUsers = async (username) => {
    toggleError();
    setLoading(true);
    const response = await axios(`${rootUrl}/users/${username}`).catch(
      (err) => {
        console.log(err);
      }
    );
    if (response) {
      // users
      setGithubUser(response.data);
      // repos
      const { repos_url } = response.data;
      await axios(`${repos_url}?per_page=100`).then((response) =>
        setRepos(response.data)
      );
      // followers
      const { followers_url } = response.data;
      await axios(`${followers_url}?per_page=100`).then((response) => {
        setFollowers(response.data);
      });
    } else {
      toggleError(true, "No such user exists");
    }
    getRequets();
    setLoading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (user) {
      searchUsers(user);
    }
  };

  const setUserValue = (e) => {
    setUser(e.target.value);
  };

  const getRequets = () => {
    axios(`${rootUrl}/rate_limit`)
      .then((response) => {
        const { remaining } = response.data.rate;
        setRequests(remaining);
        if (remaining === 0) {
          toggleError(true, "request count has been exceeded");
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const toggleError = (show: false, msg: "") => {
    setError({ show: show, msg: msg });
  };

  useEffect(() => {
    getRequets();
  }, []);
  return (
    <GithubContext.Provider
      value={{
        githubUser,
        repos,
        followers,
        handleSubmit,
        user,
        setUserValue,
        requests,
        error,
        loading,
      }}
    >
      {children}
    </GithubContext.Provider>
  );
};

// global context
const useGlobalContext = () => {
  return useContext(GithubContext);
};
export { useGlobalContext, GithubProvider };
