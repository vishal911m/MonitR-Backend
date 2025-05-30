"use client";

import { useUserContext } from "@/context/userContext";
import useRedirect from "@/hooks/useUserRedirect";
import { useState } from "react";
import ChangePasswordForm from "./Components/auth/ChangePasswordForm/ChangePasswordForm";

export default function Home() {
  useRedirect("/login");
  const  {logoutUser, user, handleUserInput, userState, updateUser, emailVerification, allUsers, deleteUser} = useUserContext();
  const {name, photo, isVerified, bio} = user;
  const [isOpen, setIsOpen] = useState(false);

  const toggleClass = () => {
    setIsOpen(!isOpen);
    // console.log("isOpen", isOpen);
  };
  // const name = "Vishal";
  // console.log(user);
  return (
    <main className="py-[2rem] mx-[10rem]">
      <header className="flex justify-between">
        <h1 className="text-[2rem] font-bold">
          Welcome <span className="text-red-600">{name}</span> 
        </h1>
        <div className="flex items-center gap-4">
          <img 
            src={photo} 
            alt={name}
            className="w-[40px] h-[40px] rounded-full" 
          />
          {!isVerified && 
          <button 
            onClick={emailVerification}
            className="px-4 py-2 bg-blue-500 text-white rounded-md"
          >
              Verify Account
          </button>}
          <button 
            onClick={logoutUser}
            className="px-4 py-2 bg-red-600 text-white rounded-md">
            Logout
          </button>
        </div>
      </header>
      <section>
        <p className="text-[#999] text-[2rem]">{bio}</p>

        <h1>
          <button 
            onClick={toggleClass}
            className="px-4 py-2 bg-green-500 text-white rounded-md">
            
            Update Bio
          </button>
        </h1>

        {isOpen && (
          <form className="mt-4 max-w-[400px] w-full">
          <div className="flex flex-col">
            <label htmlFor="">
              Bio
            </label>
            <textarea 
              name="bio"
              defaultValue={bio}
              className="px-4 py-2 border-[2px] rounded-md outline-green-400"
              onChange={(e) => handleUserInput("bio")(e)}
              ></textarea>
          </div>
          <button 
            type="submit"
            onClick={(e) => updateUser(e, {bio: userState.bio})}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md">
            Update Bio
          </button>
          </form>
          )}
      </section>
      <div className="mt-4 flex gap-8">
        <div className="flex-1">
          <ChangePasswordForm />
        </div>
        <div className="flex-1">
          <ul>
            {allUsers.map((user:any )=>(
              // <li key={user.id} className="border p-1 flex items-center justify-between gap-4">
              user.role !== "admin" && ( // logic to list the users who are not admin
              <li key={user.id} className="border p-1 px-2 py-3 grid grid-cols-4 items-center gap-8">
                <img 
                  src={user.photo} 
                  alt={user.name}
                  className="w-[40px] h-[40px] rounded-full" 
                />
                <p>{user.name}</p>
                <p>{user.bio}</p>
                <button
                  className="bg-red-500 text-white p-2"
                  onClick={()=>deleteUser(user._id)}
                >
                  Delete User
                </button>
              </li>
              )
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
