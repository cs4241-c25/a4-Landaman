import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [GitHub],
  callbacks: {
    authorized: async ({ request, auth: session }) => {
      const url = new URL(request.url);
      // allow signings to proceed and favicon
      if (
        url.pathname.startsWith("/api/auth") ||
        url.pathname.startsWith("/api/auth") ||
        url.pathname.endsWith(".ico")
      ) {
        return true;
      }

      return !!session;
    },
  },
});
