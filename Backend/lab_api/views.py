from rest_framework.views import APIView
from rest_framework import generics
from .models import Element, Molecule, Subject, Topic, GlobalSettings, Feedback
from .serializers import (
    ElementSerializer, MoleculeSerializer, SubjectSerializer, 
    TopicSerializer, GlobalSettingsSerializer, FeedbackSerializer
)
from django.db.models import Avg
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly

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

class PublicStatsView(APIView):
    def get(self, request):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        # Calculate average rating
        avg_rating = Feedback.objects.aggregate(Avg('rating'))['rating__avg'] or 5.0
        feedback_count = Feedback.objects.count()
        
        return Response({
            "subjects": Subject.objects.count(),
            "topics": Topic.objects.count(),
            "students": User.objects.filter(role='student').count(),
            "average_rating": round(avg_rating, 1),
            "feedback_count": feedback_count
        })

class FeedbackList(generics.ListCreateAPIView):
    queryset = Feedback.objects.all()
    serializer_class = FeedbackSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def perform_create(self, serializer):
        if self.request.user.is_authenticated:
            serializer.save(user=self.request.user)
        else:
            pass