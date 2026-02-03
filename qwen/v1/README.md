# Patekai Generations - PTarsila 1.8

A family tree application for tracking the Patekai family lineage across generations.

## 📁 File Structure

The application has been organized into separate files for better maintainability:

```
patekai-generations/
├── index.html      # Main HTML structure
├── styles.css      # All styling rules
├── data.js         # Family member data
├── app.js          # All JavaScript functionality
└── README.md       # This file
```

## 📄 File Descriptions

### index.html
- Contains the page structure and layout
- Defines all the tabs: Family Tree, Register, Statistics, Timeline
- Loads Tailwind CSS from CDN
- References the external CSS and JavaScript files

### styles.css
- Custom CSS classes for tree nodes, buttons, and UI elements
- Uses Tailwind's @apply directive for styling
- Defines visual appearance of family members, spouses, and children

### data.js
- Stores all family member information in the `members` array
- Contains Philippine city/region data
- This is where you add new family members or edit existing ones

### app.js
- All JavaScript functionality organized into sections:
  - **Utility Functions**: Helper functions like `getMemberByPid()`
  - **Tab Navigation**: Switching between different views
  - **Family Tree Rendering**: Drawing the tree structure
  - **Member Selection**: Viewing member details
  - **Search Functionality**: Finding family members
  - **Add/Edit Members**: Form handling for member data
  - **Spouse Management**: Linking spouses and relationships
  - **Location Management**: Country/region/city handling
  - **Statistics & Timeline**: Data visualization

## 🚀 How to Use

1. **Open the application**: Double-click `index.html` to open in your web browser
2. **View the tree**: The Family Tree tab shows all members organized by wife/children
3. **Search**: Use the search box to find members by PID, name, or TID
4. **Add members**: Click "➕ Add Child" on any member to add their descendants
5. **Edit members**: Click on a member, then "Edit" to modify their information
6. **View statistics**: Check the Stats tab for family counts
7. **Timeline**: See births and deaths in chronological order

## 🔧 For Developers

### Adding a New Family Member (Manually in data.js)

```javascript
{
  id: 29,                          // Unique number
  pid: 'PID029',                   // Patekai ID
  tid: 'W01-SD01-GSD05',          // Tarsila ID
  firstName: 'Juan',
  lastName: 'Patekai',
  name: 'Juan Patekai',           // Full name
  sex: 'M',                        // M or F
  birth: '01/15/1850',
  death: '12/20/1920',            // Leave empty if alive
  country: 'Philippines',
  region: 'BARMM',
  city: 'Cotabato City',
  address: 'Street Address',
  phone: '+639123456789',
  email: 'email@example.com',
  parentPids: ['PID007'],         // Array of parent PIDs
  spousePid: '',                  // PID of spouse
  spouseStatus: 'No',             // Yes, No, or Unknown
  marriageDate: '',
  divorceDate: '',
  photo: ''                       // Base64 image or empty
}
```

### Key Functions in app.js

- `renderTree()` - Draws the family tree
- `selectMember(member)` - Shows member details
- `startEdit()` - Opens edit form
- `startAddChild()` - Opens form to add a child
- `submitRegForm(e)` - Saves member changes
- `searchMembers()` - Filters members by search query

## 💡 Benefits of This Organization

1. **Easier to Find Code**: Each file has a specific purpose
2. **Better Collaboration**: Multiple people can work on different files
3. **Simpler Debugging**: Errors are easier to locate
4. **Cleaner Structure**: HTML, CSS, and JavaScript are separated
5. **Reusability**: Data can be exported/imported easily

## 🔄 Future Improvements

Possible enhancements:
- Add data persistence (save to localStorage or database)
- Export family tree to PDF
- Import/export member data as CSV
- Add photo galleries for members
- Generate printable family tree diagrams
- Add more relationship types (siblings, cousins, etc.)

## 📝 Notes

- All member data is currently stored in `data.js`
- Changes are lost when you refresh the page (no database yet)
- Photos are stored as base64 strings in memory
- The app uses Tailwind CSS for responsive design

---

**Version**: PTarsila 1.8 - Spouse Intelligence  
**Last Updated**: February 2025
