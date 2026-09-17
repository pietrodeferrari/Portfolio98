// Shows the Win98 hourglass cursor when the page loads
// The class is removed inside DOMContentLoaded once everything is ready
document.body.classList.add("is-loading");

document.addEventListener("DOMContentLoaded", () => {
  // Removes the hourglass cursor once the desktop is fully initialised
  setTimeout(() => document.body.classList.remove("is-loading"), 1500);

  // START MENU
  // Toggles visibility and closes when clicking outside
  const startButton = document.getElementById("start-button");
  const startMenu = document.getElementById("start-menu");

  const closeStartMenu = (e) => {
    if (!startMenu.contains(e.target) && e.target !== startButton) {
      startMenu.classList.add("hidden");
      startButton.setAttribute("aria-expanded", "false");
      document.removeEventListener("click", closeStartMenu);
    }
  };

  if (startButton && startMenu) {
    startButton.addEventListener("click", (e) => {
      e.stopPropagation();
      const isNowHidden = startMenu.classList.toggle("hidden");
      startButton.setAttribute("aria-expanded", String(!isNowHidden));
      if (!isNowHidden) {
        document.addEventListener("click", closeStartMenu);
      } else {
        document.removeEventListener("click", closeStartMenu);
      }
    });
  }

  // OBJECT COUNT (for the projects window)
  // Counts .project-folder elements and updates the status bar
  const objectCountDisplay = document.getElementById("object-count");
  if (objectCountDisplay) {
    const count = document.querySelectorAll(".project-folder").length;
    objectCountDisplay.textContent = `${count} object${count !== 1 ? "s" : ""}`;
  }

  // POST COUNT (for the blog window)
  // Counts .blog-post elements on load so the status bar is always correct
  // regardless of how many posts the user has added or removed
  const blogStatusDisplay = document.getElementById("blog-status");
  if (blogStatusDisplay) {
    const count = document.querySelectorAll(
      "#blog-list-view .blog-post",
    ).length;
    blogStatusDisplay.textContent = `${count} post${count !== 1 ? "s" : ""}`;
  }

  // ADDRESS BAR
  // Displays the Win98 style filesystem path of the currently active window
  // The icon and path text update every time bringToFront() is called
  const addressInput = document.getElementById("address-input");
  const addressIcon = document.getElementById("address-icon");

  // Maps each window ID to the fake Win98 path and its matching small icon
  const WINDOW_PATHS = {
    "window-welcome": {
      path: "C:\\Desktop",
      icon: "icons/information-icon.png",
    },
    "window-about": {
      path: "C:\\Desktop\\About Me",
      icon: "icons/about-icon.png",
    },
    "window-projects": {
      path: "C:\\Desktop\\My Projects",
      icon: "icons/projects-icon.png",
    },
    "window-contact": {
      path: "C:\\Desktop\\Contact",
      icon: "icons/contact-icon.png",
    },
    "window-blog": { path: "C:\\Desktop\\Blog", icon: "icons/blog-icon.png" },
    "window-recycle": { path: "C:\\RECYCLED", icon: "icons/bin-icon.png" },
    "window-privacy": {
      path: "C:\\Desktop\\Privacy Policy",
      icon: "icons/information-icon.png",
    },
    "window-cookie": {
      path: "C:\\Desktop\\Cookie Policy",
      icon: "icons/information-icon.png",
    },
  };

  function updateAddressBar(win) {
    const entry = win && WINDOW_PATHS[win.id];
    if (!entry) return;
    if (addressInput) addressInput.value = entry.path;
    if (addressIcon) addressIcon.src = entry.icon;
  }

  // ADDRESS BAR DROPDOWN
  // The ▾ button opens a list showing all available window destinations
  // Selecting an entry opens that window and updates the address bar path
  // Closes with item click, click outside and escape
  const addressGoBtn = document.getElementById("address-go");
  const addressDropdown = document.getElementById("address-dropdown");

  function buildAddressDropdown() {
    if (!addressDropdown) return;
    addressDropdown.innerHTML = "";
    Object.entries(WINDOW_PATHS).forEach(([winId, entry]) => {
      const li = document.createElement("li");
      li.className = "address-dropdown-item";
      li.setAttribute("role", "option");
      li.dataset.windowId = winId;

      const img = document.createElement("img");
      img.src = entry.icon;
      img.alt = "";
      img.width = 16;
      img.height = 16;

      const span = document.createElement("span");
      span.textContent = entry.path;

      li.appendChild(img);
      li.appendChild(span);
      addressDropdown.appendChild(li);
    });
  }

  function openAddressDropdown() {
    if (!addressDropdown || !addressGoBtn) return;
    buildAddressDropdown();
    addressDropdown.classList.remove("hidden");
    addressGoBtn.setAttribute("aria-expanded", "true");
  }

  function closeAddressDropdown() {
    if (!addressDropdown || !addressGoBtn) return;
    addressDropdown.classList.add("hidden");
    addressGoBtn.setAttribute("aria-expanded", "false");
  }

  if (addressGoBtn) {
    addressGoBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = !addressDropdown.classList.contains("hidden");
      isOpen ? closeAddressDropdown() : openAddressDropdown();
    });
  }

  // Opens the selected window and close the dropdown
  if (addressDropdown) {
    addressDropdown.addEventListener("click", (e) => {
      const item = e.target.closest(".address-dropdown-item");
      if (!item) return;
      closeAddressDropdown();
      const win = document.getElementById(item.dataset.windowId);
      if (win) openWindow(win);
    });
  }

  // Closes dropdown when clicking anywhere outside the address bar
  document.addEventListener("click", (e) => {
    if (addressDropdown && !addressDropdown.classList.contains("hidden")) {
      if (!e.target.closest(".taskbar-address-bar")) closeAddressDropdown();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAddressDropdown();
  });

  // Z-INDEX
  // Clicking any window brings it above all others by incrementing a
  // shared counter and assigning it to the target window.
  // Updates the taskbar button pressed state and address bar path
  let topZIndex = 10;

  function bringToFront(win) {
    topZIndex += 1;
    win.style.zIndex = topZIndex;
    updateTaskbarActiveState(win);
    updateAddressBar(win);
  }

  // TASKBAR WINDOW BUTTONS
  // Each open window gets a button in the taskbar
  // Clicking a button brings the window to the front
  // The button for the active window appears pressed

  // Maps window IDs to their icon paths for the taskbar button thumbnail
  const WINDOW_ICONS = {
    "window-welcome": "icons/information-icon.png",
    "window-about": "icons/about-icon.png",
    "window-projects": "icons/projects-icon.png",
    "window-contact": "icons/contact-icon.png",
    "window-blog": "icons/blog-icon.png",
    "window-recycle": "icons/bin-icon.png",
    "window-privacy": "icons/information-icon.png",
    "window-cookie": "icons/information-icon.png",
  };

  const taskbarWindowsEl = document.getElementById("taskbar-windows");

  function addTaskbarButton(win) {
    if (!taskbarWindowsEl) return;
    // Avoid duplicates
    if (taskbarWindowsEl.querySelector(`[data-window-id="${win.id}"]`)) return;

    const titleEl = win.querySelector(".title-bar-text");
    const title = titleEl ? titleEl.textContent.trim() : win.id;

    const btn = document.createElement("button");
    btn.className = "taskbar-btn";
    btn.dataset.windowId = win.id;

    // Small icon matching the window
    const iconSrc = WINDOW_ICONS[win.id];
    if (iconSrc) {
      const img = document.createElement("img");
      img.src = iconSrc;
      img.alt = "";
      img.width = 16;
      img.height = 16;
      btn.appendChild(img);
    }

    const span = document.createElement("span");
    span.textContent = title;
    btn.appendChild(span);

    btn.addEventListener("click", () => {
      if (win.hidden) {
        // Window is minimized
        win.hidden = false;
        bringToFront(win);
      } else if (btn.classList.contains("is-active")) {
        // Clicking the active window's button minimizes it
        minimizeWindow(win);
      } else {
        // Bring to the front
        bringToFront(win);
      }
    });
    taskbarWindowsEl.appendChild(btn);
  }

  function removeTaskbarButton(win) {
    if (!taskbarWindowsEl) return;
    const btn = taskbarWindowsEl.querySelector(`[data-window-id="${win.id}"]`);
    if (btn) btn.remove();
  }

  function updateTaskbarActiveState(activeWin) {
    if (!taskbarWindowsEl) return;
    taskbarWindowsEl.querySelectorAll(".taskbar-btn").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.windowId === activeWin.id);
    });
  }

  function minimizeWindow(win) {
    win.hidden = true;
    // Taskbar button stays because it's the only way to restore the window
    // Finds the topmost visible window and mark it active
    let topWin = null;
    let maxZ = -1;
    document
      .querySelectorAll(".desktop-content > .window:not([hidden])")
      .forEach((w) => {
        const z = parseInt(w.style.zIndex, 10) || 0;
        if (z > maxZ) {
          maxZ = z;
          topWin = w;
        }
      });
    if (topWin) {
      updateTaskbarActiveState(topWin);
    } else {
      // No visible windows left, clears all pressed states
      taskbarWindowsEl
        .querySelectorAll(".taskbar-btn")
        .forEach((b) => b.classList.remove("is-active"));
    }
  }

  // WINDOW INITIALIZATION
  // Converts visible windows to absolute positioning based on their natural flex-layout position.
  // Hidden windows are skipped and get positioned in openWindow()
  // Only runs on desktop (>= 1200px). Mobile keeps the flex-column layout
  function initializeWindowPositions() {
    if (window.innerWidth < 1200) return;

    const desktop = document.querySelector(".desktop-content");
    if (!desktop) return;

    const desktopRect = desktop.getBoundingClientRect();

    // Only targets direct children of .desktop-content to exclude any
    // .window elements used as tab panels nested inside real windows
    document.querySelectorAll(".desktop-content > .window").forEach((win) => {
      const winRect = win.getBoundingClientRect();
      // Skip hidden windows
      if (winRect.width === 0 || winRect.height === 0) return;

      // Captures the natural position from the flex layout, but lets CSS
      // control width and height already set via #window-welcome rules
      win.style.position = "absolute";
      win.style.left = `${Math.round(winRect.left - desktopRect.left)}px`;
      win.style.top = `${Math.round(winRect.top - desktopRect.top)}px`;
      bringToFront(win);
    });
  }

  initializeWindowPositions();

  // Registers taskbar buttons for any window visible on load
  // openWindow() handles this for windows opened later
  document
    .querySelectorAll(".desktop-content > .window:not([hidden])")
    .forEach((win) => {
      addTaskbarButton(win);
      updateTaskbarActiveState(win);
    });

  // SPA WINDOW MANAGEMENT
  // Windows are hidden/shown in-place instead of navigating between pages
  // openWindow(win) shows a window, centering it in the desktop the first time it is opened
  // closeWindow(win) hides a window back to display:none
  // Default widths are defined per window id. Heights grow with content bounded by the CSS max-height on .window
  // Default dimensions for each window on first opening are sized to comfortably fit their content without scrolling
  // Cascade offset applied to each new window on first open, matching Win98 behaviour where successive windows step diagonally so the user can see all open windows at a glance
  const CASCADE_OFFSET = 24;
  let cascadeStep = 1; // 0 is occupied by the welcome window which opens centred on load

  const WINDOW_DEFAULTS = {
    "window-welcome": { width: 660, height: 480 },
    "window-about": { width: 660, height: 480 },
    "window-projects": { width: 660, height: 480 },
    "window-contact": { width: 660, height: 480 },
    "window-blog": { width: 660, height: 480 },
    "window-recycle": { width: 500, height: 320 },
    "window-privacy": { width: 560, height: 480 },
    "window-cookie": { width: 560, height: 420 },
  };

  function openWindow(win) {
    // Already visible, just brings it to the front
    if (!win.hidden) {
      bringToFront(win);
      return;
    }

    // On mobile closes all other open windows before showing the new one so only one window is visible at a time
    if (window.innerWidth < 1200) {
      document
        .querySelectorAll(".desktop-content > .window")
        .forEach((other) => {
          if (other !== win && !other.hidden) closeWindow(other);
        });
    }

    // First-time open -> centres the window then applies the cascade offset so successive windows step diagonally and don't overlap
    if (!win.dataset.positioned) {
      const desktop = document.querySelector(".desktop-content");
      const dRect = desktop
        ? desktop.getBoundingClientRect()
        : { width: 800, height: 600 };
      const defaults = WINDOW_DEFAULTS[win.id] || {};
      const winW = defaults.width || 500;
      const winH = defaults.height || 400;

      if (window.innerWidth >= 1200) {
        const baseLeft = Math.round((dRect.width - winW) / 2);
        const baseTop = Math.round((dRect.height - winH) / 2);
        const offset = cascadeStep * CASCADE_OFFSET;

        // Resets cascade if the next position would push the window off-screen
        if (
          baseLeft + offset + winW > dRect.width ||
          baseTop + offset + winH > dRect.height
        ) {
          cascadeStep = 0;
        }

        win.style.position = "absolute";
        win.style.left = `${Math.max(0, baseLeft + cascadeStep * CASCADE_OFFSET)}px`;
        win.style.top = `${Math.max(0, baseTop + cascadeStep * CASCADE_OFFSET)}px`;
        win.style.width = `${winW}px`;
        win.style.height = `${winH}px`;

        cascadeStep++;
      }

      win.dataset.positioned = "true";
    }

    win.hidden = false;
    addTaskbarButton(win);
    bringToFront(win);

    // Fixes the project sidebar width the first time the Projects window opens
    if (win.id === "window-projects") fixProjectSidebarWidth();
  }

  // Hides the window and removes its taskbar button
  function closeWindow(win) {
    win.hidden = true;
    removeTaskbarButton(win);
  }

  // PROJECT DETAIL VIEW
  // Double-clicking a project folder switches the projects window from the folder
  // grid to a detail view inside the same window.
  // Clicking any sidebar category restores the grid view
  // The title bar and address bar update to reflect the current location

  function openProjectDetail(folder) {
    const win = document.getElementById("window-projects");
    const gridView = document.getElementById("projects-grid-view");
    const detailView = document.getElementById("projects-detail-view");
    if (!win || !gridView || !detailView) return;

    const title = folder.dataset.title || "Project";
    const description = folder.dataset.description || "";
    const tech = folder.dataset.tech || "";
    const year = folder.dataset.year || "";
    const category = folder.dataset.category || "";
    const github = folder.dataset.github || "";
    const live = folder.dataset.live || "";

    // Populates detail fields
    document.getElementById("project-detail-description").textContent =
      description;
    document.getElementById("project-detail-tech").textContent = tech;

    // GitHub button visible for "#" and real URLs (hidden if empty)
    const githubBtn = document.getElementById("project-detail-github-btn");
    githubBtn.hidden = github === "";
    githubBtn.onclick =
      github && github !== "#"
        ? () => window.open(github, "_blank", "noopener,noreferrer")
        : null;

    // Live demo button with the same logic
    const liveBtn = document.getElementById("project-detail-live-btn");
    liveBtn.hidden = live === "";
    liveBtn.onclick =
      live && live !== "#"
        ? () => window.open(live, "_blank", "noopener,noreferrer")
        : null;

    // Switch panels
    gridView.hidden = true;
    detailView.hidden = false;

    // Updates title bar and address bar to show the current project path
    document.getElementById("title-projects").textContent = title;
    WINDOW_PATHS["window-projects"].path = `C:\\Desktop\\My Projects\\${title}`;
    updateAddressBar(win);

    // The status bar shows year and category
    const objectCount = document.getElementById("object-count");
    if (objectCount) {
      objectCount.textContent = [
        year ? `Year: ${year}` : "",
        category ? category.charAt(0).toUpperCase() + category.slice(1) : "",
      ]
        .filter(Boolean)
        .join("  ·  ");
    }
  }

  // Restores the grid view when any sidebar filter is clicked.
  // Resets the status bar count so the function is correct on its own
  function restoreProjectsGrid() {
    const win = document.getElementById("window-projects");
    const gridView = document.getElementById("projects-grid-view");
    const detailView = document.getElementById("projects-detail-view");
    if (!gridView || !detailView) return;

    gridView.hidden = false;
    detailView.hidden = true;

    document.getElementById("title-projects").textContent = "My Projects";
    WINDOW_PATHS["window-projects"].path = "C:\\Desktop\\My Projects";
    if (win) updateAddressBar(win);

    const countEl = document.getElementById("object-count");
    if (countEl) {
      const visible = gridView.querySelectorAll(
        ".project-folder:not([hidden])",
      ).length;
      countEl.textContent = `${visible} object${visible !== 1 ? "s" : ""}`;
    }
  }

  // Project folders (double-click on desktop, single click on mobile)
  // The click handler always prevents the default href="#" navigation
  document.querySelectorAll(".project-link").forEach((link) => {
    link.addEventListener("dblclick", (e) => {
      e.preventDefault();
      const folder = link.closest(".project-folder");
      if (folder) openProjectDetail(folder);
    });
    link.addEventListener("click", (e) => {
      e.preventDefault();
      // On mobile single-click opens the detail view
      if (window.innerWidth < 1200) {
        const folder = link.closest(".project-folder");
        if (folder) openProjectDetail(folder);
      }
    });
  });

  // EVENT DELEGATION
  // Two separate handlers mirror real Win98 behaviour.
  // Desktop icons -> double-click to open, single click to select
  // Tree-view links inside windows -> single click to open
  // Both handlers call e.preventDefault() so href="#" never scrolls the page

  // Single click prevents default for all [data-opens] links, then opens
  // the target window unless it is a desktop icon on desktop (those will need
  // double-click). On mobile desktop icons open on single click.
  // Also closes the Start menu when a [data-opens] link inside it is clicked
  document.addEventListener("click", (e) => {
    const trigger = e.target.closest("[data-opens]");
    if (!trigger) return;
    e.preventDefault();
    // On desktop the icons require double-click
    // On mobile single-click is the only reliable interaction
    if (trigger.closest(".desktop-icon") && window.innerWidth >= 1200) return;
    // Closes the start menu if the link lives inside it
    if (startMenu && trigger.closest(".start-menu")) {
      startMenu.classList.add("hidden");
      if (startButton) startButton.setAttribute("aria-expanded", "false");
      document.removeEventListener("click", closeStartMenu);
    }
    const target = document.getElementById(trigger.dataset.opens);
    if (target) openWindow(target);
  });

  // Double click opens the window for desktop icon links only
  document.addEventListener("dblclick", (e) => {
    const trigger = e.target.closest(".desktop-icon [data-opens]");
    if (!trigger) return;
    e.preventDefault();
    const target = document.getElementById(trigger.dataset.opens);
    if (target) openWindow(target);
  });

  // DESKTOP ICON SELECTION
  // Single click selects one icon at a time
  // Clicking anywhere outside an icon deselects all
  // Escape key also clears the selection
  // The post-drag click suppression ensures drag-end doesn't trigger selection
  function deselectAllIcons() {
    document.querySelectorAll(".desktop-icon.is-selected").forEach((icon) => {
      icon.classList.remove("is-selected");
    });
  }

  document.addEventListener("click", (e) => {
    const icon = e.target.closest(".desktop-icon");
    if (icon) {
      deselectAllIcons();
      icon.classList.add("is-selected");
    } else {
      // Any click outside an icon deselects
      deselectAllIcons();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") deselectAllIcons();
  });

  // RIGHT-CLICK CONTEXT MENU
  // Shows a Win98 style context menu when the user right-clicks on the bare desktop
  // arrange-icons/line-up-icons -> resets icon column positions
  // refresh -> reloads the page
  // properties -> opens the welcome window
  const contextMenu = document.getElementById("desktop-context-menu");

  function showContextMenu(x, y) {
    if (!contextMenu) return;
    // Shows first so offsetWidth/Height are measurable then clamp to desktop
    contextMenu.classList.remove("hidden");
    const desktopEl = document.querySelector(".desktop-content");
    const dRect = desktopEl.getBoundingClientRect();
    const menuW = contextMenu.offsetWidth || 160;
    const menuH = contextMenu.offsetHeight || 150;
    contextMenu.style.left = `${Math.max(0, Math.min(x, dRect.width - menuW))}px`;
    contextMenu.style.top = `${Math.max(0, Math.min(y, dRect.height - menuH))}px`;
  }

  function hideContextMenu() {
    if (contextMenu) contextMenu.classList.add("hidden");
  }

  // Right-click on desktop
  document
    .querySelector(".desktop-content")
    .addEventListener("contextmenu", (e) => {
      if (e.target.closest(".desktop-icon") || e.target.closest(".window"))
        return;
      e.preventDefault();
      deselectAllIcons();
      const dRect = document
        .querySelector(".desktop-content")
        .getBoundingClientRect();
      showContextMenu(e.clientX - dRect.left, e.clientY - dRect.top);
    });

  // Menu item actions
  if (contextMenu) {
    contextMenu.addEventListener("click", (e) => {
      const item = e.target.closest("[data-action]");
      if (!item) return;
      hideContextMenu();
      switch (item.dataset.action) {
        case "arrange-icons":
        case "line-up-icons":
          initializeIconPositions();
          break;
        case "refresh":
          location.reload();
          break;
        case "properties":
          break;
      }
    });
  }

  // Closes context menu with any click outside (or escape)
  document.addEventListener("click", (e) => {
    if (contextMenu && !contextMenu.contains(e.target)) hideContextMenu();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") hideContextMenu();
  });

  // TITLE BAR BUTTONS
  // Minimize hides the window but keeps its taskbar button
  // Close hides the window and removes the taskbar button entirely
  document
    .querySelectorAll('.window [aria-label="Minimize"]')
    .forEach((btn) => {
      btn.addEventListener("click", () => {
        const win = btn.closest(".window");
        if (win) minimizeWindow(win);
      });
    });

  document.querySelectorAll('.window [aria-label="Close"]').forEach((btn) => {
    btn.addEventListener("click", () => {
      const win = btn.closest(".window");
      if (win) closeWindow(win);
    });
  });

  // DRAGGABLE DESKTOP ICONS
  // Icons are positioned absolutely inside .icon-container
  // initializeIconPositions() places them in a column on the left
  // makeIconsDraggable() lets the user move them freely
  // A 4px drag threshold distinguishes a click from an intentional drag
  // If the mouse moves beyond the threshold the upcoming click event is suppressed so the window does not open mid-drag
  // Disabled on mobile where icons stay in normal flow
  function initializeIconPositions() {
    if (window.innerWidth < 1200) return;

    const ICON_STEP = 80; // vertical distance between icon tops in px
    document.querySelectorAll(".desktop-icon").forEach((icon, i) => {
      icon.style.left = "16px";
      icon.style.top = `${16 + i * ICON_STEP}px`;
    });
  }

  function makeIconsDraggable() {
    if (window.innerWidth < 1200) return;

    const desktop = document.querySelector(".desktop-content");

    document.querySelectorAll(".desktop-icon").forEach((icon) => {
      let isDragging = false;
      let hasDragged = false;
      let startMouseX, startMouseY, startLeft, startTop;
      const THRESHOLD = 4; // px before a move is considered a drag

      icon.addEventListener("mousedown", (e) => {
        if (e.button !== 0) return; // main button only
        // Prevents the browser's native drag which would intercept mousemove and break our custom drag logic
        e.preventDefault();
        isDragging = true;
        hasDragged = false;
        startMouseX = e.clientX;
        startMouseY = e.clientY;
        startLeft = parseInt(icon.style.left, 10) || 0;
        startTop = parseInt(icon.style.top, 10) || 0;
        document.body.style.userSelect = "none";
      });

      document.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        const dx = e.clientX - startMouseX;
        const dy = e.clientY - startMouseY;

        // Stays still until the threshold is crossed
        if (!hasDragged && Math.hypot(dx, dy) < THRESHOLD) return;

        if (!hasDragged) {
          hasDragged = true;
          icon.classList.add("is-dragging");
        }

        // Clamps to desktop bounds
        const dRect = desktop.getBoundingClientRect();
        icon.style.left = `${Math.max(0, Math.min(startLeft + dx, dRect.width - icon.offsetWidth))}px`;
        icon.style.top = `${Math.max(0, Math.min(startTop + dy, dRect.height - icon.offsetHeight))}px`;
      });

      document.addEventListener("mouseup", () => {
        if (!isDragging) return;
        isDragging = false;
        icon.classList.remove("is-dragging");
        document.body.style.userSelect = "";

        if (hasDragged) {
          // Suppresses the click that the browser fires right after mouseup so the window does not open at the end of a drag
          icon.addEventListener(
            "click",
            (e) => {
              e.preventDefault();
              e.stopPropagation();
            },
            { once: true, capture: true },
          );
        }
      });
    });
  }

  // RUBBER BAND SELECTION
  // Dragging on the empty desktop draws a dotted selection rectangle
  // Icons whose bounds intersect it are highlighted in real time
  // Releasing the mouse finalises the selection
  // A click suppressor prevents the mouseup from also firing the "deselect all" click handler
  // when the band has meaningful size
  // Disabled on mobile
  function initRubberBand() {
    if (window.innerWidth < 1200) return;

    const desktop = document.querySelector(".desktop-content");
    let isSelecting = false;
    let startX, startY;
    let rubberBand = null;

    desktop.addEventListener("mousedown", (e) => {
      if (e.button !== 0) return;
      // Only works on desktop and not on icons, windows or other controls
      if (e.target.closest(".desktop-icon") || e.target.closest(".window"))
        return;

      isSelecting = true;
      const dRect = desktop.getBoundingClientRect();
      startX = e.clientX - dRect.left;
      startY = e.clientY - dRect.top;

      rubberBand = document.createElement("div");
      rubberBand.className = "rubber-band";
      rubberBand.style.left = `${startX}px`;
      rubberBand.style.top = `${startY}px`;
      rubberBand.style.width = "0px";
      rubberBand.style.height = "0px";
      desktop.appendChild(rubberBand);

      deselectAllIcons();
      document.body.style.userSelect = "none";
    });

    document.addEventListener("mousemove", (e) => {
      if (!isSelecting || !rubberBand) return;

      const dRect = desktop.getBoundingClientRect();
      const curX = e.clientX - dRect.left;
      const curY = e.clientY - dRect.top;
      const bandX = Math.min(startX, curX);
      const bandY = Math.min(startY, curY);
      const bandW = Math.abs(curX - startX);
      const bandH = Math.abs(curY - startY);

      rubberBand.style.left = `${bandX}px`;
      rubberBand.style.top = `${bandY}px`;
      rubberBand.style.width = `${bandW}px`;
      rubberBand.style.height = `${bandH}px`;

      // Selects icons that intersect the rubber band in real time
      document.querySelectorAll(".desktop-icon").forEach((icon) => {
        const iL = parseInt(icon.style.left, 10) || 0;
        const iT = parseInt(icon.style.top, 10) || 0;
        const iR = iL + icon.offsetWidth;
        const iB = iT + icon.offsetHeight;

        const intersects = !(
          iR < bandX ||
          iL > bandX + bandW ||
          iB < bandY ||
          iT > bandY + bandH
        );
        icon.classList.toggle("is-selected", intersects);
      });
    });

    document.addEventListener("mouseup", () => {
      if (!isSelecting) return;
      isSelecting = false;
      document.body.style.userSelect = "";

      if (!rubberBand) return;
      const bandW = parseInt(rubberBand.style.width, 10) || 0;
      const bandH = parseInt(rubberBand.style.height, 10) || 0;
      rubberBand.remove();
      rubberBand = null;

      // If the band is large enough to be intentional suppresses the
      // upcoming click so the "deselect all" handler doesn't start
      if (bandW > 4 || bandH > 4) {
        document.addEventListener(
          "click",
          (e) => {
            e.stopPropagation();
          },
          { once: true, capture: true },
        );
      }
    });
  }

  initRubberBand();
  initializeIconPositions();
  makeIconsDraggable();

  // DRAGGABLE WINDOWS
  // Uses the pre-calculated absolute position from initializeWindowPositions() or openWindow()
  // On mousedown the current left/top are captured as the drag origin
  // mousemove applies the delta directly
  // Disabled on mobile
  function makeWindowDraggable(windowEl, handle) {
    let isDragging = false;
    let startMouseX, startMouseY, startLeft, startTop;

    handle.addEventListener("mousedown", (e) => {
      // Ignores clicks on title-bar controls
      if (e.target.closest("button") || e.target.closest("a")) return;
      if (window.innerWidth < 1200) return;

      isDragging = true;
      startMouseX = e.clientX;
      startMouseY = e.clientY;
      startLeft = parseInt(windowEl.style.left, 10) || 0;
      startTop = parseInt(windowEl.style.top, 10) || 0;

      windowEl.classList.add("is-dragging");
      bringToFront(windowEl);
      document.body.style.userSelect = "none";
    });

    document.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      windowEl.style.left = `${startLeft + (e.clientX - startMouseX)}px`;
      windowEl.style.top = `${startTop + (e.clientY - startMouseY)}px`;
    });

    document.addEventListener("mouseup", () => {
      if (!isDragging) return;
      isDragging = false;
      windowEl.classList.remove("is-dragging");
      document.body.style.userSelect = "";
    });
  }

  document.querySelectorAll(".desktop-content > .window").forEach((win) => {
    const titleBar = win.querySelector(".title-bar");
    if (titleBar) {
      makeWindowDraggable(win, titleBar);
      // Double-clicking the title bar toggles maximize
      // Ignored when the click lands on a control button or on mobile
      titleBar.addEventListener("dblclick", (e) => {
        if (e.target.closest("button")) return;
        if (window.innerWidth < 1200) return;
        toggleMaximize(win);
      });
    }
    // Clicking anywhere inside a window brings it to front
    win.addEventListener("mousedown", () => bringToFront(win));
  });

  // MAXIMIZE/RESTORE
  // Saves the window's current geometry in data attributes
  // then stretches it to fill the desktop area using inset:0
  // Clicking maximize again restores the saved geometry
  function toggleMaximize(win) {
    const desktop = win.closest(".desktop-content");
    if (!desktop) return;

    const isMaximized = win.classList.toggle("is-maximized");

    // Swaps the button aria-label so 98.css renders the correct icon
    // Maximize shows a single square
    // Restore shows two overlapping squares
    const btn = win.querySelector(
      '[aria-label="Maximize"], [aria-label="Restore"]',
    );
    if (btn)
      btn.setAttribute("aria-label", isMaximized ? "Restore" : "Maximize");

    if (isMaximized) {
      // Persists current geometry for restore
      win.dataset.prevLeft = win.style.left || "";
      win.dataset.prevTop = win.style.top || "";
      win.dataset.prevWidth = win.style.width || "";
      win.dataset.prevHeight = win.style.height || "";

      // Fills the entire desktop area
      win.style.position = "absolute";
      win.style.inset = "0";
      win.style.width = "auto";
      win.style.height = "auto";
      win.style.maxWidth = "none";
      win.style.maxHeight = "none";
      bringToFront(win);
    } else {
      // Restores saved geometry
      win.style.inset = "";
      win.style.left = win.dataset.prevLeft;
      win.style.top = win.dataset.prevTop;
      win.style.width = win.dataset.prevWidth;
      win.style.height = win.dataset.prevHeight || "";
      win.style.maxWidth = "";
      win.style.maxHeight = "";
    }
  }

  // The listener is attached to the button element at init time
  // When toggleMaximize swaps aria-label from mMaximize" to "restore"
  // the listener stays on the same DOM node so it continues to work without rebinding
  // Disabled on mobile
  document.querySelectorAll(".desktop-content > .window").forEach((win) => {
    const maximizeBtn = win.querySelector('[aria-label="Maximize"]');
    if (maximizeBtn) {
      maximizeBtn.addEventListener("click", (e) => {
        e.preventDefault();
        if (window.innerWidth < 1200) return;
        toggleMaximize(win);
      });
    }
  });

  // CLOCK + DATE
  // Updates the taskbar clock every second in H:MM AM/PM format
  // Hovering over the clock shows a Win98 style tooltip with the full date
  const clockEl = document.getElementById("clock");
  const clockTimeEl = document.getElementById("clock-time");
  const clockTooltip = document.getElementById("clock-tooltip");

  function updateClock() {
    if (!clockTimeEl) return;
    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    clockTimeEl.textContent = `${hours}:${minutes} ${ampm}`;
  }

  // Shows the date tooltip on mouseenter populating it with the current date
  if (clockEl && clockTooltip) {
    clockEl.addEventListener("mouseenter", () => {
      const now = new Date();
      const dateStr = now.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      clockTooltip.textContent = dateStr;
      clockTooltip.classList.remove("hidden");
    });

    clockEl.addEventListener("mouseleave", () => {
      clockTooltip.classList.add("hidden");
    });
  }

  updateClock();
  setInterval(updateClock, 1000);

  // TABS
  // Generic tab switcher for any [role="tablist"] inside a .content--tabs container
  // Clicking a tab sets aria-selected and shows the matching [role="tabpanel"]
  function initTabs() {
    document.querySelectorAll('[role="tablist"]').forEach((tablist) => {
      const tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));
      const container = tablist.closest(".content--tabs");
      if (!container) return;

      tabs.forEach((tab) => {
        tab.addEventListener("click", (e) => {
          e.preventDefault();
          const link = tab.querySelector("a");
          if (!link) return;
          const targetId = link.getAttribute("href").replace("#", "");

          // Deactivates all tabs and activates the clicked one
          tabs.forEach((t) => t.setAttribute("aria-selected", "false"));
          tab.setAttribute("aria-selected", "true");

          // Shows only the matching panel
          container.querySelectorAll('[role="tabpanel"]').forEach((panel) => {
            panel.hidden = panel.id !== targetId;
          });
        });
      });
    });
  }

  initTabs();

  // BLOG POST DETAIL VIEW
  // Clicking an article title in the blog list switches the Blog window to a full-post reading view inside the same window
  // Full article content lives inside a hidden .blog-full-content div inside each .blog-post element
  // openBlogPost() reads that content and injects it into the post view then swaps the visible panel
  // restoreBlogList() reverses the swap and is called by the back link
  function openBlogPost(postArticle) {
    const win = document.getElementById("window-blog");
    const listView = document.getElementById("blog-list-view");
    const postView = document.getElementById("blog-post-view");
    if (!win || !listView || !postView) return;

    const titleEl = postArticle.querySelector(".blog-post-link");
    const dateEl = postArticle.querySelector(".blog-post-meta");
    const contentEl = postArticle.querySelector(".blog-full-content");

    const title = titleEl ? titleEl.textContent.trim() : "Post";
    const date = dateEl ? dateEl.textContent.trim() : "";
    const content = contentEl ? contentEl.innerHTML : "";

    document.getElementById("blog-post-title").textContent = title;
    document.getElementById("blog-post-date").textContent = date;
    document.getElementById("blog-post-body").innerHTML = content;

    listView.hidden = true;
    postView.hidden = false;

    // Updates title bar to the article title and address bar to the post path
    document.getElementById("title-blog").textContent = title;
    WINDOW_PATHS["window-blog"].path = `C:\\Desktop\\Blog\\${title}`;
    updateAddressBar(win);

    const statusEl = document.getElementById("blog-status");
    if (statusEl) statusEl.textContent = date;
  }

  function restoreBlogList() {
    const win = document.getElementById("window-blog");
    const listView = document.getElementById("blog-list-view");
    const postView = document.getElementById("blog-post-view");
    if (!listView || !postView) return;

    listView.hidden = false;
    postView.hidden = true;

    document.getElementById("title-blog").textContent = "Blog";
    WINDOW_PATHS["window-blog"].path = "C:\\Desktop\\Blog";
    if (win) updateAddressBar(win);

    // Restores post count in status bar
    const statusEl = document.getElementById("blog-status");
    if (statusEl) {
      const total = document.querySelectorAll(
        "#blog-list-view .blog-post",
      ).length;
      statusEl.textContent = `${total} post${total !== 1 ? "s" : ""}`;
    }
  }

  // Click on article title opens the full post
  document.querySelectorAll(".blog-post-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const postArticle = link.closest(".blog-post");
      if (postArticle) openBlogPost(postArticle);
    });
  });

  // Click on back link restores the list
  const blogBackLink = document.getElementById("blog-back-link");
  if (blogBackLink) {
    blogBackLink.addEventListener("click", (e) => {
      e.preventDefault();
      restoreBlogList();
    });
  }

  // PROJECT CATEGORY FILTER
  // Clicking a [data-filter] summary in the Projects sidebar shows only the project folders whose data-category matches
  // "all" shows everything
  // Updates the status bar object count
  function initProjectFilter() {
    const sidebar = document.querySelector("#window-projects .tree-view");
    const grid = document.querySelector(".content.projects-grid");
    const countEl = document.getElementById("object-count");
    if (!sidebar || !grid) return;

    sidebar.addEventListener("click", (e) => {
      const filter = e.target.closest("[data-filter]");
      if (!filter) return;

      // If the detail view is open clicking any category navigates back to grid
      restoreProjectsGrid();

      const category = filter.dataset.filter;

      // Updates active highlight on all filter summaries
      sidebar
        .querySelectorAll(".tree-filter")
        .forEach((el) => el.classList.toggle("is-active", el === filter));

      // Show/hide project folders
      grid.querySelectorAll(".project-folder").forEach((folder) => {
        folder.hidden =
          category !== "all" && folder.dataset.category !== category;
      });

      // Syncs status bar count
      if (countEl) {
        const visible = grid.querySelectorAll(
          ".project-folder:not([hidden])",
        ).length;
        countEl.textContent = `${visible} object${visible !== 1 ? "s" : ""}`;
      }
    });
  }

  initProjectFilter();

  // PROJECT SIDEBAR
  // Opens all <details> in the sidebar to measure the widest possible layout, then locks that width
  // This way the sidebar never grows or shrinks as categories are expanded/collapsed and no hardcoded
  // pixel value is needed
  function fixProjectSidebarWidth() {
    const sidebar = document.querySelector(".project-sidebar");
    if (!sidebar || window.innerWidth < 1200) return;

    // Records current open states then force-opens all details
    const details = Array.from(sidebar.querySelectorAll("details"));
    const wasOpen = details.map((d) => d.open);
    details.forEach((d) => {
      d.open = true;
    });

    // Reads the natural scrollWidth with everything expanded
    const naturalWidth = sidebar.scrollWidth;

    // Restores original open states
    details.forEach((d, i) => {
      d.open = wasOpen[i];
    });

    // Locks the width so expand/collapse never changes it
    sidebar.style.width = `${naturalWidth}px`;
    sidebar.style.minWidth = `${naturalWidth}px`;
    sidebar.style.maxWidth = `${naturalWidth}px`;
  }

  // INTERACTIVE TABLE ROW SELECTION
  // Clicking a row in a .interactive table highlights it
  // Only one row can be highlighted at a time within the same table
  document.querySelectorAll("table.interactive tbody").forEach((tbody) => {
    tbody.addEventListener("click", (e) => {
      const row = e.target.closest("tr");
      if (!row) return;
      // Deselects all rows in this table then selects the clicked one
      tbody
        .querySelectorAll("tr")
        .forEach((r) => r.classList.remove("highlighted"));
      row.classList.add("highlighted");
    });
  });

  // CONTACT FORM VALIDATION + SUBMISSION
  // The form uses novalidate to control validation manually
  // On submit each field is checked
  // The first error is shown in the Contact window's status bar
  // When validation passes the form is submitted via fetch() so the page never navigates away
  // This works with Formspree out of the box
  // For Netlify Forms see index.html comments
  const contactForm = document.querySelector("#window-contact form");
  const contactStatus = document.querySelector(
    "#window-contact .status-bar-field",
  );

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const NAME_RE = /^[A-Za-zÀ-ÿĀ-ɏ\s'\-]+$/;

  // Updates the Contact window status bar
  // Errors are shown in dark red to match the Win98 style
  function setContactStatus(msg, isError = false) {
    if (!contactStatus) return;
    contactStatus.textContent = msg;
    contactStatus.style.color = isError ? "#800000" : "";
  }

  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = document.getElementById("contact-name");
      const email = document.getElementById("contact-email");
      const message = document.getElementById("contact-message");

      // Name is required. 2–100 chars, valid characters only
      if (!name.value.trim() || name.value.trim().length < 2) {
        setContactStatus(
          "Error: please enter your name (at least 2 characters).",
          true,
        );
        name.focus();
        return;
      }
      if (!NAME_RE.test(name.value.trim())) {
        setContactStatus(
          "Error: name may only contain letters, spaces, hyphens and apostrophes.",
          true,
        );
        name.focus();
        return;
      }

      // Email is required. Valid format, max 254 chars
      if (!email.value.trim()) {
        setContactStatus("Error: please enter your email address.", true);
        email.focus();
        return;
      }
      if (!EMAIL_RE.test(email.value.trim()) || email.value.length > 254) {
        setContactStatus("Error: please enter a valid email address.", true);
        email.focus();
        return;
      }

      // Message is required. 10–2000 chars
      if (message.value.trim().length < 10) {
        setContactStatus(
          "Error: message must be at least 10 characters.",
          true,
        );
        message.focus();
        return;
      }

      // If no backend is configured shows a placeholder and stops here
      // The user must set the form action to their Formspree (or other service) endpoint first
      const rawAction = contactForm.getAttribute("action");
      if (!rawAction || rawAction === "#") {
        setContactStatus(
          "Form validated. Set the action URL in index.html to enable delivery.",
        );
        return;
      }

      // If a real endpoint is configured submits via fetch so the page never navigates away
      // Formspree responds with JSON when the accept header is set
      setContactStatus("Sending...");
      fetch(rawAction, {
        method: "POST",
        body: new FormData(contactForm),
        headers: { Accept: "application/json" },
      })
        .then((res) => {
          if (res.ok) {
            setContactStatus("Message sent! I'll get back to you soon.");
            contactForm.reset();
          } else {
            // Formspree returns { errors: [{ message }] } on failure
            return res.json().then((data) => {
              const detail = data.errors
                ? data.errors.map((err) => err.message).join(", ")
                : "submission failed";
              setContactStatus(`Error: ${detail}`, true);
            });
          }
        })
        .catch(() => {
          setContactStatus(
            "Error: could not send the message. Please try again.",
            true,
          );
        });
    });

    // Clears errors as soon as the user starts correcting a field
    contactForm.addEventListener("input", () => {
      if (contactStatus && contactStatus.style.color)
        setContactStatus("Awaiting input...");
    });
  }
});
