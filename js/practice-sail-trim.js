/**
 * sail-trim.js - Production Vector Morphing Engine
 * Fully Synchronized Matrix Layout Engine (Fixed Flexible Upper Mast Bending Aft / Right)
 */

// 1. Corrected ILCA Rig coordinate models: Upper half curves AFT (Right, higher X values)
const RIG_VECTORS = {
  mast: {
    // Format: "Downhaul_Vang"
    // SVG C Syntax: C control1X,control1Y control2X,control2Y endX,endY
    // Lower mast stays perfectly vertical. Upper carbon section sweeps Aft (Right, higher X values)
    "Off_Ease":      "M 50,145 C 50,110 50,80 50,15",   // Neutral rest state: perfectly straight rig
    "Off_Center":    "M 50,145 C 50,110 50,80 53,16",   
    "Off_Max":       "M 50,145 C 50,110 51,75 58,18",   // Pure Vang: Upper tip bends back towards stern (Right)
    
    "Base_Ease":     "M 50,145 C 50,110 52,78 55,17",   // Base Downhaul: Upper mast bends aft (Right)
    "Base_Center":   "M 50,145 C 50,110 53,75 58,18",   // Standard balanced tuning bend
    "Base_Max":      "M 50,145 C 50,110 54,72 63,20",   
    
    "Max Luff_Ease": "M 50,145 C 50,110 54,75 61,18",   // Max Downhaul: Upper mast bends hard aft (Right)
    "Max Luff_Center":"M 50,145 C 50,110 56,72 65,20",  
    "Max Luff_Max":  "M 50,145 C 50,110 58,68 68,22"    // Max Storm Load: Ultimate flat block aft-bend (Right)
  },
  // Controls the depth of the trailing edge leech curve (anchoring the sail pocket)
  sailBellyOffset: {
    "Off_Ease":      { qx: 95, qy: 65 },   // Full open baggy pocket depth
    "Off_Center":    { qx: 90, qy: 65 },   
    "Off_Max":       { qx: 85, qy: 65 },   
    
    "Base_Ease":     { qx: 88, qy: 65 },   
    "Base_Center":   { qx: 82, qy: 65 },   // Standard balanced operational shape
    "Base_Max":      { qx: 76, qy: 65 },   
    
    "Max Luff_Ease": { qx: 82, qy: 65 },   
    "Max Luff_Center":{ qx: 74, qy: 65 },  
    "Max Luff_Max":  { qx: 66, qy: 65 }    // Storm trim: pulled flat
  },
  // Controls the absolute end point (x2, y2) of the rigid side view boom line
  boomTargetCoords: {
    "Ease":   { x2: 160, y2: 120 }, // Boom lifted upward (Loose leech)
    "Center": { x2: 160, y2: 125 }, // Standard 90-degree baseline angle
    "Max":    { x2: 158, y2: 133 }  // Vang on Max: Pulls boom down past square (~93°)
  }
};

const CAMBER_VECTORS = {
  mainsheet: {
    "0-8":   { x2: 148, y2: 83  },
    "5-15":  { x2: 145, y2: 95  },
    "35-65": { x2: 120, y2: 140 },
    "90":    { x2: 52,  y2: 165 }
  },
  outhaulBelly: { "Full": 32, "Base": 16, "Flat": 2 }
};

const state = {
  mainsheet: "0-8", outhaul: "Base", sailor: "Mid Center", vang: "Center", downhaul: "Base"
};

/**
 * Tab Switching Controller Core
 */
function switchSandboxTab(tabKey, tabButtonElement) {
  document.querySelectorAll('#controlTabs .nav-link').forEach(btn => btn.classList.remove('active'));
  tabButtonElement.classList.add('active');

  document.querySelectorAll('.control-panel-group').forEach(p => p.classList.add('d-none'));
  document.getElementById(`panel-${tabKey}`).classList.remove('d-none');

  document.querySelectorAll('.sandbox-view').forEach(v => v.classList.remove('active-view'));
  if (tabKey === 'sheet-outhaul') document.getElementById('viewCamber').classList.add('active-view');
  if (tabKey === 'sailor') document.getElementById('viewSailor').classList.add('active-view');
  if (tabKey === 'vang-downhaul') document.getElementById('viewRig').classList.add('active-view');

  triggerSandboxRefresh();
}

/**
 * Input Highlights & Pipeline Routers
 */
function highlightButtonRow(element) {
  if (!element) return;
  Array.from(element.parentElement.children).forEach(btn => {
    btn.classList.remove('btn-primary');
    btn.classList.add('btn-outline-secondary');
  });
  element.classList.remove('btn-outline-secondary');
  element.classList.add('btn-primary');
}

