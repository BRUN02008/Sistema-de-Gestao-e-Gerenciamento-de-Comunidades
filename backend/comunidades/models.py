from django.db import models
from django.contrib.auth.models import User


class Familia(models.Model):
    nome = models.CharField(max_length=150)
    responsavel = models.CharField(max_length=150, blank=True)
    endereco = models.CharField(max_length=255, blank=True)
    total_membros = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.nome


class Morador(models.Model):

    STATUS_CHOICES = [
        ("ativo", "Ativo"),
        ("inativo", "Inativo"),
    ]

    ESCOLARIDADE_CHOICES = [
        ("Sem Escolaridade", "Sem Escolaridade"),
        ("Fundamental Incompleto", "Fundamental Incompleto"),
        ("Fundamental Completo", "Fundamental Completo"),
        ("Médio Incompleto", "Médio Incompleto"),
        ("Médio Completo", "Médio Completo"),
        ("Superior Completo", "Superior Completo"),
    ]

    nome = models.CharField(max_length=150)
    data_nascimento = models.DateField()
    cpf = models.CharField(max_length=14, unique=True)
    rg = models.CharField(max_length=30, blank=True)

    familia = models.ForeignKey(
        Familia,
        on_delete=models.PROTECT,
        related_name="moradores"
    )

    telefone = models.CharField(max_length=20, blank=True)
    ocupacao = models.CharField(max_length=100, blank=True)

    escolaridade = models.CharField(
        max_length=50,
        choices=ESCOLARIDADE_CHOICES,
        blank=True
    )

    endereco = models.CharField(max_length=255, blank=True)

    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default="ativo"
    )

    comorbidade = models.CharField(
        max_length=255,
        blank=True
    )

    def __str__(self):
        return self.nome


class Veiculo(models.Model):

    TIPO_CHOICES = [
        ("Canoa", "Canoa"),
        ("Barco a Motor", "Barco a Motor"),
        ("Barco de Pesca", "Barco de Pesca"),
        ("Voadeira", "Voadeira"),
        ("Motor-Rabeta", "Motor-Rabeta"),
        ("Motocicleta", "Motocicleta"),
        ("Bicicleta", "Bicicleta"),
        ("Carro", "Carro"),
        ("Caminhonete", "Caminhonete"),
        ("Outro", "Outro"),
    ]

    morador = models.OneToOneField(
        Morador,
        on_delete=models.CASCADE,
        related_name="veiculo"
    )

    tipo = models.CharField(
        max_length=50,
        choices=TIPO_CHOICES
    )

    modelo = models.CharField(max_length=100, blank=True)
    cor = models.CharField(max_length=50, blank=True)
    placa = models.CharField(max_length=30, blank=True)

    def __str__(self):
        return f"{self.tipo} - {self.morador.nome}"
    
    
class Mensalidade(models.Model):

    STATUS_CHOICES = [
        ("pago", "Pago"),
        ("pendente", "Pendente"),
        ("atrasado", "Atrasado"),
    ]

    METODO_PAGAMENTO_CHOICES = [
        ("pix", "PIX"),
        ("dinheiro", "Dinheiro"),
        ("transferencia", "Transferência"),
        ("cartao", "Cartão"),
    ]

    familia = models.ForeignKey(
        Familia,
        on_delete=models.PROTECT,
        related_name="mensalidades"
    )

    mes_referencia = models.CharField(max_length=7)
    valor = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default="pendente"
    )

    data_vencimento = models.DateField()
    data_pagamento = models.DateField(
        null=True,
        blank=True
    )

    metodo_pagamento = models.CharField(
        max_length=20,
        choices=METODO_PAGAMENTO_CHOICES,
        blank=True
    )

    def __str__(self):
        return f"{self.familia.nome} - {self.mes_referencia}"


class Investimento(models.Model):

    CATEGORIA_CHOICES = [
        ("infraestrutura", "Infraestrutura"),
        ("educacao", "Educação"),
        ("saude", "Saúde"),
        ("meio_ambiente", "Meio Ambiente"),
        ("outros", "Outros"),
    ]

    STATUS_CHOICES = [
        ("planejado", "Planejado"),
        ("em_andamento", "Em andamento"),
        ("concluido", "Concluído"),
        ("cancelado", "Cancelado"),
    ]

    titulo = models.CharField(max_length=200)

    categoria = models.CharField(
        max_length=30,
        choices=CATEGORIA_CHOICES
    )

    valor = models.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    data = models.DateField()

    responsavel = models.CharField(
        max_length=150
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="planejado"
    )

    descricao = models.TextField(
        blank=True
    )

    observacoes = models.TextField(
        blank=True
    )

    def __str__(self):
        return self.titulo
    
    
    
