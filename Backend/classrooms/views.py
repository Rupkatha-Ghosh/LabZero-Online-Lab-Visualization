from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Classroom, Assignment
from .serializers import ClassroomSerializer, AssignmentSerializer
from livekit import api
import os

class ClassroomViewSet(viewsets.ModelViewSet):
    serializer_class = ClassroomSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['teacher', 'institute']:            
            return Classroom.objects.filter(teacher=user)
        elif user.role == 'student':
            return user.enrolled_classrooms.all()
        return Classroom.objects.none()

    def perform_create(self, serializer):
        if self.request.user.role not in ['teacher', 'institute']:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only accounts with 'teacher' or 'institute' roles can create classrooms.")
        serializer.save(teacher=self.request.user)

class JoinClassroomView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        code = request.data.get('code')
        try:
            classroom = Classroom.objects.get(invite_code=code)
            if request.user.role != 'student':
                return Response(
                    {"error": "Only students can join classrooms."}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            classroom.students.add(request.user)
            return Response(
                {"message": f"Successfully joined {classroom.name}", "classroom": ClassroomSerializer(classroom).data},
                status=status.HTTP_200_OK
            )
        except Classroom.DoesNotExist:
            return Response(
                {"error": "Invalid invite code."}, 
                status=status.HTTP_404_NOT_FOUND
            )

class AssignmentViewSet(viewsets.ModelViewSet):
    serializer_class = AssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['teacher', 'institute']:
            return Assignment.objects.filter(classroom__teacher=user)
        elif user.role == 'student':
            return Assignment.objects.filter(classroom__students=user)
        return Assignment.objects.none()

class LiveKitTokenView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        room_name = request.data.get('room_name')
        if not room_name:
            return Response({"error": "room_name is required"}, status=status.HTTP_400_BAD_REQUEST)

        # In production, these should be in your .env file
        api_key = os.getenv('LIVEKIT_API_KEY', 'devkey')
        api_secret = os.getenv('LIVEKIT_API_SECRET', 'secret')
        
        # Identity is usually the user's username or ID
        identity = request.user.username
        name = f"{request.user.first_name} {request.user.last_name}".strip() or identity

        token = api.AccessToken(api_key, api_secret) \
            .with_identity(identity) \
            .with_name(name) \
            .with_grants(api.VideoGrants(
                room_join=True,
                room=room_name,
            ))

        return Response({'token': token.to_jwt()})
