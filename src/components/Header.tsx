import {
  Calendar,
  Home,
  Building2,
  LayoutDashboard,
  Bell,
  Menu,
  User,
  LogOut,
  Heart,
  HelpCircle,
} from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Badge } from "./ui/badge";
import { useAuth } from "../contexts/AuthContext";
import { Avatar, AvatarFallback } from "./ui/avatar";

interface HeaderProps {
  currentView: string;
  onViewChange: (view: string) => void;
  unreadNotifications: number;
  onLoginClick: () => void;
}

export function Header({
  currentView,
  onViewChange,
  unreadNotifications,
  onLoginClick,
}: HeaderProps) {
  const { user, logout, isAdmin } = useAuth();

  const publicNavItems = [
    { id: "home", label: "Eventos", icon: Home },
    { id: "calendar", label: "Calendário", icon: Calendar },
    { id: "spaces", label: "Espaços", icon: Building2 },
    { id: "help", label: "Ajuda", icon: HelpCircle },
  ];

  const userNavItems = [
    ...publicNavItems,
    { id: "my-area", label: "Minha Área", icon: User },
    { id: "notifications", label: "Notificações", icon: Bell },
  ];

  const adminNavItems = [
    { id: "home", label: "Eventos", icon: Home },
    { id: "calendar", label: "Calendário", icon: Calendar },
    { id: "spaces", label: "Espaços", icon: Building2 },
    { id: "admin-dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "admin-rentals", label: "Locações", icon: Building2 },
    { id: "notifications", label: "Notificações", icon: Bell },
    { id: "help", label: "Ajuda", icon: HelpCircle },
  ];

  const navItems = isAdmin
    ? adminNavItems
    : user
    ? userNavItems
    : publicNavItems;

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => onViewChange("home")}
            className="flex items-center gap-2"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white">🎭</span>
            </div>
            <div>
              <h1 className="text-purple-900">EncenaPE</h1>
              <p className="text-sm text-gray-600">
                Sistema de Gestão Integrada
              </p>
            </div>
          </button>

          <div className="flex items-center gap-2">
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={currentView === item.id ? "default" : "ghost"}
                    onClick={() => onViewChange(item.id)}
                    className="relative"
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {item.label}
                    {item.id === "notifications" && unreadNotifications > 0 && (
                      <Badge className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-red-500">
                        {unreadNotifications}
                      </Badge>
                    )}
                  </Button>
                );
              })}
            </nav>

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full"
                  >
                    <Avatar>
                      <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-600">{user.email}</p>
                      {isAdmin && (
                        <Badge className="w-fit text-xs">Administrador</Badge>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {!isAdmin && (
                    <DropdownMenuItem onClick={() => onViewChange("my-area")}>
                      <User className="mr-2 h-4 w-4" />
                      Minha Área
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={() => onViewChange("notifications")}
                  >
                    <Bell className="mr-2 h-4 w-4" />
                    Notificações
                    {unreadNotifications > 0 && (
                      <Badge className="ml-auto bg-red-500">
                        {unreadNotifications}
                      </Badge>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={onLoginClick} className="hidden md:flex">
                <User className="mr-2 h-4 w-4" />
                Entrar
              </Button>
            )}

            {/* Mobile Navigation */}
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="outline" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="flex flex-col gap-4 mt-8">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Button
                        key={item.id}
                        variant={currentView === item.id ? "default" : "ghost"}
                        onClick={() => onViewChange(item.id)}
                        className="w-full justify-start relative"
                      >
                        <Icon className="mr-2 h-4 w-4" />
                        {item.label}
                        {item.id === "notifications" &&
                          unreadNotifications > 0 && (
                            <Badge className="ml-auto h-5 w-5 rounded-full p-0 flex items-center justify-center bg-red-500">
                              {unreadNotifications}
                            </Badge>
                          )}
                      </Button>
                    );
                  })}
                  {!user && (
                    <Button
                      onClick={onLoginClick}
                      className="w-full justify-start"
                    >
                      <User className="mr-2 h-4 w-4" />
                      Entrar
                    </Button>
                  )}
                  {user && (
                    <Button
                      onClick={logout}
                      variant="ghost"
                      className="w-full justify-start"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sair
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