class Documento(models.Model):

    TIPO_CHOICES = [
        ("certidao", "Certidão"),
        ("declaracao", "Declaração"),
        ("relatorio", "Relatório"),
        ("outro", "Outro"),
    ]

    morador = models.ForeignKey(
        Morador,
        on_delete=models.PROTECT,
        related_name="documentos"
    )

    titulo = models.CharField(max_length=200)

    tipo = models.CharField(
        max_length=20,
        choices=TIPO_CHOICES
    )

    data_emissao = models.DateField()

    arquivo = models.FileField(
    upload_to="documentos/"
)

    criado_em = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.titulo} - {self.morador.nome}"
    
    
class AssinaturaDocumento(models.Model):

    documento = models.OneToOneField(
        Documento,
        on_delete=models.CASCADE,
        related_name="assinatura"
    )

    assinatura = models.TextField()

    assinado_por = models.CharField(
        max_length=150
    )

    data_assinatura = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"Assinatura - {self.documento.titulo}"
    
    
    
class EventoAgenda(models.Model):
    STATUS_CHOICES = [
    ('pendente', 'Pendente'),
    ('andamento', 'Em andamento'),
    ('concluida', 'Concluída'),
    ('cancelada', 'Cancelada'),
    ] 
    TIPO_CHOICES = [
    ("reuniao", "Reunião"),
    ("evento", "Evento"),
    ("assembleia", "Assembleia"),
    ("atividade", "Atividade"),
    ("outro", "Outro"),
    ]

    titulo = models.CharField(max_length=200)
    responsavel = models.CharField(
    max_length=200,
    blank=True
    )

    descricao = models.TextField(
        blank=True
    )

    data = models.DateField()

    hora = models.TimeField()
    status = models.CharField(
    max_length=20,
    choices=STATUS_CHOICES,
    blank=True,
    null=True,
)
    local = models.CharField(
        max_length=200,
        blank=True
    )

    tipo = models.CharField(
        max_length=20,
        choices=TIPO_CHOICES,
        default="evento"
    )

    criado_em = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return self.titulo
    
    
class Atividade(models.Model):

    STATUS_CHOICES = [
        ("andamento", "Em andamento"),
        ("concluida", "Concluída"),
        ("pendente", "Pendente"),
    ]

    titulo = models.CharField(max_length=200)

    descricao = models.TextField(
        blank=True
    )

    data = models.DateField()
    
    responsavel = models.CharField(
        max_length=200,
        blank=True
    )

    local = models.CharField(
        max_length=200,
        blank=True
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pendente"
    )

    criado_em = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return self.titulo
    

class RelatorioAtividade(models.Model):

    STATUS_CHOICES = [
        ("rascunho", "Rascunho"),
        ("finalizado", "Finalizado"),
    ]

    titulo = models.CharField(max_length=255)

    descricao = models.TextField(blank=True)

    data = models.DateField()

    responsavel = models.CharField(max_length=200)

    categoria = models.CharField(max_length=100)

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="rascunho"
    )

    imagens = models.JSONField(
        default=list,
        blank=True
    )

    criado_em = models.DateTimeField(
        auto_now_add=True
    )

    atualizado_em = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return self.titulo
    
class Oficio(models.Model):

    STATUS_CHOICES = [
        ("rascunho", "Rascunho"),
        ("enviado", "Enviado"),
        ("protocolado", "Protocolado"),
        ("respondido", "Respondido"),
    ]

    numero = models.CharField(max_length=50)

    titulo = models.CharField(max_length=255)

    destinatario = models.CharField(max_length=255)

    assunto = models.CharField(
        max_length=255,
        blank=True
    )

    data_emissao = models.DateField()

    data_protocolo = models.DateField(
        null=True,
        blank=True
    )

    numero_protocolo = models.CharField(
        max_length=100,
        blank=True
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="rascunho"
    )

    observacoes = models.TextField(
        blank=True
    )

    criado_em = models.DateTimeField(
        auto_now_add=True
    )

    atualizado_em = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return f"{self.numero} - {self.titulo}"
    
    
    
class PerfilUsuario(models.Model):

    ROLE_CHOICES = [
        ("admin", "Administrador"),
        ("tecnico", "Técnico"),
        ("visualizador", "Visualizador"),
    ]

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="perfil"
    )

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default="visualizador"
    )

    morador = models.ForeignKey(
        "Morador",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="usuario"
    )

    cpf = models.CharField(
        max_length=14,
        blank=True
    )

    familia = models.CharField(
        max_length=255,
        blank=True
    )
    
class Despesa(models.Model):

    CATEGORIA_CHOICES = [
        ("manutencao", "Manutenção"),
        ("energia", "Energia"),
        ("agua", "Água"),
        ("material", "Material"),
        ("evento", "Evento"),
        ("outros", "Outros"),
    ]

    categoria = models.CharField(
        max_length=30,
        choices=CATEGORIA_CHOICES,
        default="outros"
    )

    valor = models.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    data = models.DateField()

    responsavel = models.CharField(
        max_length=150,
        blank=True
    )

    descricao = models.TextField(
        blank=True
    )

    criado_em = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"{self.get_categoria_display()} - R$ {self.valor}"