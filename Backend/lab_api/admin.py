from django.contrib import admin
from .models import Element, Molecule, AtomPosition, LonePair, Subject, Topic, Feedback, FeedbackForm, FeedbackResponse

@admin.register(Element)
class ElementAdmin(admin.ModelAdmin):
    list_display = ('number', 'symbol', 'name', 'mass', 'category', 'electrons', 'discovery', 'color', 'config', 'radius', 'ionization', 'electronegativity', 'period', 'group', 'summary')

class AtomPositionInline(admin.TabularInline):
    model = AtomPosition
    extra = 1

class LonePairInline(admin.TabularInline):
    model = LonePair
    extra = 1

@admin.register(Molecule)
class MoleculeAdmin(admin.ModelAdmin):
    list_display = ('name', 'formula', 'central_atom', 'real_angle', 'model_angle')
    inlines = [AtomPositionInline, LonePairInline]

@admin.register(AtomPosition)
class AtomPositionAdmin(admin.ModelAdmin):
    list_display = ('symbol', 'molecule', 'x', 'y', 'z')

@admin.register(LonePair)
class LonePairAdmin(admin.ModelAdmin):
    list_display = ('molecule', 'x', 'y', 'z')

class TopicInline(admin.StackedInline):
    model = Topic
    extra = 1

@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'icon', 'color', 'target_class')
    search_fields = ('name', 'slug')
    inlines = [TopicInline]

@admin.register(Topic)
class TopicAdmin(admin.ModelAdmin):
    list_display = ('name', 'subject', 'target_class')


@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ('user', 'rating', 'created_at')
    list_filter = ('rating', 'created_at')
    search_fields = ('user__username', 'user__email', 'comment')
    readonly_fields = ('created_at',)


@admin.register(FeedbackForm)
class FeedbackFormAdmin(admin.ModelAdmin):
    list_display = ('title', 'status', 'anonymous_allowed', 'created_at', 'updated_at')
    list_filter = ('status', 'anonymous_allowed', 'created_at')
    search_fields = ('title', 'description')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(FeedbackResponse)
class FeedbackResponseAdmin(admin.ModelAdmin):
    list_display = ('form', 'anonymous', 'submitted_at')
    list_filter = ('anonymous', 'submitted_at')
    search_fields = ('form__title',)
    readonly_fields = ('submitted_at',)
