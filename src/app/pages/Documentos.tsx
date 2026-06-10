import { useState } from 'react';
import { Card, CardContent } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { mockDocumentos, type Documento } from '../data/mockData';
import { Plus, Search, Download, Eye, FileText, File } from 'lucide-react';
import { toast } from 'sonner';

export function Documentos() {
  const [busca, setBusca] = useState('');
  const [documentos] = useState<Documento[]>(mockDocumentos);

  const documentosFiltrados = documentos.filter((doc) =>
    doc.titulo.toLowerCase().includes(busca.toLowerCase()) ||
    doc.morador.toLowerCase().includes(busca.toLowerCase()) ||
    doc.tipo.includes(busca.toLowerCase())
  );

  const getIconByType = (tipo: string) => {
    switch (tipo) {
      case 'certidao':
        return <FileText className="text-primary" size={24} />;
      case 'declaracao':
        return <File className="text-accent" size={24} />;
      case 'relatorio':
        return <FileText className="text-secondary" size={24} />;
      default:
        return <File className="text-muted-foreground" size={24} />;
    }
  };

  const getTipoLabel = (tipo: string) => {
    const tipos: Record<string, string> = {
      certidao: 'Certidão',
      declaracao: 'Declaração',
      relatorio: 'Relatório',
      outro: 'Outro'
    };
    return tipos[tipo] || tipo;
  };

  const handleDownload = (documento: Documento) => {
    toast.success(`Download iniciado: ${documento.titulo}`);
  };

  const handleView = (documento: Documento) => {
    toast.info(`Visualizando: ${documento.titulo}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground mb-2">Documentos</h1>
          <p className="text-muted-foreground">Gerenciamento de documentos comunitários</p>
        </div>
        <Button>
          <Plus size={20} />
          Novo Documento
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2">
            <Search className="text-muted-foreground" size={20} />
            <Input
              type="text"
              placeholder="Buscar documentos por título, morador ou tipo..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              fullWidth
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4">
        {documentosFiltrados.map((documento) => (
          <Card key={documento.id} hover>
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="bg-muted/50 p-3 rounded-lg">
                  {getIconByType(documento.tipo)}
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-foreground mb-1">{documento.titulo}</h3>
                      <p className="text-sm text-muted-foreground">
                        Morador: {documento.morador}
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs bg-primary/20 text-primary">
                      {getTipoLabel(documento.tipo)}
                    </span>
                  </div>

                  <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4">
                    <div>
                      <span className="font-medium">Data de Emissão:</span>{' '}
                      {new Date(documento.dataEmissao).toLocaleDateString('pt-BR')}
                    </div>
                    <div>
                      <span className="font-medium">Arquivo:</span> {documento.arquivo}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleView(documento)}
                    >
                      <Eye size={16} />
                      Visualizar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(documento)}
                    >
                      <Download size={16} />
                      Baixar
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {documentosFiltrados.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="mx-auto mb-4 text-muted-foreground" size={48} />
            <p className="text-muted-foreground">Nenhum documento encontrado</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
