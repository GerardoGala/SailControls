/**
 * Unified Sailing Aerodynamics Trim Matrix
 * Uses explicit GUI-matched text criteria keys
 */

const SAIL_VECTORS = {
  // Profiles manage side-view canvas structures
  profile: {
    vang: {
      "EASE":   "M 50,145 Q 110,75 65,15",
      "CENTER": "M 50,145 Q 75,75 65,15",
      "MAX":    "M 50,145 Q 52,75 65,15"
    },
    downhaul: {
      "OFF":      "M 50,145 Q 85,85 65,15", // Full entry pocket
      "BASE":     "M 50,145 Q 75,75 65,15", // Mid entry pocket
      "MAX LUFF": "M 50,145 Q 58,65 65,15"  // Draft forward entry flattening
    }
  },
  // Cambers manage the overhead cross-section slices
  camber: {
    outhaul: {
      "FULL": "M 20,80 Q 100,10 180,80",
      "BASE": "M 20,80 Q 100,45 180,80",
      "FLAT": "M 20,80 Q 100,78 180,80"
    },
    mainsheet: {
      "0-8":   "M 20,80 Q 100,45 180,80",
      "5-15":  "M 20,80 Q 95,50 175,90",
      "35-65": "M 20,80 Q 80,70 140,120",
      "40-70": "M 20,80 Q 75,75 130,130",
      "75-85": "M 20,80 Q 65,85 95,150",
      "90":    "M 20,80 Q 60,90 70,155" // Complete structural release out broad
    }
  },
  // Daggerboard offsets 
  daggerboard: {
    "Up":     "M 100,80 L 100,85",  // Retracted
    "Center": "M 100,80 L 100,105", // Halfway
    "Down":   "M 100,80 L 100,135"  // Full structural plane
  }
};

// State representation
const sailState = {
  mainsheet: "0-8",
  sailorPosition: "Mid Center",
  daggerboard: "Down",
  vang: "CENTER",
  downhaul: "BASE",
  outhaul: "BASE"
};

// 6 Discrete API Interception Controllers
function updateBoomControl(value) {
  sailState.mainsheet = value; // e.g. '0-8', '90'
  triggerInstantTrimAnimation();
}

function updateSailorPosition(value) {
  sailState.sailorPosition = value; // e.g. 'Hike Hard', 'Leeward'
  triggerInstantTrimAnimation();
}

function updateDaggerboardControl(value) {
  sailState.daggerboard = value; // e.g. 'Up', 'Center', 'Down'
  triggerInstantTrimAnimation();
}

function updateVangControl(value) {
  sailState.vang = value.toUpperCase(); // Ensure matches "MAX", "CENTER", "EASE"
  triggerInstantTrimAnimation();
}

function updateDownhaulControl(value) {
  sailState.downhaul = value.toUpperCase(); // Matches "MAX LUFF", "BASE", "OFF"
  triggerInstantTrimAnimation();
}

function updateOuthaulControl(value) {
  sailState.outhaul = value.toUpperCase(); // Matches "FLAT", "BASE", "FULL"
  triggerInstantTrimAnimation();
}

// Global Mathematical Execution Loop
function triggerInstantTrimAnimation() {
  // 1. Resolve Profile Shape (Vang overrides Downhaul baseline)
  const profilePath = sailState.vang === "CENTER" 
    ? SAIL_VECTORS.profile.downhaul[sailState.downhaul]
    : SAIL_VECTORS.profile.vang[sailState.vang];

  // 2. Resolve Camber Curve Shape (Mainsheet adjusts trailing edge orientation)
  const camberPath = sailState.mainsheet === "0-8"
    ? SAIL_VECTORS.camber.outhaul[sailState.outhaul]
    : SAIL_VECTORS.camber.mainsheet[sailState.mainsheet];

  // 3. Resolve Foil Depth Line
  const foilPath = SAIL_VECTORS.daggerboard[sailState.daggerboard];

  // 4. Resolve Dynamic Structural Heel (Tilt window based on Sailor hiking weight)
  let rotationDeg = 0;
  if (sailState.sailorPosition === "Leeward") rotationDeg = 8;
  if (sailState.sailorPosition === "Hike Hard") rotationDeg = -12;
  if (sailState.sailorPosition === "Forward") rotationDeg = -2;
  if (sailState.sailorPosition === "Aft") rotationDeg = 3;

  // Execute Fluid Matrix Morph via Anime.js Core
  anime({
    targets: '#sailProfilePath',
    d: [ { value: profilePath } ],
    easing: 'easeOutElastic(1, .6)',
    duration: 1000
  });

  anime({
    targets: '#sailCamberPath',
    d: [ { value: camberPath } ],
    easing: 'easeOutQuad',
    duration: 700
  });

  anime({
    targets: '#foilReferencePath',
    d: [ { value: foilPath } ],
    easing: 'easeOutBounce',
    duration: 600
  });

  // Structural dynamic tilt response
  anime({
    targets: '#sailProfileDiv svg, #sailCamberDiv svg',
    rotate: rotationDeg,
    transformOrigin: '50% 50%',
    easing: 'linear',
    duration: 400
  });
}
