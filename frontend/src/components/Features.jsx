import React from 'react';
import { motion } from 'framer-motion';
import { 
  FaUsers, FaRobot, FaChartLine, FaComments, 
  FaUserTie, FaTrophy, FaShieldAlt, FaBrain 
} from 'react-icons/fa';
import Navbar from './Navbar';

const Features = () => {
  const features = [
    {
      icon: <FaRobot className="text-4xl" />,
      title: "AI-Powered Matching",
      description: "Our advanced algorithm analyzes skills, experience, and goals to create optimal team compositions.",
      color: "from-blue-500/20 to-purple-500/20"
    },
    {
      icon: <FaUsers className="text-4xl" />,
      title: "Smart Team Formation",
      description: "Find teammates with complementary skills and shared interests for your next hackathon.",
      color: "from-green-500/20 to-teal-500/20"
    },
    {
      icon: <FaUserTie className="text-4xl" />,
      title: "Expert Mentorship",
      description: "Connect with industry professionals and experienced mentors who can guide your team.",
      color: "from-yellow-500/20 to-orange-500/20"
    },
    {
      icon: <FaChartLine className="text-4xl" />,
      title: "Progress Tracking",
      description: "Monitor your team's progress, set milestones, and track achievements in real-time.",
      color: "from-pink-500/20 to-red-500/20"
    },
    {
      icon: <FaComments className="text-4xl" />,
      title: "Team Communication",
      description: "Built-in chat and collaboration tools to keep your team connected and organized.",
      color: "from-indigo-500/20 to-blue-500/20"
    },
    {
      icon: <FaTrophy className="text-4xl" />,
      title: "Competition Management",
      description: "Easy registration and team management for hackathons and competitions.",
      color: "from-purple-500/20 to-pink-500/20"
    },
    {
      icon: <FaShieldAlt className="text-4xl" />,
      title: "Secure Platform",
      description: "Enterprise-grade security to protect your team's data and communications.",
      color: "from-teal-500/20 to-green-500/20"
    },
    {
      icon: <FaBrain className="text-4xl" />,
      title: "Skill Development",
      description: "Track your progress and develop new skills through team collaborations.",
      color: "from-orange-500/20 to-yellow-500/20"
    }
  ];

  return (
    <div className="min-h-screen bg-[#111111]">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative pt-32 pb-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-7xl mx-auto text-center"
        >
          <h1 className="text-5xl font-bold text-white mb-6">Platform Features</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Discover the tools and features that make TeamSync the perfect platform
            for building successful teams and managing competitions.
          </p>
        </motion.div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"
                style={{ backgroundColor: 'rgba(232, 200, 72, 0.05)' }}
              />
              <div className="relative p-8 rounded-xl border border-gray-800 bg-[#1A1A1A] hover:border-[#E8C848]/50 transition-all duration-300">
                <div className="text-[#E8C848] mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-[#1A1A1A] py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold text-white mb-6">
              Ready to Build Your Dream Team?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Join thousands of students and professionals who are already using TeamSync
              to form successful teams and participate in exciting competitions.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-[#E8C848] text-[#111111] px-8 py-3 rounded-full font-medium hover:bg-[#E8C848]/90 transition-colors"
            >
              Get Started Now
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Features;
