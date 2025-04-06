import { useState, useRef, useEffect, useMemo } from 'react';

// Updated Dynamic Gradient Background with Moving Gradients
function DynamicGradientBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Base Dark Layer */}
      <div className="absolute inset-0 bg-[#0A0A0A]">
        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(0, 224, 255, 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0, 224, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />

        {/* Moving Gradient Elements */}
        <div className="absolute inset-0">
          {[...Array(6)].map((_, i) => (
          <div
              key={i}
              className="absolute rounded-full opacity-40 blur-3xl"
            style={{
                width: `${400 + i * 100}px`,
                height: `${400 + i * 100}px`,
                background: 'radial-gradient(circle, rgba(0, 85, 170, 0.4), transparent)',
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animation: `float${i} ${8 + i * 2}s infinite ease-in-out`
              }}
            />
          ))}
        </div>

        {/* Twinkling Stars */}
        <div className="absolute inset-0">
          {[...Array(200)].map((_, i) => {
            const size = Math.random() * 6 + 2;
            const color = i % 3 === 0 ? '#0055AA' : i % 3 === 1 ? '#0066CC' : '#FFFFFF';
            return (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                  backgroundColor: color,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                  width: `${size}px`,
                  height: `${size}px`,
                  opacity: Math.random() * 0.7 + 0.3,
                  animation: `twinkle ${Math.random() * 2 + 1}s ease-in-out infinite`,
                  transform: `scale(${Math.random() * 0.5 + 0.75})`,
                  pointerEvents: 'none',
                  boxShadow: `0 0 ${size}px ${color}`
                }}
              />
            );
          })}
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.3); }
        }
        ${[...Array(6)].map((_, i) => `
          @keyframes float${i} {
            0%, 100% { transform: translate(0, 0); }
            25% { transform: translate(${100 + i * 20}px, ${-60 - i * 10}px); }
            50% { transform: translate(${-40 - i * 10}px, ${80 + i * 20}px); }
            75% { transform: translate(${-80 - i * 20}px, ${-40 - i * 10}px); }
          }
        `).join('\n')}
      `}</style>
    </div>
  );
}

// Section Indicator Component
function SectionIndicator() {
  const [activeSection, setActiveSection] = useState('hero');
  
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['hero', 'features', 'testimonials'];
      const scrollPosition = window.scrollY + window.innerHeight / 2;
      
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { top, bottom } = element.getBoundingClientRect();
          if (top <= window.innerHeight / 2 && bottom >= window.innerHeight / 2) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed right-8 top-1/2 transform -translate-y-1/2 z-50">
      <div className="flex flex-col space-y-4">
        {['hero', 'features', 'testimonials'].map((section) => (
          <button
            key={section}
            onClick={() => {
              document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              activeSection === section
                ? 'bg-[#00E0FF] scale-125'
                : 'bg-white/30 hover:bg-white/50'
            }`}
              />
            ))}
          </div>
          </div>
  );
}

// Fade In Component
function FadeIn({ children }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
    >
      {children}
              </div>
  );
}

