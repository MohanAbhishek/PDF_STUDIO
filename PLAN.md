# PDF Studio Full-Stack Application Plan

## Context
Building a complete, production-quality PDF Editor web application from scratch as requested. The application must allow users to upload PDFs, view them in the browser, perform editing operations (text, whiteout, signatures), and download modified PDFs. The solution requires both frontend (React/Vite) and backend (Spring Boot/Java/MySQL) components with JWT authentication.

## Technical Approach
This is a comprehensive full-stack application that will be built incrementally with focus on:
- Proper separation of concerns (React frontend + Spring Boot backend)
- Security-first implementation (JWT + BCrypt)
- Client-side PDF editing for better performance and privacy
- Clean, maintainable code architecture
- Responsive SaaS-style UI

## Architecture Overview

### Backend (Spring Boot)
- Java 21+ with Maven
- Spring Web, Security, Data JPA
- MySQL database with JPA/Hibernate
- JWT authentication with Spring Security
- Clean layered architecture: Controller → Service → Repository → Entity

### Frontend (React)
- React 18+ with Vite
- JavaScript (no TypeScript)
- Tailwind CSS for styling
- React Router for navigation
- PDF.js for PDF rendering
- pdf-lib for PDF manipulation
- Real-time PDF editing in browser

### Database Design
```sql
users (id, full_name, email, password, created_at, updated_at)
documents (id, user_id, document_name, original_file_name, file_size, page_count, created_at, updated_at)
document_history (id, document_id, action, created_at)
```

### Core Features
1. **Authentication**: JWT-based user registration and login
2. **Document Management**: Upload, view, edit, save, delete documents
3. **PDF Editing**: 
   - Text tool (add/edit draggable text objects)
   - Whiteout tool (drag-select white rectangles)
   - Signature tool (draw/upload signatures)
4. **Editor Operations**: Undo/redo, zoom, page navigation
5. **Export**: Download edited PDF with all modifications
6. **Responsive Design**: Desktop-first with tablet/mobile support

## Implementation Strategy

### Phase 1: Foundation
1. Create project structure
2. Set up backend with Maven, Spring Boot, MySQL
3. Implement database entities and repositories
4. Configure Spring Security with JWT
5. Create authentication endpoints
6. Set up frontend with React/Vite
7. Create public pages (landing, login, register)

### Phase 2: User Experience
1. Implement dashboard
2. Create PDF upload with drag-and-drop
3. Set up PDF.js rendering
4. Implement basic editor UI with toolbar
5. Add page navigation and thumbnails

### Phase 3: Core Editing Features
1. Implement Text tool with font/size/color options
2. Implement Whiteout tool with drag-resize
3. Implement Signature tool (draw/upload)
4. Create unified selection system
5. Implement coordinate conversion system

### Phase 4: Advanced Features
1. Implement undo/redo history
2. Add zoom functionality
3. Implement PDF export engine
4. Add save document functionality
5. Implement error handling and loading states

### Phase 5: Quality & Polish
1. Add responsive design
2. Implement accessibility features
3. Create comprehensive testing
4. Add proper error handling
5. Write documentation and README

## Critical Files Structure

### Backend
```
backend/
├── src/main/java/com/example/pdfstudio/
│   ├── controller/           # REST API endpoints
│   ├── service/              # Business logic
│   ├── repository/           # JPA repositories
│   ├── entity/               # JPA entities
│   ├── dto/                  # Data transfer objects
│   ├── security/             # Security configuration
│   ├── config/               # App configuration
│   └── PdfStudioApplication.java
└── src/main/resources/
    ├── application.properties
    └── static/
```

