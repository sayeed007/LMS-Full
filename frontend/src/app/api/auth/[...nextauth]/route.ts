import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import CredentialsProvider from "next-auth/providers/credentials"
import { JWT } from "next-auth/jwt"

async function refreshAccessToken(token: JWT) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refreshToken: token.refreshToken,
      }),
    })

    const refreshedTokens = await response.json()

    if (!response.ok) {
      throw refreshedTokens
    }

    if (refreshedTokens.status === 'success') {
      return {
        ...token,
        backendToken: refreshedTokens.token,
        refreshToken: refreshedTokens.refreshToken ?? token.refreshToken,
        accessTokenExpires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
      }
    }

    return token
  } catch (error) {
    console.error('Error refreshing access token:', error)
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    }
  }
}

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
              refreshToken: data.refreshToken,
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
      // Initial sign in - store tokens and set expiry
      if (account && user) {
        // Handle OAuth providers
        if (account.provider === 'google' || account.provider === 'github') {
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
                token.refreshToken = data.refreshToken
                token.userId = data.data.user._id
                token.role = data.data.user.role
                // Set token expiry (7 days from now - matching JWT_EXPIRES_IN)
                token.accessTokenExpires = Date.now() + 7 * 24 * 60 * 60 * 1000
              }
            }
          } catch (error) {
            console.error('OAuth backend sync error:', error)
          }
        }

        // Handle credentials provider
        if (account.provider === 'credentials') {
          const credUser = user as { token?: string; refreshToken?: string; id: string; role: string }
          token.backendToken = credUser.token || ''
          token.refreshToken = credUser.refreshToken || ''
          token.userId = credUser.id
          token.role = credUser.role
          // Set token expiry (7 days from now - matching JWT_EXPIRES_IN)
          token.accessTokenExpires = Date.now() + 7 * 24 * 60 * 60 * 1000
        }

        return token
      }

      // Return previous token if the access token has not expired yet
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token
      }

      // Access token has expired, try to refresh it
      return refreshAccessToken(token)
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.userId as string
        session.user.role = token.role as string
        session.backendToken = token.backendToken as string
        session.refreshToken = token.refreshToken as string
        session.error = token.error as string | undefined
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Redirect to articles page after successful login
      if (url.startsWith("/")) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return `${baseUrl}/dashboard`
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