// Technical Graph Component
function TechnicalGraph() {
  const [points, setPoints] = useState([]);
  const [prevPoints, setPrevPoints] = useState([]);
  const [status, setStatus] = useState('ACTIVE');
  const [metrics, setMetrics] = useState({
    frequency: Math.random() * 100,
    amplitude: Math.random() * 100,
    stability: Math.random() * 100,
  });
  const [catFrame, setCatFrame] = useState(0);
  
  // ASCII art frames for animated cat
  const catFrames = [
    `
  ／l、             
（ﾟ､ ﾟ ７         
  l  ~ヽ       
  じしf_,)ノ`,
    `
  ／l、             
（-､ - ７         
  l  ~ヽ       
  じしf_,)ノ`,
    `
  ／l、             
（^､ ^ ７         
  l  ~ヽ       
  じしf_,)ノ`,
    `
  ／l、             
（ﾟ､ ﾟ ７         
  l  ~ヽ       
  じしf_,)ノ`
  ];

  // Animate cat with gentle timing
  useEffect(() => {
    const catInterval = setInterval(() => {
      setCatFrame((prev) => (prev + 1) % catFrames.length);
    }, 800); // Gentle timing for the sleepy cat
    return () => clearInterval(catInterval);
  }, []);

  // Generate new data points with more interesting patterns
  const generatePoints = () => {
    const timeOffset = Date.now() * 0.001;
    const newPoints = Array.from({ length: 50 }, (_, i) => {
      const x = i;
      // Create a more complex and interesting wave pattern
      const mainWave = Math.sin(i * 0.15 + timeOffset) * 25;
      const secondWave = Math.sin(i * 0.3 + timeOffset * 1.5) * 10;
      const fastWave = Math.sin(i * 0.8 + timeOffset * 2) * 5;
      const ultraFastWave = Math.sin(i * 2 + timeOffset * 3) * 2;
      
      // Add some noise for organic feel
      const noise = Math.sin(i * 50 + timeOffset * 10) * 1;
      
      // Combine all waves with base line
      const y = 50 + mainWave + secondWave + fastWave + ultraFastWave + noise;
      
      return { x, y: Math.max(5, Math.min(95, y)) }; // Clamp values between 5 and 95
    });

    // Update metrics based on wave characteristics
    setMetrics({
      frequency: 50 + Math.sin(timeOffset * 0.5) * 25,
      amplitude: 60 + Math.cos(timeOffset * 0.7) * 20,
      stability: 75 + Math.sin(timeOffset * 0.3) * 15,
    });

    return newPoints;
  };

  // Initialize points
  useEffect(() => {
    setPoints(generatePoints());
    
    // Simulate status changes
    const statusInterval = setInterval(() => {
      setStatus(prev => {
        const statuses = ['ACTIVE', 'SYNCING', 'OPTIMIZING', 'ANALYZING'];
        const currentIndex = statuses.indexOf(prev);
        return statuses[(currentIndex + 1) % statuses.length];
      });
    }, 3000);

    return () => clearInterval(statusInterval);
  }, []);

  // Update points periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setPrevPoints(points);
      setPoints(generatePoints());
    }, 50);

    return () => clearInterval(interval);
  }, [points]);

  // Interpolate between previous and current points
  const currentPoints = useMemo(() => {
    if (prevPoints.length === 0) return points;
    const progress = (Date.now() % 50) / 50;
    return points.map((point, i) => ({
      x: point.x,
      y: prevPoints[i] ? prevPoints[i].y + (point.y - prevPoints[i].y) * progress : point.y
    }));
  }, [points, prevPoints]);

  return (
    <div className="relative w-full h-full">
      {/* Fixed Cat Panel with ASCII borders */}
      <div className="fixed top-25 right-4 z-50">
        {/* ASCII Border Container */}
        <div className="relative">
          {/* ASCII Top Border */}
          <div className="text-[#00E0FF]/50 font-mono text-sm whitespace-pre leading-none mb-1">
            {`┌${'─'.repeat(24)}┐`}
              </div>

          {/* Main Content with Left Support */}
          <div className="flex">
            {/* Left Support Structure */}
            <div className="text-[#00E0FF]/30 font-mono text-sm whitespace-pre leading-none mr-2">
              {`║\n║\n║\n║\n║\n║\n║\n║`}
            </div>
            
            {/* Main Panel */}
            <div className="bg-black/60 backdrop-blur-md p-4 relative">
              {/* Left Border Decorations */}
              <div className="absolute left-0 top-0 h-full w-px bg-gradient-to-b from-[#00E0FF]/50 via-[#00E0FF]/20 to-[#00E0FF]/50"></div>
              <div className="absolute left-0 top-0 h-full w-px bg-[#00E0FF]/10 animate-pulse"></div>

              {/* ASCII Cat */}
              <div className="text-[#00E0FF]/40 text-sm whitespace-pre font-mono mb-4 transition-all duration-500">
                {catFrames[catFrame]}
            </div>

              {/* Divider with ASCII style */}
              <div className="text-[#00E0FF]/30 whitespace-pre mb-4">
                {`├${'─'.repeat(22)}┤`}
          </div>
            
              {/* Status Indicator */}
              <div className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    status === 'ACTIVE' ? 'bg-[#0EE6B7]' : 'bg-[#00E0FF]'
                  } animate-pulse`}></div>
                  <span className="text-[#00E0FF]">{status}</span>
        </div>
                <span className="text-[#00E0FF]/60">NM_447</span>
              </div>
              
              {/* Circuit-like decorative elements */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#00E0FF]/30"></div>
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#00E0FF]/30"></div>
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#00E0FF]/30"></div>
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#00E0FF]/30"></div>
            </div>
              </div>
              
          {/* ASCII Bottom Border */}
          <div className="text-[#00E0FF]/50 font-mono text-sm whitespace-pre leading-none mt-1">
            {`└${'─'.repeat(24)}┘`}
              </div>
              
          {/* Decorative Connection Lines */}
          <div className="absolute -left-3 top-1/2 w-3 h-px bg-[#00E0FF]/30"></div>
          <div className="absolute -left-3 top-1/2 w-px h-8 -translate-y-1/2 bg-[#00E0FF]/30"></div>
                </div>
            </div>
            
      {/* Technical Grid with Enhanced Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[#000814] pointer-events-none" />
        {/* Vertical Grid Lines */}
        {[...Array(21)].map((_, i) => (
          <div 
            key={`v-${i}`} 
            className="absolute top-0 bottom-0 border-0"
            style={{
              left: `${(i / 20) * 100}%`,
              backgroundImage: 'linear-gradient(to bottom, #0055AA 1px, transparent 1px)',
              backgroundSize: '1px 6px',
              opacity: i % 5 === 0 ? 0.4 : 0.2
            }}
          />
        ))}
        {/* Horizontal Grid Lines */}
        {[...Array(21)].map((_, i) => (
          <div 
            key={`h-${i}`} 
            className="absolute left-0 right-0 border-0"
            style={{
              top: `${(i / 20) * 100}%`,
              backgroundImage: 'linear-gradient(to right, #0055AA 1px, transparent 1px)',
              backgroundSize: '6px 1px',
              opacity: i % 5 === 0 ? 0.4 : 0.2
            }}
          />
        ))}
              </div>
              
      {/* Right Side Metrics Panel */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 z-40">
        {/* ASCII Border Container */}
        <div className="relative">
          {/* ASCII Top Border */}
          <div className="text-[#00E0FF]/50 font-mono text-sm whitespace-pre leading-none mb-1">
            {`┌${'─'.repeat(30)}┐`}
              </div>
              
          {/* Main Content with Left Support */}
          <div className="flex">
            {/* Left Support Structure */}
            <div className="text-[#00E0FF]/30 font-mono text-sm whitespace-pre leading-none mr-2">
              {`║\n║\n║\n║\n║\n║\n║\n║\n║\n║\n║\n║`}
              </div>
              
            {/* Main Panel */}
            <div className="bg-black/60 backdrop-blur-md p-4 relative w-48">
              {/* Left Border Decorations */}
              <div className="absolute left-0 top-0 h-full w-px bg-gradient-to-b from-[#00E0FF]/50 via-[#00E0FF]/20 to-[#00E0FF]/50"></div>
              <div className="absolute left-0 top-0 h-full w-px bg-[#00E0FF]/10 animate-pulse"></div>

              <div className="space-y-6">
                {Object.entries(metrics).map(([key, value], index) => (
                  <div key={key} className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[#00E0FF]/80 uppercase text-xs font-mono">{key}</span>
                      <span className="text-[#0EE6B7] text-xs font-mono">{value.toFixed(1)}%</span>
                    </div>
                    <div className="h-1 bg-black/50 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#00E0FF]/40 to-[#0EE6B7]/40 relative"
                        style={{ width: `${value}%` }}
                      >
                        <div className="absolute top-0 right-0 h-full w-1 bg-[#0EE6B7] animate-pulse" />
                </div>
              </div>
                    {/* Decorative elements */}
                    <div className="absolute -left-2 top-1/2 w-1 h-1 bg-[#00E0FF] animate-ping" />
                    <div className="absolute -right-2 top-1/2 w-1 h-1 bg-[#0EE6B7] animate-ping" />
                    
                    {/* ASCII divider except for last item */}
                    {index < Object.entries(metrics).length - 1 && (
                      <div className="text-[#00E0FF]/30 whitespace-pre mt-4">
                        {`├${'─'.repeat(16.5)}┤`}
        </div>
      )}
            </div>
              ))}
            </div>

              {/* Circuit-like decorative elements */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#00E0FF]/30"></div>
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#00E0FF]/30"></div>
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#00E0FF]/30"></div>
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#00E0FF]/30"></div>
          </div>
        </div>

          {/* ASCII Bottom Border */}
          <div className="text-[#00E0FF]/50 font-mono text-sm whitespace-pre leading-none mt-1">
            {`└${'─'.repeat(30)}┘`}
            </div>
            
          {/* Decorative Connection Lines */}
          <div className="absolute -left-3 top-1/2 w-3 h-px bg-[#00E0FF]/30"></div>
          <div className="absolute -left-3 top-1/2 w-px h-8 -translate-y-1/2 bg-[#00E0FF]/30"></div>
          </div>
        </div>

      {/* Animated Graph */}
      <div className="absolute inset-0 pr-64">
        <svg className="w-full h-full" preserveAspectRatio="none">
          {/* Main Line */}
          <path
            d={`M 0 ${100 - currentPoints[0]?.y || 0}% ${currentPoints.map((p, i) => `L ${(i / (currentPoints.length - 1)) * 100}% ${100 - p.y}%`).join(' ')}`}
                    fill="none"
            stroke="#FFFFFF"
            strokeWidth="1.5"
            strokeOpacity="0.9"
            className="transition-all duration-100 ease-linear"
          />
                  </svg>

        {/* Y-axis labels */}
        <div className="absolute left-0 inset-y-0 w-8 flex flex-col justify-between text-[10px] py-2">
          {[5, 4, 3, 2, 1, 0].map((value) => (
            <div 
              key={value}
              className="relative z-10 px-1 font-mono"
              style={{ color: '#0055AA', opacity: 1 }}
            >
              {value}
            </div>
          ))}
            </div>

        {/* Time labels */}
        <div className="absolute bottom-0 inset-x-0 h-6 flex justify-between text-[10px] pl-8 font-mono">
          {['20Hz', '100Hz', '250Hz', '500Hz', '+1000Hz'].map((label) => (
            <div 
              key={label}
              className="relative z-10 px-1"
              style={{ color: '#0055AA', opacity: 1 }}
            >
              {label}
            </div>
              ))}
            </div>
          </div>

      {/* Add grid animation keyframes */}
      <style jsx>{`
        @keyframes gridPulse {
          0% { opacity: 0.4; }
          50% { opacity: 0.8; }
          100% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}

