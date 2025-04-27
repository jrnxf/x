import { jwtDecode } from "jwt-decode";
import React from "react";

type AuthProviderProperties = {
  isAuthenticated: boolean;
  sessionUser: Session | undefined;
  setSession: (jwt: string) => void;
};
const AuthContext = React.createContext<AuthProviderProperties>({
  isAuthenticated: false,
  sessionUser: undefined,
  setSession: () => {},
});

export const useAuth = () => React.useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [sessionUser, setSessionUser] = React.useState<SessionUser | undefined>(
    () => {
      const session = localStorage.getItem("session");
      if (!session) return;

      const decoded = jwtDecode<{ user: SessionUser }>(session);

      if (!sessionUserSchema.safeParse(decoded.user).success) {
        localStorage.removeItem("session");
        return;
      }

      return decoded.user;
    },
  );

  const setSession = (jwt: string) => {
    localStorage.setItem("session", jwt);
    const sessionUser = jwtDecode<{ user: SessionUser }>(jwt);
    setSessionUser(sessionUser.user);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: Boolean(sessionUser),
        sessionUser,
        setSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
