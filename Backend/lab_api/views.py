import uuid
from collections import Counter
from datetime import datetime, time

from django.utils import timezone
from django.utils.dateparse import parse_date, parse_datetime
from rest_framework.views import APIView
from rest_framework import generics
from .models import Element, Molecule, Subject, Topic, GlobalSettings, Feedback, FeedbackForm, FeedbackResponse
from .serializers import (
    ElementSerializer, MoleculeSerializer, SubjectSerializer, 
    TopicSerializer, GlobalSettingsSerializer, FeedbackSerializer
)
from django.db.models import Avg
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework import status

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


class IsFeedbackAdmin(IsAuthenticated):
    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        user = request.user
        return bool(
            getattr(user, 'is_staff', False)
            or getattr(user, 'is_superuser', False)
            or getattr(user, 'role', '') in ['institute', 'teacher']
        )


def api_success(data, message='Request completed successfully.', response_status=200):
    return Response({'success': True, 'message': message, 'data': data}, status=response_status)


def api_error(message, response_status=400):
    return Response({'success': False, 'message': message}, status=response_status)


def parse_optional_datetime(value):
    if not value:
        return None
    parsed = parse_datetime(value)
    if parsed:
        return timezone.make_aware(parsed) if timezone.is_naive(parsed) else parsed
    parsed_date = parse_date(value)
    if parsed_date:
        return timezone.make_aware(datetime.combine(parsed_date, time.min))
    return None


def user_payload(user):
    if not getattr(user, 'is_authenticated', False):
        return {}
    return {
        'userId': str(user.id),
        'name': f'{user.first_name} {user.last_name}'.strip() or user.username,
        'email': user.email,
        'role': getattr(user, 'role', ''),
    }


def normalize_feedback_form_payload(payload, fallback_user=None):
    sections = payload.get('sections') or []
    if not payload.get('title'):
        raise ValueError('Feedback form title is required.')
    if not sections:
        raise ValueError('At least one feedback section is required.')

    normalized_sections = []
    for section_index, section in enumerate(sections):
        questions = section.get('questions') or []
        if len(questions) < 3 or len(questions) > 5:
            raise ValueError(f'Section "{section.get("title") or section_index + 1}" must contain 3 to 5 questions.')

        normalized_questions = []
        question_ids = []
        for question_index, question in enumerate(questions):
            question_id = str(question.get('_id') or question.get('id') or uuid.uuid4())
            question_type = question.get('type')
            if question_type not in ['text', 'rating', 'checkbox', 'radio', 'dropdown']:
                raise ValueError('Unsupported question type.')
            if not question.get('prompt'):
                raise ValueError('Every question needs a prompt.')
            if question_type in ['checkbox', 'radio', 'dropdown'] and len(question.get('options') or []) < 2:
                raise ValueError('Choice questions need at least two options.')

            question_ids.append(question_id)
            normalized_questions.append({
                '_id': question_id,
                'id': question_id,
                'sectionTitle': section.get('title', f'Section {section_index + 1}'),
                'prompt': question.get('prompt'),
                'type': question_type,
                'required': question.get('required', True),
                'options': question.get('options') or [],
                'minRating': question.get('minRating', 1 if question_type == 'rating' else None),
                'maxRating': question.get('maxRating', 5 if question_type == 'rating' else None),
                'order': question.get('order', question_index),
            })

        normalized_sections.append({
            'title': section.get('title', f'Section {section_index + 1}'),
            'description': section.get('description', ''),
            'questionIds': question_ids,
            'order': section.get('order', section_index),
            'questions': normalized_questions,
        })

    created_by = payload.get('createdBy') or payload.get('created_by') or fallback_user or {}
    return {
        'title': payload.get('title'),
        'description': payload.get('description', ''),
        'created_by': created_by,
        'classroom_course_metadata': payload.get('classroomCourseMetadata') or payload.get('classroom_course_metadata') or {},
        'anonymous_allowed': payload.get('anonymousAllowed', payload.get('anonymous_allowed', True)),
        'starts_at': parse_optional_datetime(payload.get('startsAt') or payload.get('starts_at')),
        'ends_at': parse_optional_datetime(payload.get('endsAt') or payload.get('ends_at')),
        'sections': normalized_sections,
        'status': payload.get('status', 'draft'),
    }


def serialize_feedback_form(form):
    return {
        '_id': str(form.id),
        'id': form.id,
        'title': form.title,
        'description': form.description,
        'createdBy': form.created_by,
        'classroomCourseMetadata': form.classroom_course_metadata,
        'anonymousAllowed': form.anonymous_allowed,
        'startsAt': form.starts_at.isoformat() if form.starts_at else None,
        'endsAt': form.ends_at.isoformat() if form.ends_at else None,
        'sections': form.sections,
        'status': form.status,
        'createdAt': form.created_at.isoformat() if form.created_at else None,
        'updatedAt': form.updated_at.isoformat() if form.updated_at else None,
    }


def all_questions(form):
    return [question for section in form.sections for question in section.get('questions', [])]


