import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import CredentialsProvider from "next-auth/providers/credentials"

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET ? [
      GitHubProvider({
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
      })
    ] : []),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        try {
          // Call your backend API to authenticate user
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          })

          if (!response.ok) return null

          const data = await response.json()

          if (data.status === 'success' && data.data.user) {
            return {
              id: data.data.user._id,
              email: data.data.user.email,
              name: data.data.user.name,
              image: data.data.user.avatar,
              role: data.data.user.role,
              token: data.token,
            }
          }

          return null
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Handle OAuth providers
      if (account?.provider === 'google' || account?.provider === 'github') {
        try {
          // Register/login user with your backend using OAuth data
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/oauth`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              provider: account.provider,
              providerId: account.providerAccountId,
              email: user.email,
              name: user.name,
              image: user.image,
            }),
          })

          if (response.ok) {
            const data = await response.json()
            if (data.status === 'success') {
              token.backendToken = data.token
              token.userId = data.data.user._id
              token.role = data.data.user.role
            }
          }
        } catch (error) {
          console.error('OAuth backend sync error:', error)
        }
      }

      // Handle credentials provider
      if (user && account?.provider === 'credentials') {
        token.backendToken = user.token || ''
        token.userId = user.id
        token.role = user.role
      }

      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.userId as string
        session.user.role = token.role as string
        session.backendToken = token.backendToken as string
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Redirect to articles page after successful login
      if (url.startsWith("/")) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return `${baseUrl}/articles`
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }