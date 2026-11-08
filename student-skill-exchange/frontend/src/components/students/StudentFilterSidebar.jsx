import React from 'react';
import { Filter, RotateCcw, BookOpen, Layers, Calendar, Monitor, Award } from 'lucide-react';
import {
  SKILL_CATEGORIES,
  DEPARTMENTS,
  ACADEMIC_YEARS,
  PROFICIENCY_LEVELS,
  AVAILABILITY_OPTIONS,
  LEARNING_MODES,
} from '../../services/studentService.js';

export default function StudentFilterSidebar({
  filters,
  onChangeFilter,
  onResetFilters,
  isOpenMobile,
  onCloseMobile,
}) {
  return (
    <aside className={`filter-sidebar ${isOpenMobile ? 'mobile-open' : ''}`}>
      <div className="filter-sidebar-header">
        <h3 className="filter-sidebar-title">
          <Filter size={18} color="#6366f1" />
          <span>Filters</span>
        </h3>
        <button
          type="button"
          onClick={onResetFilters}
          className="filter-reset-btn"
          title="Reset all filters to default"
        >
          <RotateCcw size={13} style={{ display: 'inline', marginRight: '4px' }} />
          Reset All
        </button>
      </div>

      {/* Filter 1: Skill Category */}
      <div className="filter-section">
        <label className="filter-label" htmlFor="filter-category-select">
          Skill Category
        </label>
        <select
          id="filter-category-select"
          className="filter-select"
          value={filters.category}
          onChange={(e) => onChangeFilter('category', e.target.value)}
        >
          {SKILL_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Filter 2: Department */}
      <div className="filter-section">
        <label className="filter-label" htmlFor="filter-dept-select">
          Department
        </label>
        <select
          id="filter-dept-select"
          className="filter-select"
          value={filters.department}
          onChange={(e) => onChangeFilter('department', e.target.value)}
        >
          {DEPARTMENTS.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
      </div>

      {/* Filter 3: Academic Year */}
      <div className="filter-section">
        <label className="filter-label" htmlFor="filter-year-select">
          Academic Year
        </label>
        <select
          id="filter-year-select"
          className="filter-select"
          value={filters.academicYear}
          onChange={(e) => onChangeFilter('academicYear', e.target.value)}
        >
          {ACADEMIC_YEARS.map((yr) => (
            <option key={yr} value={yr}>
              {yr}
            </option>
          ))}
        </select>
      </div>

      {/* Filter 4: Proficiency */}
      <div className="filter-section">
        <label className="filter-label">Skill Proficiency</label>
        <div className="filter-pill-group">
          {PROFICIENCY_LEVELS.map((prof) => (
            <button
              key={prof}
              type="button"
              className={`filter-pill ${filters.proficiency === prof ? 'active' : ''}`}
              onClick={() => onChangeFilter('proficiency', prof)}
            >
              {prof}
            </button>
          ))}
        </div>
      </div>

      {/* Filter 5: Learning Mode */}
      <div className="filter-section">
        <label className="filter-label">Learning Mode</label>
        <div className="filter-pill-group">
          {LEARNING_MODES.map((mode) => (
            <button
              key={mode}
              type="button"
              className={`filter-pill ${filters.learningMode === mode ? 'active' : ''}`}
              onClick={() => onChangeFilter('learningMode', mode)}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Filter 6: Availability */}
      <div className="filter-section">
        <label className="filter-label">Availability Schedule</label>
        <div className="filter-pill-group">
          {AVAILABILITY_OPTIONS.map((avail) => (
            <button
              key={avail}
              type="button"
              className={`filter-pill ${filters.availability === avail ? 'active' : ''}`}
              onClick={() => onChangeFilter('availability', avail)}
            >
              {avail}
            </button>
          ))}
        </div>
      </div>

      {isOpenMobile && (
        <button
          type="button"
          onClick={onCloseMobile}
          className="btn-card-profile"
          style={{ width: '100%', marginTop: '1rem' }}
        >
          Apply & Close Filters
        </button>
      )}
    </aside>
  );
}