def validate_submission(form, payload):
    if form.status != 'published':
        raise ValueError('This feedback form is not accepting responses.')
    if payload.get('anonymous') and not form.anonymous_allowed:
        raise ValueError('Anonymous submissions are not allowed for this form.')

    now = timezone.now()
    if form.starts_at and now < form.starts_at:
        raise ValueError('This feedback form is not open yet.')
    if form.ends_at and now > form.ends_at:
        raise ValueError('This feedback form is closed.')

    answers = payload.get('answers') or []
    answers_by_question = {str(answer.get('questionId')): answer.get('value') for answer in answers}

    for question in all_questions(form):
        question_id = str(question.get('_id'))
        value = answers_by_question.get(question_id)
        if question.get('required') and (value is None or value == '' or value == []):
            raise ValueError(f'Missing required answer for "{question.get("prompt")}".')

    return answers


def build_feedback_analytics(form):
    responses = list(form.responses.all())
    question_stats = []
    for question in all_questions(form):
        question_id = str(question.get('_id'))
        values = [
            answer.get('value')
            for response in responses
            for answer in response.answers
            if str(answer.get('questionId')) == question_id
        ]
        stat = {
            'questionId': question_id,
            'prompt': question.get('prompt'),
            'type': question.get('type'),
            'totalAnswers': len(values),
        }
        if question.get('type') == 'rating':
            numeric_values = [float(value) for value in values if str(value).replace('.', '', 1).isdigit()]
            distribution = Counter(str(int(value)) for value in numeric_values)
            stat['ratingDistribution'] = dict(distribution)
            stat['averageRating'] = round(sum(numeric_values) / len(numeric_values), 2) if numeric_values else 0
            stat['ratingSum'] = sum(numeric_values)
        elif question.get('type') in ['checkbox', 'radio', 'dropdown']:
            flattened = []
            for value in values:
                flattened.extend(value if isinstance(value, list) else [value])
            stat['optionCounts'] = dict(Counter(map(str, flattened)))
        else:
            stat['textAnswerCount'] = len(values)
        question_stats.append(stat)

    rating_stats = [item for item in question_stats if item.get('type') == 'rating' and item.get('totalAnswers')]
    average_rating = round(sum(item.get('averageRating', 0) for item in rating_stats) / len(rating_stats), 2) if rating_stats else 0
    return {
        'formId': str(form.id),
        'totalResponses': len(responses),
        'anonymousResponses': len([response for response in responses if response.anonymous]),
        'identifiedResponses': len([response for response in responses if not response.anonymous]),
        'questionStats': question_stats,
        'summary': {
            'totalResponses': len(responses),
            'anonymousResponses': len([response for response in responses if response.anonymous]),
            'identifiedResponses': len([response for response in responses if not response.anonymous]),
            'averageRating': average_rating,
            'satisfactionPercentage': round((average_rating / 5) * 100) if average_rating else 0,
        },
        'lastCalculatedAt': timezone.now().isoformat(),
    }


STOP_WORDS = set('a an and are as at be but by for from had has have i in is it its of on or our that the their there this to was we were with you your'.split())
POSITIVE_WORDS = set('accurate amazing clear easy effective engaging excellent fun good great helpful improved interactive interesting liked love perfect smooth useful well'.split())
NEGATIVE_WORDS = set('bad boring broken confusing difficult error frustrating hard issue lag missing poor problem slow stuck unclear unhelpful weak worse wrong'.split())


def tokenize_text(value):
    return [
        token.strip("'")
        for token in ''.join(char.lower() if char.isalnum() or char.isspace() else ' ' for char in value).split()
        if len(token) > 2 and token not in STOP_WORDS
    ]


def sentiment(value):
    tokens = tokenize_text(value)
    score = sum(1 for token in tokens if token in POSITIVE_WORDS) - sum(1 for token in tokens if token in NEGATIVE_WORDS)
    return 'positive' if score > 0 else 'negative' if score < 0 else 'neutral', score


def text_analysis_for_values(values):
    tokens = [token for value in values for token in tokenize_text(value)]
    frequencies = Counter(tokens)
    sentiments = [sentiment(value) for value in values]
    positive = len([item for item in sentiments if item[0] == 'positive'])
    negative = len([item for item in sentiments if item[0] == 'negative'])
    neutral = len(values) - positive - negative
    average_score = round(sum(item[1] for item in sentiments) / len(sentiments), 3) if sentiments else 0
    keywords = [
        {'keyword': word, 'count': count, 'score': round(count / max(len(values), 1), 3)}
        for word, count in frequencies.most_common(20)
    ]
    return {
        'keywords': keywords,
        'wordFrequencies': [{'word': word, 'count': count} for word, count in frequencies.most_common(60)],
        'sentiment': {
            'positive': positive,
            'neutral': neutral,
            'negative': negative,
            'averageScore': average_score,
            'satisfactionPercentage': round((positive / len(values)) * 100) if values else 0,
        },
    }


class FeedbackFormDetailView(APIView):
    def get(self, request, form_id):
        try:
            form = FeedbackForm.objects.get(id=form_id)
        except FeedbackForm.DoesNotExist:
            return api_error('Feedback form not found.', 404)
        return api_success(serialize_feedback_form(form), 'Feedback form fetched.')


