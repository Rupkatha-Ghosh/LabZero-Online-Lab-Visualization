from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase

from .models import Feedback, FeedbackForm


class FeedbackApiTests(APITestCase):
    def setUp(self):
        User = get_user_model()
        self.teacher = User.objects.create_user(
            username='teacher',
            email='teacher@example.com',
            password='pass12345',
            role='teacher',
        )
        self.student = User.objects.create_user(
            username='student',
            email='student@example.com',
            password='pass12345',
            role='student',
        )
        self.form = FeedbackForm.objects.create(
            title='Lab feedback',
            status='published',
            anonymous_allowed=True,
            sections=[
                {
                    'title': 'Experience',
                    'description': '',
                    'questionIds': ['rating-1', 'text-1', 'choice-1'],
                    'order': 0,
                    'questions': [
                        {
                            '_id': 'rating-1',
                            'id': 'rating-1',
                            'sectionTitle': 'Experience',
                            'prompt': 'Rate the lab',
                            'type': 'rating',
                            'required': True,
                            'options': [],
                            'minRating': 1,
                            'maxRating': 5,
                            'order': 0,
                        },
                        {
                            '_id': 'text-1',
                            'id': 'text-1',
                            'sectionTitle': 'Experience',
                            'prompt': 'What worked?',
                            'type': 'text',
                            'required': True,
                            'options': [],
                            'minRating': None,
                            'maxRating': None,
                            'order': 1,
                        },
                        {
                            '_id': 'choice-1',
                            'id': 'choice-1',
                            'sectionTitle': 'Experience',
                            'prompt': 'Difficulty',
                            'type': 'radio',
                            'required': True,
                            'options': [
                                {'label': 'Easy', 'value': 'easy'},
                                {'label': 'Hard', 'value': 'hard'},
                            ],
                            'minRating': None,
                            'maxRating': None,
                            'order': 2,
                        },
                    ],
                }
            ],
        )

    def test_anonymous_feedback_response_can_be_submitted_to_published_form(self):
        response = self.client.post(
            reverse('feedback-response-create'),
            {
                'formId': str(self.form.id),
                'anonymous': True,
                'answers': [
                    {'questionId': 'rating-1', 'value': 5},
                    {'questionId': 'text-1', 'value': 'Very clear and helpful'},
                    {'questionId': 'choice-1', 'value': 'easy'},
                ],
            },
            format='json',
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(self.form.responses.count(), 1)
        self.assertTrue(self.form.responses.first().anonymous)

    def test_invalid_choice_feedback_response_returns_api_error(self):
        response = self.client.post(
            reverse('feedback-response-create'),
            {
                'formId': str(self.form.id),
                'anonymous': True,
                'answers': [
                    {'questionId': 'rating-1', 'value': 5},
                    {'questionId': 'text-1', 'value': 'Good'},
                    {'questionId': 'choice-1', 'value': 'medium'},
                ],
            },
            format='json',
        )

        self.assertEqual(response.status_code, 400)
        self.assertFalse(response.data['success'])

    def test_site_feedback_requires_authentication_and_valid_rating(self):
        unauthenticated = self.client.post(
            reverse('feedback-list'),
            {'rating': 5, 'comment': 'Great'},
            format='json',
        )
        self.assertEqual(unauthenticated.status_code, 401)

        self.client.force_authenticate(self.student)
        invalid = self.client.post(
            reverse('feedback-list'),
            {'rating': 6, 'comment': 'Too high'},
            format='json',
        )
        self.assertEqual(invalid.status_code, 400)

        valid = self.client.post(
            reverse('feedback-list'),
            {'rating': 4, 'comment': 'Works well'},
            format='json',
        )
        self.assertEqual(valid.status_code, 201)
        self.assertEqual(Feedback.objects.count(), 1)

    def test_feedback_analytics_is_admin_only(self):
        response = self.client.get(reverse('feedback-analytics', kwargs={'form_id': self.form.id}))
        self.assertEqual(response.status_code, 401)

        self.client.force_authenticate(self.teacher)
        response = self.client.get(reverse('feedback-analytics', kwargs={'form_id': self.form.id}))
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['data']['totalResponses'], 0)

    def test_admin_can_create_feedback_form(self):
        self.client.force_authenticate(self.teacher)
        response = self.client.post(
            reverse('feedback-admin-forms'),
            {
                'title': 'New form',
                'anonymousAllowed': True,
                'status': 'draft',
                'sections': [
                    {
                        'title': 'Section 1',
                        'questions': [
                            {'prompt': 'One', 'type': 'text', 'required': True, 'options': []},
                            {'prompt': 'Two', 'type': 'rating', 'required': True, 'options': [], 'minRating': 1, 'maxRating': 5},
                            {
                                'prompt': 'Three',
                                'type': 'dropdown',
                                'required': True,
                                'options': [
                                    {'label': 'A', 'value': 'a'},
                                    {'label': 'B', 'value': 'b'},
                                ],
                            },
                        ],
                    }
                ],
            },
            format='json',
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['data']['title'], 'New form')

    def test_admin_overview_includes_site_feedback_choice_counts(self):
        Feedback.objects.create(
            user=self.student,
            rating=5,
            comment='\n'.join(
                [
                    'Feedback Category: Student',
                    'Student Multiple Choice:',
                    '- Helpful tools: Simulations, Quizzes',
                    '- Improvements: Not selected',
                    'Student Single Choice:',
                    '- Overall pace: Good',
                    'Student Dropdown Details:',
                    '- Preferred subject: Physics',
                ]
            ),
        )

        self.client.force_authenticate(self.teacher)
        response = self.client.get(reverse('feedback-admin-overview'))

        self.assertEqual(response.status_code, 200)
        option_counts = response.data['data']['overall']['optionCounts']
        self.assertEqual(option_counts['Simulations'], 1)
        self.assertEqual(option_counts['Quizzes'], 1)
        self.assertEqual(option_counts['Good'], 1)
        self.assertEqual(option_counts['Physics'], 1)
        self.assertNotIn('Not selected', option_counts)
