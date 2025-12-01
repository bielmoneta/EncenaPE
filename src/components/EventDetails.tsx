import { useState } from "react";
import { Event } from "../types";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Heart,
  ShoppingCart,
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";

interface EventDetailsProps {
  event: Event;
  onBack: () => void;
  onSelectSeats: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export function EventDetails({
  event,
  onBack,
  onSelectSeats,
  isFavorite = false,
  onToggleFavorite,
}: EventDetailsProps) {
  const { user } = useAuth();
  const occupancyPercentage =
    ((event.totalSeats - event.availableSeats) / event.totalSeats) * 100;

  const handleToggleFavorite = () => {
    if (!user) {
      toast.error("Faça login para adicionar aos favoritos");
      return;
    }
    if (onToggleFavorite) {
      onToggleFavorite();
      toast.success(
        isFavorite ? "Removido dos favoritos" : "Adicionado aos favoritos"
      );
    }
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar aos eventos
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="relative h-96 rounded-lg overflow-hidden">
            <ImageWithFallback
              src={event.image}
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <Badge className="absolute top-4 left-4 bg-white text-gray-900">
              {event.category}
            </Badge>
            {user && onToggleFavorite && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 bg-white/90 hover:bg-white"
                onClick={handleToggleFavorite}
              >
                <Heart
                  className={`h-5 w-5 ${
                    isFavorite ? "fill-red-500 text-red-500" : "text-gray-700"
                  }`}
                />
              </Button>
            )}
          </div>

          <div>
            <h1 className="text-gray-900 mb-4">{event.title}</h1>
            <p className="text-gray-600">{event.description}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <Calendar className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <p className="text-sm text-gray-600 mb-1">Data</p>
                <p className="text-gray-900">
                  {new Date(event.date).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "short",
                  })}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <Clock className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <p className="text-sm text-gray-600 mb-1">Horário</p>
                <p className="text-gray-900">{event.time}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <MapPin className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <p className="text-sm text-gray-600 mb-1">Local</p>
                <p className="text-gray-900">{event.space}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <Users className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <p className="text-sm text-gray-600 mb-1">Duração</p>
                <p className="text-gray-900">{event.duration}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Informações Adicionais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-gray-600">
              <p>• Classificação: Livre</p>
              <p>• Idioma: Português</p>
              <p>• Acessibilidade: Rampa de acesso e banheiros adaptados</p>
              <p>• Estacionamento disponível</p>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Purchase */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <Card>
              <CardHeader>
                <CardTitle>Adquirir Ingressos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">
                      Disponibilidade
                    </span>
                    <span className="text-gray-900">
                      {event.availableSeats} lugares
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${occupancyPercentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {occupancyPercentage.toFixed(0)}% ocupado
                  </p>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Valor a partir de</span>
                    <span className="text-gray-900">
                      R$ {event.price.toFixed(2)}
                    </span>
                  </div>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={onSelectSeats}
                  disabled={event.availableSeats === 0}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Selecionar Assentos
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  Pagamento seguro • Cancelamento até 24h antes
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
