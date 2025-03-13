import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ClerkProvider, SignIn, SignUp, RedirectToSignIn } from '@clerk/clerk-react';
import Navbar from './components/Navbar';
import LoginPage from './components/Login';
import RegisterPage from './components/Register';
import Dashboard from './components/Dashboard';
import {Toaster} from 'react-hot-toast';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  throw new Error("Missing Publishable Key");
}

const App = () => {
  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <BrowserRouter>
        <Navbar />
        <Toaster position='bottom-right' toastOptions={{duration: 3000}} />
        <Routes>
          <Route path='/sign-in/*' element={<SignIn routing="path" path="/sign-in" />} />
          <Route path='/sign-up/*' element={<SignUp routing="path" path="/sign-up" />} />
          <Route path='/dashboard' element={<Dashboard />} />
          
          {/* Keep legacy routes for now - you can migrate or remove them later */}
          <Route path='/login' element={<LoginPage />} />
          <Route path='/register' element={<RegisterPage />} />
        </Routes>
      </BrowserRouter>
    </ClerkProvider>
  );
};

export default App;