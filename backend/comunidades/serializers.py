import unicodedata
import re

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


def cpf_digits(value):
    return "".join(char for char in value if char in "0123456789")


def cpf_valido(value):
    if re.search(r"[^0-9.-]", value):
        return False
    cpf = cpf_digits(value)
    if len(cpf) != 11 or len(set(cpf)) == 1:
        return False
    for tamanho, peso in ((9, 10), (10, 11)):
        soma = sum(int(digito) * (peso - indice) for indice, digito in enumerate(cpf[:tamanho]))
        verificador = (soma * 10) % 11
        if verificador == 10:
            verificador = 0
        if verificador != int(cpf[tamanho]):
            return False
    return True


def validar_cpf(value):
    if not cpf_valido(value):
        raise serializers.ValidationError("Informe um CPF válido.")
    return value


def validar_telefone(value):
    if re.search(r"[^0-9\s()+.-]", value):
        raise serializers.ValidationError("O telefone contém caracteres inválidos.")
    digits = cpf_digits(value)
    if value.strip() and not digits:
        raise serializers.ValidationError("Informe um telefone com DDD e números.")
    if len(digits) in (12, 13) and digits.startswith("55"):
        digits = digits[2:]
    if digits and len(digits) not in (10, 11):
        raise serializers.ValidationError("Informe um telefone com DDD e 8 ou 9 dígitos.")
    if digits:
        ddd = int(digits[:2])
        numero = digits[2:]
        primeiro_digito_valido = numero[0] in "2345" if len(numero) == 8 else numero[0] == "9"
        if ddd < 11 or ddd > 99 or not primeiro_digito_valido:
            raise serializers.ValidationError("Informe um telefone brasileiro válido com DDD.")
    return value


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
    responsavel_morador_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    class Meta:
        model = Familia
        fields = [
            "id",
            "nome",
            "responsavel",
            "responsavel_morador_id",
            "endereco",
            "total_membros",
        ]

    def validate(self, attrs):
        responsavel_id = attrs.pop("responsavel_morador_id", None)
        if responsavel_id is None and (self.instance is None or "responsavel" in attrs):
            raise serializers.ValidationError({"responsavel_morador_id": "Selecione um morador cadastrado como responsável."})
        if responsavel_id is not None:
            try:
                morador = Morador.objects.select_for_update().get(pk=responsavel_id)
            except Morador.DoesNotExist:
                raise serializers.ValidationError({"responsavel_morador_id": "Selecione um morador cadastrado."})
            if morador.familia_id and (self.instance is None or morador.familia_id != self.instance.id):
                raise serializers.ValidationError({"responsavel_morador_id": "Este morador já pertence a outra família."})
            attrs["_responsavel_morador"] = morador
        instance = self.instance
        nome = (attrs.get("nome", instance.nome if instance else "") or "").strip()
        responsavel = (
            attrs.get("responsavel", instance.responsavel if instance else "") or ""
        ).strip()
        if attrs.get("_responsavel_morador"):
            responsavel = attrs["_responsavel_morador"].nome

        if not nome:
            raise serializers.ValidationError({"nome": "Informe o nome da família."})

        def normalizar(valor):
            sem_acentos = "".join(
                caractere
                for caractere in unicodedata.normalize("NFKD", valor)
                if not unicodedata.combining(caractere)
            )
            return " ".join(sem_acentos.casefold().split())

        identidade_alterada = instance is None or (
            normalizar(nome) != normalizar(instance.nome)
            or normalizar(responsavel) != normalizar(instance.responsavel)
        )
        if identidade_alterada:
            duplicadas = Familia.objects.select_for_update().only(
                "id", "nome", "responsavel"
            )
            if instance:
                duplicadas = duplicadas.exclude(pk=instance.pk)
            if any(
                normalizar(familia.nome) == normalizar(nome)
                and normalizar(familia.responsavel) == normalizar(responsavel)
                for familia in duplicadas
            ):
                raise serializers.ValidationError({
                    "nome": "Já existe uma família com este nome e responsável."
                })

        attrs["nome"] = nome
        attrs["responsavel"] = responsavel
        return attrs

    def create(self, validated_data):
        morador = validated_data.pop("_responsavel_morador", None)
        familia = super().create(validated_data)
        if morador:
            morador.familia = familia
            morador.save(update_fields=["familia"])
        return familia

    def update(self, instance, validated_data):
        morador = validated_data.pop("_responsavel_morador", None)
        familia = super().update(instance, validated_data)
        if morador:
            morador.familia = familia
            morador.save(update_fields=["familia"])
        return familia

    def to_representation(self, instance):
        data = super().to_representation(instance)
        morador = instance.moradores.filter(nome=instance.responsavel).first()
        data["responsavel_morador_id"] = morador.id if morador else None
        return data


class MoradorSerializer(serializers.ModelSerializer):
    familia = serializers.PrimaryKeyRelatedField(queryset=Familia.objects.all(), required=False, allow_null=True)
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

    def validate_cpf(self, value):
        validar_cpf(value)
        normalized = cpf_digits(value)
        query = Morador.objects.all()
        if self.instance:
            query = query.exclude(pk=self.instance.pk)
        if any(cpf_digits(outro.cpf) == normalized for outro in query.only("cpf")):
            raise serializers.ValidationError("Já existe um morador cadastrado com este CPF.")
        return value

    def validate_telefone(self, value):
        try:
            return validar_telefone(value)
        except serializers.ValidationError:
            if self.instance and value == self.instance.telefone:
                return value
            raise

    def validate_rg(self, value):
        if re.fullmatch(r"[0-9]{0,30}", value):
            return value
        if self.instance and value == self.instance.rg:
            return value
        raise serializers.ValidationError("O RG deve conter somente números e ter até 30 dígitos.")

    def validate_familia(self, value):
        if self.instance and self.instance.familia_id and self.instance.familia.responsavel == self.instance.nome:
            if value is None or value.pk != self.instance.familia_id:
                raise serializers.ValidationError(
                    "Este morador é o responsável familiar. Altere o responsável na página Famílias antes de desvinculá-lo."
                )
        return value

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
        nome_anterior = instance.nome
        familia_anterior = instance.familia

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()

        if familia_anterior and familia_anterior.responsavel == nome_anterior and instance.nome != nome_anterior:
            familia_anterior.responsavel = instance.nome
            familia_anterior.save(update_fields=["responsavel"])

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

    def validate_cpf(self, value):
        if value:
            validar_cpf(value)
        return value

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
