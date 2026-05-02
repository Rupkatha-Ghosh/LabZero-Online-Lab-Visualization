from enum import unique
from django.db import models

class Element(models.Model):
    CATEGORY_CHOICES = [
        ('nonmetal', 'Nonmetal'),
        ('noble-gas', 'Noble Gas'),
        ('alkali-metal', 'Alkali Metal'),
        ('alkaline-earth-metal', 'Alkaline Earth Metal'),
        ('metalloid', 'Metalloid'),
        ('halogen', 'Halogen'),
        ('post-transition-metal', 'Post-transition Metal'),
        ('transition-metal', 'Transition Metal'),
        ('lanthanide', 'Lanthanide'),
        ('actinide', 'Actinide'),
    ]

    number = models.PositiveIntegerField(unique=True)
    symbol = models.CharField(max_length=3,unique=True)
    name = models.CharField(max_length=50, unique=True)
    mass = models.DecimalField(max_digits=10, decimal_places=4)
    category = models.CharField(
        max_length=50,
        choices=CATEGORY_CHOICES
    )
    electrons = models.JSONField()
    discovery = models.CharField(max_length=100, null=True, blank=True)
    color = models.CharField(max_length=7)
    config = models.CharField(max_length=100)
    radius = models.IntegerField()
    ionization = models.FloatField(null=True, blank=True)
    electronegativity = models.FloatField(null=True, blank=True)
    period = models.IntegerField()
    group = models.IntegerField(null=True, blank=True)
    summary = models.TextField()

    def __str__(self):
        return f"{self.number}. {self.name} ({self.symbol})"


class GlobalSettings(models.Model):
    SORT_CHOICES = [
        ('alpha', 'Alphabetical'),
        ('order', 'Custom Order'),
    ]
    subject_sort_method = models.CharField(max_length=10, choices=SORT_CHOICES, default='order')
    
    class Meta:
        verbose_name_plural = "Global Settings"

    def __str__(self):
        return "Global Application Settings"


class Molecule(models.Model):
    formula = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=100, unique=True)
    central_atom = models.CharField(max_length=5)
    real_angle = models.CharField(
        max_length=100,
        help_text = "The actual Bond Angle in degrees (can be multiple values)"
    )
    model_angle = models.CharField(
        max_length=100,
        help_text = "The model Bond Angle in degrees (can be multiple values)"
    )

    def __str__(self):
        return f"{self.name} ({self.formula})"


class AtomPosition(models.Model):
    molecule = models.ForeignKey(Molecule, related_name='atoms', on_delete=models.CASCADE)
    symbol = models.CharField(max_length=3)
    x = models.FloatField()
    y = models.FloatField()
    z = models.FloatField()
    
    def __str__(self):
        return f"{self.symbol} in {self.molecule.formula} at ({self.x}, {self.y}, {self.z})"


class LonePair(models.Model):
    molecule = models.ForeignKey(
        Molecule, 
        related_name='lone_pairs', 
        on_delete=models.CASCADE
        ) 
    x = models.FloatField()
    y = models.FloatField()
    z = models.FloatField()

    def __str__(self):
        return f"Lone Pair for {self.molecule.formula}"

class Subject(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True, null=True, blank=True, help_text="ID used by frontend (e.g., 'chemistry')")
    description = models.TextField(null=True, blank=True)
    image_url = models.URLField(max_length=500, null=True, blank=True)
    model_url = models.CharField(max_length=500, null=True, blank=True, help_text="Link to .glb or .gltf model (e.g. /models/chem.glb)")
    icon = models.CharField(max_length=50)
    color = models.CharField(max_length=50)
    theme = models.CharField(max_length=100, default='border-[var(--border-glass)]')
    icon_color = models.CharField(max_length=100, default='text-indigo-500')
    target_class = models.JSONField(help_text="List of target classes, e.g., ['Class 11', 'Class 12']")
    order = models.IntegerField(default=0, help_text="Order of appearance in the UI")

    def __str__(self):
        return self.name

class Topic(models.Model):
    subject = models.ForeignKey(Subject, related_name='topics', on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, null=True, blank=True, help_text="Slug for URL (e.g., 'atomic-structure')")
    description = models.TextField()
    # The simulation_id maps to our new React Registry
    simulation_id = models.CharField(max_length=100, null=True, blank=True, help_text="ID for the 3D simulation (e.g., 'molecular_structure')")
    target_class = models.JSONField(help_text="List of target classes, e.g., ['Class 11']")
    theory = models.TextField()
    order = models.IntegerField(default=0, help_text="Order in which this topic appears (lower numbers appear first)")

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return f"{self.name} ({self.subject.name})"