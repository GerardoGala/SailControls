/**
 * sail-trim.js - Sandbox Controller & Dynamic Rig Bending Engine
 */

// 1. Rig coordinate models for Vang and Downhaul combinations
const RIG_VECTORS = {
  mast: {
    "Off_Ease":      "M 50,145 Q 50,75 50,15",  // Straight mast profile
    "Base_Center":   "M 50,145 Q 46,80 44,18",  // Moderate balanced rig bend
    "Max Luff_Max":  "M 50,145 Q 40,85 36,22"   // Heavy load pronounced mast bend
  },
  sail: {
    "Off_Ease":      "M 50,125 Q 85,70 50,15",  // Ballooning open trailing leech twist
    "Base_Center":   "M 46,125 Q 70,72 44,18",  // Flat balanced speed pocket
    "Max Luff_Max":  "M 40,125 Q 56,75 36,22"   // Blown completely flat
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
  // Toggle Nav Tab Class Highlights
  document.querySelectorAll('#controlTabs .nav-link').forEach(btn => btn.classList.remove('active'));
  tabButtonElement.classList.add('active');

  // Toggle Input Panel Field Visibility
  document.querySelectorAll('.control-panel-group').forEach(p => p.classList.add('d-none'));
  document.getElementById(`panel-${tabKey}`).classList.remove('d-none');

  // Toggle SVG Viewport Visibility Lanes
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
  // 1. UPDATE CAMBER CANVAS (Top-Down View)
  const boomTarget = CAMBER_VECTORS.mainsheet[state.mainsheet];
  const depth = CAMBER_VECTORS.outhaulBelly[state.outhaul];
  const midX = (50 + boomTarget.x2) / 2;
  const midY = (80 + boomTarget.y2) / 2;
  const dCamber = `M 50,80 Q ${midX + (depth*0.3)},${midY + depth} ${boomTarget.x2},${boomTarget.y2}`;

  anime({ targets: '#topDownBoom', x2: boomTarget.x2, y2: boomTarget.y2, easing: 'easeOutQuad', duration: 500 });
  anime({ targets: '#sailCamberPath', d: [{ value: dCamber }], easing: 'easeOutQuad', duration: 500 });

  // 2. UPDATE RIG CANVAS (Bending Profile)
  let rigKey = `${state.downhaul}_${state.vang}`;
  let mastD = RIG_VECTORS.mast[rigKey] || RIG_VECTORS.mast["Base_Center"];
  let sailD = RIG_VECTORS.sail[rigKey] || RIG_VECTORS.sail["Base_Center"];

  anime({ targets: '#mastProfilePath', d: [{ value: mastD }], easing: 'easeOutQuad', duration: 500 });
  anime({ targets: '#sailProfileCurvePath', d: [{ value: sailD }], easing: 'easeOutQuad', duration: 500 });

  // 3. UPDATE SAILOR POSITION CANVAS (Heel/Transom Rolling)
  let targetRoll = 0, headX = 80, bodyX2 = 80;
  if (state.sailor === "Leeward") { targetRoll = 8; headX = 94; bodyX2 = 88; }
  if (state.sailor === "Hike Hard") { targetRoll = -12; headX = 40; bodyX2 = 62; }

  anime({ targets: '#svgTransom', rotate: targetRoll, transformOrigin: '80px 120px', easing: 'easeOutQuad', duration: 400 });
  anime({ targets: '#crewHead', cx: headX, easing: 'easeOutQuad', duration: 400 });
  anime({ targets: '#crewBody', x2: bodyX2, easing: 'easeOutQuad', duration: 400 });
}
