export class LetterUtils {
  /**
   * Convert a number to a base-26 number system (A-Z)
   * @param n The number to convert
   * @return The base-26 representation
   */
  public static ToNumberSystem26(n: number): string {
    let s = '';
    while (n > 0) {
      let m = n % 26;
      if (m === 0) m = 26;
      s = String.fromCharCode(m + 64) + s;
      n = (n - m) / 26;
    }
    return s;
  }

  /**
   * Check if the data is a basic type (number)
   * @param data The data to check
   * @return True if the data is a number, false otherwise
   */
  public static isBasicType(data: any): boolean {
    return data != null && typeof data === 'number';
  }

  /**
   * Check if the data is a number (not a float or double)
   * @param data The data to check
   * @return True if the data is a number, false otherwise
   */
  public static isNumber(data: any): boolean {
    return typeof data === 'number' && !isNaN(data) && isFinite(data);
  }
}
