import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import {
  HelpCircle,
  MessageCircle,
  Search,
  Send,
  Bot,
  User,
} from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

export function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState("");
  const [chatMessages, setChatMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Olá! 👋 Sou o assistente virtual do Teatro Recife. Como posso ajudá-lo hoje?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");

  const faqs = [
    {
      category: "Compras e Ingressos",
      questions: [
        {
          question: "Como comprar ingressos?",
          answer:
            'Para comprar ingressos, navegue pelo catálogo de eventos, selecione o evento desejado, clique em "Comprar Ingressos", escolha seus assentos e finalize o pagamento. É necessário estar logado para realizar a compra.',
        },
        {
          question: "Quais são as formas de pagamento aceitas?",
          answer:
            "Aceitamos cartões de crédito (Visa, Mastercard, Elo), débito, PIX e boleto bancário. O pagamento é processado de forma segura através de nossa plataforma.",
        },
        {
          question: "Posso cancelar minha compra?",
          answer:
            'Sim, você pode cancelar sua compra até 24 horas antes do evento. Acesse "Minha Área" > "Meus Ingressos" e clique em "Cancelar Compra". O reembolso será processado em até 5 dias úteis.',
        },
        {
          question: "Como recebo meus ingressos?",
          answer:
            'Após a confirmação do pagamento, seus e-tickets ficam disponíveis em "Minha Área" > "Meus Ingressos". Você pode baixá-los em PDF ou apresentar diretamente pelo celular na entrada do evento.',
        },
      ],
    },
    {
      category: "Conta e Perfil",
      questions: [
        {
          question: "Como criar uma conta?",
          answer:
            'Clique em "Entrar" no menu superior, depois em "Cadastro". Preencha os dados solicitados: nome, CPF, telefone, email, data de nascimento e senha. Após o cadastro, você poderá fazer login e acessar todos os recursos.',
        },
        {
          question: "Esqueci minha senha, como recuperar?",
          answer:
            'Na tela de login, clique em "Esqueceu sua senha?". Informe seu email ou telefone cadastrado. Você receberá um código de verificação para redefinir sua senha.',
        },
        {
          question: "Como atualizar meus dados pessoais?",
          answer:
            'Acesse "Minha Área" > "Meu Perfil" e clique em "Editar Perfil". Atualize as informações desejadas e clique em "Salvar Alterações".',
        },
      ],
    },
    {
      category: "Eventos e Espaços",
      questions: [
        {
          question: "Como encontrar eventos específicos?",
          answer:
            'Use os filtros na página de Eventos para buscar por categoria, data ou palavra-chave. Você também pode visualizar o calendário completo de eventos clicando em "Calendário" no menu.',
        },
        {
          question: "Como solicitar locação de espaço?",
          answer:
            'Acesse "Espaços" no menu, escolha o espaço desejado e clique em "Solicitar Locação". Preencha os detalhes do evento e aguarde a aprovação da administração.',
        },
        {
          question: "Posso favoritar eventos?",
          answer:
            'Sim! Clique no ícone de coração nos detalhes do evento. Seus favoritos ficam salvos em "Minha Área" > "Favoritos" para fácil acesso.',
        },
      ],
    },
    {
      category: "Administrativo",
      questions: [
        {
          question: "Como cadastrar um novo evento?",
          answer:
            'Administradores podem acessar o "Dashboard" e clicar em "Cadastrar Novo Evento". Preencha todas as informações do evento, incluindo título, descrição, data, horário, preço e imagem.',
        },
        {
          question: "Como gerenciar solicitações de locação?",
          answer:
            'No painel administrativo, acesse "Locações" para visualizar todas as solicitações pendentes. Você pode aprovar ou rejeitar cada solicitação.',
        },
      ],
    },
  ];

  const filteredFaqs = faqs
    .map((category) => ({
      ...category,
      questions: category.questions.filter(
        (q) =>
          q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.answer.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((category) => category.questions.length > 0);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setChatMessages([...chatMessages, userMessage]);

    // Simulate bot response
    setTimeout(() => {
      const botResponse = generateBotResponse(inputMessage);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: "bot",
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, botMessage]);
    }, 1000);

    setInputMessage("");
  };

  const generateBotResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes("ingresso") || lowerMessage.includes("compra")) {
      return 'Para comprar ingressos, navegue até a página de eventos, selecione o evento desejado e clique em "Comprar Ingressos". Você precisará estar logado para concluir a compra. Posso ajudá-lo com mais alguma coisa?';
    }

    if (
      lowerMessage.includes("cancelar") ||
      lowerMessage.includes("reembolso")
    ) {
      return 'Você pode cancelar sua compra até 24 horas antes do evento através de "Minha Área" > "Meus Ingressos". O reembolso é processado em até 5 dias úteis. Precisa de mais informações?';
    }

    if (lowerMessage.includes("senha") || lowerMessage.includes("recuperar")) {
      return 'Para recuperar sua senha, clique em "Esqueceu sua senha?" na tela de login. Um código será enviado para seu email ou telefone cadastrado. Posso ajudar com mais alguma coisa?';
    }

    if (lowerMessage.includes("perfil") || lowerMessage.includes("dados")) {
      return 'Para atualizar seus dados, acesse "Minha Área" > "Meu Perfil" e clique em "Editar Perfil". Você pode alterar nome, email, CPF, telefone e data de nascimento. Tem mais alguma dúvida?';
    }

    if (lowerMessage.includes("evento") || lowerMessage.includes("locação")) {
      return 'Você pode visualizar todos os eventos na página inicial ou no calendário. Para solicitar locação de espaço, acesse "Espaços" e escolha o local desejado. Como posso ajudar mais?';
    }

    if (lowerMessage.includes("obrigado") || lowerMessage.includes("valeu")) {
      return "Por nada! Estou sempre aqui para ajudar. Se precisar de mais alguma coisa, é só chamar! 😊";
    }

    return "Entendo sua dúvida! Para informações mais específicas, consulte nossa seção de Perguntas Frequentes ou entre em contato com nosso suporte através do email contato@teatrorecife.com.br ou telefone (81) 3333-4444. Posso ajudá-lo com mais alguma coisa?";
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-gray-900 mb-2">Central de Ajuda</h2>
        <p className="text-gray-600">
          Encontre respostas para suas dúvidas ou converse com nosso assistente
          virtual
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* FAQ Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Perguntas Frequentes
              </CardTitle>
              <CardDescription>
                Respostas para as dúvidas mais comuns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar nas perguntas frequentes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <ScrollArea className="h-[600px] pr-4">
                <Accordion type="single" collapsible className="space-y-4">
                  {filteredFaqs.map((category, categoryIndex) => (
                    <div key={categoryIndex} className="space-y-2">
                      <Badge variant="outline" className="mb-2">
                        {category.category}
                      </Badge>
                      {category.questions.map((faq, faqIndex) => (
                        <AccordionItem
                          key={`${categoryIndex}-${faqIndex}`}
                          value={`${categoryIndex}-${faqIndex}`}
                          className="border rounded-lg px-4"
                        >
                          <AccordionTrigger className="text-left hover:no-underline">
                            {faq.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-gray-600">
                            {faq.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </div>
                  ))}
                </Accordion>

                {filteredFaqs.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <HelpCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>Nenhuma pergunta encontrada para "{searchQuery}"</p>
                    <p className="text-sm mt-2">
                      Tente usar o chat com o assistente virtual
                    </p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Chat Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Chat com Assistente Virtual
              </CardTitle>
              <CardDescription>
                Tire suas dúvidas em tempo real com nossa IA
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-4">
                  {chatMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        message.sender === "user"
                          ? "flex-row-reverse"
                          : "flex-row"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          message.sender === "user"
                            ? "bg-purple-600"
                            : "bg-blue-600"
                        }`}
                      >
                        {message.sender === "user" ? (
                          <User className="h-4 w-4 text-white" />
                        ) : (
                          <Bot className="h-4 w-4 text-white" />
                        )}
                      </div>
                      <div
                        className={`flex-1 max-w-[80%] ${
                          message.sender === "user"
                            ? "items-end"
                            : "items-start"
                        }`}
                      >
                        <div
                          className={`rounded-lg p-3 ${
                            message.sender === "user"
                              ? "bg-purple-600 text-white"
                              : "bg-gray-100 text-gray-900"
                          }`}
                        >
                          <p className="text-sm">{message.text}</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {message.timestamp.toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="flex gap-2">
                <Input
                  placeholder="Digite sua pergunta..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <Button onClick={handleSendMessage} size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-900">
                <p className="mb-1">💡 Dicas para usar o chat:</p>
                <ul className="list-disc list-inside text-xs space-y-1">
                  <li>Seja específico em suas perguntas</li>
                  <li>
                    Pergunte sobre compras, cancelamentos, perfil e eventos
                  </li>
                  <li>O assistente está disponível 24/7</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle>Ainda precisa de ajuda?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">📧 Email:</span>
                <a
                  href="mailto:contato@teatrorecife.com.br"
                  className="text-purple-600 hover:underline"
                >
                  contato@teatrorecife.com.br
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">📱 Telefone:</span>
                <a
                  href="tel:+558133334444"
                  className="text-purple-600 hover:underline"
                >
                  (81) 3333-4444
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">🕐 Horário:</span>
                <span className="text-gray-900">
                  Segunda a Sexta, 10h - 22h
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
