import {react,useState,useRef, useEffect} from 'react'

function Landing() {
  const [showTestimonialModal, setShowTestimonialModal] = useState(false);
  const [showTestimonialForm, setShowTestimonialForm] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [testimonialType, setTestimonialType] = useState('student');
  const [rating, setRating] = useState(0);

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* Interactive Grid Background with Spotlight */}
      <InteractiveGridBackground />

      {/* Hero Section */}
      <section className="relative z-10">
        <div className="container mx-auto px-4 pt-32 pb-20">
          <TypewriterHero />
        </div>
      </section>

      {/* Integrated Features Section */}
      <section id="features" className="relative z-10 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="px-4 py-1 rounded-full text-sm font-medium bg-black border border-[#00E0FF]/30 text-[#00E0FF] inline-block mb-4">
              OUR PLATFORM
            </span>
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-[#00E0FF] to-[#2563EB] bg-clip-text text-transparent">
              Features & Advantages
            </h2>
            <p className="text-xl text-[#ACB6E5]/90 max-w-3xl mx-auto mb-6">
              Our platform streamlines the entire process from team formation to competition success.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {integratedFeatures.slice(0, 3).map((feature, index) => (
              <EnhancedFeatureCard 
                key={index} 
                {...feature} 
                index={index} 
              />
            ))}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {integratedFeatures.slice(3).map((feature, index) => (
              <EnhancedFeatureCard 
                key={index + 3} 
                {...feature} 
                index={index + 3} 
              />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="relative z-10 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="px-4 py-1 rounded-full text-sm font-medium bg-black border border-[#0EE6B7]/30 text-[#0EE6B7] inline-block mb-4">
              TESTIMONIALS
            </span>
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-[#0EE6B7] to-[#00E0FF] bg-clip-text text-transparent">
              What Our Users Say
            </h2>
          </div>
          <ImprovedTestimonialsStack testimonials={testimonials} />
          
          {/* Submit Your Testimonial Section */}
          <div className="mt-16 max-w-3xl mx-auto text-center">
            <div 
              className="cursor-pointer bg-black border border-[#00E0FF]/20 hover:border-[#00E0FF]/50 rounded-xl p-8 transition-all duration-300 transform hover:-translate-y-1"
              onClick={() => setShowTestimonialModal(true)}
            >
              <div className="mb-6 mx-auto w-16 h-16 rounded-full bg-gradient-to-r from-[#00E0FF]/10 to-[#0EE6B7]/10 flex items-center justify-center border border-[#00E0FF]/30">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#00E0FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              
              <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-[#00E0FF] to-[#0EE6B7] bg-clip-text text-transparent">
                Share Your Experience
              </h3>
              
              <p className="text-[#ACB6E5]/80 mb-6">
                Help others understand the benefits of TeamSync by sharing your own success story.
              </p>
              
              <button className="group inline-flex items-center bg-transparent border border-[#00E0FF]/30 text-[#00E0FF] px-5 py-2 rounded-full hover:bg-[#00E0FF]/10 transition-all duration-300">
                Submit Testimonial 
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Modal */}
      {showTestimonialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowTestimonialModal(false)}
          ></div>
          
          {/* Modal Content */}
          <div className="relative z-10 bg-[#0A0A0A] border border-[#00E0FF]/20 rounded-xl max-w-md w-full p-6 transform transition-all duration-300 scale-100">
            <button 
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
              onClick={() => setShowTestimonialModal(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="text-center mb-8">
              <div className="h-20 w-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-[#00E0FF]/20 to-[#0EE6B7]/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[#00E0FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-[#00E0FF] to-[#0EE6B7] bg-clip-text text-transparent mb-2">
                Share Your Testimonial
              </h3>
              <p className="text-[#ACB6E5]/80">
                How would you like to submit your feedback?
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                className="bg-transparent border border-[#00E0FF]/30 hover:bg-[#00E0FF]/10 text-[#00E0FF] rounded-lg p-4 transition-all duration-300 flex flex-col items-center"
                onClick={() => {
                  setTestimonialType('student');
                  setShowTestimonialForm(true);
                  setShowTestimonialModal(false);
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                </svg>
                <span className="font-medium">As a Student</span>
              </button>
              
              <button 
                className="bg-transparent border border-[#0EE6B7]/30 hover:bg-[#0EE6B7]/10 text-[#0EE6B7] rounded-lg p-4 transition-all duration-300 flex flex-col items-center"
                onClick={() => {
                  setTestimonialType('mentor');
                  setShowTestimonialForm(true);
                  setShowTestimonialModal(false);
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span className="font-medium">As a Mentor</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Testimonial Form Modal */}
      {showTestimonialForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowTestimonialForm(false)}
          ></div>
          
          {/* Form Modal Content */}
          <div className="relative z-10 bg-[#0A0A0A] border border-[#00E0FF]/20 rounded-xl max-w-lg w-full p-6 transform transition-all duration-300 scale-100">
            <button 
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
              onClick={() => setShowTestimonialForm(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-[#00E0FF] to-[#0EE6B7] bg-clip-text text-transparent mb-2">
                {testimonialType === 'student' ? 'Student Testimonial' : 'Mentor Testimonial'}
              </h3>
              <p className="text-[#ACB6E5]/80">
                Please share your experience with TeamSync
              </p>
            </div>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 rounded-md bg-black border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-[#00E0FF]/50 focus:border-transparent"
                  placeholder="Your name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  {testimonialType === 'student' ? 'Field of Study' : 'Area of Expertise'}
                </label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 rounded-md bg-black border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-[#00E0FF]/50 focus:border-transparent"
                  placeholder={testimonialType === 'student' ? 'e.g., Computer Science' : 'e.g., Machine Learning'}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Your Testimonial</label>
                <textarea 
                  className="w-full px-4 py-2 rounded-md bg-black border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-[#00E0FF]/50 focus:border-transparent min-h-[120px]"
                  placeholder="Share your experience with TeamSync..."
                ></textarea>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Rating</label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className="text-gray-400 hover:text-[#00E0FF] focus:outline-none"
                      onClick={() => setRating(star)}
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-8 w-8" 
                        fill={rating >= star ? "currentColor" : "none"} 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={rating >= star ? 0 : 2} 
                          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" 
                        />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
              
              <button 
                type="button"
                className="w-full py-3 px-4 bg-gradient-to-r from-[#00E0FF] to-[#0EE6B7] text-black font-medium rounded-md hover:from-[#0EE6B7] hover:to-[#00E0FF] transition-all duration-300 transform hover:-translate-y-1 shadow-lg"
                onClick={() => {
                  // Here you would typically handle the form submission
                  setShowTestimonialForm(false);
                  setShowSuccessMessage(true);
                  // Reset form values
                  setRating(0);
                }}
              >
                Submit Testimonial
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Success Message Modal */}
      {showSuccessMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowSuccessMessage(false)}
          ></div>
          
          {/* Success Modal Content */}
          <div className="relative z-10 bg-[#0A0A0A] border border-[#0EE6B7]/30 rounded-xl max-w-md w-full p-8 transform transition-all duration-300 scale-100 text-center">
            <div className="mb-6 mx-auto w-20 h-20 rounded-full bg-[#0EE6B7]/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[#0EE6B7]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h3 className="text-2xl font-bold text-[#0EE6B7] mb-3">Thank You!</h3>
            <p className="text-white/80 mb-6">
              Your testimonial has been submitted successfully. We appreciate your feedback!
            </p>
            
            <button 
              className="px-6 py-3 bg-gradient-to-r from-[#0EE6B7] to-[#00E0FF] text-black font-medium rounded-md hover:from-[#00E0FF] hover:to-[#0EE6B7]"
              onClick={() => setShowSuccessMessage(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="relative z-10 py-12 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <h2 className="text-2xl font-bold flex items-center mb-4">
                <span className="text-[#0EE6B7] mr-2">
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
                <span className="bg-gradient-to-r from-[#00E0FF] to-[#0EE6B7] bg-clip-text text-transparent">TeamSync</span>
              </h2>
              <p className="text-white/70 mb-4">
                Building winning teams through smart matching and expert mentorship. Our AI-powered platform helps you form the perfect teams for technical competitions.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-[#00E0FF]">Product</h3>
              <ul className="space-y-2">
                <li><a href="#features" className="text-white/70 hover:text-[#00E0FF] transition-colors">Features</a></li>
                <li><a href="#" className="text-white/70 hover:text-[#00E0FF] transition-colors">Pricing</a></li>
                <li><a href="#" className="text-white/70 hover:text-[#00E0FF] transition-colors">Case Studies</a></li>
                <li><a href="#" className="text-white/70 hover:text-[#00E0FF] transition-colors">Documentation</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-[#0EE6B7]">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-white/70 hover:text-[#0EE6B7] transition-colors">About Us</a></li>
                <li><a href="#" className="text-white/70 hover:text-[#0EE6B7] transition-colors">Careers</a></li>
                <li><a href="#" className="text-white/70 hover:text-[#0EE6B7] transition-colors">Blog</a></li>
                <li><a href="#" className="text-white/70 hover:text-[#0EE6B7] transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-800">
            <p className="text-white/50 text-sm mb-4 md:mb-0">&copy; {new Date().getFullYear()} TeamSync. All rights reserved.</p>
            <div className="flex space-x-6">
              {['twitter', 'github', 'instagram'].map((social) => (
                <a key={social} href="#" className="text-white/70 hover:text-[#00E0FF] transition-colors">
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
      <div className="absolute inset-0 bg-gradient-to-b from-black to-[#0A0A0A]">
        {/* Full Grid Pattern - Always Visible But Subtle */}
        <svg 
          className="absolute inset-0 w-full h-full opacity-25" 
          xmlns="http://www.w3.org/2000/svg" 
          width="100%" 
          height="100%"
        >
          <defs>
            <pattern id="grid-pattern-base" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(14, 230, 183, 0.2)" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-pattern-base)" />
        </svg>
        
        {/* Animated Gradient Overlay */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(0, 224, 255, 0.15) 0%, transparent 70%)',
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
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0, 224, 255, 0.4)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-pattern-highlight)" />
          </svg>
        </div>
        
        {/* Subtle Stars */}
        <div className="stars-container">
          {[...Array(100)].map((_, i) => (
            <div 
              key={i}
              className="absolute rounded-full"
              style={{
                backgroundColor: i % 4 === 0 ? '#00E0FF' : i % 4 === 1 ? '#0EE6B7' : i % 4 === 2 ? '#2563EB' : '#ACB6E5',
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 2 + 1}px`,
                height: `${Math.random() * 2 + 1}px`,
                opacity: Math.random() * 0.5 + 0.2,
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
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.5; }
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
  
  // Define an array of gradient classes to cycle through
  const gradientClasses = [
    "bg-gradient-to-r from-[#00E0FF] to-[#2563EB]",
    "bg-gradient-to-r from-[#0EE6B7] to-[#00E0FF]",
    "bg-gradient-to-r from-[#2563EB] to-[#ACB6E5]",
    "bg-gradient-to-r from-[#0EE6B7] to-[#2563EB]",
    "bg-gradient-to-r from-[#00E0FF] to-[#0EE6B7]"
  ];

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
      <div className="inline-block px-4 py-1 rounded-full text-sm font-medium bg-black border border-[#00E0FF]/30 text-[#00E0FF] mb-6">
        THE ROAD TO SUCCESS STARTS HERE
      </div>
      <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6">
        Build <span className={`${gradientClasses[currentWordIndex]} bg-clip-text text-transparent`}>{text}</span> teams
      </h1>
      <p className="text-[#ACB6E5]/90 text-xl max-w-2xl mb-8">
        Our AI-powered platform helps you form the perfect teams for technical competitions with complementary skills
        and expert mentorship.
      </p>
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <button className="px-8 py-4 bg-gradient-to-r from-[#00E0FF] to-[#2563EB] text-white font-medium rounded-md hover:from-[#2563EB] hover:to-[#00E0FF] transition-all duration-300 shadow-lg shadow-[#00E0FF]/20 group">
          Get Started
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block ml-2 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
        <button className="px-8 py-4 bg-transparent border border-[#0EE6B7]/30 rounded-md hover:bg-[#0EE6B7]/10 transition-colors duration-300 text-[#0EE6B7]">
          Learn More
        </button>
      </div>
    </div>
  );
}

// Enhanced Feature Card Component
function EnhancedFeatureCard({ icon, title, description, tag, index }) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Card color schemes (alternating)
  const cardSchemes = [
    {
      bg: "bg-black",
      border: "border-[#00E0FF]/50",
      icon: "text-[#00E0FF]",
      title: "text-[#00E0FF]",
      tagBg: "bg-[#00E0FF]/10",
      tagText: "text-[#00E0FF]",
      hoverGlow: "from-[#00E0FF]/10 to-[#2563EB]/10",
      dotColor: "#00E0FF"
    },
    {
      bg: "bg-gradient-to-br from-[#0A0A0A] to-black",
      border: "border-[#0EE6B7]/30",
      icon: "text-[#0EE6B7]",
      title: "text-[#0EE6B7]",
      tagBg: "bg-[#0EE6B7]/10",
      tagText: "text-[#0EE6B7]",
      hoverGlow: "from-[#0EE6B7]/10 to-[#00E0FF]/10",
      dotColor: "#0EE6B7"
    }
  ];
  
  const scheme = cardSchemes[index % 2];
    
  return (
    <div 
      className={`relative overflow-hidden px-6 py-4 rounded-xl border ${scheme.bg} ${scheme.border} transition-all duration-500 flex flex-col transform hover:-translate-y-1`}
      style={{ minHeight: '200px' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background glow effect */}
      <div 
        className={`absolute inset-0 bg-gradient-to-r ${scheme.hoverGlow} opacity-0 transition-opacity duration-500 ${isHovered ? 'opacity-100' : ''}`}
      />
      
      {/* Subtle animated pattern */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute w-[200%] h-[200%] top-[-50%] left-[-50%] bg-grid-pattern" 
             style={{
               backgroundImage: `radial-gradient(circle, ${scheme.dotColor} 1px, transparent 1px)`,
               backgroundSize: '30px 30px',
               transform: isHovered ? 'rotate(10deg) scale(1.1)' : 'rotate(0deg) scale(1)',
               transition: 'transform 0.7s ease-in-out'
             }}
        />
      </div>
      
      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center justify-between mb-3">
          <div className={`${scheme.icon} w-12 h-12 flex items-center justify-center rounded-lg transition-all duration-500 ${isHovered ? 'transform -translate-y-2 scale-110' : ''}`}>
            {icon}
          </div>
          
          {tag && (
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${scheme.tagBg} ${scheme.tagText}`}>
              {tag}
            </span>
          )}
        </div>
        
        <h3 className={`text-xl font-bold ${scheme.title} mb-2`}>{title}</h3>
        
        <p className="text-[#ACB6E5]/80 text-sm mb-3 flex-grow">{description}</p>
        
        <div className={`mt-auto self-end transition-all duration-500 ${isHovered ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}`}>
          <div className={`${scheme.icon} flex items-center text-sm`}>
            <span className="mr-2">Learn more</span>
            <svg className={`w-3 h-3 transform ${isHovered ? 'translate-x-1' : ''} transition-transform duration-300`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

// Improved Testimonials Stack Component
function ImprovedTestimonialsStack({ testimonials }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollX, setScrollX] = useState(0);
  const containerRef = useRef(null);
  
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setScrollX(containerRef.current.scrollLeft);
  };
  
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const x = e.pageX - containerRef.current.offsetLeft;
    const distance = (x - startX);
    containerRef.current.scrollLeft = scrollX - distance;
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
    
    // Calculate which testimonial is most visible
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const scrollPosition = containerRef.current.scrollLeft;
      const cardWidth = containerWidth;
      
      const newIndex = Math.round(scrollPosition / cardWidth);
      setActiveIndex(Math.max(0, Math.min(newIndex, testimonials.length - 1)));
      
      // Smooth scroll to the active card
      containerRef.current.scrollTo({
        left: newIndex * cardWidth,
        behavior: 'smooth'
      });
    }
  };
  
  const goToNext = () => {
    const newIndex = (activeIndex + 1) % testimonials.length;
    setActiveIndex(newIndex);
    if (containerRef.current) {
      containerRef.current.scrollTo({
        left: newIndex * containerRef.current.clientWidth,
        behavior: 'smooth'
      });
    }
  };
  
  const goToPrevious = () => {
    const newIndex = (activeIndex - 1 + testimonials.length) % testimonials.length;
    setActiveIndex(newIndex);
    if (containerRef.current) {
      containerRef.current.scrollTo({
        left: newIndex * containerRef.current.clientWidth,
        behavior: 'smooth'
      });
    }
  };
  
  // Autoscroll effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isDragging) {
        goToNext();
      }
    }, 6000);
    
    return () => clearInterval(interval);
  }, [activeIndex, isDragging]);

  // Color schemes for testimonials - alternate between them
  const colorSchemes = [
    {
      accent: "#00E0FF",
      accentSecondary: "#2563EB"
    },
    {
      accent: "#0EE6B7",
      accentSecondary: "#00E0FF"
    },
    {
      accent: "#2563EB",
      accentSecondary: "#ACB6E5"
    }
  ];
  
  return (
    <div className="relative max-w-6xl mx-auto">
      {/* Left Arrow */}
      <button 
        onClick={goToPrevious}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-20 md:left-4 bg-black/80 text-[#00E0FF] hover:bg-black hover:text-[#0EE6B7] rounded-full p-3 transition-all duration-300 border border-[#00E0FF]/30 hover:border-[#0EE6B7] focus:outline-none"
        aria-label="Previous testimonial"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      {/* Testimonial Cards Container */}
      <div 
        ref={containerRef}
        className="overflow-x-hidden scroll-smooth flex snap-x snap-mandatory touch-pan-x"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {testimonials.map((testimonial, index) => {
          const scheme = colorSchemes[index % colorSchemes.length];
          return (
            <div 
              key={index}
              className="snap-center flex-shrink-0 w-full px-4 transition-all duration-300"
            >
              <div className="bg-[#0A0A0A] rounded-2xl overflow-hidden shadow-[0_5px_30px_rgba(0,224,255,0.1)] border border-[#00E0FF]/10">
                <div className="md:flex">
                  {/* Left column with accent and avatar */}
                  <div 
                    className="hidden md:block w-1/3 relative overflow-hidden p-6" 
                    style={{
                      background: `linear-gradient(135deg, #000 0%, #111111 100%)`,
                      boxShadow: `inset 0 0 60px rgba(${scheme.accent}, 0.1)`
                    }}
                  >
                    <div className="absolute inset-0 opacity-10">
                      <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path d="M0,0 L100,0 L100,100 L0,100 Z" fill={`url(#testimonial-pattern-${index})`} />
                      </svg>
                      <defs>
                        <pattern id={`testimonial-pattern-${index}`} patternUnits="userSpaceOnUse" width="20" height="20">
                          <rect width="20" height="20" fill="none" />
                          <path d="M-5,5 L25,5 M5,-5 L5,25" stroke={scheme.accent} strokeWidth="0.5" />
                        </pattern>
                      </defs>
                    </div>
                    
                    <div className="relative z-10 h-full flex flex-col items-center justify-center">
                      <div 
                        className="w-24 h-24 bg-black rounded-full border-4 overflow-hidden mb-4 flex items-center justify-center"
                        style={{ borderColor: scheme.accent, boxShadow: `0 0 20px ${scheme.accent}40` }}
                      >
                        <span className="text-4xl font-bold" style={{ color: scheme.accent }}>
                          {testimonial.name.charAt(0)}
                        </span>
                      </div>
                      <div className="text-center">
                        <h4 className="text-lg font-bold" style={{ color: scheme.accent }}>{testimonial.name}</h4>
                        <p className="text-white/60 text-sm">{testimonial.role}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Right column with testimonial content */}
                  <div className="md:w-2/3 p-8">
                    {/* Mobile avatar for small screens */}
                    <div className="md:hidden flex items-center mb-6">
                      <div 
                        className="w-12 h-12 bg-black rounded-full border-2 flex items-center justify-center mr-4"
                        style={{ borderColor: scheme.accent }}
                      >
                        <span className="text-xl font-bold" style={{ color: scheme.accent }}>
                          {testimonial.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold" style={{ color: scheme.accent }}>{testimonial.name}</h4>
                        <p className="text-white/60 text-sm">{testimonial.role}</p>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" style={{ color: `${scheme.accent}60` }}>
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" fill="currentColor" />
                      </svg>
                    </div>
                    
                    <p className="text-[#ACB6E5]/90 text-lg italic leading-relaxed mb-6">
                      {testimonial.content}
                    </p>
                    
                    <div className="flex items-center">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className="w-5 h-5" viewBox="0 0 20 20" style={{ color: scheme.accent }}>
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" fill="currentColor" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Right Arrow */}
      <button 
        onClick={goToNext}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-20 md:right-4 bg-black/80 text-[#00E0FF] hover:bg-black hover:text-[#0EE6B7] rounded-full p-3 transition-all duration-300 border border-[#00E0FF]/30 hover:border-[#0EE6B7] focus:outline-none"
        aria-label="Next testimonial"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
      
      {/* Navigation dots */}
      <div className="flex justify-center mt-8 space-x-3">
        {testimonials.map((_, index) => {
          const scheme = colorSchemes[index % colorSchemes.length];
          return (
            <button
              key={index}
              onClick={() => {
                setActiveIndex(index);
                containerRef.current.scrollTo({
                  left: index * containerRef.current.clientWidth,
                  behavior: 'smooth'
                });
              }}
              className={`transition-all duration-300 ${
                activeIndex === index 
                  ? 'w-8 h-2' 
                  : 'w-2 h-2 hover:bg-opacity-50'
              } rounded-full`}
              style={{ 
                backgroundColor: activeIndex === index ? scheme.accent : '#111',
                borderColor: scheme.accent,
                border: activeIndex === index ? 'none' : `1px solid ${scheme.accent}40`
              }}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          )
        })}
      </div>
    </div>
  );
}

// Icon Components
function TeamIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
}

function MentorIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );
}

function TrackingIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function AnalyticsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

function AiIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
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
      
      // Sample data for integrated features
      const integratedFeatures = [
        {
          icon: <TeamIcon />,
          title: "Smart Team Matching",
          description: "Our AI algorithm analyzes skills, experience, and personality to form balanced teams with complementary abilities.",
          tag: "AI Powered"
        },
        {
          icon: <MentorIcon />,
          title: "Expert Mentorship",
          description: "Connect with industry professionals who provide guidance, feedback, and support throughout your competition journey.",
          tag: "Premium"
        },
        {
          icon: <TrackingIcon />,
          title: "Progress Tracking",
          description: "Monitor your team's development with comprehensive analytics and milestone tracking for continuous improvement.",
          tag: "Analytics"
        },
        {
          icon: <SearchIcon />,
          title: "Talent Discovery",
          description: "Find the perfect teammates or mentors with our advanced search filters and recommendation engine.",
          tag: "Networking"
        },
        {
          icon: <AnalyticsIcon />,
          title: "Performance Insights",
          description: "Gain valuable insights into your team's strengths and areas for improvement with detailed analytics.",
          tag: "Data-Driven"
        },
        {
          icon: <AiIcon />,
          title: "Skill Assessment",
          description: "Evaluate your technical and soft skills with our comprehensive assessment tools to identify growth opportunities.",
          tag: "Personalized"
        }
      ];
      
      // Sample testimonial data
      const testimonials = [
        {
          name: "Alex Chen",
          role: "Computer Science Student",
          content: "TeamSync transformed our hackathon experience. We were matched with teammates whose skills perfectly complemented each other, and our mentor's guidance was invaluable. We ended up winning first place!",
          rating: 5
        },
        {
          name: "Sophia Rodriguez",
          role: "AI Research Mentor",
          content: "As a mentor, TeamSync makes it easy to connect with motivated students who truly benefit from my expertise. The platform's organization tools help me track progress and provide meaningful feedback.",
          rating: 5
        },
        {
          name: "Michael Johnson",
          role: "Software Engineering Student",
          content: "Finding the right team used to be the hardest part of competitions. TeamSync matched me with amazing teammates who shared my passion for blockchain. Our project received funding after the competition!",
          rating: 5
        }
      ];
      
      export default Landing;