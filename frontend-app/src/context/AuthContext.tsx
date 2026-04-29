import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { Button } from "@/components/ui/button"
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface Permission {
  id: number;
  codigo: string;
  nombre: string;
  modulo: string;
  descripcion: string;
  created_at: string;
}

interface Role {
  id: number;
  nombre: string;
  is_active: boolean;
  is_default: boolean;
  permisos: Permission[];
}

interface User {
  id: number;
  nombre: string;
  apellido: string;
  telefono: string;
  correo: string;
  roles: Role[];
}

interface LoginResponse {
  access_token: string;
  token_type: string;
  usuario: User;
}

interface LoginResult {
  success: boolean;
  user?: User;
  error?: string;
}

interface PermissionsByModule {
  [module: string]: Permission[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  permissions: string[];
  hasPermission: (permissionCode: string) => boolean;
  hasAnyPermission: (permissionCodes: string[]) => boolean;
  hasAllPermissions: (permissionCodes: string[]) => boolean;
  getPermissionsByModule: () => PermissionsByModule;
  login: (credentials: LoginResponse) => Promise<LoginResult>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("access_token"));
  const [loading, setIsLoading] = useState<boolean>(true);
  const [permissions, setPermissions] = useState<string[]>([]);
  const navigate = useNavigate();
  //const API_URL = import.meta.env.VITE_API_URL;

  const getTokenExpiration = (token: string): number | null => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.exp ? payload.exp * 1000 : null; // convertir a ms
    } catch {
      return null;
    }
  };

  const isTokenExpired = (token: string): boolean => {
    const exp = getTokenExpiration(token);
    if (!exp) return true;
    return Date.now() >= exp;
  };

  useEffect(() => {

    const storedToken = localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      if (isTokenExpired(storedToken)) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        setIsLoading(false);
        navigate("/");
        return;
      }
      try {
        setToken(storedToken);
        const userData: User = JSON.parse(storedUser);
        setUser(userData);
        const allPermissions = extractPermissions(userData);
        setPermissions(allPermissions);

        const exp = getTokenExpiration(storedToken);
        
        setIsLoading(false);

        if (exp) {
          const msUntilExpiry = exp - Date.now();
          const timer = setTimeout(() => {
            logout();
            navigate("/");
          }, msUntilExpiry);
          return () => clearTimeout(timer);
        }
      } catch (error) {
        console.error("Error parsing stored user data", error);
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
      }
    }

    setIsLoading(false);
  }, [navigate]);

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("user");
          setToken(null);
          setUser(null);
          setPermissions([]);
          navigate("/");
        }
        return Promise.reject(error);
      },
    );

    // Limpia el interceptor al desmontar
    return () => axios.interceptors.response.eject(interceptor);
  }, [navigate]);

  const extractPermissions = (userData: User): string[] => {
    if (!userData || !userData.roles) return [];
    return userData.roles.reduce<string[]>((allPerms, role) => {
      if (role.permisos && Array.isArray(role.permisos)) {
        const roleCodes = role.permisos.map(perm => perm.codigo);
        return [...allPerms, ...roleCodes];
      }
      return allPerms;
    }, []);
  };

  const hasPermission = (permissionCode: string): boolean => {
    if (!permissions.length) return false;
    return permissions.includes(permissionCode);
  };

  const hasAnyPermission = (permissionCodes: string[]): boolean => {
    if (!permissions.length) return false;
    return permissionCodes.some(code => permissions.includes(code));
  };

  const hasAllPermissions = (permissionCodes: string[]): boolean => {
    if (!permissions.length) return false;
    return permissionCodes.every(code => permissions.includes(code));
  };


  const login = async (credentials: LoginResponse): Promise<LoginResult> => {
    try {
      setIsLoading(true);
      const { access_token, usuario } = credentials;
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('user', JSON.stringify(usuario));
      setToken(access_token);
      setUser(usuario);
      const userPermissions = extractPermissions(usuario);
      setPermissions(userPermissions);
      return { success: true, user: usuario };
    } catch (error) {
      console.error('Login failed:', error);
      const axiosError = error as any;
      return {
        success: false,
        error: axiosError.response?.data?.message || 'Error al iniciar sesión'
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
    setPermissions([]);
  };

  const getPermissionsByModule = (): PermissionsByModule => {
    if (!user || !user.roles) return {};

    const modules: PermissionsByModule = {};
    user.roles.forEach(role => {
      if (role.permisos && Array.isArray(role.permisos)) {
        role.permisos.forEach(perm => {
          if (!modules[perm.modulo]) {
            modules[perm.modulo] = [];
          }
          if (!modules[perm.modulo].some(p => p.codigo === perm.codigo)) {
            modules[perm.modulo].push(perm);
          }
        });
      }
    });

    return modules;
  };
  const contextValue: AuthContextType = {
    user,
    token,
    loading,
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getPermissionsByModule,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};


// ==================== HOOK PARA VERIFICAR PERMISOS ====================
const usePermission = (permission: string): boolean => {
  const { hasPermission } = useAuth();
  return hasPermission(permission);
};

// ==================== COMPONENTE DE RUTA PROTEGIDA ====================

interface ProtectedViewProps {
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
  children: ReactNode;
  fallback?: ReactNode;
  loginRedirect?: string;
}

const ProtectedView: React.FC<ProtectedViewProps> = ({
  permission,
  permissions,
  requireAll = false,
  children,
  fallback = null,
  // loginRedirect = "/"
}) => {
  const { user, loading, hasPermission, hasAnyPermission, hasAllPermissions } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <h1 className="text-8xl font-bold text-foreground">401</h1>
          <h2 className="text-2xl font-semibold text-foreground">Not Authenticated</h2>
          <p className="text-muted-foreground leading-relaxed">
            You need to be logged in to access this resource. Please sign in with your account to continue.
          </p>
          <div className="flex gap-3 justify-center pt-4">
            <Button variant="outline" >
              Go Back
            </Button>
            <Button>Sign In</Button>
          </div>
        </div>
      </div>
    );
  }

  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (permissions && permissions.length > 0) {
    hasAccess = requireAll ? hasAllPermissions(permissions) : hasAnyPermission(permissions);
  } else {
    hasAccess = true;
  }

  if (!hasAccess) {
    return fallback as React.ReactElement || (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <h1 className="text-8xl font-bold text-foreground">403</h1>
          <h2 className="text-2xl font-semibold text-foreground">Forbidden</h2>
          <p className="text-muted-foreground leading-relaxed">
            You do not have permission to access this resource.
          </p>
          <div className="flex gap-3 justify-center pt-4">
            <Button variant="outline" >
              Go Back
            </Button>
            <Button>Sign In</Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export { usePermission, ProtectedView };
