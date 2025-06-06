import { FormTemplate } from '~/types/form';

export const predefinedTemplates: FormTemplate[] = [
  {
    id: 'contact-us',
    name: 'Contact Us',
    description: 'A simple contact form with name, email, and message fields',
    form: {
      title: 'Contact Us',
      description: 'Get in touch with us',
      fields: [
        {
          id: 'name',
          type: 'text',
          label: 'Full Name',
          placeholder: 'Enter your full name',
          validation: { required: true, minLength: 2, maxLength: 100 },
          step: 1,
        },
        {
          id: 'email',
          type: 'email',
          label: 'Email Address',
          placeholder: 'Enter your email',
          validation: { required: true, pattern: '^[^@]+@[^@]+\\.[^@]+$' },
          step: 1,
        },
        {
          id: 'phone',
          type: 'phone',
          label: 'Phone Number',
          placeholder: '+1 (555) 123-4567',
          validation: { pattern: '^\\+?[1-9]\\d{1,14}$' },
          step: 1,
        },
        {
          id: 'subject',
          type: 'dropdown',
          label: 'Subject',
          validation: { required: true },
          options: [
            { id: '1', label: 'General Inquiry', value: 'general' },
            { id: '2', label: 'Support', value: 'support' },
            { id: '3', label: 'Sales', value: 'sales' },
            { id: '4', label: 'Partnership', value: 'partnership' },
          ],
          step: 1,
        },
        {
          id: 'message',
          type: 'textarea',
          label: 'Message',
          placeholder: 'Tell us how we can help you...',
          validation: { required: true, minLength: 10, maxLength: 1000 },
          step: 1,
        },
        {
          id: 'newsletter',
          type: 'checkbox',
          label: 'Subscribe to Newsletter',
          helpText: 'Get updates about our latest products and offers',
          validation: {},
          step: 1,
        },
      ],
      isMultiStep: false,
    },
  },
  {
    id: 'survey',
    name: 'Customer Survey',
    description: 'Multi-step customer feedback survey',
    form: {
      title: 'Customer Satisfaction Survey',
      description: 'Help us improve our services',
      fields: [
        {
          id: 'customer-name',
          type: 'text',
          label: 'Your Name',
          placeholder: 'Enter your name',
          validation: { required: true },
          step: 1,
        },
        {
          id: 'customer-email',
          type: 'email',
          label: 'Email Address',
          placeholder: 'your.email@example.com',
          validation: { required: true },
          step: 1,
        },
        {
          id: 'satisfaction',
          type: 'radio',
          label: 'How satisfied are you with our service?',
          validation: { required: true },
          options: [
            { id: '1', label: 'Very Satisfied', value: '5' },
            { id: '2', label: 'Satisfied', value: '4' },
            { id: '3', label: 'Neutral', value: '3' },
            { id: '4', label: 'Dissatisfied', value: '2' },
            { id: '5', label: 'Very Dissatisfied', value: '1' },
          ],
          step: 2,
        },
        {
          id: 'recommendation',
          type: 'number',
          label: 'How likely are you to recommend us to a friend? (0-10)',
          validation: { required: true, min: 0, max: 10 },
          step: 2,
        },
        {
          id: 'improvements',
          type: 'textarea',
          label: 'What can we improve?',
          placeholder: 'Share your suggestions...',
          validation: { maxLength: 500 },
          step: 3,
        },
        {
          id: 'contact-permission',
          type: 'checkbox',
          label: 'May we contact you about your feedback?',
          validation: {},
          step: 3,
        },
      ],
      isMultiStep: true,
      steps: [
        {
          id: 'step-1',
          title: 'Contact Information',
          description: 'Tell us about yourself',
          fields: [],
        },
        {
          id: 'step-2',
          title: 'Satisfaction Rating',
          description: 'Rate your experience',
          fields: [],
        },
        {
          id: 'step-3',
          title: 'Additional Feedback',
          description: 'Help us improve',
          fields: [],
        },
      ],
    },
  },
  {
    id: 'registration',
    name: 'Event Registration',
    description: 'Event registration form with personal and preferences',
    form: {
      title: 'Event Registration',
      description: 'Register for our upcoming event',
      fields: [        {
          id: 'first-name',
          type: 'text',
          label: 'First Name',
          validation: { required: true, minLength: 2 },
          step: 1,
        },
        {
          id: 'last-name',
          type: 'text',
          label: 'Last Name',
          validation: { required: true, minLength: 2 },
          step: 1,
        },
        {
          id: 'email',
          type: 'email',
          label: 'Email',
          validation: { required: true },
          step: 1,
        },
        {
          id: 'phone',
          type: 'phone',
          label: 'Phone Number',
          validation: { required: true },
          step: 1,
        },
        {
          id: 'company',
          type: 'text',
          label: 'Company/Organization',
          validation: {},
          step: 1,
        },
        {
          id: 'dietary-restrictions',
          type: 'dropdown',
          label: 'Dietary Restrictions',
          options: [
            { id: '1', label: 'None', value: 'none' },
            { id: '2', label: 'Vegetarian', value: 'vegetarian' },
            { id: '3', label: 'Vegan', value: 'vegan' },
            { id: '4', label: 'Gluten-free', value: 'gluten-free' },
            { id: '5', label: 'Other', value: 'other' },
          ],
          validation: { required: true },
          step: 2,
        },
        {
          id: 'special-requirements',
          type: 'textarea',
          label: 'Special Requirements',
          placeholder: 'Any accessibility needs or special requirements?',
          validation: {},
          step: 2,
        },        {
          id: 'agree-terms',
          type: 'checkbox',
          label: 'I agree to the terms and conditions',
          validation: { required: true },
          step: 2,
        },
      ],
      isMultiStep: true,
    },
  },
];
