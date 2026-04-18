import { ok, err, guardianError } from "../shared/result";
import type { Result } from "../shared/result";

describe("result helpers", () => {
  it("ok wraps data in a success result", () => {
    const result = ok({ value: 42 });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.value).toBe(42);
    }
  });

  it("err wraps an error in a failure result", () => {
    const error = guardianError("INVALID_INPUT", "bad input");
    const result = err(error);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("INVALID_INPUT");
      expect(result.error.message).toBe("bad input");
    }
  });

  it("Result type narrows correctly via success flag", () => {
    const maybeResult: Result<string> = ok("hello");

    if (maybeResult.success) {
      const upper: string = maybeResult.data.toUpperCase();
      expect(upper).toBe("HELLO");
    }
  });

  it("guardianError constructs a frozen-shape error", () => {
    const error = guardianError("PROVIDER_UNAVAILABLE", "provider is down");

    expect(error.code).toBe("PROVIDER_UNAVAILABLE");
    expect(error.message).toBe("provider is down");
  });
});
