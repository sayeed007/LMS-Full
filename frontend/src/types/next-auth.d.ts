import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      image?: string
      role: string
    }
    backendToken: string
  }

  interface User {
    id: string
    email: string
    name: string
    image?: string
    role: string
    token?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: string
    role: string
    backendToken: string
  }
}