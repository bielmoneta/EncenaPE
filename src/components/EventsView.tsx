import { useState } from "react";
import { Event } from "../types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Calendar, Clock, MapPin, Users, Search } from "lucide-react";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface EventsViewProps {
  events: Event[];
  onEventSelect: (event: Event) => void;
}

export function EventsView({ events, onEventSelect }: EventsViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    "all",
    ...Array.from(new Set(events.map((e) => e.category))),
  ];

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getOccupancyColor = (available: number, total: number) => {
    const percentage = (available / total) * 100;
    if (percentage > 50) return "bg-green-500";
    if (percentage > 20) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-gray-900 mb-2">Eventos em Cartaz</h2>
        <p className="text-gray-600">
          Explore nossa programação e adquira seus ingressos
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar eventos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {categories
              .filter((c) => c !== "all")
              .map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event) => (
          <Card
            key={event.id}
            className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
          >
            <div className="relative h-48 overflow-hidden">
              <ImageWithFallback
                src={event.image}
                alt={event.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <Badge className="absolute top-4 right-4 bg-white text-gray-900">
                {event.category}
              </Badge>
            </div>
            <CardHeader>
              <CardTitle className="text-gray-900">{event.title}</CardTitle>
              <CardDescription className="line-clamp-2">
                {event.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date(event.date).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>
                    {event.time} • {event.duration}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{event.space}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{event.availableSeats} lugares disponíveis</span>
                  <div
                    className={`ml-auto h-2 w-2 rounded-full ${getOccupancyColor(
                      event.availableSeats,
                      event.totalSeats
                    )}`}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <p className="text-sm text-gray-600">A partir de</p>
                  <p className="text-gray-900">R$ {event.price.toFixed(2)}</p>
                </div>
                <Button onClick={() => onEventSelect(event)}>
                  Ver Detalhes
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">Nenhum evento encontrado.</p>
        </div>
      )}
    </div>
  );
}
