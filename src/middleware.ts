import { NextRequest, NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/auth";

export async function middleware(req: NextRequest) {
  // The login endpoint must stay reachable while unauthenticated - it's how
  // the auth cookie gets issued in the first place.
  if (req.nextUrl.pathname === "/api/admin/login") {
    return NextResponse.next();
  }

  const admin = await getAdminFromRequest(req);

  if (!admin) {
    // Protecting the dashboard page: send unauthenticated visitors to login
    if (req.nextUrl.pathname.startsWith("/admin/dashboard")) {
      const loginUrl = new URL("/admin", req.url);
      return NextResponse.redirect(loginUrl);
    }
    // Protecting admin API routes: return 401 instead of leaking data
    if (req.nextUrl.pathname.startsWith("/api/admin")) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/dashboard/:path*", "/api/admin/:path*"],
};
