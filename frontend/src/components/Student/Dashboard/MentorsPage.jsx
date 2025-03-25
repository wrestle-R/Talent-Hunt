import React from 'react';
import { Helmet } from 'react-helmet';
import { useUser } from '../../../../context/UserContext';
import DisplayMentors from './DisplayMentors';

const MentorsPage = () => {
  const { userData, isLoading } = useUser();
  
  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  return (
    <>
      <Helmet>
        <title>Find Mentors | TalentHunt</title>
      </Helmet>
      <div className="py-6 px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Find Mentors</h1>
          <p className="mt-1 text-sm text-gray-500">
            Connect with experienced mentors who can guide you in your learning journey
          </p>
        </div>
        
        <DisplayMentors userData={userData} isFullPage={true} />
      </div>
    </>
  );
};

export default MentorsPage;