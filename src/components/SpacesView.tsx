import { useState } from "react";
import { Space } from "../types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Users, DollarSign, CheckCircle2, Calendar } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { toast } from "sonner";

interface SpacesViewProps {
  spaces: Space[];
}

export function SpacesView({ spaces }: SpacesViewProps) {
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);
  const [rentalForm, setRentalForm] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    startTime: "",
    endTime: "",
    eventType: "",
    description: "",
  });

  const handleRentalSubmit = (space: Space) => {
    const hours = calculateHours(rentalForm.startTime, rentalForm.endTime);
    const totalCost = hours * space.pricePerHour;

    toast.success("Solicitação de locação enviada!", {
      description: `Reserva da ${space.name} para ${
        rentalForm.date
      }. Valor estimado: R$ ${totalCost.toFixed(
        2
      )}. Entraremos em contato em breve.`,
    });

    setRentalForm({
      name: "",
      email: "",
      phone: "",
      date: "",
      startTime: "",
      endTime: "",
      eventType: "",
      description: "",
    });
    setSelectedSpace(null);
  };

  const calculateHours = (start: string, end: string) => {
    if (!start || !end) return 0;
    const [startHour] = start.split(":").map(Number);
    const [endHour] = end.split(":").map(Number);
    return Math.max(0, endHour - startHour);
  };

  const hours = calculateHours(rentalForm.startTime, rentalForm.endTime);
  const estimatedCost = selectedSpace ? hours * selectedSpace.pricePerHour : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-gray-900 mb-2">Locação de Espaços</h2>
        <p className="text-gray-600">
          Alugue nossos espaços para seus eventos e apresentações
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {spaces.map((space) => (
          <Card
            key={space.id}
            className="overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="relative h-64 overflow-hidden">
              <ImageWithFallback
                src={space.image}
                alt={space.name}
                className="w-full h-full object-cover"
              />
              <Badge className="absolute top-4 right-4 bg-green-500">
                {space.availability}
              </Badge>
            </div>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-gray-900">{space.name}</CardTitle>
                  <CardDescription className="mt-2">
                    {space.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">Até {space.capacity} pessoas</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-sm">R$ {space.pricePerHour}/hora</span>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Comodidades:</p>
                <div className="flex flex-wrap gap-2">
                  {space.amenities.slice(0, 4).map((amenity, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      {amenity}
                    </Badge>
                  ))}
                  {space.amenities.length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{space.amenities.length - 4} mais
                    </Badge>
                  )}
                </div>
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    className="w-full"
                    onClick={() => setSelectedSpace(space)}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Solicitar Locação
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Solicitar Locação - {space.name}</DialogTitle>
                    <DialogDescription>
                      Preencha o formulário para solicitar a locação deste
                      espaço
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Nome completo *</Label>
                        <Input
                          id="name"
                          value={rentalForm.name}
                          onChange={(e) =>
                            setRentalForm({
                              ...rentalForm,
                              name: e.target.value,
                            })
                          }
                          placeholder="Seu nome"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">E-mail *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={rentalForm.email}
                          onChange={(e) =>
                            setRentalForm({
                              ...rentalForm,
                              email: e.target.value,
                            })
                          }
                          placeholder="seu@email.com"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone">Telefone *</Label>
                        <Input
                          id="phone"
                          value={rentalForm.phone}
                          onChange={(e) =>
                            setRentalForm({
                              ...rentalForm,
                              phone: e.target.value,
                            })
                          }
                          placeholder="(81) 99999-9999"
                        />
                      </div>
                      <div>
                        <Label htmlFor="date">Data do evento *</Label>
                        <Input
                          id="date"
                          type="date"
                          value={rentalForm.date}
                          onChange={(e) =>
                            setRentalForm({
                              ...rentalForm,
                              date: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="startTime">Horário início *</Label>
                        <Input
                          id="startTime"
                          type="time"
                          value={rentalForm.startTime}
                          onChange={(e) =>
                            setRentalForm({
                              ...rentalForm,
                              startTime: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="endTime">Horário fim *</Label>
                        <Input
                          id="endTime"
                          type="time"
                          value={rentalForm.endTime}
                          onChange={(e) =>
                            setRentalForm({
                              ...rentalForm,
                              endTime: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="eventType">Tipo de evento *</Label>
                      <Input
                        id="eventType"
                        value={rentalForm.eventType}
                        onChange={(e) =>
                          setRentalForm({
                            ...rentalForm,
                            eventType: e.target.value,
                          })
                        }
                        placeholder="Ex: Peça teatral, Workshop, Apresentação musical"
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Descrição do evento</Label>
                      <Textarea
                        id="description"
                        value={rentalForm.description}
                        onChange={(e) =>
                          setRentalForm({
                            ...rentalForm,
                            description: e.target.value,
                          })
                        }
                        placeholder="Conte-nos mais sobre seu evento..."
                        rows={3}
                      />
                    </div>

                    {hours > 0 && (
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-600">
                            Duração estimada:
                          </span>
                          <span className="text-gray-900">{hours}h</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Valor estimado:</span>
                          <span className="text-gray-900">
                            R$ {estimatedCost.toFixed(2)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          * Valor sujeito a confirmação e possíveis taxas
                          adicionais
                        </p>
                      </div>
                    )}

                    <Button
                      className="w-full"
                      onClick={() => handleRentalSubmit(space)}
                      disabled={
                        !rentalForm.name ||
                        !rentalForm.email ||
                        !rentalForm.phone ||
                        !rentalForm.date ||
                        !rentalForm.startTime ||
                        !rentalForm.endTime ||
                        !rentalForm.eventType
                      }
                    >
                      Enviar Solicitação
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Processo de Locação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3">
                1
              </div>
              <p className="text-blue-900 mb-2">Solicite a Locação</p>
              <p className="text-sm text-blue-700">
                Preencha o formulário com os detalhes do seu evento
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3">
                2
              </div>
              <p className="text-blue-900 mb-2">Análise e Confirmação</p>
              <p className="text-sm text-blue-700">
                Nossa equipe analisa e entra em contato em até 24h
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3">
                3
              </div>
              <p className="text-blue-900 mb-2">Realize seu Evento</p>
              <p className="text-sm text-blue-700">
                Contrato assinado e espaço reservado para você
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
