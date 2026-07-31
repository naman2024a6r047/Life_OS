const fs = require('fs');

const srcFile = 'client/src/components/fitness/MuscleDiagram.jsx';
let content = fs.readFileSync(srcFile, 'utf-8');

// 1. Add imports
content = content.replace(
  "import React, { useState } from 'react';",
  "import React, { useState, useEffect, useRef } from 'react';\nimport anatomyFrontRaw from '../../assets/anatomy_front.svg?raw';\nimport anatomyBackRaw from '../../assets/anatomy_back.svg?raw';"
);

// 2. Add useRef and SVG mapping logic
const stateHookMarker = "  const [activeDrawerMuscle, setActiveDrawerMuscle] = useState(null);";
const mappingLogic = `
  const svgContainerRef = useRef(null);

  // SVG Data-Muscle -> Internal Tracker ID mapping
  const svgToInternalMap = {
    trapezius: 'traps',
    deltoids: 'deltoids_side', // Group them for display
    chest: 'chest',
    abs: 'core',
    obliques: 'obliques',
    biceps: 'biceps',
    forearm: 'forearms',
    quadriceps: 'quads',
    upperBack: 'lats',
    lowerBack: 'lower_back',
    gluteal: 'glutes',
    hamstring: 'hamstrings',
    triceps: 'triceps',
    calves: 'calves'
  };

  // Internal Tracker ID -> SVG Data-Muscle mapping (for highlighting)
  const internalToSvgMap = {
    chest: 'chest',
    deltoids_front: 'deltoids',
    deltoids_side: 'deltoids',
    deltoids_rear: 'deltoids',
    biceps: 'biceps',
    triceps: 'triceps',
    forearms: 'forearm',
    core: 'abs',
    obliques: 'obliques',
    quads: 'quadriceps',
    calves: 'calves',
    traps: 'trapezius',
    lats: 'upperBack',
    lower_back: 'lowerBack',
    glutes: 'gluteal',
    hamstrings: 'hamstring'
  };

  useEffect(() => {
    if (!svgContainerRef.current) return;
    const container = svgContainerRef.current;
    
    // First, clear all previous event listeners by cloning nodes if we need to? 
    // Actually, simple DOM events can be attached. Since this runs on every render, 
    // it's safer to just set styles and attributes dynamically without duplicating listeners, 
    // or just re-attach them. Wait, React handles the DOM, but we are injecting raw SVG.
    // The raw SVG doesn't change unless viewMode changes.
    // But we need to update fills every time targetInfo or hoveredMuscle changes.
    
    const muscles = container.querySelectorAll('g.muscle[data-muscle]');
    
    muscles.forEach((group) => {
      const svgId = group.getAttribute('data-muscle');
      const internalId = svgToInternalMap[svgId];
      
      // Setup event listeners ONLY ONCE by checking a flag
      if (!group.dataset.initialized) {
        group.dataset.initialized = 'true';
        if (internalId) {
          group.style.cursor = 'pointer';
          group.style.transition = 'all 0.3s ease';
          
          group.addEventListener('mouseenter', () => setHoveredMuscle(internalId));
          group.addEventListener('mouseleave', () => setHoveredMuscle(null));
          group.addEventListener('click', () => {
            onSelectMuscle(internalId);
            setActiveDrawerMuscle(muscleData[internalId]);
          });
        }
      }

      // Calculate styles based on current state
      let status = 'none';
      
      // Determine if this SVG group is primary/secondary based on active tracker IDs
      const isPrimary = targetInfo.primary.some(id => internalToSvgMap[id] === svgId) || (selectedMuscle !== 'all' && internalToSvgMap[selectedMuscle] === svgId);
      const isSecondary = targetInfo.secondary.some(id => internalToSvgMap[id] === svgId);
      
      if (isPrimary) status = 'primary';
      else if (isSecondary) status = 'secondary';
      
      // Determine if this specific SVG group is hovered
      const isHovered = hoveredMuscle && internalToSvgMap[hoveredMuscle] === svgId;
      
      // Apply styles
      if (isHovered) {
        group.style.fill = 'url(#hoverGradient)';
        group.style.filter = 'drop-shadow(0px 0px 8px rgba(192, 132, 252, 0.9))';
      } else if (status === 'primary') {
        group.style.fill = 'url(#primaryGradient)';
        group.style.filter = 'drop-shadow(0px 0px 7px rgba(168, 85, 247, 0.85))';
      } else if (status === 'secondary') {
        group.style.fill = 'url(#secondaryGradient)';
        group.style.filter = 'drop-shadow(0px 0px 5px rgba(56, 189, 248, 0.65))';
      } else {
        group.style.fill = 'url(#inactiveGradient)';
        group.style.filter = 'none';
      }
    });
  }); // Run on every render to ensure styles update
`;

content = content.replace(stateHookMarker, stateHookMarker + "\n" + mappingLogic);

// 3. Replace the renderSVGGraphic function
const renderSvgStart = "  // Render SVG Anatomical Graphic Component";
const renderSvgEnd = "      {/* FLOATING GLASSMORPHISM TOOLTIP */}";

const renderSvgIndexStart = content.indexOf(renderSvgStart);
const renderSvgIndexEnd = content.indexOf(renderSvgEnd);

if (renderSvgIndexStart !== -1 && renderSvgIndexEnd !== -1) {
  const newRenderSVG = `  // Render SVG Anatomical Graphic Component
  const renderSVGGraphic = () => (
    <div ref={svgContainerRef} className="relative w-full h-full flex flex-col items-center justify-center select-none overflow-visible">
      {/* 
        We wrap both in a shared SVG to keep the gradients in scope.
        The viewBox handles the overall layout of both figures. 
      */}
      <svg
        viewBox="0 0 800 900"
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full filter drop-shadow-xl"
      >
        <defs>
          <linearGradient id="primaryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#5b21b6" />
          </linearGradient>

          <linearGradient id="secondaryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>

          <linearGradient id="inactiveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3f3f46" />
            <stop offset="100%" stopColor="#27272a" />
          </linearGradient>

          <linearGradient id="hoverGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d8b4fe" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>
        </defs>

        {/* FRONT ANATOMY MODEL (High Fidelity) */}
        {(viewMode === 'both' || viewMode === 'front') && (
          <g id="front-anatomy" transform={viewMode === 'front' ? "translate(200, 0) scale(1)" : "translate(0, 0)"} dangerouslySetInnerHTML={{ __html: anatomyFrontRaw.replace(/<svg[^>]*>|<\/svg>/g, '') }} />
        )}

        {/* BACK ANATOMY MODEL (High Fidelity) */}
        {(viewMode === 'both' || viewMode === 'back') && (
          <g id="back-anatomy" transform={viewMode === 'back' ? "translate(200, 0) scale(1)" : "translate(400, 0)"} dangerouslySetInnerHTML={{ __html: anatomyBackRaw.replace(/<svg[^>]*>|<\/svg>/g, '') }} />
        )}
      </svg>
    </div>
  );

`;
  
  content = content.substring(0, renderSvgIndexStart) + newRenderSVG + content.substring(renderSvgIndexEnd);
  fs.writeFileSync(srcFile, content);
  console.log("Successfully refactored MuscleDiagram.jsx to use raw SVGs and DOM injection!");
} else {
  console.log("Could not find replacement bounds");
}
