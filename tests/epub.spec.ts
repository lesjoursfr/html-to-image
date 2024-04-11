import assert from "assert";
import { resolve } from "path";
import { URL } from "url";
import { HtmlToImage, HtmlToImageOutputType } from "../src/index";

async function runTestOn(input: string, outputType: HtmlToImageOutputType): Promise<boolean> {
  const file = resolve(__dirname, `./${input}.html`);
  const target = new URL(`file://${file}`);
  const output = resolve(__dirname, `./${input}.${outputType}`);

  const htmlToImage = new HtmlToImage(target, output, "blockquote", outputType);
  const op = await htmlToImage.render();
  return op.result === "ok";
}

it("PNG > generate", async () => {
  assert.strictEqual(await runTestOn("article", HtmlToImageOutputType.png), true);
}).timeout(30000);

it("JPEG > generate", async () => {
  assert.strictEqual(await runTestOn("article", HtmlToImageOutputType.jpeg), true);
}).timeout(30000);
