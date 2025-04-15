import React from 'react';
import { Helmet } from 'react-helmet';
import { useUser } from '../../../../context/UserContext';
import DisplayMentors from './DisplayMentors';

const MentorsPage = () => {
  const { userData, isLoading } = useUser();
  
  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#121212]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E8C848]"></div>
      </div>
    );
  }
  
  return (
    <>
      <Helmet>
        <title>Find Mentors | TalentHunt</title>
      </Helmet>
      <div className="py-6 px-6 bg-[#121212] min-h-screen">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-white">Find Mentors</h1>
          <p className="mt-1 text-sm text-gray-400">
            Connect with experienced mentors who can guide you in your learning journey
          </p>
        </div>
{        console.log(userData)
}        <DisplayMentors userData={userData} isFullPage={true} />
      </div>
    </>
  );
};

export default MentorsPage;