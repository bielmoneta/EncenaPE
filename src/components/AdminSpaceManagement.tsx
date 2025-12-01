import { SpaceRental } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Mail,
  Phone,
  Calendar,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";

interface AdminSpaceManagementProps {
  rentals: SpaceRental[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export function AdminSpaceManagement({
  rentals,
  onApprove,
  onReject,
}: AdminSpaceManagementProps) {
  const pendingRentals = rentals.filter((r) => r.status === "pending");
  const approvedRentals = rentals.filter((r) => r.status === "approved");
  const rejectedRentals = rentals.filter((r) => r.status === "rejected");

  const handleApprove = (rental: SpaceRental) => {
    onApprove(rental.id);
    toast.success("Locação aprovada!", {
      description: `${rental.spaceName} para ${rental.userName} em ${rental.date}`,
    });
  };

  const handleReject = (rental: SpaceRental) => {
    onReject(rental.id);
    toast.error("Locação rejeitada", {
      description: `Solicitação de ${rental.userName} foi recusada.`,
    });
  };

  const getStatusBadge = (status: SpaceRental["status"]) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500">Aprovado</Badge>;
      case "rejected":
        return <Badge className="bg-red-500">Rejeitado</Badge>;
      default:
        return <Badge className="bg-yellow-500">Pendente</Badge>;
    }
  };

  const RentalCard = ({
    rental,
    showActions = false,
  }: {
    rental: SpaceRental;
    showActions?: boolean;
  }) => (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-gray-900">{rental.spaceName}</CardTitle>
            <p className="text-sm text-gray-600 mt-1">{rental.eventType}</p>
          </div>
          {getStatusBadge(rental.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">
              Informações do Solicitante
            </p>
            <div className="space-y-1">
              <p className="text-sm text-gray-900">{rental.userName}</p>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="h-3 w-3" />
                {rental.userEmail}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="h-3 w-3" />
                {rental.userPhone}
              </div>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Detalhes da Locação</p>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-900">
                <Calendar className="h-3 w-3" />
                {new Date(rental.date).toLocaleDateString("pt-BR")}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-900">
                <Clock className="h-3 w-3" />
                {rental.startTime} - {rental.endTime}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-900">
                <DollarSign className="h-3 w-3" />
                R$ {rental.totalCost.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {rental.description && (
          <div>
            <p className="text-sm text-gray-600 mb-1">Descrição do Evento</p>
            <p className="text-sm text-gray-900">{rental.description}</p>
          </div>
        )}

        <div className="text-xs text-gray-500">
          Solicitado em{" "}
          {new Date(rental.submittedDate).toLocaleDateString("pt-BR")}
        </div>

        {showActions && (
          <div className="flex gap-2 pt-2 border-t">
            <Button
              onClick={() => handleApprove(rental)}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Aprovar
            </Button>
            <Button
              onClick={() => handleReject(rental)}
              variant="destructive"
              className="flex-1"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Rejeitar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-gray-900 mb-2">Gestão de Locações</h2>
        <p className="text-gray-600">
          Gerencie solicitações de locação de espaços
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-gray-600">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-gray-900">{pendingRentals.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-gray-600">Aprovadas</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-gray-900">{approvedRentals.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-gray-600">
              Receita Estimada
            </CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-gray-900">
              R${" "}
              {approvedRentals
                .reduce((sum, r) => sum + r.totalCost, 0)
                .toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            Pendentes ({pendingRentals.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Aprovadas ({approvedRentals.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejeitadas ({rejectedRentals.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4 mt-6">
          {pendingRentals.length > 0 ? (
            pendingRentals.map((rental) => (
              <RentalCard key={rental.id} rental={rental} showActions />
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Nenhuma solicitação pendente</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4 mt-6">
          {approvedRentals.length > 0 ? (
            approvedRentals.map((rental) => (
              <RentalCard key={rental.id} rental={rental} />
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Nenhuma locação aprovada</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4 mt-6">
          {rejectedRentals.length > 0 ? (
            rejectedRentals.map((rental) => (
              <RentalCard key={rental.id} rental={rental} />
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                <XCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Nenhuma solicitação rejeitada</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
