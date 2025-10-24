import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Cliente, FichaAnamnese } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import SignatureCanvas from 'react-signature-canvas';
import jsPDF from 'jspdf';
import { Download } from 'lucide-react';

interface ClienteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cliente?: Cliente;
  onSuccess?: () => void;
}

export default function ClienteModal({ open, onOpenChange, cliente, onSuccess }: ClienteModalProps) {
  const { toast } = useToast();
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    nome: cliente?.nome || '',
    email: cliente?.email || '',
    telefone: cliente?.telefone || '',
    whatsapp: cliente?.whatsapp || '',
    observacoes: cliente?.observacoes || '',
  });

  const [anamnese, setAnamnese] = useState<FichaAnamnese>(cliente?.ficha_anamnese || {
    tipo_pele: '',
    alergias: '',
    medicamentos_uso: '',
    cirurgias_previas: '',
    tratamentos_esteticos_anteriores: '',
    exposicao_solar: '',
    gestante_lactante: '',
    doencas_preexistentes: '',
    objetivo_tratamento: '',
    observacoes_adicionais: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Captura assinatura se existir
      const assinaturaBase64 = sigCanvas.current?.toDataURL();
      
      const clienteData = {
        ...formData,
        ficha_anamnese: {
          ...anamnese,
          assinatura_digital: assinaturaBase64,
          data_preenchimento: new Date().toISOString(),
        },
        updated_at: new Date().toISOString(),
      };

      if (cliente?.id) {
        const { error } = await supabase
          .from('clientes')
          .update(clienteData)
          .eq('id', cliente.id);

        if (error) throw error;
        toast({ title: 'Cliente atualizado com sucesso!' });
      } else {
        const { error } = await supabase
          .from('clientes')
          .insert([{ ...clienteData, created_at: new Date().toISOString() }]);

        if (error) throw error;
        toast({ title: 'Cliente cadastrado com sucesso!' });
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar cliente',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      // Buscar configurações do negócio
      const { data: config } = await supabase
        .from('configuracoes_negocio')
        .select('*')
        .single();

      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      let yPos = 20;

      // Cabeçalho com logo e dados da clínica
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text(config?.nome_negocio || 'Clínica Estética', pageWidth / 2, yPos, { align: 'center' });
      
      yPos += 8;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      if (config?.endereco) pdf.text(config.endereco, pageWidth / 2, yPos, { align: 'center' });
      
      yPos += 5;
      if (config?.telefone) pdf.text(`Tel: ${config.telefone} | Email: ${config.email || ''}`, pageWidth / 2, yPos, { align: 'center' });
      
      yPos += 10;
      pdf.setLineWidth(0.5);
      pdf.line(20, yPos, pageWidth - 20, yPos);
      
      // Título
      yPos += 15;
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('FICHA DE ANAMNESE', pageWidth / 2, yPos, { align: 'center' });

      // Dados do cliente
      yPos += 15;
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('DADOS PESSOAIS', 20, yPos);
      
      yPos += 8;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Nome: ${formData.nome}`, 20, yPos);
      
      yPos += 6;
      pdf.text(`Email: ${formData.email}`, 20, yPos);
      
      yPos += 6;
      pdf.text(`Telefone: ${formData.telefone || 'Não informado'} | WhatsApp: ${formData.whatsapp || 'Não informado'}`, 20, yPos);

      // Dados da anamnese
      yPos += 15;
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('INFORMAÇÕES DE ANAMNESE', 20, yPos);

      const campos = [
        { label: 'Tipo de Pele', value: anamnese.tipo_pele },
        { label: 'Alergias', value: anamnese.alergias },
        { label: 'Medicamentos em Uso', value: anamnese.medicamentos_uso },
        { label: 'Cirurgias Prévias', value: anamnese.cirurgias_previas },
        { label: 'Tratamentos Estéticos Anteriores', value: anamnese.tratamentos_esteticos_anteriores },
        { label: 'Exposição Solar', value: anamnese.exposicao_solar },
        { label: 'Gestante ou Lactante', value: anamnese.gestante_lactante },
        { label: 'Doenças Pré-existentes', value: anamnese.doencas_preexistentes },
        { label: 'Objetivo do Tratamento', value: anamnese.objetivo_tratamento },
        { label: 'Observações Adicionais', value: anamnese.observacoes_adicionais },
      ];

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      
      campos.forEach((campo) => {
        yPos += 8;
        if (yPos > 270) {
          pdf.addPage();
          yPos = 20;
        }
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${campo.label}:`, 20, yPos);
        pdf.setFont('helvetica', 'normal');
        const texto = campo.value || 'Não informado';
        const linhasTexto = pdf.splitTextToSize(texto, pageWidth - 40);
        yPos += 5;
        pdf.text(linhasTexto, 20, yPos);
        yPos += (linhasTexto.length - 1) * 5;
      });

      // Assinatura
      if (anamnese.assinatura_digital || sigCanvas.current?.toDataURL()) {
        yPos += 15;
        if (yPos > 240) {
          pdf.addPage();
          yPos = 20;
        }
        pdf.setFont('helvetica', 'bold');
        pdf.text('Assinatura Digital:', 20, yPos);
        yPos += 5;
        const assinatura = anamnese.assinatura_digital || sigCanvas.current?.toDataURL();
        if (assinatura) {
          pdf.addImage(assinatura, 'PNG', 20, yPos, 80, 30);
        }
      }

      // Rodapé
      const dataPreenchimento = anamnese.data_preenchimento 
        ? new Date(anamnese.data_preenchimento).toLocaleDateString('pt-BR')
        : new Date().toLocaleDateString('pt-BR');
      
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'italic');
      pdf.text(`Data de preenchimento: ${dataPreenchimento}`, pageWidth / 2, 285, { align: 'center' });

      // Salvar PDF
      pdf.save(`ficha-anamnese-${formData.nome.replace(/\s+/g, '-').toLowerCase()}.pdf`);
      
      toast({ title: 'PDF exportado com sucesso!' });
    } catch (error: any) {
      toast({
        title: 'Erro ao exportar PDF',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{cliente ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
          <DialogDescription>
            Preencha os dados do cliente e a ficha de anamnese
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="dados" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="dados">Dados Pessoais</TabsTrigger>
              <TabsTrigger value="anamnese">Ficha de Anamnese</TabsTrigger>
            </TabsList>

            <TabsContent value="dados" className="space-y-4 mt-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="nome">Nome Completo *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      value={formData.telefone}
                      onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                      placeholder="(11) 98765-4321"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="whatsapp">WhatsApp</Label>
                    <Input
                      id="whatsapp"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                      placeholder="(11) 98765-4321"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={formData.observacoes}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="anamnese" className="space-y-4 mt-4">
              {cliente && (
                <div className="flex justify-end mb-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleExportPDF}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Exportar PDF
                  </Button>
                </div>
              )}
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="tipo_pele">Tipo de Pele</Label>
                  <Input
                    id="tipo_pele"
                    value={anamnese.tipo_pele}
                    onChange={(e) => setAnamnese({ ...anamnese, tipo_pele: e.target.value })}
                    placeholder="Ex: Oleosa, Seca, Mista, Normal"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="alergias">Alergias</Label>
                  <Textarea
                    id="alergias"
                    value={anamnese.alergias}
                    onChange={(e) => setAnamnese({ ...anamnese, alergias: e.target.value })}
                    placeholder="Descreva alergias conhecidas"
                    rows={2}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="medicamentos_uso">Medicamentos em Uso</Label>
                  <Textarea
                    id="medicamentos_uso"
                    value={anamnese.medicamentos_uso}
                    onChange={(e) => setAnamnese({ ...anamnese, medicamentos_uso: e.target.value })}
                    placeholder="Liste os medicamentos que está usando"
                    rows={2}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="cirurgias_previas">Cirurgias Prévias</Label>
                  <Textarea
                    id="cirurgias_previas"
                    value={anamnese.cirurgias_previas}
                    onChange={(e) => setAnamnese({ ...anamnese, cirurgias_previas: e.target.value })}
                    placeholder="Descreva cirurgias realizadas"
                    rows={2}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="tratamentos_esteticos_anteriores">Tratamentos Estéticos Anteriores</Label>
                  <Textarea
                    id="tratamentos_esteticos_anteriores"
                    value={anamnese.tratamentos_esteticos_anteriores}
                    onChange={(e) => setAnamnese({ ...anamnese, tratamentos_esteticos_anteriores: e.target.value })}
                    placeholder="Descreva tratamentos estéticos já realizados"
                    rows={2}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="exposicao_solar">Exposição Solar</Label>
                  <Input
                    id="exposicao_solar"
                    value={anamnese.exposicao_solar}
                    onChange={(e) => setAnamnese({ ...anamnese, exposicao_solar: e.target.value })}
                    placeholder="Ex: Diária, Ocasional, Rara"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="gestante_lactante">Gestante ou Lactante?</Label>
                  <Input
                    id="gestante_lactante"
                    value={anamnese.gestante_lactante}
                    onChange={(e) => setAnamnese({ ...anamnese, gestante_lactante: e.target.value })}
                    placeholder="Sim ou Não"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="doencas_preexistentes">Doenças Pré-existentes</Label>
                  <Textarea
                    id="doencas_preexistentes"
                    value={anamnese.doencas_preexistentes}
                    onChange={(e) => setAnamnese({ ...anamnese, doencas_preexistentes: e.target.value })}
                    placeholder="Descreva condições de saúde relevantes"
                    rows={2}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="objetivo_tratamento">Objetivo do Tratamento</Label>
                  <Textarea
                    id="objetivo_tratamento"
                    value={anamnese.objetivo_tratamento}
                    onChange={(e) => setAnamnese({ ...anamnese, objetivo_tratamento: e.target.value })}
                    placeholder="O que o cliente busca com o tratamento?"
                    rows={2}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="observacoes_adicionais">Observações Adicionais</Label>
                  <Textarea
                    id="observacoes_adicionais"
                    value={anamnese.observacoes_adicionais}
                    onChange={(e) => setAnamnese({ ...anamnese, observacoes_adicionais: e.target.value })}
                    rows={2}
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Assinatura Digital</Label>
                  <div className="border rounded-md p-2 bg-background">
                    <SignatureCanvas
                      ref={sigCanvas}
                      canvasProps={{
                        className: 'w-full h-32 border rounded',
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => sigCanvas.current?.clear()}
                    >
                      Limpar Assinatura
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : cliente ? 'Atualizar' : 'Cadastrar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
