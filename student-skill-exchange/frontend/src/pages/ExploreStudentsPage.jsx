import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  Sparkles,
  Users,
  X,
  ArrowLeft,
  GraduationCap,
  RotateCcw,
} from 'lucide-react';
import StudentCard from '../components/students/StudentCard.jsx';
import StudentDetailModal from '../components/students/StudentDetailModal.jsx';
import StudentFilterSidebar from '../components/students/StudentFilterSidebar.jsx';
import SendRequestModal from '../components/requests/SendRequestModal.jsx';
import Toast from '../components/common/Toast.jsx';
import { searchStudents } from '../services/studentService.js';

export default function ExploreStudentsPage({ embeddedInDashboard = false, onTriggerToast }) {
  const navigate = useNavigate();

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [teachingSkillQuery, setTeachingSkillQuery] = useState('');
  const [sortBy, setSortBy] = useState('relevance');
  const [filters, setFilters] = useState({
    category: 'All',
    department: 'All',
    academicYear: 'All',
    proficiency: 'All',
    availability: 'Any',
    learningMode: 'Any',
  });

  // UI States
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [localToast, setLocalToast] = useState(null);

  // Active Modals
  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState(null);
  const [selectedStudentForRequest, setSelectedStudentForRequest] = useState(null);

  const showToast = (toastObj) => {
    if (onTriggerToast) {
      onTriggerToast(toastObj);
    } else {
      setLocalToast(toastObj);
    }
  };

  // Perform search & rule-based matching
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await searchStudents({
        query: searchQuery,
        teachingSkillQuery,
        category: filters.category,
        department: filters.department,
        academicYear: filters.academicYear,
        proficiency: filters.proficiency,
        availability: filters.availability,
        learningMode: filters.learningMode,
        sortBy,
      });

      setStudents(res.students);
      setTotalCount(res.total);
    } catch (err) {
      console.error('Failed to search students:', err);
      showToast({
        type: 'error',
        title: 'Search Error',
        message: 'Could not load peer directory. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [searchQuery, teachingSkillQuery, filters, sortBy]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setTeachingSkillQuery('');
    setSortBy('relevance');
    setFilters({
      category: 'All',
      department: 'All',
      academicYear: 'All',
      proficiency: 'All',
      availability: 'Any',
      learningMode: 'Any',
    });
  };

  const reciprocalCount = students.filter((s) => s.match?.isReciprocalMatch).length;

  return (
    <div className={embeddedInDashboard ? '' : 'explore-container'}>
      {/* Toast Notification */}
      <Toast toast={localToast} onClose={() => setLocalToast(null)} />

      {/* Detail Modal */}
      <StudentDetailModal
        isOpen={Boolean(selectedStudentForDetail)}
        onClose={() => setSelectedStudentForDetail(null)}
        student={selectedStudentForDetail}
        onOpenSendRequest={(student) => {
          setSelectedStudentForRequest(student);
        }}
      />

      {/* Send Request Modal */}
      <SendRequestModal
        isOpen={Boolean(selectedStudentForRequest)}
        onClose={() => setSelectedStudentForRequest(null)}
        targetStudent={selectedStudentForRequest}
        onSuccess={(newReq, msg) => {
          showToast({
            type: 'success',
            title: 'Proposal Dispatched!',
            message: msg || `Your skill exchange proposal has been sent.`,
          });
        }}
      />

      {/* Page Header */}
      {!embeddedInDashboard && (
        <div className="explore-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn-card-profile"
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </button>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Simulated Campus Directory (Zero AI / Deterministic SQL Rules)
            </span>
          </div>

          <div className="explore-badge">
            <Users size={14} /> Peer Skill Exchange Network
          </div>
          <h1 className="explore-title">Explore Campus Students</h1>
          <p className="explore-subtitle">
            Find peer learners across engineering departments. Our deterministic matching engine
            pairs the skills you want to learn with what fellow students can teach.
          </p>
        </div>
      )}

      {/* Reciprocal Match Notice Banner */}
      {reciprocalCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="reciprocal-banner"
        >
          <div className="reciprocal-banner-content">
            <div className="reciprocal-banner-icon">
              <Sparkles size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.98rem', color: '#0f172a' }}>
                {reciprocalCount} Reciprocal Match{reciprocalCount > 1 ? 'es' : ''} Found!
              </div>
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                These students teach skills on your wishlist, and they want to learn what you can teach in return.
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Search Bar & Quick Controls */}
      <div className="explore-search-bar">
        {/* Name / College / Bio search */}
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search by student name, college, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="search-clear-btn"
              aria-label="Clear student search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Teaching Skill Search */}
        <div className="search-input-wrapper" style={{ minWidth: '200px' }}>
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Filter by skill taught (e.g. Figma, C++)..."
            value={teachingSkillQuery}
            onChange={(e) => setTeachingSkillQuery(e.target.value)}
          />
          {teachingSkillQuery && (
            <button
              type="button"
              onClick={() => setTeachingSkillQuery('')}
              className="search-clear-btn"
              aria-label="Clear skill search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Controls: Sort & Mobile filter toggle */}
        <div className="explore-controls-group">
          <select
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sort peer directory"
          >
            <option value="relevance">Sort by: Rule Match & Relevance</option>
            <option value="rating">Sort by: Highest Rating</option>
            <option value="swaps">Sort by: Most Swaps Completed</option>
            <option value="name">Sort by: Name (A-Z)</option>
          </select>

          <button
            type="button"
            className={`filter-toggle-btn ${mobileFilterOpen ? 'active' : ''}`}
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
          >
            <SlidersHorizontal size={16} />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Two Column Layout: Sidebar + Student Grid */}
      <div className="explore-main-grid">
        {/* Left Filter Sidebar */}
        <StudentFilterSidebar
          filters={filters}
          onChangeFilter={handleFilterChange}
          onResetFilters={handleResetFilters}
          isOpenMobile={mobileFilterOpen}
          onCloseMobile={() => setMobileFilterOpen(false)}
        />

        {/* Right Content Area */}
        <div>
          {/* Results Header Count */}
          <div className="results-header-info">
            <div>
              Showing <span className="results-count-bold">{students.length}</span> students
              {filters.category !== 'All' && <span> in <strong>{filters.category}</strong></span>}
            </div>
            {(searchQuery || teachingSkillQuery || filters.category !== 'All' || filters.department !== 'All') && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="filter-reset-btn"
              >
                Clear all active filters
              </button>
            )}
          </div>

          {/* Grid of Student Cards */}
          {loading ? (
            <div className="student-card-grid">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  style={{
                    height: '280px',
                    borderRadius: '20px',
                    backgroundColor: '#ede9fe',
                    opacity: 0.6,
                    animation: 'skeletonPulse 1.5s infinite',
                  }}
                />
              ))}
            </div>
          ) : students.length > 0 ? (
            <div className="student-card-grid">
              <AnimatePresence>
                {students.map((student) => (
                  <StudentCard
                    key={student.id}
                    student={student}
                    onViewProfile={(st) => setSelectedStudentForDetail(st)}
                    onSendRequest={(st) => setSelectedStudentForRequest(st)}
                  />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            /* Empty State */
            <div className="explore-empty-state">
              <div className="empty-icon-box">
                <Users size={32} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
                No campus peers matched your filters
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#64748b', margin: '0 0 1.5rem 0' }}>
                Try adjusting your search query, selecting different departments, or widening your proficiency filter.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="btn-card-request"
                style={{ margin: '0 auto' }}
              >
                <RotateCcw size={16} />
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

