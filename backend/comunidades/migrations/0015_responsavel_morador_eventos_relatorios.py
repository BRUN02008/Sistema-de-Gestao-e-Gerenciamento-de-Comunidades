from django.db import migrations, models
import django.db.models.deletion


def vincular_responsaveis_unicos(apps, schema_editor):
    Morador = apps.get_model("comunidades", "Morador")
    EventoAgenda = apps.get_model("comunidades", "EventoAgenda")
    RelatorioAtividade = apps.get_model("comunidades", "RelatorioAtividade")
    banco = schema_editor.connection.alias

    moradores_por_nome = {}
    for morador in Morador.objects.using(banco).only("id", "nome").iterator():
        chave = (morador.nome or "").strip().casefold()
        moradores_por_nome.setdefault(chave, []).append(morador.id)

    for Modelo in (EventoAgenda, RelatorioAtividade):
        for registro in Modelo.objects.using(banco).all().only("id", "responsavel").iterator():
            nome = (registro.responsavel or "").strip()
            if not nome:
                continue
            ids = moradores_por_nome.get(nome.casefold(), [])
            if len(ids) == 1:
                Modelo.objects.using(banco).filter(pk=registro.pk).update(responsavel_morador_id=ids[0])


class Migration(migrations.Migration):

    dependencies = [
        ("comunidades", "0014_morador_familia_opcional"),
    ]

    operations = [
        migrations.AddField(
            model_name="eventoagenda",
            name="responsavel_morador",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="eventos_agenda_responsavel",
                to="comunidades.morador",
            ),
        ),
        migrations.AddField(
            model_name="relatorioatividade",
            name="responsavel_morador",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="relatorios_atividade_responsavel",
                to="comunidades.morador",
            ),
        ),
        migrations.RunPython(vincular_responsaveis_unicos, migrations.RunPython.noop),
    ]