function updateBoomControl(val, el) { highlightButtonRow(el); state.mainsheet = val; triggerSandboxRefresh(); }
function updateOuthaulControl(val, el) { highlightButtonRow(el); state.outhaul = val; triggerSandboxRefresh(); }
function updateSailorPosition(val, el) { highlightButtonRow(el); state.sailor = val; triggerSandboxRefresh(); }
function updateVangControl(val, el) { highlightButtonRow(el); state.vang = val; triggerSandboxRefresh(); }
function updateDownhaulControl(val, el) { highlightButtonRow(el); state.downhaul = val; triggerSandboxRefresh(); }

/**
 * Master Morph Execution Loop
 */
function triggerSandboxRefresh() {
  // 1. UPDATE CAMBER CANVAS (Top-Down View preserved exactly)
  const boomTarget = CAMBER_VECTORS.mainsheet[state.mainsheet];
  const depth = CAMBER_VECTORS.outhaulBelly[state.outhaul];
  const midX = (50 + boomTarget.x2) / 2;
  const midY = (80 + boomTarget.y2) / 2;
  const dCamber = `M 50,80 Q ${midX + (depth*0.3)},${midY + depth} ${boomTarget.x2},${boomTarget.y2}`;

  anime({ targets: '#topDownBoom', x2: boomTarget.x2, y2: boomTarget.y2, easing: 'easeOutQuad', duration: 500 });
  anime({ targets: '#sailCamberPath', d: [{ value: dCamber }], easing: 'easeOutQuad', duration: 500 });

  // ========================================================
  // 2. SLEEVED LUFF & CLEW STRAP ENGINE (Corrected: Curves Aft / Right)
  // ========================================================
  let rigKey = `${state.downhaul}_${state.vang}`;
  let mastD = RIG_VECTORS.mast[rigKey] || RIG_VECTORS.mast["Base_Center"];
  
  const boomCoords = RIG_VECTORS.boomTargetCoords[state.vang] || RIG_VECTORS.boomTargetCoords["Center"];
  const sailCurve = RIG_VECTORS.sailBellyOffset[rigKey] || RIG_VECTORS.sailBellyOffset["Base_Center"];

  // Parse path string components to reassemble cleanly
  const segments = mastD.split(' ');
  const mastHeadCoord = segments[segments.length - 1]; // Pulls the terminal head "x,y" string (e.g. "58,18")

  // Reassemble path: 
  // 1. Starts sleeve at gooseneck deck level `M 50,125`
  // 2. Copies the cubic mast code exactly so the luff follows the aft-bending mast profile
  // 3. Curves down the trailing edge leech `Q` to connect to the end of the boom
  // 4. `L 50,125` draws a flat line back along the boom, keeping the foot locked tightly by the clew strap
  const mastPathOnly = mastD.replace("M 50,145 ", ""); 
  const dynamicSailD = `M 50,125 ${mastPathOnly} Q ${sailCurve.qx},${sailCurve.qy} ${boomCoords.x2},${boomCoords.y2} L 50,125 Z`;

  // Execute simultaneous rendering loops
  anime({ targets: '#mastProfilePath', d: [{ value: mastD }], easing: 'easeOutQuad', duration: 500 });
  anime({ targets: '#sailProfileCurvePath', d: [{ value: dynamicSailD }], easing: 'easeOutQuad', duration: 500 });
  
  anime({ 
    targets: '#profileBoomLine', 
    x2: boomCoords.x2,
    y2: boomCoords.y2, 
    easing: 'easeOutQuad', 
    duration: 500 
  });

  // ========================================================
  // 3. SAILOR POSITION CALIBRATION (West Wind Setup preserved exactly)
  // ========================================================
  let targetRoll = 0, headX = 100, bodyX2 = 100;

  if (state.sailor === "Hike Hard") { targetRoll = 0; headX = 75; bodyX2 = 85; } 
  else if (state.sailor === "Mid Center") { targetRoll = 22; headX = 100; bodyX2 = 100; } 
  else if (state.sailor === "Leeward") { targetRoll = 78; headX = 115; bodyX2 = 110; }

  anime({ 
    targets: '#tiltingRigGroup', 
    rotate: targetRoll, 
    transformOrigin: '100px 120px', 
    easing: 'easeOutQuad', 
    duration: 500 
  });
  
  anime({ targets: '#crewHead', cx: headX, easing: 'easeOutQuad', duration: 400 });
  anime({ targets: '#crewBody', x2: bodyX2, easing: 'easeOutQuad', duration: 400 });
}
