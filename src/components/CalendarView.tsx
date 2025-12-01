import { useState } from "react";
import { Event } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react";
import { Button } from "./ui/button";

interface CalendarViewProps {
  events: Event[];
  onEventSelect: (event: Event) => void;
}

export function CalendarView({ events, onEventSelect }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 10, 1)); // November 2025

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const monthNames = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const previousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const getEventsForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1
    ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.filter((event) => event.date === dateStr);
  };

  const renderCalendarDays = () => {
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(
        <div key={`empty-${i}`} className="min-h-24 bg-gray-50 rounded-lg" />
      );
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = getEventsForDate(day);
      const isToday = day === 2 && currentDate.getMonth() === 10; // Nov 2, 2025

      days.push(
        <div
          key={day}
          className={`min-h-24 p-2 rounded-lg border transition-colors ${
            isToday
              ? "bg-purple-50 border-purple-300"
              : "bg-white hover:bg-gray-50"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span
              className={`text-sm ${
                isToday ? "text-purple-900" : "text-gray-900"
              }`}
            >
              {day}
            </span>
            {dayEvents.length > 0 && (
              <Badge variant="outline" className="text-xs h-5">
                {dayEvents.length}
              </Badge>
            )}
          </div>
          <div className="space-y-1">
            {dayEvents.slice(0, 2).map((event) => (
              <button
                key={event.id}
                onClick={() => onEventSelect(event)}
                className="w-full text-left p-1 rounded text-xs bg-gradient-to-r from-purple-100 to-blue-100 hover:from-purple-200 hover:to-blue-200 transition-colors"
              >
                <p className="text-purple-900 truncate">{event.time}</p>
                <p className="text-gray-700 truncate">{event.title}</p>
              </button>
            ))}
            {dayEvents.length > 2 && (
              <p className="text-xs text-gray-500 pl-1">
                +{dayEvents.length - 2} mais
              </p>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  const upcomingEvents = events
    .filter((event) => new Date(event.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-gray-900 mb-2">Calendário de Eventos</h2>
        <p className="text-gray-600">Visualize toda a programação do teatro</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-gray-900">
                  {monthNames[currentDate.getMonth()]}{" "}
                  {currentDate.getFullYear()}
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={previousMonth}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={nextMonth}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2 mb-2">
                {weekDays.map((day) => (
                  <div
                    key={day}
                    className="text-center text-sm text-gray-600 py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {renderCalendarDays()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Events Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <CalendarIcon className="h-5 w-5" />
                Próximos Eventos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <button
                    key={event.id}
                    onClick={() => onEventSelect(event)}
                    className="w-full text-left p-3 rounded-lg border hover:border-purple-300 hover:bg-purple-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="outline" className="text-xs">
                        {event.category}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(event.date).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </span>
                    </div>
                    <p className="text-gray-900 mb-1">{event.title}</p>
                    <p className="text-sm text-gray-600">
                      {event.time} • {event.space}
                    </p>
                  </button>
                ))}
                {upcomingEvents.length === 0 && (
                  <p className="text-center text-gray-500 py-8">
                    Nenhum evento agendado
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Legend */}
      <Card className="bg-gray-50">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-6 items-center justify-center text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-50 border border-purple-300 rounded"></div>
              <span className="text-gray-600">Dia atual</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-r from-purple-100 to-blue-100 rounded"></div>
              <span className="text-gray-600">Evento agendado</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs h-5">
                2
              </Badge>
              <span className="text-gray-600">Número de eventos no dia</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
