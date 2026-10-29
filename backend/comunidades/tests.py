from django.test import TestCase, override_settings
from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient
from datetime import date
from unittest.mock import patch

from .models import Documento, Familia, Morador, PerfilUsuario
from .serializers import MoradorSerializer


class MoradorFamiliaOpcionalTests(TestCase):
    def payload(self, **overrides):
        return {
            "nome": "Morador de teste",
            "data_nascimento": "1990-01-02",
            "cpf": "529.982.247-25",
            **overrides,
        }

    def test_cadastra_morador_sem_familia(self):
        serializer = MoradorSerializer(data=self.payload(familia=None))
        self.assertTrue(serializer.is_valid(), serializer.errors)
        morador = serializer.save()
        self.assertIsNone(morador.familia_id)

    def test_cadastra_morador_com_familia_existente(self):
        familia = Familia.objects.create(nome="Família existente")
        serializer = MoradorSerializer(data=self.payload(familia=familia.pk))
        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.assertEqual(serializer.save().familia_id, familia.pk)

    def test_edita_sem_vinculo_e_vincula_posteriormente(self):
        morador = Morador.objects.create(
            nome="Morador de teste",
            data_nascimento=date(1990, 1, 2),
            cpf="529.982.247-25",
        )
        atualizar = MoradorSerializer(morador, data=self.payload(familia=None))
        self.assertTrue(atualizar.is_valid(), atualizar.errors)
        morador = atualizar.save()
        morador.refresh_from_db()
        self.assertIsNone(morador.familia_id)

        familia = Familia.objects.create(nome="Vínculo posterior")
        vincular = MoradorSerializer(morador, data=self.payload(familia=familia.pk))
        self.assertTrue(vincular.is_valid(), vincular.errors)
        morador = vincular.save()
        morador.refresh_from_db()
        self.assertEqual(morador.familia_id, familia.pk)


