import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function LearningChart({ data = [] }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const maxHours = 5; // Chart Y-axis max scale
  const chartHeight = 160;
  const chartWidth = 440;
  const barWidth = 14;
  const gap = 52;
  const startX = 35;

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      {/* Chart Legend & Summary */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.8rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: '#6366f1' }} />
            <span style={{ color: '#475569', fontWeight: 600 }}>Teaching (Mentoring)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: '#a855f7' }} />
            <span style={{ color: '#475569', fontWeight: 600 }}>Learning (Peer Sprints)</span>
          </div>
        </div>

        <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
          This Week:{' '}
          <strong style={{ color: '#0f172a' }}>
            {data.reduce((acc, curr) => acc + curr.teaching + curr.learning, 0).toFixed(1)} hrs
          </strong>
        </div>
      </div>

      {/* SVG Container */}
      <div style={{ overflowX: 'auto', paddingBottom: '0.5rem' }}>
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight + 35}`}
          style={{ width: '100%', maxWidth: '520px', height: 'auto', display: 'block' }}
        >
          {/* Horizontal Grid lines */}
          {[0, 1.25, 2.5, 3.75, 5].map((level, i) => {
            const y = chartHeight - (level / maxHours) * chartHeight + 10;
            return (
              <g key={i}>
                <line x1="25" y1={y} x2={chartWidth} y2={y} stroke="#f1f5f9" strokeDasharray="3 3" />
                <text x="5" y={y + 4} fill="#94a3b8" fontSize="9" fontFamily="sans-serif">
                  {level}h
                </text>
              </g>
            );
          })}

          {/* Bars */}
          {data.map((item, idx) => {
            const groupX = startX + idx * gap;
            const teachingHeight = (item.teaching / maxHours) * chartHeight;
            const learningHeight = (item.learning / maxHours) * chartHeight;

            const teachingY = chartHeight - teachingHeight + 10;
            const learningY = chartHeight - learningHeight + 10;

            const isHovered = hoveredIndex === idx;

            return (
              <g
                key={idx}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Teaching Bar */}
                <rect
                  x={groupX}
                  y={teachingY}
                  width={barWidth}
                  height={teachingHeight}
                  rx="4"
                  fill="#6366f1"
                  className="chart-bar-rect"
                />

                {/* Learning Bar */}
                <rect
                  x={groupX + barWidth + 3}
                  y={learningY}
                  width={barWidth}
                  height={learningHeight}
                  rx="4"
                  fill="#a855f7"
                  className="chart-bar-rect"
                />

                {/* Day Label */}
                <text
                  x={groupX + barWidth}
                  y={chartHeight + 25}
                  textAnchor="middle"
                  fill={isHovered ? '#4f46e5' : '#64748b'}
                  fontSize="11"
                  fontWeight={isHovered ? '700' : '500'}
                  fontFamily="sans-serif"
                >
                  {item.day}
                </text>

                {/* Hover Tooltip */}
                {isHovered && (
                  <g>
                    <rect
                      x={groupX - 25}
                      y={Math.min(teachingY, learningY) - 28}
                      width="80"
                      height="24"
                      rx="6"
                      fill="#0f172a"
                      opacity="0.92"
                    />
                    <text
                      x={groupX + 15}
                      y={Math.min(teachingY, learningY) - 12}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="9.5"
                      fontFamily="sans-serif"
                    >
                      T:{item.teaching}h | L:{item.learning}h
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

