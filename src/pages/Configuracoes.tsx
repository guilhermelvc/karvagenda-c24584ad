import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Settings, Palette, Bot, MessageSquare, Globe } from 'lucide-react';

export default function Configuracoes() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">
          Personalize seu sistema de agendamento
        </p>
      </div>

      <Tabs defaultValue="geral" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="geral" className="gap-2">
            <Settings className="h-4 w-4" />
            Geral
          </TabsTrigger>
          <TabsTrigger value="aparencia" className="gap-2">
            <Palette className="h-4 w-4" />
            Aparência
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            WhatsApp
          </TabsTrigger>
          <TabsTrigger value="ia" className="gap-2">
            <Bot className="h-4 w-4" />
            IA
          </TabsTrigger>
          <TabsTrigger value="idioma" className="gap-2">
            <Globe className="h-4 w-4" />
            Idioma
          </TabsTrigger>
        </TabsList>

        <TabsContent value="geral" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Negócio</CardTitle>
              <CardDescription>
                Configure as informações básicas do seu negócio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome-negocio">Nome do Negócio</Label>
                <Input id="nome-negocio" placeholder="Ex: Studio Beleza" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea 
                  id="descricao" 
                  placeholder="Descreva seu negócio..."
                  rows={4}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input id="telefone" placeholder="(11) 98765-4321" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="contato@studio.com" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="endereco">Endereço</Label>
                <Input id="endereco" placeholder="Rua Exemplo, 123 - Cidade/UF" />
              </div>
              <Button>Salvar Alterações</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Horário de Funcionamento</CardTitle>
              <CardDescription>
                Configure os horários de atendimento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'].map((dia) => (
                <div key={dia} className="flex items-center gap-4">
                  <Switch id={`ativo-${dia}`} defaultChecked={dia !== 'Domingo'} />
                  <Label htmlFor={`ativo-${dia}`} className="w-24">{dia}</Label>
                  <div className="flex-1 grid grid-cols-2 gap-4">
                    <Input type="time" defaultValue="09:00" />
                    <Input type="time" defaultValue="18:00" />
                  </div>
                </div>
              ))}
              <Button>Salvar Horários</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="aparencia" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Personalização White Label</CardTitle>
              <CardDescription>
                Personalize a aparência do sistema com sua marca
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="logo">Logo do Negócio</Label>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 rounded-lg border-2 border-dashed border-border flex items-center justify-center">
                    <span className="text-muted-foreground text-sm">Logo</span>
                  </div>
                  <Button variant="outline">Fazer Upload</Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Cor Principal</Label>
                <div className="flex gap-2">
                  {['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'].map((cor) => (
                    <button
                      key={cor}
                      className="w-12 h-12 rounded-lg border-2 border-border hover:scale-110 transition-transform"
                      style={{ backgroundColor: cor }}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="slogan">Slogan</Label>
                <Input id="slogan" placeholder="Seu slogan aqui..." />
              </div>

              <Button>Aplicar Personalização</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="whatsapp" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Integração WhatsApp Business</CardTitle>
              <CardDescription>
                Configure a integração com WhatsApp via API Evolution
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  A integração com WhatsApp permite enviar lembretes automáticos de agendamento,
                  confirmações e notificações para seus clientes.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="api-key-whatsapp">API Key Evolution</Label>
                <Input 
                  id="api-key-whatsapp" 
                  type="password" 
                  placeholder="Cole sua API Key aqui..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="numero-whatsapp">Número do WhatsApp Business</Label>
                <Input 
                  id="numero-whatsapp" 
                  placeholder="+55 11 98765-4321"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Enviar lembretes automáticos</Label>
                  <p className="text-sm text-muted-foreground">
                    Enviar mensagem 24h antes do agendamento
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <Button>Conectar WhatsApp</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ia" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Robô de Atendimento IA</CardTitle>
              <CardDescription>
                Configure o assistente virtual Gemini para atendimento automático
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  O assistente IA pode responder perguntas frequentes, ajudar com agendamentos
                  e fornecer informações sobre serviços automaticamente.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="prompt-ia">Prompt de Sistema</Label>
                <Textarea 
                  id="prompt-ia"
                  placeholder="Ex: Você é um assistente virtual profissional que ajuda clientes a agendar serviços..."
                  rows={6}
                  defaultValue="Você é um assistente virtual do [Nome do Negócio]. Sua função é ajudar clientes a agendar serviços, responder perguntas sobre horários disponíveis e fornecer informações sobre os serviços oferecidos. Seja educado, prestativo e profissional."
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Ativar Atendimento IA</Label>
                  <p className="text-sm text-muted-foreground">
                    Responder automaticamente via WhatsApp
                  </p>
                </div>
                <Switch />
              </div>

              <Button>Salvar Configurações IA</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="idioma" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Idioma</CardTitle>
              <CardDescription>
                Selecione o idioma do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                {[
                  { code: 'pt-BR', name: 'Português (Brasil)', flag: '🇧🇷' },
                  { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
                  { code: 'es-ES', name: 'Español', flag: '🇪🇸' },
                ].map((idioma) => (
                  <div 
                    key={idioma.code}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{idioma.flag}</span>
                      <span className="font-medium">{idioma.name}</span>
                    </div>
                    {idioma.code === 'pt-BR' && (
                      <Badge>Ativo</Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
