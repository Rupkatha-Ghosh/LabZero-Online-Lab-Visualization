from rest_framework import serializers
from .models import Element, Molecule, AtomPosition, LonePair, Subject, Topic, GlobalSettings, Feedback

class GlobalSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = GlobalSettings
        fields = ['subject_sort_method']

class TopicSerializer(serializers.ModelSerializer):
    targetClass = serializers.JSONField(source='target_class')

    class Meta:
        model = Topic
        fields = ['id', 'subject', 'slug', 'name', 'description', 'simulation_id', 'targetClass', 'theory', 'order']

class SubjectSerializer(serializers.ModelSerializer):
    topics = TopicSerializer(many=True, read_only=True)
    targetClass = serializers.JSONField(source='target_class', required=False)
    iconColor = serializers.CharField(source='icon_color', required=False)

    class Meta:
        model = Subject
        fields = ['id', 'slug', 'name', 'description', 'image_url', 'model_url', 'icon', 'color', 'theme', 'iconColor', 'targetClass', 'topics', 'order']


class ElementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Element
        fields = "__all__"

class AtomPositionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AtomPosition
        fields = ['symbol', 'x', 'y', 'z']

class LonePairSerializer(serializers.ModelSerializer):
    class Meta:
        model = LonePair
        fields = ['x', 'y', 'z']

class MoleculeSerializer(serializers.ModelSerializer):
    atoms = AtomPositionSerializer(many=True, required=False)
    lonePairs = LonePairSerializer(source='lone_pairs', many=True, required=False)

    realAngle = serializers.CharField(source='real_angle')
    modelAngle = serializers.CharField(source='model_angle')

    class Meta:
        model = Molecule
        fields = [
            'formula', 'name', 'central_atom', 
            'atoms', 'lonePairs', 'realAngle', 'modelAngle'
        ]

    def create(self, validated_data):
        atoms_data = validated_data.pop('atoms', [])
        lone_pairs_data = validated_data.pop('lone_pairs', [])
        molecule = Molecule.objects.create(**validated_data)
        
        for atom_data in atoms_data:
            AtomPosition.objects.create(molecule=molecule, **atom_data)
        for lp_data in lone_pairs_data:
            LonePair.objects.create(molecule=molecule, **lp_data)
            
        return molecule

    def update(self, instance, validated_data):
        atoms_data = validated_data.pop('atoms', None)
        lone_pairs_data = validated_data.pop('lone_pairs', None)
        
        # Update molecule fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update atoms (simple replace for now)
        if atoms_data is not None:
            instance.atoms.all().delete()
            for atom_data in atoms_data:
                AtomPosition.objects.create(molecule=instance, **atom_data)
                
        # Update lone pairs (simple replace for now)
        if lone_pairs_data is not None:
            instance.lone_pairs.all().delete()
            for lp_data in lone_pairs_data:
                LonePair.objects.create(molecule=instance, **lp_data)
                
        return instance

class FeedbackSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    user_role = serializers.CharField(source='user.role', read_only=True)
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)

    class Meta:
        model = Feedback
        fields = ['id', 'username', 'user_role', 'first_name', 'last_name', 'rating', 'comment', 'created_at']
        read_only_fields = ['id', 'created_at']