import { Notification } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Bell,
  CheckCheck,
  Info,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface NotificationsViewProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}

export function NotificationsView({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
}: NotificationsViewProps) {
  const unreadNotifications = notifications.filter((n) => !n.read);
  const readNotifications = notifications.filter((n) => n.read);

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getBackgroundColor = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200";
      case "warning":
        return "bg-yellow-50 border-yellow-200";
      default:
        return "bg-blue-50 border-blue-200";
    }
  };

  const NotificationCard = ({
    notification,
  }: {
    notification: Notification;
  }) => (
    <Card
      className={`${
        !notification.read ? "border-l-4 border-l-purple-600" : ""
      }`}
    >
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div
            className={`p-2 rounded-lg ${getBackgroundColor(
              notification.type
            )}`}
          >
            {getIcon(notification.type)}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-gray-900">{notification.title}</h3>
              {!notification.read && (
                <Badge variant="default" className="ml-2">
                  Nova
                </Badge>
              )}
            </div>
            <p className="text-gray-600 mb-2">{notification.message}</p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                {new Date(notification.date).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </span>
              {!notification.read && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onMarkAsRead(notification.id)}
                >
                  Marcar como lida
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900 mb-2">Central de Notificações</h2>
          <p className="text-gray-600">
            Acompanhe atualizações e comunicações importantes
          </p>
        </div>
        {unreadNotifications.length > 0 && (
          <Button onClick={onMarkAllAsRead} variant="outline">
            <CheckCheck className="mr-2 h-4 w-4" />
            Marcar todas como lidas
          </Button>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-gray-600">
              Total de Notificações
            </CardTitle>
            <Bell className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-gray-900">{notifications.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-gray-600">Não Lidas</CardTitle>
            <Badge className="bg-red-500">{unreadNotifications.length}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-gray-900">{unreadNotifications.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-gray-600">Lidas</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-gray-900">{readNotifications.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications List */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">Todas ({notifications.length})</TabsTrigger>
          <TabsTrigger value="unread">
            Não Lidas ({unreadNotifications.length})
          </TabsTrigger>
          <TabsTrigger value="read">
            Lidas ({readNotifications.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-6">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
              />
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Nenhuma notificação</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="unread" className="space-y-4 mt-6">
          {unreadNotifications.length > 0 ? (
            unreadNotifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
              />
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-400" />
                <p>Todas as notificações foram lidas</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="read" className="space-y-4 mt-6">
          {readNotifications.length > 0 ? (
            readNotifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
              />
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Nenhuma notificação lida</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Communication Channels */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle className="text-purple-900">
            Canais de Comunicação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="text-gray-900 mb-2">📧 E-mail</h4>
              <p className="text-sm text-gray-600">
                Atualizações importantes e confirmações de compra
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="text-gray-900 mb-2">🔔 Notificações Push</h4>
              <p className="text-sm text-gray-600">
                Alertas em tempo real sobre eventos e promoções
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="text-gray-900 mb-2">📱 SMS</h4>
              <p className="text-sm text-gray-600">
                Lembretes de eventos próximos
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
