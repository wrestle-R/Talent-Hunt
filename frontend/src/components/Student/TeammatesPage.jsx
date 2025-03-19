import React from 'react';
import { Helmet } from 'react-helmet';
import { useUser } from '../../../context/UserContext';
import DisplayTeammates from '../../components/Student/DisplayTeammates';

const TeammatesPage = () => {
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
        <title>Find Teammates | TalentHunt</title>
      </Helmet>
      <div className="py-6 px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Find Teammates</h1>
          <p className="mt-1 text-sm text-gray-500">
            Connect with other students who share similar skills and interests
          </p>
        </div>
        
        <DisplayTeammates userData={userData} isFullPage={true} />
      </div>
    </>
  );
};

export default TeammatesPage;