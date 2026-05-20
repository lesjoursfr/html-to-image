[![npm version](https://badge.fury.io/js/@lesjoursfr%2Fhtml-to-image.svg)](https://badge.fury.io/js/@lesjoursfr%2Fhtml-to-image)
[![QC Checks](https://github.com/lesjoursfr/html-to-image/actions/workflows/quality-control.yml/badge.svg)](https://github.com/lesjoursfr/html-to-image/actions/workflows/quality-control.yml)

# @lesjoursfr/html-to-image

Generate PNG/JPEG images from HTML with simple API in Node.js.

# What is this library?

This library use electron to generate PNG/JPEG images from HTML.

## Usage

Install the lib and add it as a dependency :

```
    npm install @lesjoursfr/html-to-image
```

Then put this in your code:

```javascript
const { HtmlToImage } = require("@lesjoursfr/html-to-image");

const htmlToImage = new HtmlToImage(target, output, selector, outputType);
htmlToImage
	.render()
	.then(() => {
		console.log("Image Generated Successfully!");
	})
	.catch((err) => {
		console.error("Failed to generate Image because of ", err);
	});
```

#### Parameters

- `target`:
  The URL of the HTML page
- `output`:
  The image file path
- `selector`:
  The CSS selector of the content to capture
- `outputType`:
  The image type ("png" or "jpeg", default to "jpeg")

## Electron 42

Previously, the electron npm package would download the Electron binary from the repository's GitHub Releases in the package's postinstall script.
With recent supply chain security attacks against the npm ecosystem with postinstall scripts as a common attack vector, Electron will now download itself dynamically the first time that its main bin script is run (e.g. via npx electron).
With this change, you can now use Electron with the npm --ignore-scripts flag.

If you need to download the Electron binary on-demand, you can now call the install-electron script:

```bash
npx install-electron
```

See the [release post](https://www.electronjs.org/blog/electron-42-0) for more details.
