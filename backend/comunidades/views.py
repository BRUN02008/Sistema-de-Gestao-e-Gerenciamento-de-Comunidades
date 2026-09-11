from rest_framework import viewsets
from django.contrib.auth import authenticate
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Sum
from .permissions import (
    IsAdmin,
    IsAdminOrTecnico,
    IsAdminTecnicoOrReadOnly,
)
from .models import (
    Familia,
    Morador,
    Mensalidade,
    Investimento,
    Despesa,
    Documento,
    AssinaturaDocumento,
    EventoAgenda,
    Atividade,
    Oficio,
    PerfilUsuario,
    RelatorioAtividade
)
from .serializers import (
    AtividadeSerializer,
    FamiliaSerializer,
    MoradorSerializer,
    MensalidadeSerializer,
    DespesaSerializer,
    InvestimentoSerializer,
    DocumentoSerializer,
    AssinaturaDocumentoSerializer,
    EventoAgendaSerializer,
    OficioSerializer,
    PerfilUsuarioSerializer,
    RelatorioAtividadeSerializer
)

class FamiliaViewSet(viewsets.ModelViewSet):
    serializer_class = FamiliaSerializer
    permission_classes = [IsAdminTecnicoOrReadOnly]

    def get_queryset(self):
        user = self.request.user

        # Admin e Técnico podem visualizar todas as famílias
        if user.perfil.role in ["admin", "tecnico"]:
            return Familia.objects.all()

        # Visualizador só pode visualizar a própria família
        if user.perfil.role == "visualizador":
            if user.perfil.morador:
                return Familia.objects.filter(
                    id=user.perfil.morador.familia.id
                )

            return Familia.objects.none()

        return Familia.objects.none()


class MoradorViewSet(viewsets.ModelViewSet):
    serializer_class = MoradorSerializer
    permission_classes = [IsAdminTecnicoOrReadOnly]

    def get_queryset(self):
        user = self.request.user

        # Admin e Técnico podem visualizar todos
        if user.perfil.role in ["admin", "tecnico"]:
            return Morador.objects.all()

        # Visualizador só pode visualizar o próprio cadastro
        if user.perfil.role == "visualizador":
            if user.perfil.morador:
                return Morador.objects.filter(
                    id=user.perfil.morador.id
                )

            return Morador.objects.none()

        return Morador.objects.none()


class MensalidadeViewSet(viewsets.ModelViewSet):
    queryset = Mensalidade.objects.all()
    serializer_class = MensalidadeSerializer
    permission_classes = [IsAdminTecnicoOrReadOnly]


class InvestimentoViewSet(viewsets.ModelViewSet):
    queryset = Investimento.objects.all()
    serializer_class = InvestimentoSerializer
    permission_classes = [IsAdmin]


class DocumentoViewSet(viewsets.ModelViewSet):
    queryset = Documento.objects.select_related("morador").all()
    serializer_class = DocumentoSerializer
    permission_classes = [IsAdminTecnicoOrReadOnly]


class AssinaturaDocumentoViewSet(viewsets.ModelViewSet):
    queryset = AssinaturaDocumento.objects.select_related("documento").all()
    serializer_class = AssinaturaDocumentoSerializer
    permission_classes = [IsAdminTecnicoOrReadOnly]

class EventoAgendaViewSet(viewsets.ModelViewSet):
    queryset = EventoAgenda.objects.all().order_by("data", "hora")
    serializer_class = EventoAgendaSerializer
    permission_classes = [IsAdminTecnicoOrReadOnly]


class AtividadeViewSet(viewsets.ModelViewSet):
    queryset = Atividade.objects.all().order_by("-data")
    serializer_class = AtividadeSerializer
    permission_classes = [IsAdminTecnicoOrReadOnly]


class OficioViewSet(viewsets.ModelViewSet):
    queryset = Oficio.objects.all().order_by("-data_emissao")
    serializer_class = OficioSerializer
    permission_classes = [IsAdminTecnicoOrReadOnly]


