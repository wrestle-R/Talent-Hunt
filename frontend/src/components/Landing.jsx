"use client"

import { useState, useEffect, useRef } from "react"
import { motion, useInView } from "framer-motion"
import { FaUser, FaCode, FaLaptopCode, FaChartLine, FaQuoteLeft } from "react-icons/fa"
import Navbar from "./Navbar"
import Spline from '@splinetool/react-spline'

// Animated Testimonials Component
function AnimatedTestimonials({ testimonials }) {
  const [active, setActive] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const testimonialsLength = testimonials.length;
  const autoplayRef = useRef();

  // Handle autoplay
  useEffect(() => {
    if (!autoplay) return;
    
    autoplayRef.current = setTimeout(() => {
      setActive((prev) => (prev + 1) % testimonialsLength);
    }, 5000);
    
    return () => clearTimeout(autoplayRef.current);
  }, [active, autoplay, testimonialsLength]);

  return (
    <div className="relative w-full max-w-5xl mx-auto">
      {/* Testimonial Cards */}
      <div className="relative h-80 md:h-72">
        {testimonials.map((testimonial, index) => {
          const isActive = index === active;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={{
                opacity: isActive ? 1 : 0,
                y: isActive ? 0 : 50,
                scale: isActive ? 1 : 0.9,
              }}
              transition={{ duration: 0.5 }}
              className={`absolute inset-0 ${
                isActive ? "z-10" : "z-0"
              } bg-[#1A1A1A] border border-gray-800 rounded-xl p-6 shadow-lg hover:border-[#E8C848]/30 transition-all duration-300`}
            >
              <div className="flex flex-col h-full">
                <div className="text-[#E8C848] mb-4">
                  <FaQuoteLeft className="h-6 w-6" />
                </div>
                <p className="text-gray-300 italic flex-grow text-lg leading-relaxed">{testimonial.quote}</p>
                <div className="flex items-center mt-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#E8C848]/80 to-[#E8C848]/30 flex items-center justify-center overflow-hidden border-2 border-[#E8C848]/20">
                    {testimonial.image ? (
                      <img src={testimonial.image} alt={testimonial.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg font-bold text-[#121212]">
                        {testimonial.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold text-white">{testimonial.name}</h4>
                    <p className="text-sm text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Navigation Dots */}
      <div className="flex justify-center space-x-2 mt-8">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setActive(index);
              setAutoplay(false);
              // Resume autoplay after manual navigation
              setTimeout(() => setAutoplay(true), 10000);
            }}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              active === index 
                ? "bg-[#E8C848] w-8" 
                : "bg-gray-600 hover:bg-gray-500"
            }`}
            aria-label={`View testimonial ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

// Add these custom components before the main Landing component
const FadeInWhenVisible = ({ children, delay = 0 }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { 
    margin: "-100% -100px",
    once: true
  })
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView && { opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.8, 
        delay
      }}
    >
      {children}
    </motion.div>
  )
}

const StaggerChildren = ({ children }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { 
    margin: "-100% -100px",
    once: true
  })
  
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        hidden: { 
          opacity: 0
        },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.2,
            delayChildren: 0.1
          }
        }
      }}
    >
      {children}
    </motion.div>
  )
}

const StaggerItem = ({ children }) => {
  return (
    <motion.div
      variants={{
        hidden: { 
          opacity: 0, 
          y: 50
        },
        visible: { 
          opacity: 1, 
          y: 0,
          transition: {
            duration: 0.5,
            ease: "easeOut"
          }
        }
      }}
    >
      {children}
    </motion.div>
  )
}

