"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  account,
  databases,
  DATABASE_ID,
  COLLECTION_IDS,
} from "@/lib/appwrite";
import { Models, ID, AppwriteException } from "appwrite";

interface UserMetadata {
  username: string;
  display_name: string;
  avatar_url?: string;
}

interface AuthResult {
  data: unknown;
  error: { message: string } | null;
}

interface AuthContextType {
  user: Models.User<Models.Preferences> | null;
  signUp: (
    email: string,
    password: string,
    userData: UserMetadata,
  ) => Promise<AuthResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    account
      .get()
      .then((currentUser) => {
        setUser(currentUser);
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
      });
  }, []);

  const signUp = async (
    email: string,
    password: string,
    userData: UserMetadata,
  ): Promise<AuthResult> => {
    try {
      await account.create(ID.unique(), email, password, userData.display_name);

      // Delete any existing session first
      try {
        await account.deleteSession("current");
      } catch {
        // No active session — that's fine
      }
      await account.createEmailPasswordSession(email, password);

      await account.updatePrefs({
        username: userData.username,
        display_name: userData.display_name,
        avatar_url: userData.avatar_url || "👤",
      });

      const currentUser = await account.get();

      // Create profile document BEFORE setting user state
      // (otherwise app-context will try to fetch it before it exists)
      await databases.createDocument(
        DATABASE_ID,
        COLLECTION_IDS.profiles,
        currentUser.$id,
        {
          username: userData.username.toLowerCase(),
          display_name: userData.display_name,
          avatar_url: userData.avatar_url || "👤",
          bio: "",
          followers_count: 0,
          following_count: 0,
        },
      );

      // Create welcome notification
      await databases.createDocument(
        DATABASE_ID,
        COLLECTION_IDS.notifications,
        ID.unique(),
        {
          recipient_id: currentUser.$id,
          sender_id: currentUser.$id,
          type: "welcome",
          message: "Thanks for checking out my project! 🎉",
          is_read: false,
          created_at: new Date().toISOString(),
        },
      );

      setUser(currentUser);

      return { data: currentUser, error: null };
    } catch (error) {
      const appwriteError = error as AppwriteException;
      return { data: null, error: { message: appwriteError.message } };
    }
  };

  const signIn = async (
    email: string,
    password: string,
  ): Promise<AuthResult> => {
    try {
      // Delete any existing session first
      try {
        await account.deleteSession("current");
      } catch {
        // No active session — that's fine
      }
      const session = await account.createEmailPasswordSession(email, password);
      const currentUser = await account.get();
      setUser(currentUser);

      return { data: session, error: null };
    } catch (error) {
      const appwriteError = error as AppwriteException;
      return { data: null, error: { message: appwriteError.message } };
    }
  };

  const signOut = async () => {
    try {
      setUser(null);
      await account.deleteSession("current");
      window.location.href = "/login";
    } catch (error) {
      console.error("Sign out error:", error);
      window.location.href = "/login";
    }
  };

  return (
    <AuthContext.Provider value={{ user, signUp, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
