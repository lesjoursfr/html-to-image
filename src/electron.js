const { app, BrowserWindow } = require("electron");
const { writeFileSync } = require("fs");
const { string: yargs } = require("yargs");

// Arguments
const { target, output, selector, outputImageType } = yargs(["target", "output", "selector", "output-image-type"]).argv;

// Wait until Electron is Ready
app.on("ready", function () {
  // Image Generation Callback
  let exiting = false;
  function imageGenerationCallback(err, image, _cropRect) {
    // Shutdown Electron
    window.close();
    app.quit();

    // Check if there is an Error
    if (err) {
      // Send the Error
      process.stdout.write(`${JSON.stringify({ error: err.toString() })}\n`, "utf8");
      return;
    } else if (image === undefined) {
      // Send the Error
      process.stdout.write(`${JSON.stringify({ error: new Error("Missing Image buffer").toString() })}\n`, "utf8");
      return;
    }

    // Write the Image File to a Temporary File
    try {
      writeFileSync(output, outputImageType === "png" ? image.toPNG() : image.toJPEG(100));
    } catch (error) {
      // Send the Error
      process.stdout.write(`${JSON.stringify({ error: error.toString() })}\n`, "utf8");
      return;
    }

    // Send a success
    process.stdout.write(`${JSON.stringify({ result: "ok" })}\n`, "utf8");
  }

  // Load the HTML File into Electron
  const window = new BrowserWindow({
    show: false,
    width: 1920,
    height: 1080,
    webPreferences: { sandbox: false, offscreen: true },
  });
  window.loadURL(target);
  window.webContents.on("did-finish-load", async function () {
    // Prevent Multiple Callback Calls
    console.log("did-finish-load");
    if (exiting) {
      return;
    }
    exiting = true;

    // Get the Rect
    let escapedSelector = selector.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    let rect = await window.webContents.executeJavaScript(
      `Promise
.resolve(document.querySelector("${escapedSelector}"))
.then((element) => {
  if (element === null) { return null; }
  let rect = element.getBoundingClientRect();
  window.scrollTo(0, rect.y);
  rect = element.getBoundingClientRect();
  return { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
});`
    );
    if (rect === null) {
      return imageGenerationCallback(new Error(`Can't find an element that match the selector: ${escapedSelector}`));
    }

    // Make sure we have integers
    rect.x = Math.round(rect.x);
    rect.y = Math.round(rect.y);
    rect.width = Math.round(rect.width);
    rect.height = Math.round(rect.height);

    // Safety Extra Wait
    setTimeout(function () {
      window.webContents
        .capturePage(rect, { stayHidden: true })
        .then(function (image) {
          imageGenerationCallback(null, image, rect);
        })
        .catch(function (err) {
          imageGenerationCallback(err);
        });
    }, 2000);
  });
});
