# SHARED DEPENDENCIES REGISTRY

## UI COMPONENTS
| Component | Purpose | Location | Used By | Last Updated |
|-----------|---------|----------|---------|-------------|
| Button | Primary CTA | /components/ui/Button.js | Feature A, B | 2025-01-15 |
| Modal | Pop-up dialogs | /components/ui/Modal.js | Feature C | 2025-01-10 |

## API CONTRACTS
| Endpoint | Method | Purpose | Request Format | Response Format | Owner |
|----------|--------|---------|----------------|-----------------|-------|
| /api/users | GET | User profile | - | {id, name, email} | Backend |
| /api/posts | POST | Create post | {title, content} | {id, status} | Backend |

## DATABASE SCHEMA
| Collection | Purpose | Key Fields | Relationships | Last Modified |
|------------|---------|------------|---------------|---------------|
| users | User profiles | id, email, name | posts[] | 2025-01-15 |
| posts | User posts | id, userId, content | users.id | 2025-01-12 |

## NAVIGATION STRUCTURE
| Screen | Route | Parent | Children | Access Level |
|--------|-------|---------|----------|-------------|
| Home | /home | - | Profile, Posts | Public |
| Profile | /profile | Home | Settings | Auth Required |