class FeedbackResponseCreateView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def post(self, request):
        try:
            form = FeedbackForm.objects.get(id=request.data.get('formId'))
            answers = validate_submission(form, request.data)
        except FeedbackForm.DoesNotExist:
            return api_error('Feedback form not found.', 404)
        except ValueError as exc:
            return api_error(str(exc), 400)

        response = FeedbackResponse.objects.create(
            form=form,
            anonymous=request.data.get('anonymous', False),
            user_details={} if request.data.get('anonymous') else request.data.get('userDetails') or user_payload(request.user),
            classroom_course_metadata=request.data.get('classroomCourseMetadata') or form.classroom_course_metadata,
            answers=answers,
        )
        return api_success({'id': response.id}, 'Feedback submitted.', 201)


class FeedbackAnalyticsView(APIView):
    def get(self, request, form_id):
        try:
            form = FeedbackForm.objects.get(id=form_id)
        except FeedbackForm.DoesNotExist:
            return api_error('Feedback form not found.', 404)
        return api_success(build_feedback_analytics(form), 'Feedback analytics fetched.')


class FeedbackTextAnalysisView(APIView):
    def get(self, request, form_id):
        try:
            form = FeedbackForm.objects.get(id=form_id)
        except FeedbackForm.DoesNotExist:
            return api_error('Feedback form not found.', 404)

        responses = list(form.responses.all())
        question_analyses = []
        all_values = []
        for question in all_questions(form):
            if question.get('type') != 'text':
                continue
            question_id = str(question.get('_id'))
            values = [
                str(answer.get('value'))
                for response in responses
                for answer in response.answers
                if str(answer.get('questionId')) == question_id and answer.get('value')
            ]
            all_values.extend(values)
            question_analyses.append({
                'questionId': question_id,
                'prompt': question.get('prompt'),
                'responseCount': len(values),
                **text_analysis_for_values(values),
            })

        return api_success({
            'formId': str(form.id),
            'totalTextResponses': len(all_values),
            **text_analysis_for_values(all_values),
            'questions': question_analyses,
            'generatedAt': timezone.now().isoformat(),
        }, 'Text feedback analysis fetched.')


class FeedbackAdminFormsView(APIView):
    permission_classes = [IsFeedbackAdmin]

    def get(self, request):
        forms = FeedbackForm.objects.all()
        search = request.query_params.get('search')
        status_filter = request.query_params.get('status')
        department = request.query_params.get('department')
        if search:
            forms = forms.filter(title__icontains=search)
        if status_filter:
            forms = forms.filter(status=status_filter)
        if department:
            forms = [form for form in forms if form.classroom_course_metadata.get('subject') == department]

        page = max(int(request.query_params.get('page', 1)), 1)
        limit = min(max(int(request.query_params.get('limit', 10)), 1), 50)
        total = len(forms) if isinstance(forms, list) else forms.count()
        items = list(forms)[(page - 1) * limit:page * limit]
        return api_success({
            'items': [serialize_feedback_form(form) for form in items],
            'pagination': {
                'page': page,
                'limit': limit,
                'total': total,
                'totalPages': (total + limit - 1) // limit,
            },
        }, 'Feedback forms fetched.')

    def post(self, request):
        try:
            data = normalize_feedback_form_payload(request.data, user_payload(request.user))
        except ValueError as exc:
            return api_error(str(exc), 400)
        form = FeedbackForm.objects.create(**data)
        return api_success(serialize_feedback_form(form), 'Feedback form created.', 201)


class FeedbackAdminFormDetailView(APIView):
    permission_classes = [IsFeedbackAdmin]

    def put(self, request, form_id):
        try:
            form = FeedbackForm.objects.get(id=form_id)
            data = normalize_feedback_form_payload(request.data, user_payload(request.user))
        except FeedbackForm.DoesNotExist:
            return api_error('Feedback form not found.', 404)
        except ValueError as exc:
            return api_error(str(exc), 400)
        for key, value in data.items():
            setattr(form, key, value)
        form.save()
        return api_success(serialize_feedback_form(form), 'Feedback form updated.')

    def delete(self, request, form_id):
        try:
            form = FeedbackForm.objects.get(id=form_id)
        except FeedbackForm.DoesNotExist:
            return api_error('Feedback form not found.', 404)
        form.delete()
        return api_success({'deleted': True}, 'Feedback form deleted.')


class FeedbackAdminStatusView(APIView):
    permission_classes = [IsFeedbackAdmin]

    def patch(self, request, form_id):
        try:
            form = FeedbackForm.objects.get(id=form_id)
        except FeedbackForm.DoesNotExist:
            return api_error('Feedback form not found.', 404)
        if request.data.get('status') not in ['draft', 'published', 'closed']:
            return api_error('Invalid feedback form status.', 400)
        form.status = request.data['status']
        form.save(update_fields=['status', 'updated_at'])
        return api_success(serialize_feedback_form(form), 'Feedback form status updated.')
