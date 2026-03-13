import { PrismaPg } from "@prisma/adapter-pg";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { username } from "better-auth/plugins";
import { PrismaClient } from "@/generated/prisma/client";
import { EmailTemplate } from "@/lib/email/email-template";
import { FROM_EMAIL, resend } from "@/server/resend";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL as string,
});

const prisma = new PrismaClient({ adapter });

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      accessType: "offline",
      redirectURI: `${process.env.BETTER_AUTH_URL}/api/auth/callback/google`,
    },
    facebook: {
      clientId: process.env.FACEBOOK_CLIENT_ID as string,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET as string,
      redirectURI: `${process.env.BETTER_AUTH_URL}/api/auth/callback/facebook`,
    },
    apple: {
      clientId: process.env.APPLE_CLIENT_ID as string,
      clientSecret: process.env.APPLE_CLIENT_SECRET as string,
      redirectURI: `${process.env.BETTER_AUTH_URL}/api/auth/callback/apple`,
    },
  },
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      console.log("Reset password URL:", user.email, ":", url);
      try {
        const emailHtml = EmailTemplate(user.email, url);
        const { data, error } = await resend.emails.send({
          from: FROM_EMAIL,
          to: user.email,
          subject: "Reset Your Password",
          html: emailHtml,
        });

        if (error) {
          console.error("Error sending reset password email:", error);
          throw new Error("Failed to send reset password email");
        } else {
          console.log("Reset password email sent to:", user.email);
          console.log("Email data:", data?.id);

          if (process.env.NODE_ENV === "development") {
            console.log("Reset url (dev):", url);
          }
        }
      } catch (err: unknown) {
        console.error("Error occured while sending reset password email:", err);
        throw new Error("Failed to send reset password email");
      }
    },
  },

  user: {
    additionalFields: {
      role: {
        type: "string",
        input: false,
      },
      onlineVisibility: {
        type: "boolean",
        input: false,
      },
      preferredLanguage: {
        type: "string",
        input: false,
      },
    },
  },

  plugins: [nextCookies(), username()],
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
