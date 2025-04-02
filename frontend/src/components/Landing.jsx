import React, { useState, useEffect, useRef } from "react";

function Landing() {
  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* Interactive Grid Background with Spotlight */}
      <InteractiveGridBackground />

      {/* Navbar */}
      {/* <Navbar /> */}

      {/* Hero Section */}
      <section className="relative z-10">
        <div className="container mx-auto px-4 pt-32 pb-20">
          <TypewriterHero />
        </div>
      </section>

      {/* Sparkles Section */}
      <section className="relative z-10">
        {/* <SparklesPreview /> */}
      </section>

      {/* Features Section with 3D Cards */}
      <section className="relative z-10 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="px-4 py-1 rounded-full text-sm font-medium bg-purple-900/30 text-purple-300 inline-block mb-4">
              POWERFUL FEATURES
            </span>
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Our platform streamlines the entire process from team formation to competition success.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <ThreeDCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* Tracing Beam Section */}
      <section className="relative z-10 py-20">
        <div className="container mx-auto px-4">
          {/* <TracingBeamSection /> */}
        </div>
      </section>

      {/* Glowing Cards Section */}
      <section className="relative z-10 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="px-4 py-1 rounded-full text-sm font-medium bg-purple-900/30 text-purple-300 inline-block mb-4">
              WHY CHOOSE US
            </span>
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              Our Advantages
            </h2>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            <GlowingCard
              title="Smart Team Formation"
              description="AI-driven matching based on complementary skills and experience for optimal team composition."
              icon={<TeamIcon />}
            />
            <GlowingCard
              title="Expert Mentorship"
              description="Get matched with faculty mentors based on competition type and team needs."
              icon={<MentorIcon />}
            />
            <GlowingCard
              title="Progress Tracking"
              description="Monitor milestones, deadlines, and team performance throughout the competition."
              icon={<TrackingIcon />}
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative z-10 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="px-4 py-1 rounded-full text-sm font-medium bg-purple-900/30 text-purple-300 inline-block mb-4">
              TESTIMONIALS
            </span>
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              What Our Users Say
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={index} {...testimonial} />
            ))}
          </div>
        </div>
      </section>

      

      {/* Footer */}
      <footer className="relative z-10 py-12 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <h2 className="text-2xl font-bold flex items-center mb-4">
                <span className="text-purple-500 mr-2">
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
              <p className="text-gray-400 mb-4">
                Building winning teams through smart matching and expert mentorship. Our AI-powered platform helps you form the perfect teams for technical competitions.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">Features</a></li>
                <li><a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">Case Studies</a></li>
                <li><a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">Documentation</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-800">
            <p className="text-gray-500 text-sm mb-4 md:mb-0">&copy; {new Date().getFullYear()} TeamSync. All rights reserved.</p>
            <div className="flex space-x-6">
              {['twitter', 'github', 'instagram'].map((social) => (
                <a key={social} href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                  <span className="sr-only">{social}</span>
                  <SocialIcon type={social} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Navbar Component
function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-black/80 backdrop-blur-md shadow-lg' : 'bg-transparent'}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <a href="#" className="flex items-center">
              <div className="h-10 w-10 rounded-md bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center mr-2">
                <span className="text-white font-bold">TS</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                TeamSync
              </span>
            </a>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="text-gray-300 hover:text-white transition-colors">How It Works</a>
            <a href="#testimonials" className="text-gray-300 hover:text-white transition-colors">Testimonials</a>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <button className="px-4 py-2 text-gray-300 hover:text-white transition-colors">
              Log in
            </button>
            <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-md hover:from-purple-700 hover:to-indigo-700 transition-all duration-300">
              Sign up
            </button>
          </div>
          
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-300 hover:text-white"
            >
              {isMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
        
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-800">
            <div className="flex flex-col space-y-4">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-300 hover:text-white transition-colors">How It Works</a>
              <a href="#testimonials" className="text-gray-300 hover:text-white transition-colors">Testimonials</a>
              <div className="pt-4 flex flex-col space-y-4">
                <button className="px-4 py-2 text-gray-300 hover:text-white transition-colors border border-gray-700 rounded-md">
                  Log in
                </button>
                <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-md hover:from-purple-700 hover:to-indigo-700 transition-all duration-300">
                  Sign up
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

// Interactive Grid Background with Spotlight
function InteractiveGridBackground() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden">
      {/* Base Layer */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A14] to-[#121220]">
        {/* Full Grid Pattern - Always Visible But Darker */}
        <svg 
          className="absolute inset-0 w-full h-full opacity-20" 
          xmlns="http://www.w3.org/2000/svg" 
          width="100%" 
          height="100%"
        >
          <defs>
            <pattern id="grid-pattern-base" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(75, 85, 99, 0.6)" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-pattern-base)" />
        </svg>
        
        {/* Animated Gradient Overlay */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(91, 33, 182, 0.4) 0%, transparent 70%)',
            animation: 'pulse 8s ease-in-out infinite alternate'
          }}
        />
        
        {/* Spotlight Effect with Brighter Grid */}
        <div
          className="absolute inset-x-0 inset-y-0"
          style={{
            mask: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, white, transparent)`,
            WebkitMask: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, white, transparent)`,
          }}
        >
          {/* Grid Pattern Inside Spotlight - Brighter */}
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
            <defs>
              <pattern id="grid-pattern-highlight" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(168, 85, 247, 0.6)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-pattern-highlight)" />
          </svg>
        </div>
        
        {/* Animated Stars */}
        <div className="stars-container">
          {[...Array(100)].map((_, i) => (
            <div 
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 2 + 1}px`,
                height: `${Math.random() * 2 + 1}px`,
                opacity: Math.random() * 0.7 + 0.3,
                animation: `twinkle ${Math.random() * 5 + 5}s ease-in-out infinite`
              }}
            />
          ))}
        </div>
      </div>
      
      {/* Global CSS for animations */}
      <style jsx>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}

// Typewriter Hero Component
function TypewriterHero() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [text, setText] = useState("");
  const [typingSpeed, setTypingSpeed] = useState(150);

  const words = ["awesome", "innovative", "powerful", "seamless", "intelligent"];

  useEffect(() => {
    const timeout = setTimeout(() => {
      // Current word being typed
      const currentWord = words[currentWordIndex];

      // If deleting
      if (isDeleting) {
        setText(currentWord.substring(0, currentCharIndex - 1));
        setCurrentCharIndex((prev) => prev - 1);
        setTypingSpeed(50); // Faster when deleting
      }
      // If typing
      else {
        setText(currentWord.substring(0, currentCharIndex + 1));
        setCurrentCharIndex((prev) => prev + 1);
        setTypingSpeed(150); // Normal typing speed
      }

      // If word is complete
      if (!isDeleting && currentCharIndex === currentWord.length) {
        setTypingSpeed(2000); // Pause at the end of the word
        setIsDeleting(true);
      }
      // If word is deleted
      else if (isDeleting && currentCharIndex === 0) {
        setIsDeleting(false);
        setCurrentWordIndex((prev) => (prev + 1) % words.length);
        setTypingSpeed(500); // Pause before typing the next word
      }
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [currentWordIndex, currentCharIndex, isDeleting, words, typingSpeed]);

  return (
    <div className="flex flex-col items-center justify-center text-center py-20">
      <div className="inline-block px-4 py-1 rounded-full text-sm font-medium bg-purple-900/30 text-purple-300 mb-6">
        THE ROAD TO SUCCESS STARTS HERE
      </div>
      <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6">
        Build <span className="bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">{text}</span> teams
      </h1>
      <p className="text-xl text-gray-300 max-w-2xl mb-8">
        Our AI-powered platform helps you form the perfect teams for technical competitions with complementary skills
        and expert mentorship.
      </p>
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-md hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg shadow-purple-500/25">
          Get Started
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
        <button className="px-8 py-4 bg-transparent border border-purple-500 rounded-md hover:bg-purple-900/20 transition-colors duration-300">
          Learn More
        </button>
      </div>
    </div>
  );
}

// SparklesPreview Component
function SparklesPreview() {
  const [particles, setParticles] = useState([]);
  const containerRef = useRef(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    const generateParticles = () => {
      const width = containerRef.current.offsetWidth;
      const height = containerRef.current.offsetHeight;
      
      const newParticles = [];
      const particleCount = 1200;
      
      for (let i = 0; i < particleCount; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 0.6 + 0.4,
          color: '#FFFFFF',
          opacity: Math.random() * 0.5 + 0.3
        });
      }
      
      setParticles(newParticles);
    };
    
    generateParticles();
    
    const handleResize = () => {
      generateParticles();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <div
      ref={containerRef}
      className="h-[40rem] w-full flex flex-col items-center justify-center overflow-hidden relative"
    >
      <h1 className="md:text-7xl text-3xl lg:text-9xl font-bold text-center text-white relative z-20">
        TeamSync
      </h1>
      <div className="w-[40rem] h-40 relative">
        {/* Gradients */}
        <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-purple-500 to-transparent h-[2px] w-3/4 blur-sm" />
        <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-purple-500 to-transparent h-px w-3/4" />
        <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-pink-500 to-transparent h-[5px] w-1/4 blur-sm" />
        <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-pink-500 to-transparent h-px w-1/4" />

        {/* Particles */}
        <div className="absolute inset-0">
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="absolute rounded-full"
              style={{
                left: `${particle.x}px`,
                top: `${particle.y}px`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                backgroundColor: particle.color,
                opacity: particle.opacity,
              }}
            />
          ))}
        </div>

        {/* Radial Gradient to prevent sharp edges */}
        <div className="absolute inset-0 w-full h-full bg-black [mask-image:radial-gradient(350px_200px_at_top,transparent_20%,white)]"></div>
      </div>
    </div>
  );
}

// 3D Card Component
function ThreeDCard({ icon, title, description }) {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const rotateY = ((e.clientX - centerX) / (rect.width / 2)) * 10;
    const rotateX = -((e.clientY - centerY) / (rect.height / 2)) * 10;
    
    setRotation({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
  };

  return (
    <div
      ref={cardRef}
      className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-xl shadow-lg border border-gray-800 hover:border-purple-500/50 transition-all duration-300 hover:shadow-purple-500/10 hover:shadow-xl group"
      style={{
        transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
        transition: 'transform 0.2s ease-out',
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="text-purple-500 mb-6 transform group-hover:scale-110 transition-transform duration-300">{icon}</div>
      <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}

// Tracing Beam Section
function TracingBeamSection() {
  const beamRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % tracingBeamContent.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    if (!beamRef.current) return;
    
    const items = beamRef.current.querySelectorAll('.tracing-beam-item');
    if (!items.length) return;
    
    const activeItem = items[activeIndex];
    if (!activeItem) return;
    
    const rect = activeItem.getBoundingClientRect();
    const beamElement = beamRef.current.querySelector('.tracing-beam');
    
    if (beamElement) {
      beamElement.style.height = `${rect.height + 40}px`;
      beamElement.style.top = `${rect.top - beamRef.current.getBoundingClientRect().top - 20}px`;
    }
  }, [activeIndex]);
  
  return (
    <div ref={beamRef} className="relative max-w-4xl mx-auto">
      <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-purple-500 to-transparent" />
      
      <div className="absolute left-8 w-px tracing-beam bg-purple-500 transition-all duration-500 ease-in-out" style={{ top: 0, height: 0 }} />
      
      <div className="ml-16">
        <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">How TeamSync Works</h2>
        
        {tracingBeamContent.map((item, index) => (
          <div 
            key={index} 
            className={`tracing-beam-item mb-12 transition-opacity duration-500 ${activeIndex === index ? 'opacity-100' : 'opacity-50'}`}
            onClick={() => setActiveIndex(index)}
          >
            <div className="flex items-center mb-4">
              <div className="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center text-black font-bold mr-4">
                {index + 1}
              </div>
              <h3 className="text-xl font-semibold">{item.title}</h3>
            </div>
            <div className="pl-12">
              <p className="text-gray-400 mb-4">{item.description}</p>
              {item.image && (
                <div className="rounded-lg overflow-hidden mb-4 border border-gray-800">
                  <img src={item.image || "/placeholder.svg"} alt={item.title} className="w-full h-auto" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Glowing Card Component
function GlowingCard({ title, description, icon }) {
  return (
    <div className="relative group max-w-sm">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
      <div className="relative px-7 py-6 bg-black rounded-lg leading-none flex items-center">
        <div className="flex flex-col">
          <div className="flex items-center mb-4">
            <div className="text-purple-500 mr-4">{icon}</div>
            <p className="text-purple-400 font-semibold text-lg">{title}</p>
          </div>
          <p className="text-gray-300">{description}</p>
        </div>
      </div>
    </div>
  );
}

// Testimonial Card Component
function TestimonialCard({ name, role, content, avatar }) {
  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-xl shadow-lg border border-gray-800 hover:border-purple-500/50 transition-all duration-300">
      <div className="mb-6">
        <svg className="h-8 w-8 text-purple-500/40" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
        </svg>
      </div>
      <p className="text-gray-300 italic mb-6">{content}</p>
      <div className="flex items-center">
        <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center mr-3">
          {avatar || <span className="text-purple-500 font-bold">{name.charAt(0)}</span>}
        </div>
        <div>
          <h4 className="font-semibold text-white">{name}</h4>
          <p className="text-sm text-gray-400">{role}</p>
        </div>
      </div>
    </div>
  );
}

// Icon Components
function TeamIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
}

function MentorIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );
}

function TrackingIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

function SocialIcon({ type }) {
  switch (type) {
    case 'twitter':
      return (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
        </svg>
      );
    case 'github':
      return (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
      );
    case 'instagram':
      return (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      );
    default:
      return null;
  }
}

// Features data
const features = [
  {
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>,
    title: "Smart Team Formation",
    description: "Use AI-powered matching to build teams with complementary skills and experiences."
  },
  {
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>,
    title: "Advanced Search",
    description: "Find the perfect teammates with detailed filtering based on skills, experience, and interests."
  },
  {
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>,
    title: "Expert Mentorship",
    description: "Connect with faculty mentors specialized in your competition domain for guidance and support."
  },
  {
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>,
    title: "Progress Tracking",
    description: "Monitor team milestones, deadlines, and performance with intuitive visualization tools."
  }
];

// Tracing Beam Section Content
const tracingBeamContent = [
  {
    title: "Create Your Profile",
    description: "Sign up and build your comprehensive profile showcasing your skills, experience, and competition interests. Our AI analyzes your profile to understand your strengths and team fit.",
    image: "/profile.jpg" 
  },
  {
    title: "Find Your Perfect Team",
    description: "Use our smart matching system to connect with teammates whose skills complement yours. Filter by competition type, skill requirements, and availability to find the ideal match.",
    image: "/team-matching.jpg"
  },
  {
    title: "Get Expert Guidance",
    description: "Get matched with faculty mentors specialized in your competition domain. Receive personalized guidance, feedback, and support throughout your competition journey.",
    image: "/mentorship.jpg"
  },
  {
    title: "Track Your Progress",
    description: "Monitor your team's performance with comprehensive tracking tools. Set milestones, track deadlines, and visualize your progress to stay on target for competition success.",
    image: "/progress.jpg"
  }
];

// Testimonials data
const testimonials = [
  {
    name: "Alex Johnson",
    role: "Computer Science Student",
    content: "TeamSync helped me find teammates with the exact skills our hackathon project needed. We ended up winning first place thanks to our perfect team composition!",
  },
  {
    name: "Priya Sharma",
    role: "Faculty Mentor",
    content: "As a mentor, TeamSync makes it easy to guide student teams based on their specific needs. The progress tracking tools help me provide timely and relevant feedback.",
  },
  {
    name: "Michael Chen",
    role: "Engineering Student",
    content: "I was struggling to find teammates for the robotics competition until I found TeamSync. The AI matching suggested teammates I would have never considered, but we worked together brilliantly.",
  }
];

export default Landing;
