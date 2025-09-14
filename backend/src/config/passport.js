const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');
const Organization = require('../models/Organization');

// JWT Strategy
passport.use(new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
}, async (payload, done) => {
  try {
    const user = await User.findById(payload.id).populate('organization');

    if (user) {
      return done(null, user);
    }

    return done(null, false);
  } catch (error) {
    return done(error, false);
  }
}));

// Local Strategy
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (email, password, done) => {
  try {
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return done(null, false, { message: 'Invalid email or password' });
    }

    const isPasswordValid = await user.correctPassword(password, user.password);

    if (!isPasswordValid) {
      return done(null, false, { message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return done(null, false, { message: 'Account is deactivated' });
    }

    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/v1/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists with Google ID
    let user = await User.findOne({ googleId: profile.id });

    if (user) {
      // Update last login
      user.lastLogin = new Date();
      await user.save({ validateBeforeSave: false });
      return done(null, user);
    }

    // Check if user exists with the same email
    const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;

    if (!email) {
      return done(new Error('No email found in Google profile'), null);
    }

    user = await User.findOne({ email });

    if (user) {
      // Link Google account to existing user
      user.googleId = profile.id;
      user.emailVerified = true;
      user.lastLogin = new Date();

      // Update avatar if not set
      if (!user.avatar && profile.photos && profile.photos[0]) {
        user.avatar = profile.photos[0].value;
      }

      await user.save({ validateBeforeSave: false });
      return done(null, user);
    }

    // Create new user with Google account
    const newUser = await User.create({
      name: profile.displayName || `${profile.name.givenName} ${profile.name.familyName}`,
      email: email,
      googleId: profile.id,
      avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
      emailVerified: true,
      role: 'student', // Default role for OAuth users
      lastLogin: new Date()
    });

    return done(null, newUser);
  } catch (error) {
    console.error('Google OAuth error:', error);
    return done(error, null);
  }
}));

// Microsoft Azure AD Strategy (if needed)
// Uncomment and configure if you need Microsoft SSO
/*
const { OIDCStrategy } = require('passport-azure-ad');

passport.use(new OIDCStrategy({
  identityMetadata: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/v2.0/.well-known/openid_configuration`,
  clientID: process.env.AZURE_CLIENT_ID,
  clientSecret: process.env.AZURE_CLIENT_SECRET,
  responseType: 'code',
  responseMode: 'form_post',
  redirectUrl: process.env.AZURE_CALLBACK_URL,
  allowHttpForRedirectUrl: process.env.NODE_ENV === 'development',
  passReqToCallback: false,
  scope: ['profile', 'email', 'openid']
}, async (iss, sub, profile, accessToken, refreshToken, done) => {
  try {
    const email = profile._json.email;
    
    if (!email) {
      return done(new Error('No email found in Azure profile'), null);
    }
    
    let user = await User.findOne({ email });
    
    if (!user) {
      user = await User.create({
        name: profile.displayName,
        email: email,
        emailVerified: true,
        role: 'student',
        lastLogin: new Date()
      });
    } else {
      user.lastLogin = new Date();
      await user.save({ validateBeforeSave: false });
    }
    
    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));
*/

// SAML Strategy for enterprise SSO (if needed)
// Uncomment and configure for SAML-based SSO
/*
const SamlStrategy = require('passport-saml').Strategy;

passport.use(new SamlStrategy({
  path: '/api/v1/auth/saml/callback',
  entryPoint: process.env.SAML_ENTRY_POINT,
  issuer: process.env.SAML_ISSUER,
  cert: process.env.SAML_CERT,
  identifierFormat: null,
  decryptionPvk: process.env.SAML_PRIVATE_KEY,
  privateCert: process.env.SAML_PRIVATE_KEY,
  validateInResponseTo: false,
  disableRequestedAuthnContext: true
}, async (profile, done) => {
  try {
    const email = profile.email || profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'];
    const name = profile.displayName || profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];
    
    if (!email) {
      return done(new Error('No email found in SAML profile'), null);
    }
    
    let user = await User.findOne({ email });
    
    if (!user) {
      user = await User.create({
        name: name || email,
        email: email,
        emailVerified: true,
        role: 'student',
        lastLogin: new Date()
      });
    } else {
      user.lastLogin = new Date();
      await user.save({ validateBeforeSave: false });
    }
    
    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));
*/

// Serialize/Deserialize user (for session-based auth if needed)
passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).populate('organization');
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;