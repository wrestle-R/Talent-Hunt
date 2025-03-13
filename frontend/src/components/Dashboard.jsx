import React from 'react';
import { useUser, RedirectToSignIn } from '@clerk/clerk-react';

const Dashboard = () => {
  const { isLoaded, isSignedIn, user } = useUser();

  // Show a loading state if user data is still loading
  if (!isLoaded) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  // Redirect to sign-in if not signed in
  if (!isSignedIn) {
    return <RedirectToSignIn />;
  }

  return (
    <div className="bg-gray-100 p-12 rounded-lg shadow-md w-4/5 max-w-xl mx-auto text-center mt-10">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">Dashboard</h1>
      <h1 className="text-2xl text-green-500 font-medium">
        Hi {user.firstName || user.emailAddresses[0].emailAddress}!
      </h1>
      
      {/* Display additional user information */}
      <div className="mt-8 text-left">
        <p className="text-gray-700">
          <strong>Email:</strong> {user.primaryEmailAddress?.emailAddress}
        </p>
        {user.phoneNumbers?.length > 0 && (
          <p className="text-gray-700">
            <strong>Phone:</strong> {user.phoneNumbers[0].phoneNumber}
          </p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;