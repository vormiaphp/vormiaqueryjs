import { describe, it, expect } from "vitest";
import { VormiaClient } from "../src/client/createVormiaClient.js";

describe("VormiaClient", () => {
  it("should instantiate without errors", () => {
    const client = new VormiaClient({ baseURL: "/api/test" });
    expect(client).toBeInstanceOf(VormiaClient);
  });
});