// Matrix Loading Screen Component
function MatrixLoadingScreen() {
  const canvasRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Japanese characters (katakana only)
    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    const fontSize = 16;
    const columns = canvas.width / fontSize;
    const drops = Array(Math.floor(columns)).fill(1);

    function draw() {
      // Semi-transparent black background for trail effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Match landing page color scheme
      ctx.fillStyle = '#00E0FF';
      ctx.font = `bold ${fontSize}px "JetBrainsMono Nerd Font", monospace`;

      // Draw characters
      drops.forEach((y, i) => {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, y * fontSize);

        // Reset drop to top when it reaches bottom
        if (y * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      });
    }

    // Handle window resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Animation loop
    const interval = setInterval(draw, 33);

    // Cleanup
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-4xl font-['JetBrainsMono_Nerd_Font'] font-bold text-[#00E0FF] animate-pulse tracking-wider">
          <span>LOADING</span>
          <span className="animate-ping">.</span>
          <span className="animate-ping" style={{ animationDelay: '0.2s' }}>.</span>
          <span className="animate-ping" style={{ animationDelay: '0.4s' }}>.</span>
        </div>
      </div>
    </div>
  );
}

// About Section Component
function AboutSection() {
  const stats = [
    { number: '10K+', label: 'Active Users' },
    { number: '500+', label: 'Teams Formed' },
    { number: '100+', label: 'Competitions' },
    { number: '50+', label: 'Expert Mentors' }
  ];
    
  return (
    <section id="about" className="relative z-10 py-20">
      <div className="container mx-auto px-4">
        <FadeIn>
          <div className="text-center mb-16">
            <span className="px-4 py-1 rounded-full text-sm font-medium bg-black border border-[#00E0FF]/30 text-[#00E0FF] inline-block mb-4">
              ABOUT US
            </span>
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-[#00E0FF] to-[#2563EB] bg-clip-text text-transparent">
              Building the Future of Team Collaboration
            </h2>
            <p className="text-xl text-[#ACB6E5]/90 max-w-3xl mx-auto mb-6">
              We're revolutionizing how teams form and succeed in competitive environments through AI-powered matching and expert mentorship.
            </p>
      </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
          <FadeIn>
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white">Our Mission</h3>
              <p className="text-gray-400">
                To empower individuals and teams to reach their full potential by providing intelligent matching, expert guidance, and comprehensive tools for success in competitive environments.
              </p>
              <div className="flex flex-wrap gap-4">
                {['Innovation', 'Excellence', 'Collaboration', 'Growth'].map((value) => (
                  <span key={value} className="px-4 py-2 bg-[#00E0FF]/10 text-[#00E0FF] rounded-full text-sm">
                    {value}
            </span>
                ))}
        </div>
          </div>
          </FadeIn>

          <FadeIn>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#00E0FF]/20 to-transparent rounded-lg blur-xl" />
              <div className="relative p-6 bg-black/50 border border-[#00E0FF]/20 rounded-lg">
                <h3 className="text-2xl font-bold text-white mb-6">Why Choose Us?</h3>
                <ul className="space-y-4">
                  {[
                    'AI-powered team matching algorithm',
                    'Expert mentorship network',
                    'Comprehensive progress tracking',
                    'Real-time collaboration tools',
                    'Competition success analytics'
                  ].map((item, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <span className="text-[#00E0FF] mt-1">✓</span>
                      <span className="text-gray-400">{item}</span>
                    </li>
                  ))}
                </ul>
        </div>
      </div>
          </FadeIn>
    </div>

        <FadeIn>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-[#00E0FF] mb-2">{stat.number}</div>
                <div className="text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function Landing() {
  const [showTestimonialModal, setShowTestimonialModal] = useState(false);
  const [showTestimonialForm, setShowTestimonialForm] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [testimonialType, setTestimonialType] = useState('student');
  const [rating, setRating] = useState(0);
  const [showContent, setShowContent] = useState(false);
  const [showMatrix, setShowMatrix] = useState(true);
  const [matrixOpacity, setMatrixOpacity] = useState(100);

  useEffect(() => {
    const fadeOutTimer = setTimeout(() => {
      setMatrixOpacity(0);
      setTimeout(() => {
        setShowMatrix(false);
        setShowContent(true);
      }, 500);
    }, 2000);

    return () => clearTimeout(fadeOutTimer);
  }, []);
    
  return (
    <div className="relative min-h-screen bg-black text-white font-mono overflow-x-hidden">
      {/* Matrix Loading Screen */}
      {showMatrix && (
        <div 
          className="fixed inset-0 z-50 transition-opacity duration-500"
          style={{ opacity: matrixOpacity }}
        >
          <MatrixLoadingScreen />
      </div>
      )}

      {/* Fixed Background */}
      <div className={`fixed inset-0 z-0 transition-opacity duration-500 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
        <DynamicGradientBackground />
        </div>

      {/* Enhanced Navbar */}
      <div className={`fixed top-4 left-0 right-0 z-50 transition-all duration-500 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <div className="w-full px-4">
          <div className="h-16 bg-black/30 backdrop-blur-md border border-[#00E0FF]/20 rounded-lg shadow-lg shadow-[#00E0FF]/10">
            <div className="h-full flex items-center justify-between px-6">
              {/* Left Section - Logo and Brand */}
              <div className="flex-1 flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#00E0FF] to-[#0EE6B7] rounded-lg flex items-center justify-center">
                    <span className="text-black font-bold text-lg">TH</span>
          </div>
                  <span className="text-xl font-bold text-[#00E0FF]">Talent Hunt</span>
        </div>
                <div className="hidden md:flex items-center space-x-1">
                  <span className="px-2 py-1 text-xs bg-[#00E0FF]/10 text-[#00E0FF] rounded-full">NIGHT MODE</span>
                  <span className="px-2 py-1 text-xs bg-[#0EE6B7]/10 text-[#0EE6B7] rounded-full">BETA</span>
      </div>
    </div>

              {/* Center Section - Navigation Links */}
              <div className="flex-1 hidden md:flex items-center justify-center space-x-8">
                <a href="#features" className="text-gray-300 hover:text-[#00E0FF] transition-colors">Features</a>
                <a href="#testimonials" className="text-gray-300 hover:text-[#00E0FF] transition-colors">Testimonials</a>
                <a href="#about" className="text-gray-300 hover:text-[#00E0FF] transition-colors">About</a>
              </div>

              {/* Right Section - Connect Button and Menu */}
              <div className="flex-1 flex items-center justify-end space-x-4">
                <button className="hidden md:flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#00E0FF] to-[#0EE6B7] rounded-lg text-black font-medium hover:opacity-90 transition-opacity">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
                  <span>Connect</span>
      </button>
                <button className="md:hidden p-2 text-gray-300 hover:text-[#00E0FF] transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                </button>
                    </div>
                      </div>
                      </div>
                    </div>
                  </div>

      {/* Scrollable Content */}
      <div className={`relative z-10 min-h-screen transition-all duration-500 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
        {/* Hero Section */}
        <section id="hero" className="relative z-10">
          <div className="container mx-auto px-4 pt-32 pb-20">
            <FadeIn>
              <TypewriterHero />
            </FadeIn>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="relative z-10 py-20">
          <div className="container mx-auto px-4">
            <FadeIn>
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
            </FadeIn>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {integratedFeatures.map((feature, index) => (
                <FadeIn key={index}>
                  <EnhancedFeatureCard {...feature} index={index} />
                </FadeIn>
              ))}
                      </div>
                    </div>
        </section>

        {/* Graph Section */}
        <section className="relative z-10 py-10">
          <div className="container mx-auto px-4">
            <div className="border border-[#00E0FF]/20 rounded-lg p-4 bg-black/50">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-[#00E0FF]">Performance Metrics</span>
                <div className="flex space-x-2">
                  {['1H', '24H', '7D'].map((period) => (
      <button 
                      key={period}
                      className="px-2 py-1 text-xs text-gray-400 hover:text-[#00E0FF] transition-colors"
      >
                      {period}
      </button>
                        ))}
                      </div>
                    </div>
              <div className="h-64">
                <TechnicalGraph />
                  </div>
                </div>
              </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="relative z-10 py-20">
          <div className="container mx-auto px-4">
            <FadeIn>
              <div className="text-center mb-16">
                <span className="px-4 py-1 rounded-full text-sm font-medium bg-black border border-[#0EE6B7]/30 text-[#0EE6B7] inline-block mb-4">
                  TESTIMONIALS
                        </span>
                <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-[#0EE6B7] to-[#00E0FF] bg-clip-text text-transparent">
                  What Our Users Say
                </h2>
            </div>
            </FadeIn>
            
            <FadeIn>
              <ImprovedTestimonialsStack testimonials={testimonials} />
            </FadeIn>
      </div>
        </section>

        {/* About Section */}
        <AboutSection />

        {/* Footer */}
        <footer className="relative z-10 py-12 border-t border-gray-800">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="col-span-2">
                <h2 className="text-2xl font-bold text-[#00E0FF] mb-4">TeamSync</h2>
                <p className="text-gray-400">Building winning teams through smart matching and expert mentorship.</p>
      </div>
              {/* Add your footer content here */}
                    </div>
                      </div>
        </footer>
                    </div>

      {/* Fixed Section Indicator */}
      <SectionIndicator />

      {/* Modals */}
      {showTestimonialModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          {/* ... modal content ... */}
                  </div>
      )}
      {showTestimonialForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          {/* ... form content ... */}
                </div>
      )}
      {showSuccessMessage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          {/* ... success message content ... */}
              </div>
      )}
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
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.239 1.237 1.07 1.834 2.807 1.304 3.492.997-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
        </svg>
      );
    case 'instagram':
      return (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      );
    default:
      return null;
  }
}

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

// TypewriterHero Component
function TypewriterHero() {
  const [currentWord, setCurrentWord] = useState('Dream');
  const words = ['Dream', 'Perfect', 'Winning', 'Successful', 'Amazing'];
  const [revealedLetters, setRevealedLetters] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRevealedLetters([]);
      setCurrentIndex(0);
      const nextWord = words[(words.indexOf(currentWord) + 1) % words.length];
      setCurrentWord(nextWord);
    }, 3000);

    return () => clearInterval(interval);
  }, [currentWord]);

  useEffect(() => {
    if (currentIndex < currentWord.length) {
      const timer = setTimeout(() => {
        // Create an array of all indices that haven't been revealed yet
        const unrevealedIndices = Array.from({ length: currentWord.length }, (_, i) => i)
          .filter(i => !revealedLetters.includes(i));
        
        if (unrevealedIndices.length > 0) {
          // Randomly select one of the unrevealed indices
          const randomIndex = unrevealedIndices[Math.floor(Math.random() * unrevealedIndices.length)];
          setRevealedLetters(prev => [...prev, randomIndex]);
          setCurrentIndex(prev => prev + 1);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, currentWord, revealedLetters]);

  const renderWord = () => {
    return currentWord.split('').map((letter, index) => (
      <span
        key={index}
        className={`inline-block transition-all duration-300 ${
          revealedLetters.includes(index)
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-4'
        }`}
        style={{
          display: 'inline-block',
          minWidth: '1ch',
          color: '#00E0FF',
          letterSpacing: '0.05em'
        }}
      >
        {letter}
      </span>
    ));
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-start justify-center pt-65">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-8">
          <span className="text-white">
            Build Your{' '}
            <span className="inline-block min-w-[200px] h-[1.2em]">
              {renderWord()}
            </span>{' '}
            Team
          </span>
        </h1>
        <p className="text-xl text-gray-400 mb-8">
          Connect with talented individuals, form powerful teams, and excel in competitions with AI-powered matching and expert mentorship.
        </p>
        <div className="flex justify-center space-x-4">
          <button className="px-8 py-3 bg-gradient-to-r from-[#00E0FF] to-[#0EE6B7] rounded-lg text-black font-medium hover:opacity-90 transition-opacity">
            Get Started
          </button>
          <button className="px-8 py-3 border border-[#00E0FF] rounded-lg text-[#00E0FF] font-medium hover:bg-[#00E0FF]/10 transition-colors">
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
}

// EnhancedFeatureCard Component
function EnhancedFeatureCard({ icon, title, description, tag, index }) {
  return (
    <div className="group relative p-6 bg-black/50 border border-[#00E0FF]/20 rounded-lg hover:border-[#00E0FF]/40 transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-r from-[#00E0FF]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
      
      {/* Tag */}
      <div className="absolute -top-3 right-4 px-3 py-1 bg-black border border-[#00E0FF]/30 rounded-full">
        <span className="text-xs font-medium text-[#00E0FF]">{tag}</span>
      </div>

      {/* Icon */}
      <div className="text-[#00E0FF] mb-4 relative">
        {icon}
        <div className="absolute -inset-2 bg-[#00E0FF]/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Content */}
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#00E0FF]/20 to-transparent" />
      <div className="absolute bottom-0 left-1/2 w-px h-full bg-gradient-to-t from-[#00E0FF]/20 via-transparent to-transparent" />
    </div>
  );
}

// ImprovedTestimonialsStack Component
function ImprovedTestimonialsStack({ testimonials }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {testimonials.map((testimonial, index) => (
        <div
          key={index}
          className="relative p-6 bg-black/50 border border-[#00E0FF]/20 rounded-lg hover:border-[#00E0FF]/40 transition-all duration-300"
        >
          <div className="flex items-start mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white">{testimonial.name}</h3>
              <p className="text-sm text-[#00E0FF]">{testimonial.role}</p>
            </div>
            <div className="flex space-x-1">
              {[...Array(testimonial.rating)].map((_, i) => (
                <span key={i} className="text-[#0EE6B7]">★</span>
              ))}
            </div>
          </div>
          <p className="text-gray-400">{testimonial.content}</p>
        </div>
      ))}
    </div>
  );
}

export default Landing;