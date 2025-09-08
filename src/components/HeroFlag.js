import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * بانر علم سوريا بحجم كامل وتموّج بطيء
 * - نجمة يسار، نجمة وسط، نجمة يمين
 * - يغطي البانر كاملاً
 * - حركة تموّج خفيفة وبطيئة
 */
export default function HeroFlag({ compact = true }) {
  const { t } = useTranslation();

  // حركة بطيئة جداً + تموّج خفيف
  const DURATION = '30s';
  const SCALE = 3;

  return (
    <section className={`hero ${compact ? 'hero--compact' : ''}`}>
      <svg
        className="hero__flag"
        viewBox="0 0 300 200"
        preserveAspectRatio="none"
      >
        <defs>
          <filter id="wave">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.010"
              numOctaves="2"
              seed="5">
              <animate
                attributeName="baseFrequency"
                values="0.010;0.013;0.010"
                dur={DURATION}
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" scale={SCALE} />
          </filter>
        </defs>

        {/* العلم كامل داخل مجموعة عليها الفلتر (التموّج) */}
        <g filter="url(#wave)">
          {/* الأشرطة: أخضر / أبيض / أسود */}
          <rect x="0" y="0"         width="300" height="66.666"  fill="#007a3d" />
          <rect x="0" y="66.666"    width="300" height="66.666"  fill="#ffffff" />
          <rect x="0" y="133.333"   width="300" height="66.666"  fill="#000000" />

          {/* 3 نجوم حمراء: يسار - وسط - يمين */}
          <g fill="#ce1126" transform="translate(0,7)">
            {[
              { cx: 40,  cy: 100 },   // يسار
              { cx: 150, cy: 100 },   // وسط
              { cx: 260, cy: 100 }    // يمين
            ].map((s, i) => (
              <polygon
                key={i}
                transform={`translate(${s.cx},${s.cy}) scale(12)`}
                points="0,-1 0.309,-0.309 1,-0.309 0.5,0.118 0.809,0.809 0,0.382 -0.809,0.809 -0.5,0.118 -1,-0.309 -0.309,-0.309"
              />
            ))}
          </g>
        </g>
      </svg>

      {/* غشاء خفيف للقراءة */}
      <div className="hero__veil"></div>

      <div className="hero__content"style={{ color: '#fff' }}>
  <h1>
    {t('welcome_title').replace('Syria Golden Eagle', '')}
    <span className="nowrap">Syria Golden Eagle</span>
  </h1>
  <p>{t('welcome_desc')}</p>
</div>
    </section>
  );
}