@override_settings(STORAGES={
    "default": {"BACKEND": "django.core.files.storage.InMemoryStorage"},
    "staticfiles": {"BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage"},
})
class DocumentoStorageAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.morador = Morador.objects.create(
            nome="Morador de teste",
            data_nascimento=date(1990, 1, 2),
            cpf="529.982.247-25",
        )
        self.outro_morador = Morador.objects.create(
            nome="Outro morador de teste",
            data_nascimento=date(1988, 3, 4),
            cpf="111.444.777-35",
        )
        self.admin = User.objects.create_user(username="documento-admin", password="senha-de-teste")
        PerfilUsuario.objects.create(user=self.admin, role="admin")
        self.viewer = User.objects.create_user(username="documento-viewer", password="senha-de-teste")
        PerfilUsuario.objects.create(user=self.viewer, role="visualizador", morador=self.morador)

    def criar_documento(self, morador=None, arquivo="documentos/teste.pdf"):
        return Documento.objects.create(
            morador=morador or self.morador,
            titulo="Documento de teste",
            tipo="outro",
            data_emissao=date(2026, 1, 2),
            arquivo=arquivo,
        )

    def test_upload_salva_binario_e_metadados(self):
        self.client.force_authenticate(self.admin)
        response = self.client.post("/api/documentos/", {
            "morador": str(self.morador.pk),
            "titulo": "Documento enviado",
            "tipo": "outro",
            "data_emissao": "2026-01-02",
            "arquivo": SimpleUploadedFile("anexo.pdf", b"conteudo-de-teste", content_type="application/pdf"),
        }, format="multipart")

        self.assertEqual(response.status_code, 201, response.data)
        documento = Documento.objects.get(pk=response.data["id"])
        self.assertEqual(documento.titulo, "Documento enviado")
        self.assertTrue(documento.arquivo.storage.exists(documento.arquivo.name))
        with documento.arquivo.open("rb") as saved_file:
            self.assertEqual(saved_file.read(), b"conteudo-de-teste")
        self.assertEqual(response.data["arquivo"], documento.arquivo.name)
        self.assertNotIn("r2.cloudflarestorage.com", response.data["arquivo"])

    def test_visualizador_pode_baixar_proprio_documento(self):
        documento = self.criar_documento()
        documento.arquivo.save("proprio.pdf", SimpleUploadedFile("proprio.pdf", b"proprio"), save=True)
        self.client.force_authenticate(self.viewer)

        response = self.client.get(f"/api/documentos/{documento.pk}/arquivo/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(b"".join(response.streaming_content), b"proprio")

    def test_visualizador_nao_lista_ou_baixa_documento_de_outro_morador(self):
        proprio = self.criar_documento()
        proprio.arquivo.save("proprio.pdf", SimpleUploadedFile("proprio.pdf", b"proprio"), save=True)
        documento = self.criar_documento(morador=self.outro_morador)
        self.client.force_authenticate(self.viewer)

        lista = self.client.get("/api/documentos/")
        detalhe = self.client.get(f"/api/documentos/{documento.pk}/arquivo/")

        self.assertEqual(lista.status_code, 200)
        self.assertEqual([item["id"] for item in lista.data], [proprio.pk])
        self.assertEqual(detalhe.status_code, 404)

    def test_edicao_de_metadados_preserva_arquivo_atual(self):
        documento = self.criar_documento()
        documento.arquivo.save("original.pdf", SimpleUploadedFile("original.pdf", b"original"), save=True)
        nome_arquivo = documento.arquivo.name
        self.client.force_authenticate(self.admin)

        response = self.client.patch(f"/api/documentos/{documento.pk}/", {
            "titulo": "Título atualizado",
        }, format="multipart")

        self.assertEqual(response.status_code, 200, response.data)
        documento.refresh_from_db()
        self.assertEqual(documento.titulo, "Título atualizado")
        self.assertEqual(documento.arquivo.name, nome_arquivo)

    def test_edicao_de_arquivo_substitui_o_objeto_antigo(self):
        documento = self.criar_documento()
        documento.arquivo.save("anterior.pdf", SimpleUploadedFile("anterior.pdf", b"anterior"), save=True)
        storage = documento.arquivo.storage
        arquivo_anterior = documento.arquivo.name
        self.client.force_authenticate(self.admin)

        with self.captureOnCommitCallbacks(execute=True):
            response = self.client.patch(f"/api/documentos/{documento.pk}/", {
                "arquivo": SimpleUploadedFile("novo.pdf", b"novo", content_type="application/pdf"),
            }, format="multipart")

        self.assertEqual(response.status_code, 200, response.data)
        documento.refresh_from_db()
        self.assertNotEqual(documento.arquivo.name, arquivo_anterior)
        self.assertFalse(storage.exists(arquivo_anterior))
        with documento.arquivo.open("rb") as saved_file:
            self.assertEqual(saved_file.read(), b"novo")

    def test_exclusao_remove_registro_do_banco(self):
        documento = self.criar_documento()
        documento.arquivo.save("remover.pdf", SimpleUploadedFile("remover.pdf", b"conteudo"), save=True)
        storage = documento.arquivo.storage
        arquivo_nome = documento.arquivo.name
        self.client.force_authenticate(self.admin)

        with self.captureOnCommitCallbacks(execute=True):
            response = self.client.delete(f"/api/documentos/{documento.pk}/")

        self.assertEqual(response.status_code, 204)
        self.assertFalse(Documento.objects.filter(pk=documento.pk).exists())
        self.assertFalse(storage.exists(arquivo_nome))

    def test_referencia_sem_objeto_no_storage_retorna_404(self):
        documento = self.criar_documento(arquivo="documentos/ausente.pdf")
        self.client.force_authenticate(self.admin)

        response = self.client.get(f"/api/documentos/{documento.pk}/arquivo/")

        self.assertEqual(response.status_code, 404)

    def test_falha_do_storage_retorna_503_sem_expor_detalhes(self):
        documento = self.criar_documento()
        self.client.force_authenticate(self.admin)
        storage = Documento._meta.get_field("arquivo").storage
        with patch.object(storage, "open", side_effect=OSError("storage indisponivel")):
            response = self.client.get(f"/api/documentos/{documento.pk}/arquivo/")

        self.assertEqual(response.status_code, 503)
        self.assertNotIn("storage indisponivel", str(response.data))