function Landing() {
  const splineRef = useRef();
  const heroRef = useRef();
  const isHeroInView = useInView(heroRef, { 
    margin: "-100% -100px",
    once: true
  });

  const onLoad = (spline) => {
    if (!spline) return;
    splineRef.current = spline;
  };

  return (
    <div className="relative min-h-screen bg-[#111111] text-white overflow-hidden">
      {/* Main Spline Scene */}
      <div className="fixed inset-0 w-full h-full z-0">
        <Spline
          scene="https://prod.spline.design/2Set-V-9Fslee20l/scene.splinecode"
          onLoad={onLoad}
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 pointer-events-none">
        <div className="pointer-events-auto">
          <Navbar />
        </div>

        {/* Hero Section */}
        <motion.section 
          ref={heroRef}
          className="h-[70vh] flex items-center justify-center px-4 mt-32"
          initial={{ opacity: 0, y: 100 }}
          animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 100 }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 20,
            mass: 1
          }}
        >
          <div className="max-w-7xl mx-auto text-center pointer-events-auto">
            <motion.div 
              className="space-y-12"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isHeroInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
              transition={{ 
                duration: 0.8,
                ease: [0.6, -0.05, 0.01, 0.99]
              }}
            >
              <motion.div 
                className="flex flex-col sm:flex-row gap-20 justify-center pt-80"
                initial={{ opacity: 0, y: 50 }}
                animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                transition={{ 
                  delay: 0.3,
                  duration: 0.8,
                  type: "spring",
                  stiffness: 100
                }}
              >
                <motion.button 
                  whileHover={{ 
                    scale: 1.1,
                    rotate: 2,
                    boxShadow: "0 0 20px rgba(255, 255, 255, 0.5)"
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="px-10 py-5 bg-white text-gray-900 rounded-full font-medium hover:bg-gray-100 transition-all duration-300 text-lg shadow-lg"
                >
                  Get Started
                </motion.button>
                <motion.button 
                  whileHover={{ 
                    scale: 1.1,
                    rotate: -2,
                    boxShadow: "0 0 20px rgba(255, 255, 255, 0.5)"
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="px-10 py-5 border-2 border-white/80 rounded-full font-medium text-white hover:bg-white hover:text-gray-900 transition-all duration-300 text-lg"
                >
                  Learn More
                </motion.button>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* Stats Section */}
        <motion.section 
          className="py-10 px-4 -mt-5"
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ 
            duration: 0.8,
            type: "spring",
            stiffness: 100
          }}
        >
          <div className="max-w-7xl mx-auto">
            <StaggerChildren>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {[
                  { icon: <FaUser className="w-8 h-8" />, label: "Active Users", value: "5,000+" },
                  { icon: <FaCode className="w-8 h-8" />, label: "Projects Completed", value: "1,000+" },
                  { icon: <FaLaptopCode className="w-8 h-8" />, label: "Teams Formed", value: "2,500+" },
                  { icon: <FaChartLine className="w-8 h-8" />, label: "Success Rate", value: "95%" },
                ].map((stat, index) => (
                  <StaggerItem key={stat.label}>
                    <motion.div 
                      className="text-center p-6 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 hover:border-white/20 transition-all duration-300"
                      whileHover={{ 
                        scale: 1.1,
                        rotate: 2,
                        backgroundColor: "rgba(255, 255, 255, 0.15)",
                        boxShadow: "0 0 30px rgba(255, 255, 255, 0.2)",
                        transition: { 
                          duration: 0.3,
                          type: "spring",
                          stiffness: 300
                        }
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <motion.div 
                        className="text-white/90 mb-4 flex justify-center"
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                      >
                        {stat.icon}
                      </motion.div>
                      <motion.div 
                        className="text-3xl font-bold mb-2 text-white"
                        whileHover={{ scale: 1.2 }}
                        transition={{ duration: 0.2 }}
                      >
                        {stat.value}
                      </motion.div>
                      <div className="text-gray-300">{stat.label}</div>
                    </motion.div>
                  </StaggerItem>
                ))}
              </div>
            </StaggerChildren>
          </div>
        </motion.section>

        {/* Features Section */}
        <motion.section 
          className="py-20 px-4"
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ 
            duration: 0.8,
            type: "spring",
            stiffness: 100
          }}
        >
          <div className="max-w-7xl mx-auto">
            <FadeInWhenVisible>
              <div className="text-center mb-16">
                <motion.h2 
                  className="text-4xl font-bold mb-4 text-white"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ 
                    delay: 0.2,
                    type: "spring",
                    stiffness: 100
                  }}
                >
                  Key Features
                </motion.h2>
                <motion.p 
                  className="text-xl text-gray-300 max-w-3xl mx-auto"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ 
                    delay: 0.3,
                    type: "spring",
                    stiffness: 100
                  }}
                >
                  Everything you need to build and manage successful teams
                </motion.p>
              </div>
            </FadeInWhenVisible>

            <StaggerChildren>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {features.map((feature, index) => (
                  <StaggerItem key={index}>
                    <motion.div 
                      className="p-8 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 hover:border-white/20 transition-all duration-300"
                      whileHover={{ 
                        scale: 1.1,
                        rotate: 2,
                        backgroundColor: "rgba(255, 255, 255, 0.15)",
                        boxShadow: "0 0 30px rgba(255, 255, 255, 0.2)",
                        transition: { 
                          duration: 0.3,
                          type: "spring",
                          stiffness: 300
                        }
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <motion.div 
                        className="text-white/90 mb-4"
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                      >
                        {feature.icon}
                      </motion.div>
                      <motion.h3 
                        className="text-xl font-semibold mb-2 text-white"
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.2 }}
                      >
                        {feature.title}
                      </motion.h3>
                      <p className="text-gray-300">{feature.description}</p>
                    </motion.div>
                  </StaggerItem>
                ))}
              </div>
            </StaggerChildren>
          </div>
        </motion.section>

        {/* Testimonials Section */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <FadeInWhenVisible>
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold mb-4 text-white">What Our Users Say</h2>
                <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                  Hear from students and mentors who have experienced success with our platform
                </p>
              </div>
            </FadeInWhenVisible>
            
            <FadeInWhenVisible delay={0.2}>
              <AnimatedTestimonials testimonials={enhancedTestimonials} />
            </FadeInWhenVisible>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-4 border-t border-white/10">
          <div className="max-w-7xl mx-auto">
            <FadeInWhenVisible>
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="mb-4 md:mb-0">
                  <h2 className="text-xl font-bold flex items-center text-white">
                    <span className="text-white/90 mr-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </span>
                    TeamSync
                  </h2>
                </div>
                <div className="flex space-x-6">
                  <a href="#" className="text-white/80 hover:text-white transition-colors duration-300">
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                    </svg>
                  </a>
                  <a href="#" className="text-white/80 hover:text-white transition-colors duration-300">
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  </a>
                  <a href="#" className="text-white/80 hover:text-white transition-colors duration-300">
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                </div>
              </div>
              <div className="border-t border-white/10 mt-8 pt-8 text-center">
                <p className="text-gray-400 text-sm">&copy; {new Date().getFullYear()} TeamSync. All rights reserved.</p>
              </div>
            </FadeInWhenVisible>
          </div>
        </footer>
      </div>
    </div>
  )
}

