import { AwsClient } from "aws4fetch";
import type { ObjectStore } from "../../core/ports";

type R2ObjectStoreOptions = {
  endpoint: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  fetch?: typeof fetch;
  timeoutMs?: number;
};

// Stores archive objects in an S3-compatible R2 bucket.
export class R2ObjectStore implements ObjectStore {
  private readonly client: AwsClient;
  private readonly endpoint: string;
  private readonly bucket: string;
  private readonly fetcher: typeof fetch;
  private readonly timeoutMs: number;

  constructor(options: R2ObjectStoreOptions) {
    this.client = new AwsClient({
      accessKeyId: options.accessKeyId,
      secretAccessKey: options.secretAccessKey,
      service: "s3",
      region: "auto",
    });
    this.endpoint = options.endpoint.replace(/\/+$/, "");
    this.bucket = options.bucket;
    this.fetcher = options.fetch ?? fetch;
    this.timeoutMs = options.timeoutMs ?? 30000;
  }

  async put(key: string, body: Uint8Array): Promise<void> {
    const encodedKey = key.split("/").map(encodeURIComponent).join("/");
    const url = `${this.endpoint}/${this.bucket}/${encodedKey}`;
    const signed = await this.client.sign(url, {
      method: "PUT",
      headers: { "content-type": "application/zstd" },
      body,
    });
    const response = await this.fetcher(signed, {
      method: "PUT",
      headers: signed.headers,
      body: body as Uint8Array<ArrayBuffer>,
      signal: AbortSignal.timeout(this.timeoutMs),
    });
    if (!response.ok) {
      const message = (await response.text()).slice(0, 200);
      throw new Error(`R2 PUT ${response.status}: ${message}`);
    }
    await response.arrayBuffer();
  }
}
