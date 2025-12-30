package utils

/*
Ptr is a generic helper function that takes any value of type T
and returns a pointer to that value. This can be useful when
you want to create pointers to literal values or simple variables
without having to declare a separate variable first.

In Go, you cannot take the address of a literal directly, e.g.:

	&42        // ❌ invalid

Ptr allows you to do this in a concise and type-safe way.

Example usage:

	intPtr := Ptr(42)             // *int pointing to 42
	strPtr := Ptr("hello world")  // *string pointing to "hello world"

This is especially convenient when working with structs or APIs
that require pointer fields instead of values.
*/
func Ptr[T any](v T) *T {
	return &v
}
