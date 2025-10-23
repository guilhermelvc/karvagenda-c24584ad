import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Mail, Phone, Calendar, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import ClienteModal from '@/components/modals/ClienteModal';
import DeleteModal from '@/components/modals/DeleteModal';
import { Cliente } from '@/types';
import { supabase } from '@/lib/supabase';

export default function Clientes() {
  const [searchTerm, setSearchTerm] = useState('');
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | undefined>();
  const [deleteItem, setDeleteItem] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    carregarClientes();
  }, []);

  const carregarClientes = async () => {
    const { data } = await supabase
      .from('clientes')
      .select('*')
      .order('nome');
    
    if (data) setClientes(data);
  };

  const handleEdit = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setModalOpen(true);
  };

  const handleDelete = (id: string, nome: string) => {
    setDeleteItem({ id, name: nome });
    setDeleteModalOpen(true);
  };

  const handleNewCliente = () => {
    setSelectedCliente(undefined);
    setModalOpen(true);
  };

  // Mock data para stats
  const mockClientes = [
    {
      id: 1,
      nome: 'Maria Silva',
      email: 'maria@email.com',
      telefone: '(11) 98765-4321',
      avatar: '',
      totalAgendamentos: 15,
      ultimoAgendamento: '2025-01-15',
      status: 'ativo'
    },
    {
      id: 2,
      nome: 'Pedro Santos',
      email: 'pedro@email.com',
      telefone: '(11) 91234-5678',
      avatar: '',
      totalAgendamentos: 8,
      ultimoAgendamento: '2025-01-18',
      status: 'ativo'
    },
    {
      id: 3,
      nome: 'Ana Costa',
      email: 'ana@email.com',
      telefone: '(11) 92345-6789',
      avatar: '',
      totalAgendamentos: 22,
      ultimoAgendamento: '2025-01-20',
      status: 'vip'
    },
  ];

  const filteredClientes = clientes.filter(cliente =>
    cliente.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">
            Gerencie sua base de clientes
          </p>
        </div>
        <Button className="gap-2" onClick={handleNewCliente}>
          <Plus className="h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar clientes por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">248</div>
            <p className="text-xs text-muted-foreground">+18 este mês</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Clientes VIP</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-muted-foreground">+5 este mês</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Novos este Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground">+25% vs mês anterior</p>
          </CardContent>
        </Card>
      </div>

      {/* Clients List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredClientes.map((cliente) => (
          <Card key={cliente.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={cliente.avatar_url} />
                    <AvatarFallback className="bg-gradient-primary text-white">
                      {cliente.nome.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{cliente.nome}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <Mail className="h-3 w-3" />
                      {cliente.email}
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                {cliente.telefone || 'Não informado'}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                {cliente.email}
              </div>
              <div className="pt-2 flex items-center justify-between gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(cliente)}>
                  Editar
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDelete(cliente.id, cliente.nome)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <ClienteModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        cliente={selectedCliente}
        onSuccess={carregarClientes}
      />

      {deleteItem && (
        <DeleteModal
          open={deleteModalOpen}
          onOpenChange={setDeleteModalOpen}
          itemId={deleteItem.id}
          itemName={deleteItem.name}
          tableName="clientes"
          onSuccess={carregarClientes}
        />
      )}
    </div>
  );
}
