/**
 * input.js - Interface Event tracking core
 * Manages active button color swaps using Bootstrap classes
 */

/**
 * Sweeps a specific row of buttons, clearing active colors
 * and setting the clicked node to blue.
 *
 * @param {HTMLElement} clickedButton - The exact button element clicked
 */
function manageActiveButtonUI(clickedButton) {
  if (!clickedButton) return;

  // Find the closest wrapper containing this button group
  const rowContainer = clickedButton.parentElement;
  if (!rowContainer) return;

  // Find all control buttons in this group
  const siblingButtons =
    rowContainer.querySelectorAll('.control-button');

  siblingButtons.forEach(btn => {
    // Reset non-selected buttons
    btn.classList.remove('btn-primary');
    btn.classList.add('btn-outline-primary');
  });

  // Highlight the clicked button
  clickedButton.classList.remove('btn-outline-primary');
  clickedButton.classList.add('btn-primary');
}
