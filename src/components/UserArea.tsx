import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Booking, Event, FavoriteEvent } from "../types";
import {
  Calendar,
  Heart,
  History,
  Download,
  Star,
  Ticket,
  User as UserIcon,
  AlertCircle,
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

interface UserAreaProps {
  bookings: Booking[];
  favorites: FavoriteEvent[];
  events: Event[];
  onEventSelect: (event: Event) => void;
  onRemoveFavorite: (eventId: string) => void;
  onCancelBooking?: (bookingId: string) => void;
}

export function UserArea({
  bookings,
  favorites,
  events,
  onEventSelect,
  onRemoveFavorite,
  onCancelBooking,
}: UserAreaProps) {
  const { user, updateProfile } = useAuth();
  const [feedbackRatings, setFeedbackRatings] = useState<
    Record<string, number>
  >({});
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    cpf: user?.cpf || "",
    phone: user?.phone || "",
    birthDate: user?.birthDate || "",
  });
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);

  const favoriteEvents = events.filter((e) =>
    favorites.some((f) => f.eventId === e.id)
  );
  const upcomingBookings = bookings.filter(
    (b) => b.status === "confirmed" && new Date(b.date) >= new Date()
  );
  const pastBookings = bookings.filter((b) => new Date(b.date) < new Date());

  const handleDownloadTicket = (booking: Booking) => {
    toast.success("E-ticket baixado com sucesso!", {
      description: `Ingresso para ${booking.eventTitle} salvo em seus downloads.`,
    });
  };

  const handleRating = (bookingId: string, rating: number) => {
    setFeedbackRatings({ ...feedbackRatings, [bookingId]: rating });
    toast.success("Avaliação enviada!", {
      description: "Obrigado pelo seu feedback.",
    });
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
    if (!cpfRegex.test(profileForm.cpf)) {
      toast.error("CPF inválido. Use o formato: 000.000.000-00");
      return;
    }

    const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
    if (!phoneRegex.test(profileForm.phone)) {
      toast.error("Telefone inválido. Use o formato: (00) 00000-0000");
      return;
    }

    const success = await updateProfile(profileForm);

    if (success) {
      toast.success("Perfil atualizado com sucesso!");
      setIsEditingProfile(false);
    } else {
      toast.error("Erro ao atualizar perfil");
    }
  };

  const handleCancelBooking = () => {
    if (bookingToCancel && onCancelBooking) {
      onCancelBooking(bookingToCancel);
      toast.success("Compra cancelada com sucesso!", {
        description: "O valor será estornado em até 5 dias úteis.",
      });
    }
    setCancelDialogOpen(false);
    setBookingToCancel(null);
  };

  const openCancelDialog = (bookingId: string) => {
    setBookingToCancel(bookingId);
    setCancelDialogOpen(true);
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

  const getStatusBadge = (status: Booking["status"]) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-500">Confirmado</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500">Pendente</Badge>;
      case "cancelled":
        return <Badge className="bg-red-500">Cancelado</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-gray-900 mb-2">Minha Área</h2>
        <p className="text-gray-600">
          Gerencie suas compras, favoritos e preferências
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-gray-600">
              Total de Ingressos
            </CardTitle>
            <Ticket className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-gray-900">{bookings.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-gray-600">
              Eventos Favoritos
            </CardTitle>
            <Heart className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-gray-900">{favorites.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-gray-600">
              Próximos Eventos
            </CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-gray-900">{upcomingBookings.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="bookings">
        <TabsList>
          <TabsTrigger value="bookings">
            <Ticket className="h-4 w-4 mr-2" />
            Meus Ingressos ({bookings.length})
          </TabsTrigger>
          <TabsTrigger value="favorites">
            <Heart className="h-4 w-4 mr-2" />
            Favoritos ({favorites.length})
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="h-4 w-4 mr-2" />
            Histórico
          </TabsTrigger>
          <TabsTrigger value="profile">
            <UserIcon className="h-4 w-4 mr-2" />
            Meu Perfil
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bookings" className="space-y-4 mt-6">
          {upcomingBookings.length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-gray-900">Próximos Eventos</h3>
              {upcomingBookings.map((booking) => (
                <Card key={booking.id}>
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="w-full md:w-32 h-32 rounded-lg overflow-hidden flex-shrink-0">
                        <ImageWithFallback
                          src={booking.eventImage}
                          alt={booking.eventTitle}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="text-gray-900 mb-1">
                              {booking.eventTitle}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {new Date(booking.date).toLocaleDateString(
                                "pt-BR"
                              )}{" "}
                              às {booking.time}
                            </p>
                          </div>
                          {getStatusBadge(booking.status)}
                        </div>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {booking.seats.map((seat) => (
                            <Badge key={seat} variant="outline">
                              {seat}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <span className="text-gray-900">
                            R$ {booking.totalPrice.toFixed(2)}
                          </span>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleDownloadTicket(booking)}
                              variant="outline"
                              size="sm"
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Baixar E-ticket
                            </Button>
                            <Button
                              onClick={() => openCancelDialog(booking.id)}
                              variant="destructive"
                              size="sm"
                            >
                              Cancelar Compra
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                <Ticket className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Você não tem ingressos para próximos eventos</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="favorites" className="space-y-4 mt-6">
          {favoriteEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {favoriteEvents.map((event) => (
                <Card key={event.id} className="overflow-hidden">
                  <div className="relative h-48">
                    <ImageWithFallback
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 bg-white/90 hover:bg-white"
                      onClick={() => onRemoveFavorite(event.id)}
                    >
                      <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                    </Button>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-gray-900">
                      {event.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {event.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">
                          {new Date(event.date).toLocaleDateString("pt-BR")}
                        </p>
                        <p className="text-gray-900">
                          R$ {event.price.toFixed(2)}
                        </p>
                      </div>
                      <Button onClick={() => onEventSelect(event)}>
                        Ver Detalhes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                <Heart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Você ainda não tem eventos favoritos</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4 mt-6">
          {pastBookings.length > 0 ? (
            <div className="space-y-4">
              {pastBookings.map((booking) => (
                <Card key={booking.id}>
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="w-full md:w-32 h-32 rounded-lg overflow-hidden flex-shrink-0">
                        <ImageWithFallback
                          src={booking.eventImage}
                          alt={booking.eventTitle}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="text-gray-900 mb-1">
                              {booking.eventTitle}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {new Date(booking.date).toLocaleDateString(
                                "pt-BR"
                              )}{" "}
                              às {booking.time}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Comprado em{" "}
                              {new Date(
                                booking.purchaseDate
                              ).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                        </div>

                        {/* Rating */}
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600 mb-2">
                            Avalie este evento:
                          </p>
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((rating) => (
                              <button
                                key={rating}
                                onClick={() => handleRating(booking.id, rating)}
                                className="transition-transform hover:scale-110"
                              >
                                <Star
                                  className={`h-6 w-6 ${
                                    (feedbackRatings[booking.id] || 0) >= rating
                                      ? "fill-yellow-500 text-yellow-500"
                                      : "text-gray-300"
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                <History className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Seu histórico está vazio</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="profile" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Meu Perfil</CardTitle>
              <CardDescription>
                Atualize suas informações pessoais
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!isEditingProfile ? (
                <div className="space-y-4">
                  <div>
                    <Label className="text-gray-600">Nome</Label>
                    <p className="text-gray-900">{user?.name}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Email</Label>
                    <p className="text-gray-900">{user?.email}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">CPF</Label>
                    <p className="text-gray-900">{user?.cpf}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Telefone</Label>
                    <p className="text-gray-900">{user?.phone}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Data de Nascimento</Label>
                    <p className="text-gray-900">
                      {user?.birthDate
                        ? new Date(user.birthDate).toLocaleDateString("pt-BR")
                        : "-"}
                    </p>
                  </div>
                  <Button onClick={() => setIsEditingProfile(true)}>
                    Editar Perfil
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <Label htmlFor="profile-name">Nome completo</Label>
                    <Input
                      id="profile-name"
                      value={profileForm.name}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="profile-email">Email</Label>
                    <Input
                      id="profile-email"
                      type="email"
                      value={profileForm.email}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          email: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="profile-cpf">CPF</Label>
                    <Input
                      id="profile-cpf"
                      value={profileForm.cpf}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          cpf: formatCPF(e.target.value),
                        })
                      }
                      maxLength={14}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="profile-phone">Telefone</Label>
                    <Input
                      id="profile-phone"
                      value={profileForm.phone}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          phone: formatPhone(e.target.value),
                        })
                      }
                      maxLength={15}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="profile-birthDate">
                      Data de Nascimento
                    </Label>
                    <Input
                      id="profile-birthDate"
                      type="date"
                      value={profileForm.birthDate}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          birthDate: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit">Salvar Alterações</Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditingProfile(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Cancel Booking Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Cancelar Compra
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja cancelar esta compra? Esta ação não pode
              ser desfeita. O valor será estornado em até 5 dias úteis de acordo
              com as regras de cancelamento.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Não, manter compra</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelBooking}
              className="bg-red-500 hover:bg-red-600"
            >
              Sim, cancelar compra
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
