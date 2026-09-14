from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Familia,
    Morador,
    RelatorioAtividade,
    Veiculo,
    Mensalidade,
    Investimento,
    Despesa,
    Documento,
    AssinaturaDocumento,
    EventoAgenda,
    Atividade,
    Oficio,
    PerfilUsuario,
)


class VeiculoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Veiculo
        fields = [
            "id",
            "tipo",
            "modelo",
            "cor",
            "placa",
        ]


class FamiliaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Familia
        fields = [
            "id",
            "nome",
            "responsavel",
            "endereco",
            "total_membros",
        ]


class MoradorSerializer(serializers.ModelSerializer):
    familia_detalhes = FamiliaSerializer(
        source="familia",
        read_only=True
    )

    veiculo = VeiculoSerializer(
        required=False,
        allow_null=True
    )

    class Meta:
        model = Morador
        fields = [
            "id",
            "nome",
            "data_nascimento",
            "cpf",
            "rg",
            "familia",
            "familia_detalhes",
            "telefone",
            "ocupacao",
            "escolaridade",
            "endereco",
            "status",
            "comorbidade",
            "veiculo",
        ]

    def create(self, validated_data):
        veiculo_data = validated_data.pop("veiculo", None)

        morador = Morador.objects.create(**validated_data)

        if veiculo_data:
            Veiculo.objects.create(
                morador=morador,
                **veiculo_data
            )

        return morador

    def update(self, instance, validated_data):
        veiculo_data = validated_data.pop("veiculo", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()

        if veiculo_data is not None:
            Veiculo.objects.update_or_create(
                morador=instance,
                defaults=veiculo_data
            )

        return instance
    
    
    
class MensalidadeSerializer(serializers.ModelSerializer):
    familia_detalhes = FamiliaSerializer(
        source="familia",
        read_only=True
    )

    class Meta:
        model = Mensalidade
        fields = [
            "id",
            "familia",
            "familia_detalhes",
            "mes_referencia",
            "valor",
            "status",
            "data_vencimento",
            "data_pagamento",
            "metodo_pagamento",
        ]
        
        
class InvestimentoSerializer(serializers.ModelSerializer):

    class Meta:
        model = Investimento
        fields = [
            "id",
            "titulo",
            "categoria",
            "valor",
            "data",
            "responsavel",
            "status",
            "descricao",
            "observacoes",
        ]
        
        
class DocumentoSerializer(serializers.ModelSerializer):

    morador_detalhes = MoradorSerializer(
        source="morador",
        read_only=True
    )

    class Meta:
        model = Documento
        fields = [
            "id",
            "morador",
            "morador_detalhes",
            "titulo",
            "tipo",
            "data_emissao",
            "arquivo",
            "criado_em",
        ]
        read_only_fields = [
            "id",
            "criado_em",
        ]

    def validate_arquivo(self, arquivo):

        extensoes_permitidas = [
            ".pdf",
            ".jpg",
            ".jpeg",
            ".png",
        ]

        nome = arquivo.name.lower()

        if not any(
            nome.endswith(ext)
            for ext in extensoes_permitidas
        ):
            raise serializers.ValidationError(
                "Formato não permitido. "
                "Envie um arquivo PDF, JPG, JPEG ou PNG."
            )

        # Limite de 10 MB
        if arquivo.size > 10 * 1024 * 1024:
            raise serializers.ValidationError(
                "O arquivo não pode ter mais de 10 MB."
            )

        return arquivo
    
    
class AssinaturaDocumentoSerializer(serializers.ModelSerializer):

    class Meta:
        model = AssinaturaDocumento
        fields = [
            "id",
            "documento",
            "assinatura",
            "assinado_por",
            "data_assinatura",
        ]

        read_only_fields = [
            "id",
            "data_assinatura",
        ]
        
        
class EventoAgendaSerializer(serializers.ModelSerializer):

    class Meta:
        model = EventoAgenda
        fields = [
            "id",
            "titulo",
            "responsavel",
            "descricao",
            "data",
            "hora",
            "local",
            "tipo",
            "status",
            "criado_em",
        ]

        read_only_fields = [
            "id",
            "criado_em",
        ]


class RelatorioAtividadeSerializer(serializers.ModelSerializer):
    class Meta:
        model = RelatorioAtividade
        fields = [
            "id",
            "titulo",
            "descricao",
            "data",
            "responsavel",
            "categoria",
            "status",
            "imagens",
            "criado_em",
            "atualizado_em",
        ]
        read_only_fields = [
            "id",
            "criado_em",
            "atualizado_em",
        ]        
        
class AtividadeSerializer(serializers.ModelSerializer):

    class Meta:
        model = Atividade
        fields = [
            "id",
            "titulo",
            "descricao",
            "data",
            "responsavel",
            "local",
            "status",
            "criado_em",
        ]

        read_only_fields = [
            "id",
            "criado_em",
        ]
        
        
class OficioSerializer(serializers.ModelSerializer):

    class Meta:
        model = Oficio
        fields = [
            "id",
            "numero",
            "titulo",
            "destinatario",
            "assunto",
            "data_emissao",
            "data_protocolo",
            "numero_protocolo",
            "status",
            "observacoes",
            "criado_em",
            "atualizado_em",
        ]

        read_only_fields = [
            "id",
            "criado_em",
            "atualizado_em",
        ]
        
        
class PerfilUsuarioSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source="user.id", read_only=True)
    nome = serializers.CharField(write_only=True, required=False)
    email = serializers.EmailField(write_only=True)
    senha = serializers.CharField(write_only=True)

    class Meta:
        model = PerfilUsuario
        fields = [
            "id",
            "nome",
            "email",
            "senha",
            "role",
            "morador",
            "cpf",
            "familia",
        ]
        read_only_fields = ["id"]

    def create(self, validated_data):
        email = validated_data.pop("email")
        senha = validated_data.pop("senha")
        nome = validated_data.pop("nome", "")

        user = User.objects.create_user(
            username=email,
            email=email,
            password=senha
        )

        if nome:
            partes = nome.strip().split(" ", 1)

            user.first_name = partes[0]

            if len(partes) > 1:
                user.last_name = partes[1]

            user.save()

        perfil = PerfilUsuario.objects.create(
            user=user,
            **validated_data
        )

        return perfil

    def to_representation(self, instance):
        data = super().to_representation(instance)

        data["nome"] = instance.user.get_full_name()

        data["email"] = instance.user.email

        return data
    
    
class DespesaSerializer(serializers.ModelSerializer):

    class Meta:
        model = Despesa

        fields = [
            "id",
            "categoria",
            "valor",
            "data",
            "responsavel",
            "descricao",
            "criado_em",
        ]

        read_only_fields = [
            "id",
            "criado_em",
        ]