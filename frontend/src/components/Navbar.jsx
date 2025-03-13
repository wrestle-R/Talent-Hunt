import React from 'react';
import { Link } from 'react-router-dom';
import { UserButton, SignInButton, SignUpButton, useUser } from '@clerk/clerk-react';

const Navbar = () => {
  const { isSignedIn, user } = useUser();
  
  return (
    <nav className="flex justify-between items-center p-4 bg-gray-800 text-white">
      <h1 className="text-2xl">Wrestle</h1>
      <div className="flex space-x-6 items-center">
        {isSignedIn ? (
          <>
            <span className="text-lg">Hello, {user.firstName || user.emailAddresses[0].emailAddress}</span>
            <Link to="/dashboard" className="text-lg hover:text-gray-300">Dashboard</Link>
          </>
        ) : (
          <>
              <button className="text-lg hover:text-gray-300">Register</button>
              <button className="text-lg hover:text-gray-300">Login</button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
