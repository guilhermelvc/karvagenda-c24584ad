import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Download, Send, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Marketing() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNicho, setSelectedNicho] = useState('');
  const { toast } = useToast();

  const nichos = [
    { id: 'sobrancelha', nome: 'Design de Sobrancelha', icon: '✨' },
    { id: 'estetica', nome: 'Estética Facial', icon: '💆' },
    { id: 'cabelo', nome: 'Cabelo e Penteados', icon: '💇' },
    { id: 'manicure', nome: 'Manicure e Pedicure', icon: '💅' },
    { id: 'massagem', nome: 'Massagem e Spa', icon: '🧘' },
    { id: 'barba', nome: 'Barbearia', icon: '💈' },
  ];

  // Templates mockados - na implementação real viriam da API do Canva
  const templates = [
    {
      id: 1,
      titulo: 'Promoção Sobrancelha',
      categoria: 'sobrancelha',
      thumbnail: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=400&fit=crop',
      formato: '1080x1080'
    },
    {
      id: 2,
      titulo: 'Oferta Especial Estética',
      categoria: 'estetica',
      thumbnail: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=400&h=400&fit=crop',
      formato: '1080x1080'
    },
    {
      id: 3,
      titulo: 'Novo Serviço Cabelo',
      categoria: 'cabelo',
      thumbnail: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=400&fit=crop',
      formato: '1080x1080'
    },
    {
      id: 4,
      titulo: 'Manicure Deluxe',
      categoria: 'manicure',
      thumbnail: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=400&fit=crop',
      formato: '1080x1080'
    },
    {
      id: 5,
      titulo: 'Massagem Relaxante',
      categoria: 'massagem',
      thumbnail: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=400&fit=crop',
      formato: '1080x1080'
    },
    {
      id: 6,
      titulo: 'Barba Perfeita',
      categoria: 'barba',
      thumbnail: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&h=400&fit=crop',
      formato: '1080x1080'
    },
  ];

  const filteredTemplates = selectedNicho 
    ? templates.filter(t => t.categoria === selectedNicho)
    : templates;

  const handleEditarNoCanva = (templateId: number) => {
    // Na implementação real, isso abriria o editor do Canva
    toast({
      title: 'Abrindo editor do Canva',
      description: 'Você será redirecionado para o Canva para editar o design.',
    });
    // window.open(`https://www.canva.com/design/DAE...`, '_blank');
  };

  const handleBaixar = (templateId: number) => {
    toast({
      title: 'Download iniciado',
      description: 'Seu design está sendo baixado.',
    });
  };

  const handleEnviarWhatsApp = (templateId: number) => {
    toast({
      title: 'Preparando envio',
      description: 'O design será enviado para sua lista de transmissão do WhatsApp.',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Marketing</h1>
        <p className="text-muted-foreground">
          Crie designs profissionais com integração Canva
        </p>
      </div>

      {/* Info Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Integração com Canva
          </CardTitle>
          <CardDescription>
            Acesse milhares de templates profissionais para divulgar seus serviços nas redes sociais e WhatsApp
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar designs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant={!selectedNicho ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedNicho('')}
              >
                Todos
              </Button>
              {nichos.map((nicho) => (
                <Button
                  key={nicho.id}
                  variant={selectedNicho === nicho.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedNicho(nicho.id)}
                  className="gap-2"
                >
                  <span>{nicho.icon}</span>
                  {nicho.nome}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-square relative overflow-hidden bg-muted">
              <img 
                src={template.thumbnail} 
                alt={template.titulo}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                {template.formato}
              </div>
            </div>
            <CardHeader>
              <CardTitle className="text-lg">{template.titulo}</CardTitle>
              <CardDescription>
                {nichos.find(n => n.id === template.categoria)?.nome}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                className="w-full gap-2" 
                onClick={() => handleEditarNoCanva(template.id)}
              >
                <ImageIcon className="h-4 w-4" />
                Editar no Canva
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleBaixar(template.id)}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Baixar
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleEnviarWhatsApp(template.id)}
                  className="gap-2"
                >
                  <Send className="h-4 w-4" />
                  WhatsApp
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Placeholder para API do Canva */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle>Conectar API do Canva</CardTitle>
          <CardDescription>
            Para acessar todos os recursos do Canva, configure sua API Key
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Como configurar:</strong><br />
              1. Acesse <a href="https://www.canva.com/developers" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Canva Developers</a><br />
              2. Crie um novo app e obtenha sua API Key<br />
              3. Cole a chave abaixo para ativar a integração completa
            </p>
          </div>
          <Input 
            type="password"
            placeholder="Cole sua Canva API Key aqui..."
          />
          <Button>Conectar Canva API</Button>
        </CardContent>
      </Card>
    </div>
  );
}
