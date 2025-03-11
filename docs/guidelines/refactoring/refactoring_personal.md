# Refactoring guidelines

## Introduction

This document provides guidelines for refactoring code in this repository to improve maintainability, readability, and efficiency. The focus is on adhering to the **Single Responsibility Principle (SRP)** and the **Don't Repeat Yourself (DRY)** principle.

## Principles

### Single Responsibility Principle (SRP)

**Definition:** A class, module, or function should have only one reason to change.

**Why it matters:**

- Improves code maintainability.
- Enhances readability and debugging.
- Reduces the risk of unintended side effects when making changes.

**Refactoring Strategies:**

- Identify classes or functions that perform multiple responsibilities.
- Break them into smaller, more focused components.
- Assign each component a single, well-defined responsibility.

**Example Before Refactoring:**

```typescript
class UserManager {
    createUser(data: UserData) {
        // Create user logic
    }

    sendWelcomeEmail(user: User) {
        // Email sending logic
    }

    logUserCreation(user: User) {
        // Logging logic
    }
}
```

**Example After Refactoring:**

```typescript
class UserService {
    createUser(data: UserData) {
        // Create user logic
    }
}

class EmailService {
    sendWelcomeEmail(user: User) {
        // Email sending logic
    }
}

class LoggerService {
    logUserCreation(user: User) {
        // Logging logic
    }
}
```

---

### Don't Repeat Yourself (DRY)

**Definition:** Avoid duplication of code by abstracting repeated logic.

**Why it matters:**

- Reduces code redundancy.
- Simplifies maintenance and updates.
- Enhances code reusability.

**Refactoring Strategies:**

- Identify duplicate code blocks.
- Extract them into reusable functions or modules.
- Use configuration files for static values.

**Example Before Refactoring:**

```typescript
function getUserInfo(userId: string) {
    const user = database.findUserById(userId);
    if (!user) {
        throw new Error('User not found');
    }
    return user;
}

function getAdminInfo(adminId: string) {
    const admin = database.findAdminById(adminId);
    if (!admin) {
        throw new Error('Admin not found');
    }
    return admin;
}
```

**Example After Refactoring:**

```typescript
function getEntityInfo<T>(
    id: string,
    finder: (id: string) => T | null,
    entityName: string,
): T {
    const entity = finder(id);
    if (!entity) {
        throw new Error(`${entityName} not found`);
    }
    return entity;
}

const user = getEntityInfo(userId, database.findUserById, 'User');
const admin = getEntityInfo(adminId, database.findAdminById, 'Admin');
```

## Problems

As I mentioned in the [README](../README.md), I have a problem with the codebase. The codebase is not scalable and maintainable, especially in the client side because the source code is not modularized. In this version of updating, I have modularized the source code into smaller modules and refactored the codebase to improve the maintainability and readability.

## Solutions

### Client side

I have modularized such components: Student Dashboard, Navigation Bar, Search Bar, Attributes Dashboard and Settings Dashboard.

### Server side

I have separated the User Service into smaller services: User Repository, User Service for especially handling the business logic but not the data access logic. However, the work has not been done that I have intention to split generation of certificate into a separate service.

## Conclusion

By following these principles, my codebase is more maintainable, readable, and scalable. I can write unit tests for the new components and services easily and the code is more robust and easier to maintain.
