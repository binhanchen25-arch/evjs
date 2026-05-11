import type { Register as EvRegister } from "./register";

// Bridge evjs' public Register interface into TanStack Router's global types.
declare module "@tanstack/react-router" {
  interface Register extends EvRegister {}
}
