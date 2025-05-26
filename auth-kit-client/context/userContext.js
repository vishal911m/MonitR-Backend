import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useCallback, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast"

const UserContext = React.createContext();

export const UserContextProvider = ({ children }) => {

  const serverUrl = "http://localhost:8000";
  const router = useRouter();
  const [user, setUser] = useState({});
  const [userState, setUserState] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(true);

  //register user
  const registerUser = async (e) => {
    e.preventDefault();
  if(!userState.email.includes("@") || !userState.password || userState.password.length < 6){
    toast.error("Please enter a valid email and password (min 6 characters)");
    return;
  }

  try {
    const res = await axios.post(`${serverUrl}/api/v1/register`, userState);
    console.log("User registered successfully:", res.data);
    toast.success("User registered successfully");
    //clear the form
    setUserState({
      name: "",
      email: "",
      password: "",
    });

    //redirect to login page
    router.push("/login");  
  } catch (error) {
    console.error("Error registering user:", error);
    toast.error(error.response.data.message);
  }
};

//login the user
const loginUser = async (e) => {
  e.preventDefault();

  try {
    const res = await axios.post(`${serverUrl}/api/v1/login`, {
      email: userState.email,
      password: userState.password,
    }, {
      withCredentials: true, // to include cookies in the request
    });

    toast.success("User logged in successfully");

    //clear the form 
    setUserState({
      email: "",
      password: "",
    }); 

    //push user to the dashboard page
    router.push("/");
  } catch (error) {
    console.log("Error logging in user:", error);
    toast.error(error.response.data.message);
  }
};

//get user login status
const userLoginStatus = async () =>{
  let loggedIn = false;
  try {
    const res = await axios.get(`${serverUrl}/api/v1/login-status`, {
      withCredentials: true, // to include cookies in the request
    });

    //coerce the string to boolean
    loggedIn = !!res.data;
    setLoading(false);

    if(!loggedIn) {
      router.push("/login");
    } 
  } catch (error) {
    console.error("Error checking user login status:", error);
    // toast.error(error.response.data.message); 
  }

  console.log("User login status:", loggedIn);

  return loggedIn;
};

//logout the user
const logoutUser = async()=>{
  try {
    const res = await axios.get(`${serverUrl}/api/v1/logout`, {
      withCredentials: true, // to include cookies in the request
    });

    toast.success("User logged out successfully");

    //redirect to login page
    router.push("/login");
  } catch (error) {
    console.error("Error logging out user:", error);
    toast.error(error.response.data.message);
  }
}

  //dynamic form handler
  const handleUserInput = (name) =>(e) => {
    const value = e.target.value;
    setUserState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  useEffect(()=>{
    userLoginStatus()
  },[])

  return (
    <UserContext.Provider value={{registerUser, userState, handleUserInput, loginUser, logoutUser}}>
      {children}
    </UserContext.Provider>
  );
}

export const useUserContext = () => {
  return useContext(UserContext);
};