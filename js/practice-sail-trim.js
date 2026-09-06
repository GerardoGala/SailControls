/**
 * sail-trim.js - Production Vector Morphing Engine
 * Connects your page's live click events directly to fluid SVG transitions.
 */

// 1. Precise geometric path maps matched directly to your HTML string values
const SAIL_VECTORS = {
  profile: {
    vang: {
      "Ease":   "M 50,145 Q 110,75 65,15", // Deep, ballooned sail pocket
      "Center": "M 50,145 Q 75,75 65,15",  // Standard neutral shape
      "Max":    "M 50,145 Q 52,75 65,15"   // Flattened aerodynamic blade
    },
    downhaul: {
      "Off":      "M 50,145 Q 85,85 65,15", // Full rounded front entry
      "Base":     "M 50,145 Q 75,75 65,15", // Balanced mid-depth draft
      "Max Luff": "M 50,145 Q 58,65 65,15"  // Stretched and flattened entry
    }
  },
  camber: {
    outhaul: {
      "Full": "M 20,80 Q 100,10 180,80", // Maximum deep structural wing pocket
      "Base": "M 20,80 Q 100,45 180,80", // Normal standard cross-section curve
      "Flat": "M 20,80 Q 100,78 180,80"  // Stretched flat against the boom
    },
    mainsheet: {
      "0-8":   "M 20,80 Q 100,45 180,80",
      "5-15":  "M 20,80 Q 95,50 175,90",
      "35-65": "M 20,80 Q 80,70 140,120",
      "40-70": "M 20,80 Q 75,75 130,130",
      "75-85": "M 20,80 Q 65,85 95,150",
      "90":    "M 20,80 Q 60,90 70,155"  // Released broad downwind angle
    }
  },
  daggerboard: {
    "CENTERBOARD UP": "M 100,80 L 100,85",  // Matches your 'CENTERBOARD UP' text
    "Center":         "M 100,80 L 100,105", 
    "Down":           "M 100,80 L 100,135"  
  }
};

// 2. Global State Storage reflecting your interface layout defaults
const sailState = {
  mainsheet: "0-8",
  sailorPosition: "Mid Center",
  daggerboard: "Down",
  vang: "Center",
  downhaul: "Base",
  outhaul: "Base"
};

// 3. Interface Event Handlers (Called by your HTML buttons)

function updateBoomControl(value) {
  sailState.mainsheet = value; // e.g., '0-8', '35-65', '90'
  triggerInstantTrimAnimation();
}

function updateDaggerboardControl(value) {
  sailState.daggerboard = value; // e.g., 'CENTERBOARD UP', 'Center', 'Down'
  triggerInstantTrimAnimation();
}

function updateSailorPosition(value) {
  sailState.sailorPosition = value; // e.g., 'Forward', 'Hike Hard', 'Leeward', 'Aft'
  triggerInstantTrimAnimation();
}

function updateVangControl(value) {
  sailState.vang = value; // e.g., 'Max', 'Center', 'Ease'
  triggerInstantTrimAnimation();
}

function updateDownhaulControl(value) {
  sailState.downhaul = value; // e.g., 'Max Luff', 'Base', 'Off'
  triggerInstantTrimAnimation();
}

function updateOuthaulControl(value) {
  sailState.outhaul = value; // e.g., 'Flat', 'Base', 'Full'
  triggerInstantTrimAnimation();
}

// 4. The Master Vector Recalculation & Animation Engine
function triggerInstantTrimAnimation() {
  // Resolve Profile vector coordinate configurations (Prioritize Vang changes)
  const profilePath = sailState.vang === "Center"
    ? SAIL_VECTORS.profile.downhaul[sailState.downhaul]
    : SAIL_VECTORS.profile.vang[sailState.vang];

  // Resolve Camber vector configurations (Prioritize Mainsheet sheet tracking)
  const camberPath = sailState.mainsheet === "0-8"
    ? SAIL_VECTORS.camber.outhaul[sailState.outhaul]
    : SAIL_VECTORS.camber.mainsheet[sailState.mainsheet];

  // Resolve Daggerboard line coordinates
  const boardPath = SAIL_VECTORS.daggerboard[sailState.daggerboard] || SAIL_VECTORS.daggerboard["Down"];

  // Calculate dynamic canvas rotation angle based on sailor weight positioning
  let rotationDeg = 0;
  if (sailState.sailorPosition === "Leeward") rotationDeg = 6;
  if (sailState.sailorPosition === "Hike Hard") rotationDeg = -10;
  if (sailState.sailorPosition === "Forward") rotationDeg = -2;
  if (sailState.sailorPosition === "Aft") rotationDeg = 3;

  // Execute continuous GPU calculations via Anime.js Core
  anime({
    targets: '#sailProfilePath',
    d: [ { value: profilePath } ],
    easing: 'easeOutElastic(1, .6)', // Interactive cloth 'flutter snap' feel
    duration: 1100
  });

  anime({
    targets: '#sailCamberPath',
    d: [ { value: camberPath } ],
    easing: 'easeOutQuad',
    duration: 750
  });

  anime({
    targets: '#foilReferencePath',
    d: [ { value: boardPath } ],
    easing: 'easeOutBounce', // Gives a physical notch-drop feel
    duration: 600
  });

  // Tilts the whole visualization coordinate space to represent boat roll
  anime({
    targets: '#sailProfileDiv svg, #sailCamberDiv svg',
    rotate: rotationDeg,
    transformOrigin: '50% 50%',
    easing: 'easeOutQuad',
    duration: 400
  });
}
