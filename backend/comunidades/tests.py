from django.test import TestCase
from datetime import date

from .models import Familia, Morador
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
