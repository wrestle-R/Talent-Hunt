// import React, { useState } from 'react';
// import { Eye, EyeOff, ArrowRight } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';
// import { auth, provider, signInWithPopup } from "../firebaseConfig";
// import axios from 'axios';

// const StudentLogin = () => {
//   const [showPassword, setShowPassword] = useState(false);
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const navigate = useNavigate();

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (email && password) {
//       console.log('Login successful:', { email, password });
//       navigate('/student/dashboard');
//     } else {
//       console.log('Please fill in all fields');
//     }
//   };

//   const handleGoogleLogin = async () => {
//     try {
//       const result = await signInWithPopup(auth, provider);
//       const user = result.user;

//       console.log("User Info:", user.uid, user.displayName, user.email, user.photoURL);

//       const studentData = {
//         firebaseUID: user.uid,
//         email: user.email,
//         name: user.displayName,
//         profilePicture: user.photoURL,
//         bio: "",
//         resume: "",
//         skills: [],
//         portfolio: "",
//         hourlyRate: 0,
//         availability: "freelance",
//         paymentMethod: ["PayPal"],
//         github: "",
//         rating: 0,
//         reviews: 0,
//       };

//       localStorage.setItem("user", JSON.stringify(user));

//       const response = await axios.post("http://localhost:4000/api/registerOrLogin", studentData);

//       console.log("Backend response:", response);

//       if (response.status === 200 || response.status === 201) {
//         console.log("Login/Registration successful:", response.data);
//         navigate("/student/hero");
//       } else {
//         console.error("Error:", response.data.message);
//         alert(`Error: ${response.data.message}`);
//       }
//     } catch (error) {
//       console.error("Google Sign-In Error:", error);
//       alert(`Failed to sign in with Google: ${error.message}`);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-[#2F4156] to-[#1A2A3A] text-black flex items-center justify-center">
//       <div className="w-full max-w-md p-4">
//         <div className="bg-white rounded-lg shadow-xl p-8 backdrop-blur-sm">
//           <div className="text-center mb-8">
//             <h1 className="text-3xl font-bold text-[#2F4156] mb-2">Welcome Back</h1>
//             <p className="text-[#567C8D]">Log in to your student account</p>
//           </div>

//           <button
//             onClick={handleGoogleLogin}
//             className="w-full mb-6 bg-white text-[#2F4156] py-3 px-4 rounded-lg border-2 border-[#C8D9E6] hover:bg-[#C8D9E6] transition-colors duration-200 flex items-center justify-center space-x-3"
//           >
//             <svg className="w-5 h-5" viewBox="0 0 24 24">
//               <path
//                 fill="#4285F4"
//                 d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
//               />
//               <path
//                 fill="#34A853"
//                 d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
//               />
//               <path
//                 fill="#FBBC05"
//                 d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
//               />
//               <path
//                 fill="#EA4335"
//                 d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
//               />
//             </svg>
//             <span>Continue with Google</span>
//           </button>

//           <div className="relative mb-6">
//             <div className="absolute inset-0 flex items-center">
//               <div className="w-full border-t border-[#C8D9E6]"></div>
//             </div>
//             <div className="relative flex justify-center text-sm">
//               <span className="px-2 bg-white text-[#567C8D]">Or continue with email</span>
//             </div>
//           </div>

//           <form onSubmit={handleSubmit} className="space-y-6">
//             <div>
//               <label htmlFor="email" className="block text-sm font-medium text-[#2F4156] mb-2">
//                 Email Address
//               </label>
//               <input
//                 type="email"
//                 id="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 className="w-full px-4 py-3 rounded-lg border border-[#C8D9E6] focus:outline-none focus:border-[#567C8D] bg-white"
//                 placeholder="Enter your email"
//                 required
//               />
//             </div>

//             <div>
//               <label htmlFor="password" className="block text-sm font-medium text-[#2F4156] mb-2">
//                 Password
//               </label>
//               <div className="relative">
//                 <input
//                   type={showPassword ? 'text' : 'password'}
//                   id="password"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   className="w-full px-4 py-3 rounded-lg border border-[#C8D9E6] focus:outline-none focus:border-[#567C8D] bg-white"
//                   placeholder="Enter your password"
//                   required
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#567C8D]"
//                 >
//                   {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//                 </button>
//               </div>
//             </div>

//             <div className="flex items-center justify-between">
//               <div className="flex items-center">
//                 <input
//                   type="checkbox"
//                   id="remember"
//                   className="h-4 w-4 text-[#567C8D] border-[#C8D9E6] rounded"
//                 />
//                 <label htmlFor="remember" className="ml-2 text-sm text-[#567C8D]">
//                   Remember me
//                 </label>
//               </div>
//               <a href="#" className="text-sm text-[#567C8D] hover:text-[#2F4156]">
//                 Forgot password?
//               </a>
//             </div>

//             <button
//               type="submit"
//               className="w-full bg-[#2F4156] text-white py-3 px-4 rounded-lg hover:bg-[#567C8D] transition-colors duration-200 flex items-center justify-center space-x-2"
//             >
//               <span>Log In</span>
//               <ArrowRight size={20} />
//             </button>
//           </form>

//           <div className="mt-6 text-center">
//             <p className="text-[#567C8D]">
//               Don't have an account?{' '}
//               <button 
//                 onClick={() => navigate('/student/register')}
//                 className="text-[#2F4156] font-semibold hover:text-[#567C8D]"
//               >
//                 Sign up
//               </button>
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default StudentLogin;