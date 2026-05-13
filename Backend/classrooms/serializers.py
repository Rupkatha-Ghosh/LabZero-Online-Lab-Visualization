from rest_framework import serializers
from .models import Classroom, Assignment
from users.serializers import UserSerializer
from lab_api.serializers import TopicSerializer

class AssignmentSerializer(serializers.ModelSerializer):
    topic_name = serializers.ReadOnlyField(source='topic.name')
    teacher_name = serializers.SerializerMethodField()

    class Meta:
        model = Assignment
        fields = ['id', 'classroom', 'title', 'description', 'topic', 'topic_name', 'teacher_name', 'file_url', 'points', 'due_date', 'status', 'created_at']

    def get_teacher_name(self, obj):
        try:
            teacher = obj.classroom.teacher
            if teacher.first_name and teacher.last_name:
                return f"{teacher.first_name} {teacher.last_name}"
            return teacher.first_name or teacher.username
        except AttributeError:
            return "Unknown Teacher"

class ClassroomSerializer(serializers.ModelSerializer):
    teacher_name = serializers.SerializerMethodField()
    students_count = serializers.SerializerMethodField()
    assignments = AssignmentSerializer(many=True, read_only=True)
    students = UserSerializer(many=True, read_only=True)

    class Meta:
        model = Classroom
        fields = ['id', 'name', 'teacher', 'teacher_name', 'invite_code', 'students_count', 'students', 'is_live', 'assignments', 'created_at']
        read_only_fields = ['invite_code', 'teacher']

    def get_teacher_name(self, obj):
        if obj.teacher.first_name and obj.teacher.last_name:
            return f"{obj.teacher.first_name} {obj.teacher.last_name}"
        return obj.teacher.first_name or obj.teacher.username

    def get_students_count(self, obj):
        return obj.students.count()
