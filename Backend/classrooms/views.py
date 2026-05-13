from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Classroom, Assignment
from .serializers import ClassroomSerializer, AssignmentSerializer

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
