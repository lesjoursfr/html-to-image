import { exec } from "child_process";
import { resolve } from "path";
import { URL } from "url";
import { promisify } from "util";

const execp = promisify(exec);
const script = resolve(__dirname, "./electron.js");

interface OperationResult {
  error: string | undefined;
  result: "ok" | undefined;
}

function cleanOutput(std: string): OperationResult | null {
  // We look for a line that contains a valid JSON string
  let result = null;
  for (const line of std.split("\n")) {
    try {
      result = JSON.parse(line);
    } catch (err) {
      /* Nothing to do */
    }
  }
  return result;
}

export enum HtmlToImageOutputType {
  png = "png",
  jpeg = "jpeg",
}

export class HtmlToImage {
  url: URL;
  output: string;
  selector: string;
  outputType: HtmlToImageOutputType;

  constructor(url: URL, output: string, selector: string, outputType?: HtmlToImageOutputType) {
    // Required options
    this.url = url;
    this.output = output;
    this.selector = selector;
    this.outputType = outputType ?? HtmlToImageOutputType.jpeg;
  }

  async render(): Promise<OperationResult> {
    // Render the Image
    const command = `node ${require.resolve(
      "electron/cli.js"
    )} --no-sandbox ${script} --target ${this.url.toString()} --output ${this.output} --selector ${this.selector} --output-image-type ${this.outputType}`;
    const { stdout } = await execp(command);

    // Clean output
    const opResult = cleanOutput(stdout);
    if (opResult === null) {
      throw new Error(`Wrong operation result [command : ${command}]`);
    }

    // Check the result
    if (opResult.error) {
      throw new Error(opResult.error);
    }
    return opResult;
  }
}
