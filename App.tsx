import { useState } from "react";
import { AuthProvider, useAuth } from "./src/contexts/AuthContext";
import { Header } from "./src/components/Header";
import { EventsView } from "./src/components/EventsView";
import { EventDetails } from "./src/components/EventDetails";
import { SeatSelection } from "./src/components/SeatSelection";
import { SpacesView } from "./src/components/SpacesView";
import { CalendarView } from "./src/components/CalendarView";
import { AdminDashboard } from "./src/components/AdminDashboard";
import { AdminSpaceManagement } from "./src/components/AdminSpaceManagement";
import { NotificationsView } from "./src/components/NotificationsView";
import { UserArea } from "./src/components/UserArea";
import { AuthModal } from "./src/components/AuthModal";
import { HelpCenter } from "./src/components/HelpCenter";
import {
  events as initialEvents,
  spaces,
  notifications as initialNotifications,
  spaceRentals as initialRentals,
  bookings as initialBookings,
} from "./src/data/mockData";
import { Event, SpaceRental, Booking, FavoriteEvent } from "./src/types";
import { Toaster } from "./src/components/ui/sonner";
import { toast } from "sonner";

function AppContent() {
  const { user, isAdmin } = useAuth();
  const [currentView, setCurrentView] = useState("home");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [rentals, setRentals] = useState<SpaceRental[]>(initialRentals);
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [favorites, setFavorites] = useState<FavoriteEvent[]>([]);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const handleEventSelect = (event: Event) => {
    setSelectedEvent(event);
    setCurrentView("event-details");
  };

  const handleSelectSeats = () => {
    if (!user) {
      toast.error("Faça login para comprar ingressos");
      setAuthModalOpen(true);
      return;
    }
    setCurrentView("seat-selection");
  };

  const handlePurchase = (seats: string[], totalPrice: number) => {
    if (!selectedEvent) return;

    const newBooking: Booking = {
      id: Date.now().toString(),
      eventId: selectedEvent.id,
      eventTitle: selectedEvent.title,
      eventImage: selectedEvent.image,
      date: selectedEvent.date,
      time: selectedEvent.time,
      seats,
      totalPrice,
      status: "confirmed",
      purchaseDate: new Date().toISOString().split("T")[0],
    };

    setBookings([...bookings, newBooking]);

    toast.success("Compra realizada com sucesso!", {
      description: `${seats.length} ingresso(s) para "${selectedEvent.title}". Verifique seus e-tickets na área do usuário.`,
    });

    setCurrentView("my-area");
  };

  const handleCancelBooking = (bookingId: string) => {
    setBookings(
      bookings.map((b) =>
        b.id === bookingId ? { ...b, status: "cancelled" } : b
      )
    );
  };

  const handleBackToEvents = () => {
    setSelectedEvent(null);
    setCurrentView("home");
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const handleApproveRental = (id: string) => {
    setRentals(
      rentals.map((r) => (r.id === id ? { ...r, status: "approved" } : r))
    );
  };

  const handleRejectRental = (id: string) => {
    setRentals(
      rentals.map((r) => (r.id === id ? { ...r, status: "rejected" } : r))
    );
  };

  const handleToggleFavorite = (eventId: string) => {
    const isFavorite = favorites.some((f) => f.eventId === eventId);
    if (isFavorite) {
      setFavorites(favorites.filter((f) => f.eventId !== eventId));
    } else {
      setFavorites([
        ...favorites,
        { eventId, addedDate: new Date().toISOString() },
      ]);
    }
  };

  const handleRemoveFavorite = (eventId: string) => {
    setFavorites(favorites.filter((f) => f.eventId !== eventId));
    toast.success("Removido dos favoritos");
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const renderView = () => {
    // Public views
    if (currentView === "home") {
      return (
        <EventsView events={initialEvents} onEventSelect={handleEventSelect} />
      );
    }

    if (currentView === "event-details" && selectedEvent) {
      const isFavorite = favorites.some((f) => f.eventId === selectedEvent.id);
      return (
        <EventDetails
          event={selectedEvent}
          onBack={handleBackToEvents}
          onSelectSeats={handleSelectSeats}
          isFavorite={isFavorite}
          onToggleFavorite={() => handleToggleFavorite(selectedEvent.id)}
        />
      );
    }

    if (currentView === "seat-selection" && selectedEvent) {
      return (
        <SeatSelection
          event={selectedEvent}
          onBack={() => setCurrentView("event-details")}
          onPurchase={handlePurchase}
        />
      );
    }

    if (currentView === "calendar") {
      return (
        <CalendarView
          events={initialEvents}
          onEventSelect={handleEventSelect}
        />
      );
    }

    if (currentView === "spaces") {
      return <SpacesView spaces={spaces} />;
    }

    if (currentView === "notifications") {
      return (
        <NotificationsView
          notifications={notifications}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
        />
      );
    }

    if (currentView === "help") {
      return <HelpCenter />;
    }

    // User views
    if (currentView === "my-area" && user && !isAdmin) {
      return (
        <UserArea
          bookings={bookings}
          favorites={favorites}
          events={initialEvents}
          onEventSelect={handleEventSelect}
          onRemoveFavorite={handleRemoveFavorite}
          onCancelBooking={handleCancelBooking}
        />
      );
    }

    // Admin views
    if (currentView === "admin-dashboard" && isAdmin) {
      return <AdminDashboard events={initialEvents} spaces={spaces} />;
    }

    if (currentView === "admin-rentals" && isAdmin) {
      return (
        <AdminSpaceManagement
          rentals={rentals}
          onApprove={handleApproveRental}
          onReject={handleRejectRental}
        />
      );
    }

    // Default fallback
    return (
      <EventsView events={initialEvents} onEventSelect={handleEventSelect} />
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        currentView={currentView}
        onViewChange={setCurrentView}
        unreadNotifications={unreadCount}
        onLoginClick={() => setAuthModalOpen(true)}
      />

      <main className="container mx-auto px-4 py-8">{renderView()}</main>

      <footer className="bg-white border-t mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">🎭</span>
                </div>
                <h3 className="text-gray-900">Teatro Recife</h3>
              </div>
              <p className="text-sm text-gray-600">
                Sistema integrado de gestão para teatros, facilitando a conexão
                entre artistas e público.
              </p>
            </div>

            <div>
              <h4 className="text-gray-900 mb-4">Navegação</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <button
                    onClick={() => setCurrentView("home")}
                    className="hover:text-purple-600"
                  >
                    Eventos
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setCurrentView("calendar")}
                    className="hover:text-purple-600"
                  >
                    Calendário
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setCurrentView("spaces")}
                    className="hover:text-purple-600"
                  >
                    Espaços
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setCurrentView("help")}
                    className="hover:text-purple-600"
                  >
                    Central de Ajuda
                  </button>
                </li>
                {user && (
                  <li>
                    <button
                      onClick={() => setCurrentView("my-area")}
                      className="hover:text-purple-600"
                    >
                      Minha Área
                    </button>
                  </li>
                )}
              </ul>
            </div>

            <div>
              <h4 className="text-gray-900 mb-4">Contato</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>📧 contato@teatrorecife.com.br</li>
                <li>📱 (81) 3333-4444</li>
                <li>📍 Recife - PE, Brasil</li>
              </ul>
            </div>

            <div>
              <h4 className="text-gray-900 mb-4">Horário de Funcionamento</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Segunda a Sexta: 10h - 22h</li>
                <li>Sábado e Domingo: 14h - 22h</li>
                <li>Bilheteria abre 1h antes dos eventos</li>
              </ul>
            </div>
          </div>

          <div className="border-t mt-8 pt-8 text-center text-sm text-gray-600">
            <p>
              © 2025 Teatro Recife - Sistema de Gestão Integrada. Todos os
              direitos reservados.
            </p>
          </div>
        </div>
      </footer>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
      <Toaster position="top-right" />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
