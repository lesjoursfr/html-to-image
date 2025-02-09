import { exec } from "child_process";
import { resolve } from "path";
import { URL } from "url";
import { promisify } from "util";

const execp = promisify(exec);
const script = resolve(__dirname, "./electron.js");

export enum HtmlToImageOutputType {
  png = "png",
  jpeg = "jpeg",
}

export interface HtmlToImageOptions {
  xvfb: boolean;
  xvfbArgs: string | undefined;
}

export interface OperationResult {
  error: string | undefined;
  result: "ok" | undefined;
}

function cleanOutput(std: string): OperationResult | null {
  // We look for a line that contains a valid JSON string
  let result = null;
  for (const line of std.split("\n")) {
    try {
      result = JSON.parse(line);
    } catch (_err) {
      /* Nothing to do */
    }
  }
  return result;
}

export class HtmlToImage {
  url: URL;
  output: string;
  selector: string;
  outputType: HtmlToImageOutputType;
  options: HtmlToImageOptions;

  constructor(
    url: URL,
    output: string,
    selector: string,
    outputType?: HtmlToImageOutputType,
    options?: HtmlToImageOptions
  ) {
    // Required options
    this.url = url;
    this.output = output;
    this.selector = selector;
    this.outputType = outputType ?? HtmlToImageOutputType.jpeg;
    this.options = options || { xvfb: false, xvfbArgs: undefined };
  }

  private command(): string {
    if (this.options.xvfb) {
      return `xvfb-run ${this.options.xvfbArgs || ""} node ${require.resolve(
        "electron/cli.js"
      )} --no-sandbox ${script} --target ${this.url.toString()} --output ${this.output} --selector ${this.selector} --output-image-type ${this.outputType}`;
    }

    return `node ${require.resolve(
      "electron/cli.js"
    )} --no-sandbox ${script} --target ${this.url.toString()} --output ${this.output} --selector ${this.selector} --output-image-type ${this.outputType}`;
  }

  async render(): Promise<OperationResult> {
    // Render the Image
    const command = this.command();
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
