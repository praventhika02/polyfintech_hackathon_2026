export { middleware } from "@/lib/auth/middleware";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/company/:path*",
    "/hidden-winners/:path*",
    "/early-warning/:path*",
    "/copilot/:path*",
    "/profile/:path*"
  ]
};
