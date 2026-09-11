from rest_framework.routers import DefaultRouter
from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import (
    FamiliaViewSet,
    MoradorViewSet,
    MensalidadeViewSet,
    InvestimentoViewSet,
    DespesaViewSet,
    DocumentoViewSet,
    AssinaturaDocumentoViewSet,
    EventoAgendaViewSet,
    AtividadeViewSet,
    OficioViewSet,
    PerfilUsuarioViewSet,
    LoginView,
    MeView,
    FinancasResumoView,
    RelatorioAtividadeViewSet,
)


router = DefaultRouter()

router.register(
    r"familias",
    FamiliaViewSet,
    basename="familia"
)

router.register(
    r"moradores",
    MoradorViewSet,
    basename="morador"
)

router.register(
    r"mensalidades",
    MensalidadeViewSet,
    basename="mensalidade"
)

router.register(
    r"investimentos",
    InvestimentoViewSet,
    basename="investimento"
)

router.register(
    r"documentos",
    DocumentoViewSet,
    basename="documento"
)


router.register(
    r"assinaturas",
    AssinaturaDocumentoViewSet,
    basename="assinatura"
)


router.register(
    r"agenda",
    EventoAgendaViewSet,
    basename="agenda"
)


router.register(
    r"relatorios-atividade",
    RelatorioAtividadeViewSet,
    basename="relatorio-atividade"
)


router.register(
    r"atividades",
    AtividadeViewSet,
    basename="atividades"
)

router.register(
    r"oficios",
    OficioViewSet,
    basename="oficios"
)


router.register(
    r"despesas",
    DespesaViewSet,
    basename="despesa"
)


router.register(
    r"usuarios",
    PerfilUsuarioViewSet,
    basename="usuarios"
)




urlpatterns = router.urls


urlpatterns += [
    path("auth/login/", LoginView.as_view(), name="login"),
    
    path(
    "auth/token/",
    TokenObtainPairView.as_view(),
    name="token_obtain_pair"
),

path(
    "auth/token/refresh/",
    TokenRefreshView.as_view(),
    name="token_refresh"
),

path(
    "auth/me/",
    MeView.as_view(),
    name="me"
),

path(
        "financas/resumo/",
        FinancasResumoView.as_view(),
        name="financas-resumo"
    ),
]