### Frontend
```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── editor/           # Editor-specific components
│   │   ├── dashboard/        # Dashboard components
│   │   ├── auth/             # Authentication components
│   │   └── common/           # Common UI components
│   ├── pages/               # Route pages
│   │   ├── Landing.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   └── Editor.jsx
│   ├── services/            # API services
│   │   ├── api.js
│   │   ├── authService.js
│   │   └── documentService.js
│   ├── hooks/               # Custom hooks
│   ├── context/             # React contexts
│   ├── utils/               # Utility functions
│   ├── assets/              # Static assets
│   ├── App.jsx
│   └── main.jsx
└── public/
    └── index.html
```

## Technology Stack Details

### Backend Dependencies (Maven)
- Spring Boot Web
- Spring Boot Security
- Spring Data JPA
- MySQL Connector
- Spring Boot DevTools
- Lombok (optional)

### Frontend Dependencies (npm)
- React 18+
- Vite
- Tailwind CSS
- React Router
- Axios
- PDF.js
- pdf-lib
- Lucide React
- React Hot Toast

## Critical Implementation Details

### PDF Editing Architecture
1. **Coordinate Conversion**: Maintain conversion between screen coordinates and PDF coordinates
2. **Export Engine**: Separate pdfExporter.js for generating final PDF
3. **Editor State**: JSON-based state model for editor objects
4. **Canvas Operations**: HTML5 Canvas for signature drawing

### Security Requirements
- BCrypt password hashing
- JWT tokens with expiration
- Protected API endpoints
- Input validation on both sides
- CORS configuration
- Environment variables for secrets

### Performance Considerations
- Lazy page rendering
- Efficient canvas sizing
- Debounced operations
- Cleanup of resources
- Avoid unnecessary re-renders

## Verification
To test this implementation:

1. **Setup**:
   ```bash
   # Backend
   cd backend
   ./mvnw spring-boot:run
   
   # Frontend (separate terminal)
   cd frontend
   npm install
   npm run dev
   ```

2. **Functional Testing**:
   - User registration and login
   - PDF upload and viewing
   - Text, whiteout, and signature tools
   - Editor operations (move, resize, delete)
   - Undo/redo functionality
   - PDF export and download
   - Save/load documents

3. **Database Testing**:
   - Verify user authentication
   - Document ownership and permissions
   - Document CRUD operations

4. **Edge Cases**:
   - Empty PDFs
   - Large PDFs
   - Corrupted PDFs
   - Multiple pages
   - Browser refresh handling

## Known Limitations
1. **PDF Text Editing**: Limited ability to directly edit existing PDF text - uses whiteout-and-replace approach
2. **Signature Quality**: Signature quality depends on device input
3. **Performance**: Large PDFs may require optimization
4. **Browser Compatibility**: Modern browsers required for PDF.js features

## Deployment Instructions

### Local Deployment
1. Set up MySQL database
2. Configure environment variables
3. Build backend: `./mvnw clean package`
4. Build frontend: `cd frontend && npm run build`
5. Deploy artifacts

### Production Deployment
- Frontend: Vercel or Netlify
- Backend: Render or Railway
- Database: MySQL cloud instance
- Use environment variables for configuration

## Database Setup
```sql
CREATE DATABASE pdfstudio;
USE pdfstudio;

-- Users table
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Documents table
CREATE TABLE documents (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    original_file_name VARCHAR(255) NOT NULL,
    file_size BIGINT,
    page_count INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Document history table
CREATE TABLE document_history (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    document_id BIGINT NOT NULL,
    action VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
);
```

## Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:8080/api
```

### Backend (application.properties)
```
spring.datasource.url=jdbc:mysql://localhost:3306/pdfstudio
spring.datasource.username=your_username
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

jwt.secret=your_secret_key_here
jwt.expiration=86400000

server.port=8080
```

## Project Status
This is a comprehensive plan for a full-stack PDF editor application. The plan covers all requirements from the user's request, including authentication, PDF editing tools, database design, and deployment instructions. The implementation will be done incrementally with focus on working functionality at each stage.

The plan is ready for execution - the foundation will be built first, followed by incremental feature development.