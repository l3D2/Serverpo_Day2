import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import axios from "axios";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  session: {
    strategy: "jwt", // Using JWT for session management
    maxAge: 10 * 60, // 1 minute session expiration time
    updateAge: 60, // Update session every 1 minute
  },
  jwt: {
    maxAge: 10 * 60, // JWT expiration time
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ account, profile }) {
      if (account.provider === "google") {
        return profile.email_verified && profile.email.endsWith("@example.com");
      }
      return true; // Do different verification for other providers that don't have `email_verified`
    },

    async jwt({ token, user, account }) {
      if (account) {
        token.provider = account.provider; // Store the provider in the token
      }

      if (user) {
        // token.accessToken = user.token; // Store user token as accessToken
        token.image = user.image; // Update this based on actual property in your user object
        token.expiresAt = Date.now() + 10 * 60 * 1000; // Set expiration time to 3 minutes
      }

      if (token.expiresAt && Date.now() > token.expiresAt) {
        return null;
      }

      return token;
    },

    async session({ session, token }) {
      // Set session properties if the token has an accessToken
      // if (token.accessToken) {
      //   // session.accessToken = token.accessToken; // Assign access token to session
      //   session.expiresAt = token.expiresAt; // Assign expiration time to session
      //   session.image = token.image; // Pass image if needed
      // } else {
      //   session = null; // Nullify session if token has no accessToken
      // }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
