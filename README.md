# Task Management Application





### Key Features

- **🔧 Custom Fields**: Create unlimited custom fields with various data types
- **🔍 Advanced Filtering**: Multi-criteria filtering with intelligent operators
- **📊 Bulk Operations**: Select and edit/delete multiple tasks simultaneously
- **💾 Auto-Persistence**: Automatic local storage with state validation
- **📱 Responsive Design**: Works seamlessly across desktop and mobile devices
- **⚡ Real-time Updates**: Instant UI updates with optimistic rendering

## 🏗️ Architecture & Design Decisions

### Technology Stack

- **Frontend**: Next.js 14 (App Router)
- **State Management**: Redux Toolkit
- **UI Components**: shadcn/ui + Tailwind CSS
- **Data Persistence**: Browser localStorage with validation
- **Language**: JavaScript 



### State Management Architecture

store/
├── tasks/
│   ├── tasks[]           # Task data array
│   ├── customFields[]    # Field definitions
│   ├── activeFilters[]   # Current filter state
│   ├── sortBy            # Sort field
│   ├── sortOrder         # Sort direction
│   └── pagination        # Page state
├── ui/
│   ├── loading           # Loading states
│   ├── modals            # Modal visibility
│   └── notifications     # Toast messages
└── user/
    ├── preferences       # User settings
    └── session          # Auth state

### Custom Fields System

The application features a sophisticated custom fields system that supports:

- **Field Types**: Text, Number, Checkbox, Single Select
- **Field Properties**: Required, Filterable, Sortable, Options
- **Dynamic Validation**: Type-specific validation rules
- **Runtime Flexibility**: Add/remove fields without data loss

## 🎯 Implemented Features

### ✅ Core Requirements
- [x] **CRUD Operations**: Create, Read, Update, Delete tasks
- [x] **Task Properties**: Title, Priority, Status, Custom Fields
- [x] **Data Persistence**: Local storage with state validation


### ✅ Bonus Milestones Implemented

#### 🔍 **Advanced Filtering & Search**
- Multi-field filtering with intelligent operators
- Field-type specific filter controls
- Real-time filter application
- Filter persistence across sessions
- Visual filter management with badges

#### 📊 **Bulk Operations**
- Multi-select with visual feedback
- Bulk delete with confirmation
- Bulk edit with field-specific controls
- Selection state management
- Bulk operation history


#### 🔧 **Custom Fields Management**
- Dynamic field creation/deletion
- Multiple field types support
- Field property configuration
- Data migration on field changes
- Field validation and constraints


## 🛠️ Technical Highlights


### Dynamic Filtering Engine
\`\`\`javascript
// Intelligent operator selection based on field type
const getOperatorsForField = (fieldType) => {
  switch (fieldType) {
    case "text": return ["contains", "equals", "starts_with", "ends_with"]
    case "number": return ["equals", "greater_than", "less_than"]
    case "single_select": return ["equals", "not_equals"]
    case "checkbox": return ["equals"]
  }
}
\`\`\`

### State Validation & Recovery
\`\`\`javascript
// Robust state validation prevents data corruption
const hasInvalidFields = parsedState.customFields.some(
  field => !field.name || !field.label || field.name.includes("count")
)
if (hasInvalidFields) {
  dispatch(resetToDefaults())
}
\`\`\`


## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
\`\`\`bash
# Clone the repository
git clone <repository-url>
cd task-management-app

# Install dependencies
npm install

# Start development server
npm run dev
\`\`\`



### Data Structure Decisions

#### Custom Fields Architecture
\`\`\`javascript
// Flexible field definition structure
{
  name: "estimatedHours",      // Internal identifier
  label: "Estimated Hours",    // Display name
  type: "number",             // Data type
  required: false,            // Validation rule
  filterable: true,           // UI capability
  sortable: true,             // UI capability
  options: []                 // For select fields
}
\`\`\`

#### Task Data Structure
\`\`\`javascript
// Extensible task structure
{
  id: "unique-id",
  title: "Task name",
  priority: "High",
  status: "In Progress",
  // ... dynamic custom fields
  customField1: "value",
  customField2: 42
}
\`\`\`

## 🔮 Future Enhancements

### Potential Improvements
- **Due Dates**: Time-based task management
- **Attachments**: File upload support
- **Collaboration**: Multi-user support
- **Export/Import**: CSV/JSON data exchange
- **Templates**: Reusable task templates
- **Analytics**: Task completion insights


## 📝 Notes for Reviewers

### Interesting Implementation Details

1. **Field Type Intelligence**: The filtering system automatically provides appropriate operators based on field types


### Performance Optimizations

- **Selective Re-rendering**: Components only re-render when relevant state changes
- **Lazy Loading**: Modal components loaded only when needed
- **Debounced Operations**: Filter applications debounced for smooth UX


---

**Built with ❤️**
