/**
 * Sail Trim Logic Engine - Proof of Concept
 * Handles instant vector morphing on user selection
 */

// 1. Precise geometric path states
const SAIL_VECTORS = {
  profile: {
    "Ease":   "M 50,145 Q 110,75 65,15", // Looser vang = curved leech, full twist
    "Center": "M 50,145 Q 75,75 65,15",  // Standard design depth
    "Max":    "M 50,145 Q 52,75 65,15"   // Max vang = tight leech, flat profile
  },
  camber: {
    "Full": "M 20,80 Q 100,10 180,80", // Loose outhaul = deep aerodynamic wing pocket
    "Base": "M 20,80 Q 100,45 180,80", // Normal standard cross-section curve
    "Flat": "M 20,80 Q 100,78 180,80"  // Stretched completely flat against the boom
  }
};

// 2. Global State Storage Object
const sailState = {
  vang: "Center",
  outhaul: "Base"
};

// 3. Control Handler: Vang Clicks
function updateVangControl(value) {
  sailState.vang = value;        // Updates state to 'Ease', 'Center', or 'Max'
  triggerInstantTrimAnimation(); // Fire the morph engine
}

// 4. Control Handler: Outhaul Clicks
function updateOuthaulControl(value) {
  sailState.outhaul = value;     // Updates state to 'Full', 'Base', or 'Flat'
  triggerInstantTrimAnimation(); // Fire the morph engine
}

// 5. The Active Morph Engine Engine 
function triggerInstantTrimAnimation() {
  const targetProfilePath = SAIL_VECTORS.profile[sailState.vang];
  const targetCamberPath = SAIL_VECTORS.camber[sailState.outhaul];

  // Morph the Side View Profile Canvas
  window.anime({
    targets: '#sailProfilePath',
    d: [ { value: targetProfilePath } ],
    easing: 'easeOutElastic(1, .6)', // Realistic sail cloth aerodynamic snap back
    duration: 1100
  });

  // Morph the Camber foil cross-section depth
  window.anime({
    targets: '#sailCamberPath',
    d: [ { value: targetCamberPath } ],
    easing: 'easeOutQuad', 
    duration: 750
  });
}
