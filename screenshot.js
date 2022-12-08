#!/usr/bin/env osascript -l JavaScript

function run(argv) {
  const rectangleId = "com.knollsoft.Rectangle";
  const defaultSize = getDefaultSize(rectangleId);
  const { dock, menuBar } = currentDockAndMenuBar();
  const targetSize = {
    width: parseInt(argv[0]) || defaultSize.width,
    height: parseInt(argv[1]) || defaultSize.height,
  };

  try {
    hidedockAndMenuBar();
    hideOthers();
    moveToCenter(defaultSize, targetSize, rectangleId);
    screenshot(getRect(targetSize));
  } finally {
    setDockAndMenuBar(dock, menuBar);
  }
}

function currentDockAndMenuBar() {
  const dockPreferences = new Application("System Events").dockPreferences();
  return {
    dock: dockPreferences.autohide(),
    menuBar: dockPreferences.autohideMenuBar(),
  };
}

function setDockAndMenuBar(hideDock, hideMenuBar) {
  const dockPreferences = new Application("System Events").dockPreferences();
  dockPreferences.autohide = hideDock;
  dockPreferences.autohideMenuBar = hideMenuBar;
}

function hidedockAndMenuBar() {
  setDockAndMenuBar(true, true);
}

function hideOthers() {
  new Application("System Events")
    .processes()
    .filter((process) => process.visible() && !process.frontmost())
    .forEach((process) => (process.visible = false));
}

function moveToCenter(defaultSize, targetSize, rectangleId) {
  const rectangle = new Application("Rectangle");
  if (JSON.stringify(defaultSize) !== JSON.stringify(targetSize)) {
    const { width, height } = targetSize;
    const write = `defaults write ${rectangleId}`;
    rectangle.quit();
    runCommand(`${write} specifiedWidth -float ${width}`);
    runCommand(`${write} specifiedHeight -float ${height}`);
  }
  if (!rectangle.running()) {
    runCommand(`open -b ${rectangleId}`);
  }
  runCommand('open -g "rectangle://execute-action?name=specified"');
}

function screenshot(rect) {
  runCommand(
    [
      "screencapture",
      "-m",
      "-T 1",
      `-R ${rect.x},${rect.y},${rect.width},${rect.height}`,
      "${HOME}/Desktop/$(date +%Y%m%d-%H%M%S).png",
    ].join(" ")
  );
}

function runCommand(command) {
  try {
    const app = Application.currentApplication();
    app.includeStandardAdditions = true;
    return app.doShellScript(command);
  } catch {
    return "";
  }
}

function getScreenSize() {
  const json = runCommand("displays");
  const displays = JSON.parse(json);
  const display = displays.find((display) => display.isMain);
  if (display === undefined) {
    return;
  }
  return {
    width: display.resolution.width,
    height: display.resolution.height,
    topInset: display.safeAreaInsets.top,
  };
}

function getRect(targetSize) {
  const padding = 160;
  const size = getScreenSize();
  return {
    x: (size.width - targetSize.width - padding) / 2,
    y: (size.height - targetSize.height + size.topInset - padding) / 2,
    width: targetSize.width + padding,
    height: targetSize.height + padding,
  };
}

function getDefaultSize(rectangleId) {
  const read = `defaults read ${rectangleId}`;
  return {
    width: parseInt(runCommand(`${read} specifiedWidth`)) || 800,
    height: parseInt(runCommand(`${read} specifiedHeight`)) || 600,
  };
}
