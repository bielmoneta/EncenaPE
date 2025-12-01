import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { authAPI } from '../services/apiDirect';
import { supabase } from '../lib/supabase';

export interface User {
  id: string;
  name: string;
  email: string;
  cpf: string;
  phone: string;
  birthDate: string;
  role: 'user' | 'admin';
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, cpf: string, phone: string, birthDate: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Verificar se usuário está logado ao carregar
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Verificar se existe uma sessão ativa no Supabase
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          console.log('✅ Sessão encontrada no Supabase');
          // Se tem sessão, carregar o perfil do usuário
          const { user: userData } = await authAPI.getCurrentUser();
          setUser(userData);
        } else {
          console.log('ℹ️ Nenhuma sessão ativa encontrada');
          // Limpar tokens do localStorage se não houver sessão
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      const { user } = await authAPI.getCurrentUser();
      setUser(user);
    } catch (error) {
      console.log('⚠️ Perfil não encontrado, usando metadata...');
      
      // Se não conseguir carregar perfil, tentar pegar dados do metadata e garantir email
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser && authUser.user_metadata) {
          setUser({
            id: authUser.id,
            // Sempre pegar email do authUser primeiro
            email: authUser.email || '',
            name: authUser.user_metadata.name || authUser.email?.split('@')[0] || 'Usuário',
            cpf: authUser.user_metadata.cpf || '',
            phone: authUser.user_metadata.phone || '',
            birthDate: authUser.user_metadata.birth_date || '',
            role: authUser.user_metadata.role || 'user',
          });
          console.log('✅ Usuário carregado do metadata com email:', authUser.email);
        }
      } catch (metaError) {
        console.error('❌ Erro ao carregar metadata:', metaError);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { user, session } = await authAPI.login(email, password);
      setUser(user);
      console.log('✅ Login bem-sucedido');
      console.log('👤 Bem-vindo(a),', user.name);
      return true;
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (
    name: string,
    email: string,
    cpf: string,
    phone: string,
    birthDate: string,
    password: string
  ): Promise<boolean> => {
    try {
      const result = await authAPI.signup({
        name,
        email,
        cpf,
        phone,
        birthDate,
        password,
      });

      console.log('✅ Cadastro realizado com sucesso!');
      
      // ✅ Retornar sucesso SEM fazer login automático
      return result.success;
    } catch (error: any) {
      console.error('Register error:', error);
      throw error;
    }
  };

  const updateProfile = async (data: Partial<User>): Promise<boolean> => {
    try {
      const result = await authAPI.updateProfile({
        name: data.name,
        phone: data.phone,
        birthDate: data.birthDate,
      });

      // Recarregar os dados completos do perfil após atualização
      const { user: updatedUser } = await authAPI.getCurrentUser();
      
      // Atualizar estado local com os dados atualizados
      setUser(updatedUser);

      return true;
    } catch (error: any) {
      console.error('Update profile error:', error);
      throw error; // Propagar o erro para tratamento no componente
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading,
      login, 
      register,
      updateProfile, 
      logout, 
      isAdmin: user?.role === 'admin' 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}