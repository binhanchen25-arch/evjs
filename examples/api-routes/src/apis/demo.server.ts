"use server";

export async function sayHello(name: string) {
  return `Hello, ${name}! This is from a server function.`;
}