class PerfilUsuarioViewSet(viewsets.ModelViewSet):
    queryset = PerfilUsuario.objects.select_related(
        "user",
        "morador"
    ).all()

    serializer_class = PerfilUsuarioSerializer
    permission_classes = [IsAdmin]
    
    
class LoginView(APIView):

    def post(self, request):

        email = request.data.get("email")
        senha = request.data.get("senha")

        if not email or not senha:
            return Response(
                {"error": "Email e senha são obrigatórios."},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = authenticate(
            username=email,
            password=senha
        )

        if user is None:
            return Response(
                {"error": "Email ou senha incorretos."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        try:
            perfil = user.perfil
        except PerfilUsuario.DoesNotExist:
            return Response(
                {"error": "Usuário não possui um perfil cadastrado."},
                status=status.HTTP_403_FORBIDDEN
            )

        refresh = RefreshToken.for_user(user)

        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),

            "user": {
                "id": str(user.id),
                "nome": user.get_full_name(),
                "email": user.email,
                "role": perfil.role,
                "moradorId": str(perfil.morador.id)
                    if perfil.morador else None,
                "cpf": perfil.cpf,
                "familia": perfil.familia,
            }
        })
        
        
class MeView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        user = request.user

        try:
            perfil = user.perfil
        except PerfilUsuario.DoesNotExist:
            return Response(
                {"error": "Usuário não possui perfil."},
                status=status.HTTP_403_FORBIDDEN
            )

        return Response({
            "id": str(user.id),
            "nome": user.get_full_name(),
            "email": user.email,
            "role": perfil.role,
            "moradorId": str(perfil.morador.id)
                if perfil.morador else None,
            "cpf": perfil.cpf,
            "familia": perfil.familia,
        })


class DespesaViewSet(viewsets.ModelViewSet):
    queryset = Despesa.objects.all().order_by("-data")
    serializer_class = DespesaSerializer
    permission_classes = [IsAdminTecnicoOrReadOnly]
        
        
        
        
class FinancasResumoView(APIView):
    permission_classes = [IsAdminTecnicoOrReadOnly]

    def get(self, request):
        hoje = timezone.localdate()

        # =========================
        # MENSALIDADES
        # =========================

        total_recebido = (
            Mensalidade.objects
            .filter(
                status="pago",
                data_pagamento__year=hoje.year,
                data_pagamento__month=hoje.month
            )
            .aggregate(total=Sum("valor"))["total"]
            or 0
        )

        total_a_receber = (
            Mensalidade.objects
            .filter(
                status__in=["pendente", "atrasado"]
            )
            .aggregate(total=Sum("valor"))["total"]
            or 0
        )

        quantidade_pagas = Mensalidade.objects.filter(
            status="pago"
        ).count()

        quantidade_pendentes = Mensalidade.objects.filter(
            status__in=["pendente", "atrasado"]
        ).count()
        
        total_despesas = (
    Despesa.objects
    .aggregate(total=Sum("valor"))["total"]
    or 0
)

        # =========================
        # INVESTIMENTOS
        # =========================

        total_investido = (
            Investimento.objects
            .filter(
                status__in=["em_andamento", "concluido"]
            )
            .aggregate(total=Sum("valor"))["total"]
            or 0
        )

        quantidade_projetos = Investimento.objects.filter(
            status__in=["em_andamento", "concluido"]
        ).count()

        # =========================
        # SALDO
        # =========================

        saldo_atual = (
    total_recebido
    - total_investido
    - total_despesas
)

        return Response({
            "saldo_atual": saldo_atual,
            "total_recebido": total_recebido,
            "total_a_receber": total_a_receber,
            "total_investido": total_investido,
            "total_despesas": total_despesas,

            "quantidade_pagas": quantidade_pagas,
            "quantidade_pendentes": quantidade_pendentes,
            "quantidade_projetos": quantidade_projetos,

            "mes": hoje.month,
            "ano": hoje.year,
        })
        
        
        
        
class RelatorioAtividadeViewSet(viewsets.ModelViewSet):
    queryset = RelatorioAtividade.objects.all().order_by("-data")
    serializer_class = RelatorioAtividadeSerializer
    permission_classes = [IsAdminTecnicoOrReadOnly]