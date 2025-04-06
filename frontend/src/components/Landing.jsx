"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { FaUser, FaCode, FaLaptopCode, FaChartLine, FaQuoteLeft } from "react-icons/fa"
import Navbar from "./Navbar"

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

function Landing() {
  return (
    <div className="relative min-h-screen bg-[#121212] text-white overflow-hidden">
      {/* Interactive Grid Background */}
      <InteractiveGridBackground />

      {/* Navbar */}
      <Navbar />

      {/* Hero Section with Typewriter */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#121212]/50 to-[#121212]"></div>

        {/* Animated particles in background */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <FloatingParticle key={i} delay={i * 200} />
          ))}
        </div>

        <div className="container mx-auto px-4 pb-16 relative z-10">
          <div className="max-w-7xl mx-auto">
            <TypewriterHero />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-5xl mx-auto">
              {[
                { icon: <FaUser className="w-6 h-6" />, label: "Active Users", value: "5,000+" },
                { icon: <FaCode className="w-6 h-6" />, label: "Projects Completed", value: "1,000+" },
                { icon: <FaLaptopCode className="w-6 h-6" />, label: "Teams Formed", value: "2,500+" },
                { icon: <FaChartLine className="w-6 h-6" />, label: "Success Rate", value: "95%" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="bg-[#121212]/40 backdrop-blur-lg rounded-xl p-4 md:p-6 border border-white/10 transition-all duration-300 hover:border-[#E8C848]/30 hover:transform hover:scale-105 h-full">
                    <div className="mb-2 text-[#E8C848] flex justify-center">{stat.icon}</div>
                    <div className="text-2xl md:text-3xl font-bold mb-1">{stat.value}</div>
                    <div className="text-xs md:text-sm text-zinc-400">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-20 bg-[#121212]/80">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Key Features</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Our platform streamlines the entire process from team formation to competition success.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative z-10 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Get started with TeamSync in just a few simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-[#E8C848] text-[#121212] flex items-center justify-center text-2xl font-bold mb-4">
                    {index + 1}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-gray-400 text-center">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-[#E8C848] to-transparent transform -translate-x-8"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Testimonials Section */}
      <section className="relative z-10 py-20 bg-[#121212]/80">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">What Our Users Say</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Hear from students and mentors who have experienced success with TeamSync
            </p>
          </div>
          
          <AnimatedTestimonials testimonials={enhancedTestimonials} />
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h2 className="text-xl font-bold flex items-center">
                <span className="text-[#E8C848] mr-2">
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
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} TeamSync. All rights reserved.</p>
          </div>
        </div>
      </footer>
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

// Improved Interactive Grid Background
function InteractiveGridBackground() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const containerRef = useRef(null)

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        const x = ((e.clientX - rect.left) / rect.width) * 100
        const y = ((e.clientY - rect.top) / rect.height) * 100
        setMousePosition({ x, y })
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden bg-[#121212]">
      <div
        className="absolute inset-x-0 inset-y-[-30%] h-[200%] skew-y-12"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(232, 200, 72, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(232, 200, 72, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          maskImage: `radial-gradient(400px circle at ${mousePosition.x}% ${mousePosition.y}%, white, transparent)`,
          WebkitMaskImage: `radial-gradient(400px circle at ${mousePosition.x}% ${mousePosition.y}%, white, transparent)`,
        }}
      />
    </div>
  )
}

// Floating Particle Component
function FloatingParticle({ delay }) {
  const style = {
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    animationDelay: `${delay}ms`,
    opacity: Math.random() * 0.5 + 0.1,
    width: `${Math.random() * 4 + 1}px`,
    height: `${Math.random() * 4 + 1}px`,
  }

  return (
    <div
      className="absolute rounded-full bg-[#E8C848] animate-pulse"
      style={{
        ...style,
        animationDuration: `${Math.random() * 3000 + 2000}ms`,
      }}
    />
  )
}

// Typewriter Hero Component
function TypewriterHero() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [currentCharIndex, setCurrentCharIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [text, setText] = useState("")
  const [typingSpeed, setTypingSpeed] = useState(150)

  const words = ["awesome", "innovative", "powerful", "seamless", "intelligent"]

  useEffect(() => {
    const timeout = setTimeout(() => {
      // Current word being typed
      const currentWord = words[currentWordIndex]

      // If deleting
      if (isDeleting) {
        setText(currentWord.substring(0, currentCharIndex - 1))
        setCurrentCharIndex((prev) => prev - 1)
        setTypingSpeed(50) // Faster when deleting
      }
      // If typing
      else {
        setText(currentWord.substring(0, currentCharIndex + 1))
        setCurrentCharIndex((prev) => prev + 1)
        setTypingSpeed(150) // Normal typing speed
      }

      // If word is complete
      if (!isDeleting && currentCharIndex === currentWord.length) {
        setTypingSpeed(2000) // Pause at the end of the word
        setIsDeleting(true)
      }
      // If word is deleted
      else if (isDeleting && currentCharIndex === 0) {
        setIsDeleting(false)
        setCurrentWordIndex((prev) => (prev + 1) % words.length)
        setTypingSpeed(500) // Pause before typing the next word
      }
    }, typingSpeed)

    return () => clearTimeout(timeout)
  }, [currentWordIndex, currentCharIndex, isDeleting, words, typingSpeed])

  return (
    <div className="flex flex-col items-center justify-center text-center py-20">
      <div className="inline-block bg-gradient-to-r from-[#E8C848] to-[#E8C848]/70 text-transparent bg-clip-text text-sm sm:text-base mb-4 font-medium">
        THE ROAD TO SUCCESS STARTS HERE
      </div>
      <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
        Build{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E8C848] to-[#E8C848]/70">{text}</span>{" "}
        teams
      </h1>
      <p className="text-xl text-gray-300 max-w-2xl mb-10 leading-relaxed">
        Our AI-powered platform helps you form the perfect teams for technical competitions with complementary skills
        and expert mentorship.
      </p>
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
        <button className="px-8 py-4 bg-gradient-to-r from-[#E8C848] to-[#E8C848]/80 rounded-full hover:from-[#E8C848]/80 hover:to-[#E8C848]/60 transition-all duration-300 shadow-lg shadow-[#E8C848]/30 font-medium text-lg text-[#121212]">
          Get Started
        </button>
        <button className="px-8 py-4 bg-transparent border border-[#E8C848] rounded-full hover:bg-[#E8C848]/10 transition-all duration-300 font-medium text-lg">
          Learn More
        </button>
      </div>
    </div>
  )
}

// Feature Card Component
function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-[#1A1A1A] p-8 rounded-lg shadow-lg border border-gray-800 hover:border-[#E8C848]/50 transition-all duration-300 hover:shadow-[#E8C848]/10 hover:shadow-xl">
      <div className="text-[#E8C848] mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  )
}

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

// ...existing code...

// Steps data
const steps = [
  {
    title: "Create Your Profile",
    description: "Sign up and add your skills, experience, and competition interests to your profile.",
  },
  {
    title: "Find Your Team",
    description: "Use our AI matching system to find teammates with complementary skills or search manually.",
  },
  {
    title: "Compete and Succeed",
    description: "Get matched with a mentor, receive guidance, and track your team's progress to competition success.",
  },
];

// Gradient configurations for consistent styling
const gradients = {
  primary: "bg-gradient-to-r from-[#E8C848] to-[#E8C848]/80",
  secondary: "bg-gradient-to-r from-[#E8C848]/20 to-transparent",
  text: "bg-gradient-to-r from-[#E8C848] to-[#E8C848]/70 text-transparent bg-clip-text"
};

// Animation variants for consistent motion
const motionVariants = {
  fadeIn: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  },
  scale: {
    initial: { scale: 0.95 },
    animate: { scale: 1 },
    transition: { duration: 0.3 }
  }
};

export default Landing;