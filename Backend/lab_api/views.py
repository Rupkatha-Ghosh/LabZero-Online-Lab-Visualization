from rest_framework.views import APIView
from rest_framework import generics
from .models import Element, Molecule, Subject, Topic, GlobalSettings
from .serializers import ElementSerializer, MoleculeSerializer, SubjectSerializer, TopicSerializer, GlobalSettingsSerializer
from rest_framework.response import Response

class GlobalSettingsView(APIView):
    def get(self, request):
        settings, created = GlobalSettings.objects.get_or_create(id=1)
        serializer = GlobalSettingsSerializer(settings)
        return Response(serializer.data)

    def post(self, request):
        settings, created = GlobalSettings.objects.get_or_create(id=1)
        serializer = GlobalSettingsSerializer(settings, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

class APIStatus(APIView):
    def get(self, request):
        return Response({"status": "Online", "version": "1.0.0"})

class ElementList(generics.ListCreateAPIView):
    queryset = Element.objects.all()
    serializer_class = ElementSerializer

class ElementDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Element.objects.all()
    serializer_class = ElementSerializer
    lookup_field = 'number'

class MoleculeList(generics.ListCreateAPIView):
    queryset = Molecule.objects.all()
    serializer_class = MoleculeSerializer

class MoleculeDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Molecule.objects.all()
    serializer_class = MoleculeSerializer
    lookup_field = 'formula'

class SubjectList(generics.ListCreateAPIView):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer

class SubjectDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer

class TopicList(generics.ListCreateAPIView):
    queryset = Topic.objects.all()
    serializer_class = TopicSerializer

class TopicDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Topic.objects.all()
    serializer_class = TopicSerializer