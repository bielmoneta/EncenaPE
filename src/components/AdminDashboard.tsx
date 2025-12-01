import { Event, Space } from "../types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import {
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  Building2,
  Ticket,
  BarChart3,
  PieChart,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

interface AdminDashboardProps {
  events: Event[];
  spaces: Space[];
}

export function AdminDashboard({ events, spaces }: AdminDashboardProps) {
  // Calculate metrics
  const totalRevenue = events.reduce((sum, event) => {
    const soldTickets = event.totalSeats - event.availableSeats;
    return sum + soldTickets * event.price;
  }, 0);

  const totalTicketsSold = events.reduce((sum, event) => {
    return sum + (event.totalSeats - event.availableSeats);
  }, 0);

  const averageOccupancy =
    events.reduce((sum, event) => {
      const occupancy =
        ((event.totalSeats - event.availableSeats) / event.totalSeats) * 100;
      return sum + occupancy;
    }, 0) / events.length;

  const totalCapacity = spaces.reduce((sum, space) => sum + space.capacity, 0);

  // Data for charts
  const eventsByCategory = events.reduce((acc, event) => {
    acc[event.category] = (acc[event.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryData = Object.entries(eventsByCategory).map(
    ([name, value]) => ({
      name,
      value,
    })
  );

  const revenueByEvent = events
    .map((event) => ({
      name: event.title.substring(0, 20),
      revenue: (event.totalSeats - event.availableSeats) * event.price,
      tickets: event.totalSeats - event.availableSeats,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 6);

  const occupancyBySpace = spaces.map((space) => {
    const spaceEvents = events.filter((e) => e.space === space.name);
    const avgOccupancy =
      spaceEvents.length > 0
        ? spaceEvents.reduce(
            (sum, e) =>
              sum + ((e.totalSeats - e.availableSeats) / e.totalSeats) * 100,
            0
          ) / spaceEvents.length
        : 0;

    return {
      name: space.name,
      ocupacao: Math.round(avgOccupancy),
      eventos: spaceEvents.length,
    };
  });

  const monthlyData = [
    { month: "Jun", vendas: 850, receita: 42500 },
    { month: "Jul", vendas: 920, receita: 48000 },
    { month: "Ago", vendas: 780, receita: 39000 },
    { month: "Set", vendas: 1050, receita: 56000 },
    { month: "Out", vendas: 1150, receita: 62000 },
    { month: "Nov", vendas: totalTicketsSold, receita: totalRevenue },
  ];

  const COLORS = ["#9333ea", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-gray-900 mb-2">Painel Administrativo</h2>
        <p className="text-gray-600">
          Gerencie e acompanhe as métricas do teatro
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-gray-600">
              Receita Total
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-gray-900">
              R${" "}
              {totalRevenue.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </div>
            <p className="text-xs text-green-600 flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12.5% vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-gray-600">
              Ingressos Vendidos
            </CardTitle>
            <Ticket className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-gray-900">{totalTicketsSold}</div>
            <p className="text-xs text-blue-600 flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +8.3% vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-gray-600">
              Taxa de Ocupação
            </CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-gray-900">{averageOccupancy.toFixed(1)}%</div>
            <p className="text-xs text-purple-600 flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +5.7% vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-gray-600">
              Eventos Ativos
            </CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-gray-900">{events.length}</div>
            <p className="text-xs text-orange-600 flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +2 novos esta semana
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="revenue" className="space-y-6">
        <TabsList className="grid w-full md:w-auto grid-cols-3">
          <TabsTrigger value="revenue">
            <BarChart3 className="h-4 w-4 mr-2" />
            Receita
          </TabsTrigger>
          <TabsTrigger value="spaces">
            <Building2 className="h-4 w-4 mr-2" />
            Espaços
          </TabsTrigger>
          <TabsTrigger value="categories">
            <PieChart className="h-4 w-4 mr-2" />
            Categorias
          </TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Receita por Evento</CardTitle>
                <CardDescription>Top 6 eventos por faturamento</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueByEvent}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number) =>
                        `R$ ${value.toLocaleString("pt-BR")}`
                      }
                    />
                    <Bar dataKey="revenue" fill="#9333ea" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Evolução Mensal</CardTitle>
                <CardDescription>
                  Vendas e receita nos últimos 6 meses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="vendas"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name="Ingressos"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="receita"
                      stroke="#10b981"
                      strokeWidth={2}
                      name="Receita (R$)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="spaces" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ocupação por Espaço</CardTitle>
              <CardDescription>
                Taxa média de ocupação e número de eventos por espaço
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={occupancyBySpace}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Bar
                    yAxisId="left"
                    dataKey="ocupacao"
                    fill="#9333ea"
                    name="Ocupação %"
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="eventos"
                    fill="#3b82f6"
                    name="Eventos"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {spaces.map((space) => {
              const spaceEvents = events.filter((e) => e.space === space.name);
              const revenue = spaceEvents.reduce((sum, e) => {
                return sum + (e.totalSeats - e.availableSeats) * e.price;
              }, 0);

              return (
                <Card key={space.id}>
                  <CardHeader>
                    <CardTitle className="text-gray-900">
                      {space.name}
                    </CardTitle>
                    <CardDescription>
                      Capacidade: {space.capacity} lugares
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Eventos:</span>
                      <span className="text-gray-900">
                        {spaceEvents.length}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Receita:</span>
                      <span className="text-gray-900">
                        R$ {revenue.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Valor/hora:</span>
                      <span className="text-gray-900">
                        R$ {space.pricePerHour}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="categories">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Categoria</CardTitle>
                <CardDescription>Número de eventos por tipo</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <RePieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RePieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resumo por Categoria</CardTitle>
                <CardDescription>Estatísticas detalhadas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(eventsByCategory).map(
                    ([category, count], index) => {
                      const categoryEvents = events.filter(
                        (e) => e.category === category
                      );
                      const categoryRevenue = categoryEvents.reduce(
                        (sum, e) => {
                          return (
                            sum + (e.totalSeats - e.availableSeats) * e.price
                          );
                        },
                        0
                      );
                      const categoryTickets = categoryEvents.reduce(
                        (sum, e) => {
                          return sum + (e.totalSeats - e.availableSeats);
                        },
                        0
                      );

                      return (
                        <div
                          key={category}
                          className="border-l-4 pl-4"
                          style={{ borderColor: COLORS[index % COLORS.length] }}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-gray-900">{category}</span>
                            <Badge variant="outline">{count} eventos</Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                            <div>Ingressos: {categoryTickets}</div>
                            <div>Receita: R$ {categoryRevenue.toFixed(2)}</div>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-purple-50 to-blue-50">
          <CardHeader>
            <CardTitle className="text-purple-900">
              Indicadores de Sucesso
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-purple-800">
                ✓ Aumento nas vendas de ingressos
              </span>
              <Badge className="bg-green-500">+12.5%</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-purple-800">
                ✓ Taxa de ocupação dos teatros
              </span>
              <Badge className="bg-green-500">
                {averageOccupancy.toFixed(0)}%
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-purple-800">
                ✓ Redução de custos operacionais
              </span>
              <Badge className="bg-green-500">-8%</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-purple-800">✓ Satisfação dos usuários</span>
              <Badge className="bg-green-500">4.7/5.0</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-purple-50">
          <CardHeader>
            <CardTitle className="text-blue-900">Metas do Mês</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-1 text-sm">
                <span className="text-blue-800">Venda de Ingressos</span>
                <span className="text-blue-900">{totalTicketsSold} / 1500</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${(totalTicketsSold / 1500) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1 text-sm">
                <span className="text-blue-800">Receita Mensal</span>
                <span className="text-blue-900">
                  R$ {(totalRevenue / 1000).toFixed(0)}k / R$ 75k
                </span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${(totalRevenue / 75000) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1 text-sm">
                <span className="text-blue-800">Novos Eventos</span>
                <span className="text-blue-900">{events.length} / 10</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${(events.length / 10) * 100}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