// Enhanced testimonials data with longer quotes and better structured information
const enhancedTestimonials = [
  {
    quote: "TeamSync transformed our hackathon experience completely. The AI matching paired me with teammates whose skills perfectly complemented mine - we had coverage across frontend, ML, and data science. We ended up winning first place and have continued working together on other projects!",
    name: "Sarah Johnson",
    role: "Computer Science Student",
    image: null,
  },
  {
    quote: "As a faculty mentor, I've seen tremendous improvement in how teams collaborate since adopting TeamSync. The progress tracking features let me provide targeted guidance exactly when teams need it, and the milestone system keeps everyone accountable. My teams' success rate has improved by 40%.",
    name: "Dr. Michael Chen",
    role: "Faculty Mentor",
    image: null,
  },
  {
    quote: "Finding teammates used to be the most stressful part of competitions. TeamSync matched me with an amazing team in minutes - people I would have never connected with otherwise. Our diverse backgrounds gave us a competitive edge that judges specifically mentioned in their feedback.",
    name: "Alex Rodriguez",
    role: "Engineering Student",
    image: null,
  },
  {
    quote: "The mentor matching algorithm paired our team with an industry expert who provided invaluable insights for our project. The platform's communication tools made collaboration seamless despite our different schedules. TeamSync is now essential for every competition we enter.",
    name: "Emily Patel",
    role: "Data Science Major",
    image: null,
  },
  {
    quote: "Managing multiple competition teams used to be overwhelming. Now I can track all teams' progress in one place, provide resources through the platform, and quickly identify which teams need additional support. TeamSync has revolutionized how we organize technical competitions.",
    name: "Professor James Wilson",
    role: "Competition Coordinator",
    image: null,
  },
];

// Features data
const features = [
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-10 w-10"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
    ),
    title: "Smart Team Formation",
    description: "AI-driven matching based on complementary skills and experience for optimal team composition.",
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-10 w-10"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    ),
    title: "Teammate Search",
    description: "Find the perfect teammates with advanced filtering by skills, department, and experience.",
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-10 w-10"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
    ),
    title: "Expert Mentorship",
    description: "Get matched with faculty mentors based on competition type and team needs.",
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-10 w-10"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
        />
      </svg>
    ),
    title: "Progress Tracking",
    description: "Monitor milestones, deadlines, and team performance throughout the competition.",
  },
];

export default Landing;