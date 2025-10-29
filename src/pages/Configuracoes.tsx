import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Settings, Palette, Bot, MessageSquare, Globe, Users } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function Configuracoes() {
  const { toast } = useToast();
  const [clientes, setClientes] = useState<any[]>([]);
  const [clientesSelecionados, setClientesSelecionados] = useState<string[]>([]);
  const [listaManual, setListaManual] = useState('');
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const [{ data: clientesData }, { data: configData }] = await Promise.all([
        supabase.from('clientes').select('id, nome, whatsapp').order('nome'),
        supabase.from('configuracoes_negocio').select('*').single()
      ]);
      
      if (clientesData) setClientes(clientesData);
      if (configData) setConfig(configData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const salvarConfiguracoes = async (campo: string, valor: any) => {
    try {
      const { error } = await supabase
        .from('configuracoes_negocio')
        .update({ [campo]: valor, updated_at: new Date().toISOString() })
        .eq('id', config?.id);

      if (error) throw error;

      toast({ title: 'Configurações salvas com sucesso!' });
      carregarDados();
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const toggleCliente = (whatsapp: string) => {
    setClientesSelecionados(prev => 
      prev.includes(whatsapp)
        ? prev.filter(w => w !== whatsapp)
        : [...prev, whatsapp]
    );
  };

  const gerarListaCompleta = () => {
    const manual = listaManual.split('\n').filter(l => l.trim());
    const selecionados = clientesSelecionados;
    return [...new Set([...manual, ...selecionados])].join('\n');
  };

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

              <div className="space-y-4 p-4 border border-border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enviar confirmação de agendamento</Label>
                    <p className="text-sm text-muted-foreground">
                      Enviar mensagem automática ao confirmar
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tempo-antes">Lembrete automático</Label>
                  <select 
                    id="tempo-antes"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  >
                    <option value="30min">30 minutos antes</option>
                    <option value="1h">1 hora antes</option>
                    <option value="2h">2 horas antes</option>
                    <option value="4h">4 horas antes</option>
                    <option value="12h">12 horas antes</option>
                    <option value="24h" selected>24 horas antes</option>
                    <option value="48h">48 horas antes</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-base">Lista de Transmissão</Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    Selecione clientes cadastrados ou adicione números manualmente
                  </p>
                </div>

                <Tabs defaultValue="clientes" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="clientes" className="gap-2">
                      <Users className="h-4 w-4" />
                      Clientes Cadastrados
                    </TabsTrigger>
                    <TabsTrigger value="manual">Adicionar Manualmente</TabsTrigger>
                  </TabsList>

                  <TabsContent value="clientes" className="space-y-2 max-h-[300px] overflow-y-auto">
                    {clientes.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        Nenhum cliente com WhatsApp cadastrado
                      </p>
                    ) : (
                      clientes.map((cliente) => (
                        cliente.whatsapp && (
                          <div key={cliente.id} className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md">
                            <Checkbox
                              id={`cliente-${cliente.id}`}
                              checked={clientesSelecionados.includes(cliente.whatsapp)}
                              onCheckedChange={() => toggleCliente(cliente.whatsapp)}
                            />
                            <Label
                              htmlFor={`cliente-${cliente.id}`}
                              className="flex-1 cursor-pointer"
                            >
                              <span className="font-medium">{cliente.nome}</span>
                              <span className="text-sm text-muted-foreground ml-2">
                                {cliente.whatsapp}
                              </span>
                            </Label>
                          </div>
                        )
                      ))
                    )}
                  </TabsContent>

                  <TabsContent value="manual" className="space-y-2">
                    <Textarea 
                      placeholder="+55 11 98765-4321&#10;+55 11 91234-5678&#10;+55 11 99999-8888"
                      rows={8}
                      value={listaManual}
                      onChange={(e) => setListaManual(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Formato: +55 DDD número (um por linha)
                    </p>
                  </TabsContent>
                </Tabs>

                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm font-medium mb-1">
                    Total de números selecionados: {clientesSelecionados.length + listaManual.split('\n').filter(l => l.trim()).length}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {clientesSelecionados.length} clientes + {listaManual.split('\n').filter(l => l.trim()).length} manuais
                  </p>
                </div>
              </div>

              <div className="space-y-4 p-4 border border-border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Mensagem de Resgate de Clientes</Label>
                    <p className="text-sm text-muted-foreground">
                      Enviar mensagem automática para clientes inativos
                    </p>
                  </div>
                  <Switch 
                    checked={config?.whatsapp_resgate_ativa || false}
                    onCheckedChange={(checked) => salvarConfiguracoes('whatsapp_resgate_ativa', checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dias-inatividade">Dias de inatividade</Label>
                  <Input
                    id="dias-inatividade"
                    type="number"
                    min="1"
                    value={config?.whatsapp_resgate_dias || 15}
                    onChange={(e) => salvarConfiguracoes('whatsapp_resgate_dias', parseInt(e.target.value))}
                    placeholder="15"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enviar mensagem após X dias sem atendimento
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mensagem-resgate">Mensagem</Label>
                  <Textarea
                    id="mensagem-resgate"
                    value={config?.whatsapp_resgate_mensagem || ''}
                    onChange={(e) => setConfig({ ...config, whatsapp_resgate_mensagem: e.target.value })}
                    onBlur={(e) => salvarConfiguracoes('whatsapp_resgate_mensagem', e.target.value)}
                    rows={3}
                    placeholder="Olá {nome}! Sentimos sua falta! Faz {dias} dias do seu último atendimento..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Use {'{nome}'} para o nome do cliente e {'{dias}'} para quantidade de dias
                  </p>
                </div>
              </div>

              <Button onClick={() => toast({ title: 'Configurações WhatsApp salvas!' })}>
                Salvar Configurações WhatsApp
              </Button>
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
