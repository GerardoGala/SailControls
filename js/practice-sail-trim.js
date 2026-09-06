/**
 * sail-trim.js - Production Vector Morphing Engine
 * Separates Mainsheet (Boom Angle) from Outhaul (Sail Camber Shape Profile)
 */

const SAIL_VECTORS = {
  profile: {
    vang: {
      "Ease":   "M 50,125 Q 110,65 65,15",
      "Center": "M 50,125 Q 75,65 65,15",
      "Max":    "M 50,125 Q 52,65 65,15"
    },
    downhaul: {
      "Off":      "M 50,125 Q 85,75 65,15",
      "Base":     "M 50,125 Q 75,65 65,15",
      "Max Luff": "M 50,125 Q 58,55 65,15"
    }
  },
  
  // NEW LOGICAL SEPARATION GRID FOR TOP-DOWN VIEW
  camber: {
    // Mainsheet exclusively controls the Clew coordinate (x2, y2) of the Boom line
    mainsheetBoomCoords: {
      "0-8":   { x2: 108, y2: 135 }, // Tight to centerline (Upwind)
      "5-15":  { x2: 120, y2: 133 },
      "35-65": { x2: 165, y2: 110 }, // Reaching out
      "40-70": { x2: 175, y2: 100 },
      "75-85": { x2: 190, y2: 65  }, // Downwind run square
      "90":    { x2: 195, y2: 45  }  // Swung out all the way 90 degrees
    },
    // Outhaul exclusively dictates the depth modifier offset for the Q control point
    outhaulBellyOffset: {
      "Full": 35, // Deep ballooning wind pocket curve
      "Base": 18, // Optimal generic foil pocket curve
      "Flat": 2   // Pulled flat inline with the boom tube axis
    }
  },
  
  daggerboard: {
    "CENTERBOARD UP": "M 90,127 L 90,130", 
    "Center":         "M 90,127 L 90,145", 
    "Down":           "M 90,127 L 90,158"  
  }
};

const sailState = {
  mainsheet: "0-8",
  sailorPosition: "Mid Center",
  daggerboard: "Down",
  vang: "Center",
  downhaul: "Base",
  outhaul: "Base"
};

// Interface Clicks Routing Links
function updateBoomControl(value) { sailState.mainsheet = value; triggerInstantTrimAnimation(); }
function updateDaggerboardControl(value) { sailState.daggerboard = value; triggerInstantTrimAnimation(); }
function updateSailorPosition(value) { sailState.sailorPosition = value; triggerInstantTrimAnimation(); }
function updateVangControl(value) { sailState.vang = value; triggerInstantTrimAnimation(); }
function updateDownhaulControl(value) { sailState.downhaul = value; triggerInstantTrimAnimation(); }
function updateOuthaulControl(value) { sailState.outhaul = value; triggerInstantTrimAnimation(); }

function triggerInstantTrimAnimation() {
  // Resolve Side Profile Canvas Line
  const profilePath = sailState.vang === "Center"
    ? SAIL_VECTORS.profile.downhaul[sailState.downhaul]
    : SAIL_VECTORS.profile.vang[sailState.vang];

  // Resolve Daggerboard Line Depth
  const boardPath = SAIL_VECTORS.daggerboard[sailState.daggerboard] || SAIL_VECTORS.daggerboard["Down"];

  // MATHEMATICAL COMBINATION FOR TOP-DOWN VIEW
  // 1. Get Clew target points from active Mainsheet selection
  const boomTarget = SAIL_VECTORS.camber.mainsheetBoomCoords[sailState.mainsheet];
  
  // 2. Get curvature offset depth from active Outhaul selection
  const depthOffset = SAIL_VECTORS.camber.outhaulBellyOffset[sailState.outhaul];

  // 3. Compute midpoints dynamically so sail curve stays anchored to boom orientation
  const midX = (100 + boomTarget.x2) / 2;
  const midY = (35 + boomTarget.y2) / 2;

  // 4. Extrude the Bézier curve control point perpendicular to wind vector (pushes right/leeward)
  const sailControlX = midX + depthOffset;
  const sailControlY = midY;

  // Assemble the unified SVG string dynamically
  const dynamicCamberPath = `M 100,35 Q ${sailControlX},${sailControlY} ${boomTarget.x2},${boomTarget.y2}`;

  // Calculate dynamic roll angle (Sailor hiking leverage offset)
  let rotationDeg = 0;
  if (sailState.sailorPosition === "Leeward") rotationDeg = 6;
  if (sailState.sailorPosition === "Hike Hard") rotationDeg = -10;
  if (sailState.sailorPosition === "Forward") rotationDeg = -2;
  if (sailState.sailorPosition === "Aft") rotationDeg = 3;

  // Execute Fluid Morphs via Anime.js Core
  anime({
    targets: '#sailProfilePath',
    d: [ { value: profilePath } ],
    easing: 'easeOutElastic(1, .6)',
    duration: 1100
  });

  // ANIMATE BOOM LINE EXTENSION ANGLE
  anime({
    targets: '#topDownBoom',
    x2: boomTarget.x2,
    y2: boomTarget.y2,
    easing: 'easeOutQuad',
    duration: 700
  });

  // ANIMATE SAIL CLOTH FOIL ATTACHED TO BOOM
  anime({
    targets: '#sailCamberPath',
    d: [ { value: dynamicCamberPath } ],
    easing: 'easeOutQuad',
    duration: 700
  });

  // Animate Daggerboard Drop Line
  anime({
    targets: '#foilReferencePath',
    d: [ { value: boardPath } ],
    easing: 'easeOutBounce',
    duration: 650
  });

  // Dynamic boat lean angle simulation
  anime({
    targets: '#sailProfileDiv svg, #sailCamberDiv svg',
    rotate: rotationDeg,
    transformOrigin: '50% 50%',
    easing: 'easeOutQuad',
    duration: 400
  });
}
