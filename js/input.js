/**
 * input.js - Interface Event tracking core
 * Manages active button color swaps using Bootstrap classes
 */

/**
 * Sweeps a specific row of buttons, clearing active colors and setting the clicked node to blue
 * @param {HTMLElement} clickedButton - The exact button element that was clicked
 */
function manageActiveButtonUI(clickedButton) {
  if (!clickedButton) return;

  // Find the closest wrapper container containing this button group row
  const rowContainer = clickedButton.parentElement;
  if (!rowContainer) return;

  // Query all buttons inside this group row
  const siblingButtons = rowContainer.querySelectorAll('.control-button');

  siblingButtons.forEach(btn => {
    // 1. Revert all non-selected buttons to Bootstrap white with blue outline style
    btn.classList.remove('btn-primary');
    btn.classList.add('btn-outline-primary');
  });

  // 2. Set the clicked button to a solid Bootstrap Blue look
  clickedButton.classList.remove('btn-outline-primary');
  clickedButton.classList.add('btn-primary');
}

// Intercept interface inputs, trigger color highlighting, then pipe values to the vector array loops
function updateBoomControl(value, element) {
  manageActiveButtonUI(element);
  if (typeof window.updateBoomControlState === 'function') {
    window.updateBoomControlState(value);
  }
}

function updateSailorPosition(value, element) {
  manageActiveButtonUI(element);
  if (typeof window.updateSailorPositionState === 'function') {
    window.updateSailorPositionState(value);
  }
}

function updateDaggerboardControl(value, element) {
  manageActiveButtonUI(element);
  if (typeof window.updateDaggerboardControlState === 'function') {
    window.updateDaggerboardControlState(value);
  }
}

function updateVangControl(value, element) {
  manageActiveButtonUI(element);
  if (typeof window.updateVangControlState === 'function') {
    window.updateVangControlState(value);
  }
}

function updateDownhaulControl(value, element) {
  manageActiveButtonUI(element);
  if (typeof window.updateDownhaulControlState === 'function') {
    window.updateDownhaulControlState(value);
  }
}

function updateOuthaulControl(value, element) {
  manageActiveButtonUI(element);
  if (typeof window.updateOuthaulControlState === 'function') {
    window.updateOuthaulControlState(value);
  }
}
