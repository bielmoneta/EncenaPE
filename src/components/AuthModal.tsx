import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";
import { LogIn, UserPlus, KeyRound } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const { login, register } = useAuth();
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    cpf: "",
    phone: "",
    birthDate: "",
    password: "",
    confirmPassword: "",
  });
  const [recoveryForm, setRecoveryForm] = useState({
    emailOrPhone: "",
    code: "",
    step: 1,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [showRecovery, setShowRecovery] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const success = await login(loginForm.email, loginForm.password);

    setIsLoading(false);

    if (success) {
      toast.success("Login realizado com sucesso!");
      onOpenChange(false);
      setLoginForm({ email: "", password: "" });
    } else {
      toast.error("Email ou senha inválidos");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    if (registerForm.password !== registerForm.confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    if (registerForm.password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    // Validação de CPF (formato)
    const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
    if (!cpfRegex.test(registerForm.cpf)) {
      toast.error("CPF inválido. Use o formato: 000.000.000-00");
      return;
    }

    // Validação de telefone (formato)
    const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
    if (!phoneRegex.test(registerForm.phone)) {
      toast.error("Telefone inválido. Use o formato: (00) 00000-0000");
      return;
    }

    // Validação de data de nascimento
    if (!registerForm.birthDate) {
      toast.error("Data de nascimento é obrigatória");
      return;
    }

    const birthDate = new Date(registerForm.birthDate);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    if (age < 18) {
      toast.error("Você deve ter pelo menos 18 anos");
      return;
    }

    setIsLoading(true);

    const success = await register(
      registerForm.name,
      registerForm.email,
      registerForm.cpf,
      registerForm.phone,
      registerForm.birthDate,
      registerForm.password
    );

    setIsLoading(false);

    if (success) {
      toast.success("Cadastro realizado com sucesso!");
      onOpenChange(false);
      setRegisterForm({
        name: "",
        email: "",
        cpf: "",
        phone: "",
        birthDate: "",
        password: "",
        confirmPassword: "",
      });
    } else {
      toast.error("Erro ao realizar cadastro");
    }
  };

  const handleSendRecoveryCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Mock envio de código
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsLoading(false);
    setRecoveryForm({ ...recoveryForm, step: 2 });
    toast.success("Código enviado!", {
      description: "Verifique seu email ou SMS. Código de teste: 123456",
    });
  };

  const handleValidateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Mock validação de código
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsLoading(false);

    if (recoveryForm.code === "123456") {
      toast.success("Código validado!", {
        description: "Você já pode fazer login com sua nova senha temporária.",
      });
      setRecoveryForm({ emailOrPhone: "", code: "", step: 1 });
      setShowRecovery(false);
      onOpenChange(false);
    } else {
      toast.error("Código inválido");
    }
  };

  // Máscaras para CPF e Telefone
  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");
  };

  const formatPhone = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4,5})(\d{4})$/, "$1-$2");
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Acesse sua conta</DialogTitle>
            <DialogDescription>
              Entre com sua conta existente ou crie uma nova
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Cadastro</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={loginForm.email}
                    onChange={(e) =>
                      setLoginForm({ ...loginForm, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="login-password">Senha</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginForm.password}
                    onChange={(e) =>
                      setLoginForm({ ...loginForm, password: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setShowRecovery(true)}
                    className="text-sm text-purple-600 hover:text-purple-700 hover:underline"
                  >
                    Esqueceu sua senha?
                  </button>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-900">
                  <p className="mb-1">💡 Contas de teste:</p>
                  <p>Admin: admin@teatrorecife.com.br / admin123</p>
                  <p>Usuário: qualquer email / min. 6 caracteres</p>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  <LogIn className="mr-2 h-4 w-4" />
                  {isLoading ? "Entrando..." : "Entrar"}
                </Button>
                <div className="text-center pt-2">
                  <p className="text-sm text-gray-600">
                    Não tem uma conta?{" "}
                    <button
                      type="button"
                      onClick={() => setActiveTab("register")}
                      className="text-purple-600 hover:text-purple-700 hover:underline"
                    >
                      Cadastre-se aqui
                    </button>
                  </p>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <Label htmlFor="register-name">Nome completo *</Label>
                  <Input
                    id="register-name"
                    placeholder="Seu nome completo"
                    value={registerForm.name}
                    onChange={(e) =>
                      setRegisterForm({ ...registerForm, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="register-cpf">CPF *</Label>
                  <Input
                    id="register-cpf"
                    placeholder="000.000.000-00"
                    value={registerForm.cpf}
                    onChange={(e) =>
                      setRegisterForm({
                        ...registerForm,
                        cpf: formatCPF(e.target.value),
                      })
                    }
                    maxLength={14}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="register-phone">Telefone *</Label>
                  <Input
                    id="register-phone"
                    placeholder="(00) 00000-0000"
                    value={registerForm.phone}
                    onChange={(e) =>
                      setRegisterForm({
                        ...registerForm,
                        phone: formatPhone(e.target.value),
                      })
                    }
                    maxLength={15}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="register-email">Email *</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={registerForm.email}
                    onChange={(e) =>
                      setRegisterForm({
                        ...registerForm,
                        email: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="register-birthDate">
                    Data de Nascimento *
                  </Label>
                  <Input
                    id="register-birthDate"
                    type="date"
                    value={registerForm.birthDate}
                    onChange={(e) =>
                      setRegisterForm({
                        ...registerForm,
                        birthDate: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="register-password">Senha *</Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={registerForm.password}
                    onChange={(e) =>
                      setRegisterForm({
                        ...registerForm,
                        password: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="register-confirm">Confirmar senha *</Label>
                  <Input
                    id="register-confirm"
                    type="password"
                    placeholder="Confirme sua senha"
                    value={registerForm.confirmPassword}
                    onChange={(e) =>
                      setRegisterForm({
                        ...registerForm,
                        confirmPassword: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  {isLoading ? "Cadastrando..." : "Criar Conta"}
                </Button>
                <div className="text-center pt-2">
                  <p className="text-sm text-gray-600">
                    Já tem uma conta?{" "}
                    <button
                      type="button"
                      onClick={() => setActiveTab("login")}
                      className="text-purple-600 hover:text-purple-700 hover:underline"
                    >
                      Faça login aqui
                    </button>
                  </p>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Recovery Password Dialog */}
      <AlertDialog open={showRecovery} onOpenChange={setShowRecovery}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-purple-600" />
              Recuperar Senha
            </AlertDialogTitle>
            <AlertDialogDescription>
              {recoveryForm.step === 1
                ? "Digite seu email ou telefone cadastrado para receber o código de recuperação."
                : "Digite o código enviado para seu email ou telefone."}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {recoveryForm.step === 1 ? (
            <form onSubmit={handleSendRecoveryCode} className="space-y-4">
              <div>
                <Label htmlFor="recovery-contact">Email ou Telefone</Label>
                <Input
                  id="recovery-contact"
                  placeholder="seu@email.com ou (00) 00000-0000"
                  value={recoveryForm.emailOrPhone}
                  onChange={(e) =>
                    setRecoveryForm({
                      ...recoveryForm,
                      emailOrPhone: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg text-sm text-yellow-900">
                <p>
                  ℹ️ Um código será enviado para o email ou telefone informado.
                </p>
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  <KeyRound className="mr-2 h-4 w-4" />
                  {isLoading ? "Enviando..." : "Enviar Código"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowRecovery(false);
                    setRecoveryForm({ emailOrPhone: "", code: "", step: 1 });
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleValidateCode} className="space-y-4">
              <div>
                <Label htmlFor="recovery-code">Código de Verificação</Label>
                <Input
                  id="recovery-code"
                  placeholder="Digite o código recebido"
                  value={recoveryForm.code}
                  onChange={(e) =>
                    setRecoveryForm({ ...recoveryForm, code: e.target.value })
                  }
                  required
                />
              </div>
              <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-900">
                <p>💡 Código de teste: 123456</p>
                <p className="text-xs mt-1">
                  Em produção, este código seria enviado por email/SMS
                </p>
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? "Validando..." : "Validar Código"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setRecoveryForm({ emailOrPhone: "", code: "", step: 1 })
                  }
                >
                  Voltar
                </Button>
              </div>
            </form>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
