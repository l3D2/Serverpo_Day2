import React from "react";

export default function Navbar({ title }) {
  return (
    <>
      {/* Navbar */}
      <nav className="absolute top-0 left-0 w-full z-10 bg-gray-800 md:flex-row md:flex-nowrap md:justify-start flex items-center p-3">
        <div className="w-full mx-autp items-center flex justify-center md:flex-nowrap flex-wrap md:px-10 px-4">
          {/* Brand */}
          <span>{title}</span>
          {/* User */}
          <ul className="flex-col md:flex-row list-none items-center hidden md:flex"></ul>
        </div>
      </nav>
      {/* End Navbar */}
    </>
  );
}
