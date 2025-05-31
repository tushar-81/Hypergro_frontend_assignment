# Form Builder Application

A comprehensive drag-and-drop form builder built with React Remix and Tailwind CSS.

## Features

### 🎯 Core Functionality
- **Drag-and-Drop Interface**: Add form components from a rich field palette
- **Field Types**: Text, Textarea, Dropdown, Checkbox, Radio, Date, Number, Email, Phone, URL, File Upload
- **Field Reordering**: Sortable fields with intuitive drag actions
- **Real-time Preview**: Live form preview with instant updates
- **Multi-step Forms**: Create complex workflows with step navigation and progress indicators

### ⚙️ Field Configuration
- **Field Properties**: Labels, placeholders, help text, default values
- **Validation Rules**: Required fields, min/max length, pattern matching, number ranges
- **Conditional Logic**: Show/hide fields based on other field values
- **Custom Options**: Dropdown and radio button option management

### 📱 Responsive Design
- **Preview Modes**: Desktop, Tablet, and Mobile responsive previews
- **Adaptive Layout**: Forms automatically adjust to different screen sizes
- **Touch-friendly**: Optimized for mobile form filling experience

### 🔗 Sharing & Collaboration
- **Shareable Links**: Generate unique URLs for public form access
- **Form Filler View**: Dedicated interface for form submission
- **Export/Import**: JSON-based form templates
- **Template Library**: Predefined templates (Contact Us, Surveys, Registration)

### 💾 Data Management
- **Auto-save**: Automatic form saving to localStorage
- **Form Versioning**: Track form changes and iterations
- **Submission Handling**: Process and validate form submissions

## Quick Start

### Development

Run the development server:

```shellscript
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Type Checking

Run TypeScript type checking:

```shellscript
npm run typecheck
```

## Project Structure

```
app/
├── components/          # React components
│   ├── DraggableField.tsx      # Sortable field component
│   ├── FieldPalette.tsx        # Left sidebar with field types
│   ├── FieldPropertyPanel.tsx  # Right sidebar for field editing
│   ├── FieldRenderer.tsx       # Renders individual form fields
│   ├── FormBuilderLayout.tsx   # Main layout component
│   ├── FormCanvas.tsx          # Center canvas for form building
│   ├── FormFiller.tsx          # Public form filling interface
│   ├── FormPreview.tsx         # Live form preview
│   ├── Icon.tsx                # Icon utility component
│   └── TemplateManager.tsx     # Template and sharing modal
├── context/             # State management
│   └── FormBuilderContext.tsx  # Global form state with useReducer
├── data/               # Static data
│   └── templates.ts    # Predefined form templates
├── routes/             # Remix routes
│   ├── _index.tsx      # Main form builder page
│   └── form.$id.tsx    # Public form filling page
├── types/              # TypeScript definitions
│   └── form.ts         # Form, field, and submission types
└── utils/              # Utility functions
    ├── fieldUtils.ts   # Field creation and management
    └── validation.ts   # Form validation logic
```

## Usage

### Building Forms
1. Drag field types from the left palette to the canvas
2. Click on fields to edit properties in the right panel
3. Configure validation rules, labels, and options
4. Use the preview toggle to see the live form
5. Test different responsive modes

### Multi-step Forms
1. Use the step controls to add multiple form pages
2. Organize fields into logical groups
3. Configure step navigation and progress indicators

### Sharing Forms
1. Click the "Template Manager" button
2. Navigate to "Share & Export" tab
3. Generate a shareable link
4. Share the URL for public form access

### Templates
1. Access predefined templates from the Template Manager
2. Import/export forms as JSON
3. Save custom forms as templates

## Dependencies

- **@dnd-kit/core**: Drag and drop functionality
- **@dnd-kit/sortable**: Sortable field reordering
- **lucide-react**: Modern icon library
- **uuid**: Unique ID generation
- **clsx**: Conditional CSS classes
- **Tailwind CSS**: Utility-first styling
- **TypeScript**: Type safety and developer experience

## Deployment

First, build your app for production:

```sh
npm run build
```

Then run the app in production mode:

```sh
npm start
```

Now you'll need to pick a host to deploy it to.

### DIY

If you're familiar with deploying Node applications, the built-in Remix app server is production-ready.

Make sure to deploy the output of `npm run build`

- `build/server`
- `build/client`

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever css framework you prefer. See the [Vite docs on css](https://vitejs.dev/guide/features.html#css) for more information.
