/**
 * Toggle an specific class to the received DOM element.
 * @param {string}	elemSelector The query selector specifying the target element.
 * @param {string}	[activeClass='active'] The class to be applied/removed.
 */
function toggleClass(elemSelector, activeClass = "active") {
  const elem = document.querySelector(elemSelector);
  if (elem) {
    elem.classList.toggle(activeClass);
  }
}

/**
 * Toggle specific classes to an array of corresponding DOM elements.
 * @param {Array<string>}	elemSelectors The query selectors specifying the target elements.
 * @param {Array<string>}	activeClasses The classes to be applied/removed.
 */
function toggleClasses(elemSelectors, activeClasses) {
  elemSelectors.map((elemSelector, idx) => {
    toggleClass(elemSelector, activeClasses[idx]);
  });
}

/**
 * Remove active class from siblings DOM elements and apply it to event target.
 * @param {Element}		element The element receiving the class, and whose siblings will lose it.
 * @param {string}		[activeClass='active'] The class to be applied.
 */
function activate(element, activeClass = "active") {
  [...element.parentNode.children].map(elem =>
    elem.classList.remove(activeClass)
  );
  element.classList.add(activeClass);
}

/**
 * Remove active class from siblings parent DOM elements and apply it to element target parent.
 * @param {Element}		element The element receiving the class, and whose siblings will lose it.
 * @param {string}		[activeClass='active'] The class to be applied.
 */
function activateParent(element, activeClass = "active") {
  const elemParent = element.parentNode;
  activate(elemParent, activeClass);
}

/**
 * Remove active class from siblings parent DOM elements and apply it to element target parent.
 * @param {Element}		element The element receiving the class, and whose siblings will lose it.
 * @param {string}		[activeClass='active'] The class to be applied.
 */
function toggleParent(element, activeClass = "active") {
  const elemParent = element.parentNode;
  if (elemParent) {
    elemParent.classList.toggle(activeClass);
  }
}

/**
 * This will make the specified elements click event to show/hide the menu sidebar.
 */
function activateToggle() {
  const menuToggles = document.querySelectorAll("#menu-toggle, #main-toggle");
  const handleToggle = (e) => {
    e.preventDefault();
    toggleClass("#wrapper", "toggled");
  };
  if (menuToggles) {
    [...menuToggles].map(elem => {
      elem.addEventListener('touchstart', handleToggle, { passive: false });
      elem.addEventListener('click', handleToggle);
    });
  }
}

/**
 * This will make the specified elements click event to behave as a menu
 * parent entry, or a link, or sometimes both, depending on the context.
 */
function activateMenuNesting() {
  const menuParents = document.querySelectorAll(".drop-nested");
  const handleMenuNesting = (e) => {
    e.preventDefault();
    toggleParent(e.currentTarget, "open");
    const elementType = e.currentTarget.tagName.toLowerCase();
    if (elementType === "a") {
      const linkElement = e.currentTarget;
      const linkElementParent = linkElement.parentNode;
      const destination = linkElement.href;
      if (
        destination !== window.location.href &&
        !linkElementParent.classList.contains("active")
      ) {
        window.location.href = destination;
      }
    }
  };
  if (menuParents) {
    [...menuParents].map(elem => {
      elem.addEventListener('touchstart', handleMenuNesting, { passive: false });
      elem.addEventListener('click', handleMenuNesting);
    });
  }
}


/**
 * Function to create an anchor with an specific id
 * @param {string}    id The corresponding id from which the href will be created.
 * @returns {Element} The new created anchor.
 */
function anchorForId(id) {
  const anchor = document.createElement("a");
  anchor.className = "header-link";
  anchor.href = `#${id}`;
  anchor.innerHTML = '<i class="fa fa-link"></i>';
  return anchor;
}

/**
 * Aux function to retrieve repository stars and watchers count info from
 * @param {string}	level The specific level to select header from.
 * @param {Element}	containingElement The element receiving the anchor.
 */
function linkifyAnchors(level, containingElement) {
  const headers = containingElement.getElementsByTagName(`h${level}`);
  [...headers].map(header => {
    if (typeof header.id !== "undefined" && header.id !== "") {
      header.append(anchorForId(header.id));
    }
  });
}

/**
 * Function
 */
function linkifyAllLevels() {
  const content = document.querySelector("#content");
  [...Array(7).keys()].map(level => {
    linkifyAnchors(level, content);
  });
}

export function init() {
  if (document.body.classList.contains('docs')) {
    activateToggle();
    activateMenuNesting();
    linkifyAllLevels();
  }
}
