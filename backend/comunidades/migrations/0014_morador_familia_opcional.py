from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("comunidades", "0013_relatorioatividade"),
    ]

    operations = [
        migrations.AlterField(
            model_name="morador",
            name="familia",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name="moradores",
                to="comunidades.familia",
            ),
        ),
    ]
