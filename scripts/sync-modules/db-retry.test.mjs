import { describe, expect, it, vi } from "vitest";
import { isTransientDatabaseError, withDatabaseRetry } from "./db-retry.mjs";

describe("isTransientDatabaseError", () => {
  it("recognizes Prisma operation timeouts", () => {
    expect(isTransientDatabaseError({ code: "P1008", message: "Operation timed out" })).toBe(true);
  });

  it("recognizes nested PostgreSQL adapter socket timeouts", () => {
    expect(isTransientDatabaseError({
      message: "Driver adapter error",
      cause: { message: "SocketTimeout" },
    })).toBe(true);
  });

  it("does not retry unique constraint or validation errors", () => {
    expect(isTransientDatabaseError({ code: "P2002", message: "Unique constraint failed" })).toBe(false);
    expect(isTransientDatabaseError(new Error("Invalid query arguments"))).toBe(false);
  });
});

describe("withDatabaseRetry", () => {
  it("retries transient failures with exponential backoff and returns the result", async () => {
    const sleepFn = vi.fn().mockResolvedValue(undefined);
    const onRetry = vi.fn();
    const operation = vi.fn()
      .mockRejectedValueOnce({ code: "P1008", message: "Operation timed out" })
      .mockRejectedValueOnce({ cause: { message: "SocketTimeout" } })
      .mockResolvedValue("ok");

    await expect(withDatabaseRetry(operation, { sleepFn, onRetry })).resolves.toBe("ok");
    expect(operation).toHaveBeenCalledTimes(3);
    expect(sleepFn.mock.calls).toEqual([[750], [1500]]);
    expect(onRetry).toHaveBeenCalledTimes(2);
  });

  it("does not retry permanent errors", async () => {
    const sleepFn = vi.fn();
    const error = { code: "P2002", message: "Unique constraint failed" };
    const operation = vi.fn().mockRejectedValue(error);

    await expect(withDatabaseRetry(operation, { sleepFn })).rejects.toBe(error);
    expect(operation).toHaveBeenCalledTimes(1);
    expect(sleepFn).not.toHaveBeenCalled();
  });

  it("stops after the configured attempt limit", async () => {
    const sleepFn = vi.fn().mockResolvedValue(undefined);
    const error = { code: "P1008", message: "Operation timed out" };
    const operation = vi.fn().mockRejectedValue(error);

    await expect(withDatabaseRetry(operation, { attempts: 3, sleepFn })).rejects.toBe(error);
    expect(operation).toHaveBeenCalledTimes(3);
    expect(sleepFn.mock.calls).toEqual([[750], [1500]]);
  });
});
