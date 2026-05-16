import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const isLoggedIn = !!session;

  const isApiAuth = nextUrl.pathname.startsWith("/api/auth");
  const isLoginPage = nextUrl.pathname === "/login";

  // Always allow auth API routes
  if (isApiAuth) return NextResponse.next();

  // Redirect logged-in users away from login page
  if (isLoginPage) {
    if (isLoggedIn) return NextResponse.redirect(new URL("/dashboard", nextUrl));
    return NextResponse.next();
  }

  // Block all other pages if not logged in
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)"],
};
