import type { FC, FormEvent, ChangeEvent } from 'react';
import { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce } from '@/hooks/useDebounce';
import type { ContactFormData, ContactApiResponse } from '@/types/api.types';

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

interface ContactFormOptimizedProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const ContactFormOptimized: FC<ContactFormOptimizedProps> = ({
  onSuccess,
  onError,
}) => {
  const { t } = useTranslation();

  // Form state
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);

  // Debounced validation for better UX
  const debouncedFormData = useDebounce(formData, 300);

  // Email validation regex
  const emailRegex = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    []
  );

  // Validation function
  const validateForm = useCallback(
    (data: ContactFormData): FormErrors => {
      const newErrors: FormErrors = {};

      if (!data.name.trim()) {
        newErrors.name = t('contact.form.name.errorRequired');
      } else if (data.name.trim().length < 2) {
        newErrors.name = t('contact.form.name.errorTooShort');
      }

      if (!data.email.trim()) {
        newErrors.email = t('contact.form.email.errorRequired');
      } else if (!emailRegex.test(data.email.trim())) {
        newErrors.email = t('contact.form.email.errorInvalid');
      }

      if (!data.subject.trim()) {
        newErrors.subject = t('contact.form.subject.errorRequired');
      } else if (data.subject.trim().length < 5) {
        newErrors.subject = t('contact.form.subject.errorTooShort');
      }

      if (!data.message.trim()) {
        newErrors.message = t('contact.form.message.errorRequired');
      } else if (data.message.trim().length < 10) {
        newErrors.message = t('contact.form.message.errorTooShort');
      }

      return newErrors;
    },
    [t, emailRegex]
  );

  // Update errors when form data changes (debounced)
  useState(() => {
    if (submitCount > 0) {
      const newErrors = validateForm(debouncedFormData);
      setErrors(newErrors);
    }
  });

  // Handle input changes
  const handleInputChange = useCallback(
    (field: keyof ContactFormData) => (
      e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      const value = e.target.value;
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    },
    []
  );

  // Handle form submission
  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setSubmitCount(prev => prev + 1);

      const validationErrors = validateForm(formData);
      setErrors(validationErrors);

      if (Object.keys(validationErrors).length > 0) {
        return;
      }

      setIsSubmitting(true);

      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        const data: ContactApiResponse = await response.json();

        if (response.ok && data.success) {
          // Reset form
          setFormData({
            name: '',
            email: '',
            subject: '',
            message: '',
          });
          setErrors({});
          setSubmitCount(0);
          onSuccess?.();
        } else {
          const errorMessage = data.error || t('contact.form.errorGeneric');
          onError?.(errorMessage);
        }
      } catch (error) {
        console.error('Form submission error:', error);
        onError?.(t('contact.form.errorNetwork'));
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, validateForm, onSuccess, onError, t]
  );

  // Check if form is valid
  const isFormValid = useMemo(() => {
    return Object.keys(validateForm(formData)).length === 0;
  }, [formData, validateForm]);

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Name field */}
      <div className="form-group">
        <label htmlFor="contact-name">
          {t('contact.form.name')} *
        </label>
        <input
          id="contact-name"
          type="text"
          value={formData.name}
          onChange={handleInputChange('name')}
          placeholder={t('contact.form.name.placeholder')}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'name-error' : undefined}
          disabled={isSubmitting}
        />
        {errors.name && (
          <div id="name-error" className="error-message" role="alert">
            {errors.name}
          </div>
        )}
      </div>

      {/* Email field */}
      <div className="form-group">
        <label htmlFor="contact-email">
          {t('contact.form.email')} *
        </label>
        <input
          id="contact-email"
          type="email"
          value={formData.email}
          onChange={handleInputChange('email')}
          placeholder={t('contact.form.email.placeholder')}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
          disabled={isSubmitting}
        />
        {errors.email && (
          <div id="email-error" className="error-message" role="alert">
            {errors.email}
          </div>
        )}
      </div>

      {/* Subject field */}
      <div className="form-group">
        <label htmlFor="contact-subject">
          {t('contact.form.subject')} *
        </label>
        <input
          id="contact-subject"
          type="text"
          value={formData.subject}
          onChange={handleInputChange('subject')}
          placeholder={t('contact.form.subject.placeholder')}
          aria-invalid={!!errors.subject}
          aria-describedby={errors.subject ? 'subject-error' : undefined}
          disabled={isSubmitting}
        />
        {errors.subject && (
          <div id="subject-error" className="error-message" role="alert">
            {errors.subject}
          </div>
        )}
      </div>

      {/* Message field */}
      <div className="form-group">
        <label htmlFor="contact-message">
          {t('contact.form.message')} *
        </label>
        <textarea
          id="contact-message"
          value={formData.message}
          onChange={handleInputChange('message')}
          placeholder={t('contact.form.message.placeholder')}
          rows={6}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? 'message-error' : undefined}
          disabled={isSubmitting}
        />
        {errors.message && (
          <div id="message-error" className="error-message" role="alert">
            {errors.message}
          </div>
        )}
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={isSubmitting || !isFormValid}
        aria-describedby="submit-status"
      >
        {isSubmitting ? t('contact.form.sending') : t('contact.form.send')}
      </button>

      {/* Screen reader status */}
      <div id="submit-status" className="sr-only" aria-live="polite">
        {isSubmitting && t('contact.form.submitting')}
      </div>
    </form>
  );
};