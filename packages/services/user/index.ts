import { randomBytes, createHmac } from "node:crypto";
import {
  type CreateUserWithEmailAndPasswordInputType,
  createUserWithEmailAndPasswordInput,
  type SignInWithEmailAndPasswordInputType,
  signInWithEmailAndPasswordInput,
  type SignInWithGoogleInputType,
  signInWithGoogleInput,
  type GetAuthenticationMethodOutputSchema,
} from "./model";
import * as JWT from "jsonwebtoken";
import { db, eq } from "@repo/database";
import { generateUserToken, type GenerateUserTokenType } from "./model";
import { usersTable } from "@repo/database/schema";
import { env } from "../env";
import { googleOAuth2Client } from "../clients/google-oauth";

class UserService {
  private async getUserByEmail(email: string) {
    const result = await db.select().from(usersTable).where(eq(usersTable.email, email));
    if (!result || result.length === 0) return null;
    return result[0];
  }

  private async generateUserToken(payload: GenerateUserTokenType) {
    const { id } = await generateUserToken.parseAsync(payload);
    const token = JWT.sign({ id }, env.JWT_SECRET);
    return { token };
  }

  private async verifyUserToken(token: string): Promise<GenerateUserTokenType> {
    try {
      const verificationResult = JWT.verify(token, env.JWT_SECRET) as GenerateUserTokenType;
      return verificationResult;
    } catch (err) {
      throw new Error("Invalid token");
    }
  }

  public async getUserInfoById(id: string) {
    const user = await db
      .select({
        id: usersTable.id,
        fullName: usersTable.fullName,
        email: usersTable.email,
        role: usersTable.role,
      })
      .from(usersTable)
      .where(eq(usersTable.id, id));
    if (!user || user.length === 0) throw new Error(`User with id ${id} does not exist`);
    return user[0];
  }

  public async createUserWithEmailAndPassword(payload: CreateUserWithEmailAndPasswordInputType) {
    const { fullName, email, password } =
      await createUserWithEmailAndPasswordInput.parseAsync(payload);

    const existingUser = await this.getUserByEmail(email);
    if (existingUser) throw new Error(`User with email ${email} already exists`);

    const salt = randomBytes(16).toString("hex");
    const hash = createHmac("sha256", salt).update(password).digest("hex");

    const userInputResult = await db
      .insert(usersTable)
      .values({
        fullName,
        email,
        password: hash,
        salt,
      })
      .returning({
        id: usersTable.id,
      });

    if (!userInputResult || userInputResult.length === 0 || !userInputResult[0]?.id)
      throw new Error("Failed to create user");

    const userId = userInputResult[0].id;
    const { token } = await this.generateUserToken({ id: userId });

    return {
      id: userId,
      token,
    };
  }

  public async signInUserWithEmailAndPassword(payload: SignInWithEmailAndPasswordInputType) {
    const { email, password } = await signInWithEmailAndPasswordInput.parseAsync(payload);

    const existingUser = await this.getUserByEmail(email);
    if (!existingUser) throw new Error(`User with email ${email} does not exist`);

    if (!existingUser.salt || !existingUser.password) throw new Error("Invalid user data");

    const hash = createHmac("sha256", existingUser.salt).update(password).digest("hex");

    if (hash !== existingUser.password) throw new Error("Invalid credentials");

    const { token } = await this.generateUserToken({ id: existingUser.id });
    return {
      id: existingUser.id,
      token,
    };
  }

  public getGoogleAuthUrl(state: string) {
    if (
      !env.GOOGLE_OAUTH_CLIENT_ID ||
      !env.GOOGLE_OAUTH_CLIENT_SECRET ||
      !env.GOOGLE_OAUTH_REDIRECT_URI
    ) {
      throw new Error("Google OAuth is not configured");
    }

    return googleOAuth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "select_account",
      scope: ["openid", "email", "profile"],
      state,
    });
  }

  public async signInWithGoogleCode(code: string) {
    if (
      !env.GOOGLE_OAUTH_CLIENT_ID ||
      !env.GOOGLE_OAUTH_CLIENT_SECRET ||
      !env.GOOGLE_OAUTH_REDIRECT_URI
    ) {
      throw new Error("Google OAuth is not configured");
    }

    const { tokens } = await googleOAuth2Client.getToken(code);
    if (!tokens.id_token) throw new Error("Google did not return an ID token");

    return this.signInWithGoogle({ idToken: tokens.id_token });
  }

  public async signInWithGoogle(payload: SignInWithGoogleInputType) {
    const { idToken } = await signInWithGoogleInput.parseAsync(payload);

    if (!env.GOOGLE_OAUTH_CLIENT_ID) {
      throw new Error("Google OAuth client ID is not configured");
    }

    const ticket = await googleOAuth2Client.verifyIdToken({
      idToken,
      audience: env.GOOGLE_OAUTH_CLIENT_ID,
    });
    const profile = ticket.getPayload();

    if (!profile?.email) throw new Error("Google account did not return an email address");
    if (!profile.email_verified) throw new Error("Google account email is not verified");

    const existingUser = await this.getUserByEmail(profile.email);
    const fullName = profile.name || profile.email.split("@")[0] || "Google User";

    if (existingUser) {
      await db
        .update(usersTable)
        .set({
          fullName: existingUser.fullName || fullName,
          emailVerified: true,
          profileImageUrl: profile.picture ?? existingUser.profileImageUrl,
        })
        .where(eq(usersTable.id, existingUser.id));

      const { token } = await this.generateUserToken({ id: existingUser.id });
      return { id: existingUser.id, token };
    }

    const userInputResult = await db
      .insert(usersTable)
      .values({
        fullName,
        email: profile.email,
        emailVerified: true,
        profileImageUrl: profile.picture,
      })
      .returning({
        id: usersTable.id,
      });

    if (!userInputResult || userInputResult.length === 0 || !userInputResult[0]?.id) {
      throw new Error("Failed to create Google user");
    }

    const userId = userInputResult[0].id;
    const { token } = await this.generateUserToken({ id: userId });

    return { id: userId, token };
  }

  public async verifyAndDecodeUserToken(token: string) {
    const { id } = await this.verifyUserToken(token);
    return { id };
  }

  public async getAuthenticationMethods(): Promise<
    ReadonlyArray<GetAuthenticationMethodOutputSchema>
  > {
    const supportedAuthenticationProviders: GetAuthenticationMethodOutputSchema[] = [];

    const isGoogleConfigured = !!(env.GOOGLE_OAUTH_CLIENT_ID && env.GOOGLE_OAUTH_CLIENT_SECRET);

    if (isGoogleConfigured) {
      const url = this.getGoogleAuthUrl("default_state");
      supportedAuthenticationProviders.push({
        provider: "GOOGLE_OAUTH",
        displayName: "Google",
        displayText: "Signin with Google",
        authUrl: url,
      });
    }

    return supportedAuthenticationProviders;
  }
}

export default UserService;
