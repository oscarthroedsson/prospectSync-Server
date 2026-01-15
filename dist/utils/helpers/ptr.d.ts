/**
 * Ptr is a generic helper function that takes any value of type T
 * and returns a pointer to that value. This can be useful when
 * you want to create pointers to literal values or simple variables
 * without having to declare a separate variable first.
 *
 * In TypeScript/JavaScript, you cannot take the address of a literal directly.
 * Ptr allows you to do this in a concise and type-safe way.
 *
 * Example usage:
 *
 *   const intPtr = ptr(42);             // number | undefined pointing to 42
 *   const strPtr = ptr("hello world");  // string | undefined pointing to "hello world"
 *
 * This is especially convenient when working with structs or APIs
 * that require optional fields instead of values.
 */
export declare function ptr<T>(v: T): T | undefined;
//# sourceMappingURL=ptr.d.ts.map