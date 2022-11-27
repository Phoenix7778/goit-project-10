/* Features to make the selectCustomQ work for mouse users.

- Toggle custom select visibility when clicking the "box"
- Update custom select value when clicking in a option
- Navigate through options when using keyboard up/down
- Pressing Enter or Space selects the current hovered option
- Close the select when clicking outside of it
- Sync both selects values when selecting a option. (native or custom)

*/

const elselectNative = document.getElementsByClassName('js-selectNativeQ')[0];
const elselectCustom = document.getElementsByClassName('js-selectCustomQ')[0];
const elselectCustomBox = elselectCustom.children[0];
const elselectCustomOpts = elselectCustom.children[1];
const customOptsList = Array.from(elselectCustomOpts.children);
const optionsCount = customOptsList.length;
const defaultLabel = elselectCustomBox.getAttribute('data-value');

let optionChecked = '';
let optionHoveredIndex = -1;

// Toggle custom select visibility when clicking the box
elselectCustomBox.addEventListener('click', e => {
  const isClosedQ = !elselectCustom.classList.contains('isActiveQ');

  if (isClosedQ) {
    openselectCustom();
  } else {
    closeselectCustom();
  }
});

function openselectCustom() {
  elselectCustom.classList.add('isActiveQ');
  // Remove aria-hidden in case this was opened by a user
  // who uses AT (e.g. Screen Reader) and a mouse at the same time.
  elselectCustom.setAttribute('aria-hidden', false);

  if (optionChecked) {
    const optionCheckedIndex = customOptsList.findIndex(
      el => el.getAttribute('data-value') === optionChecked
    );
    updateCustomSelectHovered(optionCheckedIndex);
  }

  // Add related event listeners
  document.addEventListener('click', watchClickOutside);
  document.addEventListener('keydown', supportKeyboardNavigation);
}

function closeselectCustom() {
  elselectCustom.classList.remove('isActiveQ');

  elselectCustom.setAttribute('aria-hidden', true);

  updateCustomSelectHovered(-1);

  // Remove related event listeners
  document.removeEventListener('click', watchClickOutside);
  document.removeEventListener('keydown', supportKeyboardNavigation);
}

function updateCustomSelectHovered(newIndex) {
  const prevOption = elselectCustomOpts.children[optionHoveredIndex];
  const option = elselectCustomOpts.children[newIndex];

  if (prevOption) {
    prevOption.classList.remove('isHover');
  }
  if (option) {
    option.classList.add('isHover');
  }

  optionHoveredIndex = newIndex;
}

function updateCustomSelectChecked(value, text) {
  const prevValue = optionChecked;

  const elPrevOption = elselectCustomOpts.querySelector(
    `[data-value="${prevValue}"`
  );
  const elOption = elselectCustomOpts.querySelector(`[data-value="${value}"`);

  if (elPrevOption) {
    elPrevOption.classList.remove('isActiveQ');
  }

  if (elOption) {
    elOption.classList.add('isActiveQ');
  }

  elselectCustomBox.textContent = text;
  optionChecked = value;
}

function watchClickOutside(e) {
  const didClickedOutside = !elselectCustom.contains(event.target);
  if (didClickedOutside) {
    closeselectCustom();
  }
}

function supportKeyboardNavigation(e) {
  // press down -> go next
  if (event.keyCode === 40 && optionHoveredIndex < optionsCount - 1) {
    let index = optionHoveredIndex;
    e.preventDefault(); // prevent page scrolling
    updateCustomSelectHovered(optionHoveredIndex + 1);
  }

  // press up -> go previous
  if (event.keyCode === 38 && optionHoveredIndex > 0) {
    e.preventDefault(); // prevent page scrolling
    updateCustomSelectHovered(optionHoveredIndex - 1);
  }

  // press Enter or space -> select the option
  if (event.keyCode === 13 || event.keyCode === 32) {
    e.preventDefault();

    const option = elselectCustomOpts.children[optionHoveredIndex];
    const value = option && option.getAttribute('data-value');

    if (value) {
      elselectNative.value = value;
      updateCustomSelectChecked(value, option.textContent);
    }
    closeselectCustom();
  }

  // press ESC -> close selectCustom
  if (event.keyCode === 27) {
    closeselectCustom();
  }
}

// Update selectCustom value when selectNative is changed.
elselectNative.addEventListener('change', e => {
  const value = e.target.value;
  const elRespectiveCustomOption = elselectCustomOpts.querySelectorAll(
    `[data-value="${value}"]`
  )[0];

  updateCustomSelectChecked(value, elRespectiveCustomOption.textContent);
});

// Update selectCustom value when an option is clicked or hovered
customOptsList.forEach(function (elOption, index) {
  elOption.addEventListener('click', e => {
    const value = e.target.getAttribute('data-value');

    // Sync native select to have the same value
    elselectNative.value = value;
    updateCustomSelectChecked(value, e.target.textContent);
    closeselectCustom();
  });

  elOption.addEventListener('mouseenter', e => {
    updateCustomSelectHovered(index);
  });

  // TODO: Toggle these event listeners based on selectCustom visibility
});
