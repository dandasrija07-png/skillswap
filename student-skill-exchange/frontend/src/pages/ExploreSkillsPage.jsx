import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, Star, Repeat, ArrowLeft, ArrowLeftRight, CheckCircle2, MessageSquare, Info } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';

export default function ExploreSkillsPage() {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [requestSentStudent, setRequestSentStudent] = useState(null);

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) {
      setSelectedCategory(cat);
    }
  }, [searchParams]);

  const categories = ['All', 'Programming', 'Web Development', 'Design', 'Communication', 'Data Structures', 'Languages'];

  const allSkillsData = [
    {
      id: 1,
      name: 'Aarav Sharma',
      initials: 'AS',
      role: 'B.Tech CSE • Year 3',
      campus: 'Delhi Technological University',
      category: 'Web Development',
      rating: 4.9,
      reviewsCount: 18,
      completedSwaps: 14,
      teaching: 'React.js, TypeScript, Tailwind CSS',
      learning: 'Data Structures (Trees & DP)',
      availability: 'Weekends & Evenings',
    },
    {
      id: 2,
      name: 'Ananya Iyer',
      initials: 'AI',
      role: 'Information Technology • Year 2',
      campus: 'Vellore Institute of Technology',
      category: 'Design',
      rating: 5.0,
      reviewsCount: 24,
      completedSwaps: 20,
      teaching: 'Figma Prototyping, UI/UX Guidelines',
      learning: 'Node.js, Express & REST APIs',
      availability: '3-4 hrs/week',
    },
    {
      id: 3,
      name: 'Rohan Verma',
      initials: 'RV',
      role: 'Computer Engineering • Year 4',
      campus: 'BITS Pilani',
      category: 'Programming',
      rating: 4.8,
      reviewsCount: 15,
      completedSwaps: 12,
      teaching: 'Python, System Design, Docker Basics',
      learning: 'GraphQL & Next.js App Router',
      availability: 'Flexible Sessions',
    },
    {
      id: 4,
      name: 'Sneha Patel',
      initials: 'SP',
      role: 'Data Science & CSE • Year 3',
      campus: 'National Institute of Technology',
      category: 'Data Structures',
      rating: 4.9,
      reviewsCount: 22,
      completedSwaps: 17,
      teaching: 'C++ STL, Algorithmic Optimization',
      learning: 'SQL Relational Queries & Database Design',
      availability: 'Daily 1 hr after 6 PM',
    },
    {
      id: 5,
      name: 'Vikramaditya Rao',
      initials: 'VR',
      role: 'B.Tech CSE • Year 2',
      campus: 'IIT Roorkee',
      category: 'Programming',
      rating: 4.7,
      reviewsCount: 11,
      completedSwaps: 8,
      teaching: 'Core Java, OOPs Concepts & Multithreading',
      learning: 'Figma Wireframing for Mobile Apps',
      availability: 'Weekend Bootcamps',
    },
    {
      id: 6,
      name: 'Meera Nambiar',
      initials: 'MN',
      role: 'Electronics & Computer Eng • Year 3',
      campus: 'MIT Manipal',
      category: 'Languages',
      rating: 4.9,
      reviewsCount: 19,
      completedSwaps: 15,
      teaching: 'Conversational German (B1 Level) & English Fluency',
      learning: 'Python for Automation & Web Scraping',
      availability: 'Saturday & Sunday Mornings',
    },
    {
      id: 7,
      name: 'Devashish Sen',
      initials: 'DS',
      role: 'Computer Science • Year 4',
      campus: 'Jadavpur University',
      category: 'Communication',
      rating: 4.9,
      reviewsCount: 26,
      completedSwaps: 23,
      teaching: 'Campus Placement Mock HR & Technical Presentation',
      learning: 'Docker Containerization & Kubernetes Intro',
      availability: 'Weekday Evenings',
    },
    {
      id: 8,
      name: 'Pooja Hegde',
      initials: 'PH',
      role: 'Information Science • Year 3',
      campus: 'BMS College of Engineering',
      category: 'Data Structures',
      rating: 4.8,
      reviewsCount: 16,
      completedSwaps: 13,
      teaching: 'Graph Algorithms (BFS/DFS, Dijkstra) & LeetCode Medium',
      learning: 'Modern CSS Grid & Responsive Animations',
      availability: '4 hrs/week',
    },
  ];

  // Filtering
  const filteredSkills = allSkillsData.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category.toLowerCase() === selectedCategory.toLowerCase();
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      query === '' ||
      item.name.toLowerCase().includes(query) ||
      item.teaching.toLowerCase().includes(query) ||
      item.learning.toLowerCase().includes(query) ||
      item.campus.toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });

  const handleSendRequest = (student) => {
    setRequestSentStudent(student);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-page)' }}>
      <Navbar />

      <main style={{ flex: 1, maxWidth: '1240px', margin: '0 auto', padding: '3rem 1.5rem', width: '100%' }}>
        {/* Breadcrumb & Heading */}
        <div style={{ marginBottom: '2rem' }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
              marginBottom: '1rem',
              textDecoration: 'none',
            }}
          >
            <ArrowLeft size={16} /> Back to Home
          </Link>

          <h1 style={{ fontSize: 'clamp(1.9rem, 4vw, 2.7rem)', fontWeight: 800, marginBottom: '0.6rem' }}>
            Explore Peer <span className="gradient-text">Skills Directory</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '720px' }}>
            Browse student-offered skills across campuses. Connect with peers to arrange a mutual exchange session.
          </p>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.3rem 0.8rem',
              borderRadius: '9999px',
              backgroundColor: 'rgba(237, 233, 254, 0.7)',
              border: '1px solid var(--accent-lavender-border)',
              fontSize: '0.78rem',
              color: 'var(--primary-dark)',
              marginTop: '0.85rem',
            }}
          >
            <Info size={14} color="#6366f1" />
            <span>Interactive Demo: Filter by category or search skills in real-time</span>
          </div>
        </div>

        {/* Search & Category Filter Bar */}
        <div
          className="glass-card"
          style={{
            padding: '1.25rem 1.5rem',
            marginBottom: '2.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          {/* Search Box */}
          <div style={{ position: 'relative' }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                top: '50%',
                left: '1rem',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by skill (e.g. React, Python, Figma, Graphs) or student name..."
              style={{
                width: '100%',
                padding: '0.85rem 1rem 0.85rem 2.85rem',
                borderRadius: '12px',
                border: '1px solid var(--accent-lavender-border)',
                backgroundColor: '#ffffff',
                fontSize: '0.95rem',
                fontFamily: 'inherit',
                color: 'var(--text-main)',
                outline: 'none',
                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.03)',
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  top: '50%',
                  right: '1rem',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                }}
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginRight: '0.35rem' }}>
              Category:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '0.45rem 0.95rem',
                  borderRadius: '9999px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: '1px solid',
                  backgroundColor: selectedCategory.toLowerCase() === cat.toLowerCase() ? 'var(--primary)' : 'rgba(255, 255, 255, 0.8)',
                  color: selectedCategory.toLowerCase() === cat.toLowerCase() ? '#ffffff' : 'var(--text-main)',
                  borderColor: selectedCategory.toLowerCase() === cat.toLowerCase() ? 'var(--primary)' : 'var(--accent-lavender-border)',
                  transition: 'all var(--transition-fast)',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Request Sent Toast Notification */}
        {requestSentStudent && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0',
              padding: '1rem 1.5rem',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '2rem',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#065f46' }}>
              <CheckCircle2 size={20} />
              <div>
                <strong>Skill Swap Invitation Initiated!</strong> You sent a simulated exchange request to{' '}
                <strong>{requestSentStudent.name}</strong>. Full real-time message routing activates in Phase 3.
              </div>
            </div>
            <button
              type="button"
              onClick={() => setRequestSentStudent(null)}
              style={{ background: 'none', border: 'none', color: '#065f46', cursor: 'pointer', fontWeight: 700 }}
            >
              ✕
            </button>
          </motion.div>
        )}

        {/* Results Count */}
        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Showing <strong>{filteredSkills.length}</strong> student skill listings
          </span>
        </div>

        {/* Skill Cards Grid */}
        {filteredSkills.length === 0 ? (
          <div
            className="glass-card"
            style={{ padding: '3.5rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}
          >
            <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>No skills match your search criteria.</p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="btn-secondary"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="students-grid">
            {filteredSkills.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="saas-card"
                style={{
                  padding: '1.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  {/* Top Bar */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div
                        style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                        }}
                      >
                        {item.initials}
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>{item.name}</h3>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{item.role}</div>
                      </div>
                    </div>
                    <span className="badge badge-purple" style={{ fontSize: '0.72rem' }}>
                      {item.category}
                    </span>
                  </div>

                  {/* Campus & Rating */}
                  <div
                    style={{
                      fontSize: '0.76rem',
                      color: 'var(--primary-dark)',
                      fontWeight: 600,
                      marginBottom: '0.85rem',
                    }}
                  >
                    {item.campus}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      fontSize: '0.8rem',
                      marginBottom: '1rem',
                      padding: '0.4rem 0.6rem',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(245, 243, 255, 0.7)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#b45309', fontWeight: 700 }}>
                      <Star size={13} fill="#f59e0b" color="#f59e0b" />
                      <span>{item.rating}</span>
                      <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>({item.reviewsCount})</span>
                    </div>
                    <span style={{ color: 'var(--text-dim)' }}>•</span>
                    <span style={{ color: 'var(--text-muted)' }}>{item.completedSwaps} swaps completed</span>
                  </div>

                  {/* Teaching Skill */}
                  <div style={{ marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#065f46', display: 'block', marginBottom: '0.2rem' }}>
                      CAN TEACH:
                    </span>
                    <div className="skill-tag tag-teaching" style={{ display: 'inline-block' }}>
                      {item.teaching}
                    </div>
                  </div>

                  {/* Learning Skill */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#1e40af', display: 'block', marginBottom: '0.2rem' }}>
                      WANTS IN RETURN:
                    </span>
                    <div className="skill-tag tag-learning" style={{ display: 'inline-block' }}>
                      {item.learning}
                    </div>
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      marginBottom: '0.85rem',
                      borderTop: '1px solid rgba(221, 214, 254, 0.5)',
                      paddingTop: '0.65rem',
                    }}
                  >
                    Availability: <strong>{item.availability}</strong>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSendRequest(item)}
                    className="btn-primary"
                    style={{ width: '100%', padding: '0.65rem 1rem', fontSize: '0.86rem' }}
                  >
                    <MessageSquare size={15} />
                    <span>Send Swap Request</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

