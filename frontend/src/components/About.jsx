import React from 'react';
import { motion } from 'framer-motion';
import { FaLightbulb, FaUsers, FaTrophy, FaRocket } from 'react-icons/fa';
import Navbar from './Navbar';

const About = () => {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const stats = [
    { icon: <FaUsers />, value: "10,000+", label: "Active Users" },
    { icon: <FaTrophy />, value: "500+", label: "Successful Teams" },
    { icon: <FaLightbulb />, value: "1,000+", label: "Projects Completed" },
    { icon: <FaRocket />, value: "50+", label: "Hackathons" }
  ];

  const timeline = [
    {
      year: "Start March 2025",
      title: "Platform Launch",
      description: "TeamSync was born with a mission to revolutionize team formation"
    },
    {
      year: "End March 2025",
      title: "AI Matching Integration",
      description: "Introduced smart team matching algorithm"
    },
    {
      year: "April 2025",
      title: "Mentor Network",
      description: "Expanded to include industry mentors and experts"
    },
    {
      year: "Coming soon",
      title: "Global Expansion",
      description: "Reached users across multiple universities worldwide"
    }
  ];

  return (
    <div className="min-h-screen bg-[#111111]">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#E8C848]/10 to-transparent pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 pt-32 pb-20">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl font-bold text-white mb-6">Our Story</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              TeamSync was created to solve the challenge of forming effective teams
              for hackathons and technical competitions. We believe great things happen
              when the right people come together.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-[#1A1A1A] py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center p-6 rounded-xl bg-[#242424] border border-gray-800"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="text-[#E8C848] text-3xl mb-4">{stat.icon}</div>
                <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.h2 
            className="text-3xl font-bold text-white text-center mb-16"
            {...fadeIn}
          >
            Our Journey
          </motion.h2>
          
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-px h-full bg-gray-800" />
            
            {/* Timeline items */}
            {timeline.map((item, index) => (
              <motion.div
                key={index}
                className={`relative mb-12 ${
                  index % 2 === 0 ? 'text-right pr-12 md:mr-auto md:ml-0' : 'text-left pl-12 md:ml-auto md:mr-0'
                } md:w-5/12`}
                initial={{ opacity: 0, x: index % 2 === 0 ? 50 : -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className={`absolute top-0 ${
                  index % 2 === 0 ? 'right-0' : 'left-0'
                } transform translate-x-1/2 -translate-y-1/4`}>
                  <div className="w-4 h-4 rounded-full bg-[#E8C848]" />
                </div>
                <div className="bg-[#1A1A1A] p-6 rounded-xl border border-gray-800">
                  <span className="text-[#E8C848] font-bold">{item.year}</span>
                  <h3 className="text-xl font-bold text-white mt-2">{item.title}</h3>
                  <p className="text-gray-400 mt-2">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="bg-[#1A1A1A] py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold text-white mb-6">Our Mission</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              To empower students and professionals by creating meaningful connections
              and facilitating the formation of high-performing teams through innovative
              technology and expert mentorship.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default About;
