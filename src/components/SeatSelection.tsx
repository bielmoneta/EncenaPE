import { useState } from "react";
import { Event, Seat } from "../types";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

interface SeatSelectionProps {
  event: Event;
  onBack: () => void;
  onPurchase: (seats: string[], totalPrice: number) => void;
}

export function SeatSelection({
  event,
  onBack,
  onPurchase,
}: SeatSelectionProps) {
  const [seats, setSeats] = useState<Seat[][]>(
    event.seats || generateSeats(event)
  );

  function generateSeats(event: Event): Seat[][] {
    const rows = 10;
    const seatsPerRow = Math.ceil(event.totalSeats / rows);
    const occupied = event.totalSeats - event.availableSeats;

    const seatMap: Seat[][] = [];
    let seatId = 0;
    let occupiedCount = 0;

    for (let row = 0; row < rows; row++) {
      const rowSeats: Seat[] = [];
      for (let num = 0; num < seatsPerRow; num++) {
        if (seatId < event.totalSeats) {
          const isOccupied = occupiedCount < occupied && Math.random() < 0.3;
          if (isOccupied) occupiedCount++;

          rowSeats.push({
            id: `${String.fromCharCode(65 + row)}${num + 1}`,
            row: row,
            number: num + 1,
            status: isOccupied ? "occupied" : "available",
            price: event.price,
          });
          seatId++;
        }
      }
      if (rowSeats.length > 0) {
        seatMap.push(rowSeats);
      }
    }

    return seatMap;
  }

  const handleSeatClick = (rowIndex: number, seatIndex: number) => {
    const newSeats = [...seats];
    const seat = newSeats[rowIndex][seatIndex];

    if (seat.status === "occupied") {
      toast.error("Este assento já está ocupado");
      return;
    }

    seat.status = seat.status === "available" ? "selected" : "available";
    setSeats(newSeats);
  };

  const selectedSeats = seats.flat().filter((s) => s.status === "selected");
  const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

  const handlePurchase = () => {
    if (selectedSeats.length === 0) {
      toast.error("Selecione pelo menos um assento");
      return;
    }

    onPurchase(
      selectedSeats.map((s) => s.id),
      totalPrice
    );
  };

  const getSeatColor = (status: Seat["status"]) => {
    switch (status) {
      case "selected":
        return "bg-purple-600 hover:bg-purple-700 text-white";
      case "occupied":
        return "bg-gray-300 cursor-not-allowed text-gray-500";
      default:
        return "bg-white hover:bg-purple-100 border-2 border-gray-300 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Selecione seus assentos</span>
                <Badge variant="outline">
                  {event.availableSeats} disponíveis
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Stage */}
              <div className="mb-8">
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-center py-3 rounded-lg mb-2">
                  🎭 PALCO
                </div>
                <div className="h-1 bg-gradient-to-r from-purple-200 via-blue-200 to-purple-200 rounded"></div>
              </div>

              {/* Seats */}
              <div className="space-y-2 overflow-x-auto pb-4">
                {seats.map((row, rowIndex) => (
                  <div
                    key={rowIndex}
                    className="flex items-center gap-2 justify-center"
                  >
                    <span className="text-sm text-gray-600 w-8 text-right">
                      {String.fromCharCode(65 + rowIndex)}
                    </span>
                    <div className="flex gap-2">
                      {row.map((seat, seatIndex) => (
                        <button
                          key={seat.id}
                          onClick={() => handleSeatClick(rowIndex, seatIndex)}
                          disabled={seat.status === "occupied"}
                          className={`w-8 h-8 rounded-t-lg text-xs transition-all ${getSeatColor(
                            seat.status
                          )}`}
                          title={`Assento ${seat.id} - R$ ${seat.price}`}
                        >
                          {seat.number}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-6 justify-center mt-8 pt-6 border-t">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-white border-2 border-gray-300 rounded-t-lg"></div>
                  <span className="text-sm text-gray-600">Disponível</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-purple-600 rounded-t-lg"></div>
                  <span className="text-sm text-gray-600">Selecionado</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gray-300 rounded-t-lg"></div>
                  <span className="text-sm text-gray-600">Ocupado</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <Card>
              <CardHeader>
                <CardTitle>Resumo da Compra</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-gray-900 mb-2">{event.title}</h4>
                  <p className="text-sm text-gray-600">
                    {new Date(event.date).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-sm text-gray-600">
                    {event.time} • {event.space}
                  </p>
                </div>

                {selectedSeats.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm text-gray-600 mb-2">
                      Assentos selecionados:
                    </h4>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {selectedSeats.map((seat) => (
                        <Badge key={seat.id} variant="secondary">
                          {seat.id}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t pt-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Quantidade</span>
                    <span className="text-gray-900">
                      {selectedSeats.length} ingresso(s)
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Valor unitário</span>
                    <span className="text-gray-900">
                      R$ {event.price.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-gray-900">Total</span>
                    <span className="text-gray-900">
                      R$ {totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handlePurchase}
                  disabled={selectedSeats.length === 0}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Finalizar Compra
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
