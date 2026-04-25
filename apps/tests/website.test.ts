import { describe, expect, it } from "bun:test";
import axios from "axios";

let BASE_URL = "http://localhost:3000/v1";

describe("Websie gets created", () => {
  it("Website not created if url is not present", async () => {
    await expect(axios.post(`${BASE_URL}/website`, {})).rejects.toThrow();
  });
});
