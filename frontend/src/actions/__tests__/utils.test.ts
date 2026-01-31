import { generateLabCode } from "@/lib/utils";

describe("Utils", () => {
  describe("generateLabCode", () => {
    it("should generate a code of default length 6", () => {
      const code = generateLabCode();
      expect(code).toHaveLength(6);
    });

    it("should generate a code of specific length", () => {
      const code = generateLabCode(8);
      expect(code).toHaveLength(8);
    });

    it("should only contain uppercase alphanumeric characters", () => {
      const code = generateLabCode(100); // Generate long string to increase probability of catching bad chars
      const regex = /^[A-Z0-9]+$/;
      expect(regex.test(code)).toBe(true);
    });

    it("should generate different codes on subsequent calls", () => {
      const code1 = generateLabCode();
      const code2 = generateLabCode();
      expect(code1).not.toBe(code2);
    });
  });
});
