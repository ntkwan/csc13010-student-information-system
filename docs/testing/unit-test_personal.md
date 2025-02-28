# Testing Documentation

## 1. Introduction

This document outlines the testing strategies, methodologies, and tools used for ensuring the reliability and stability of the student information system website. It includes details on test coverage, testing types, and suggestions for improvement.

## 2. Testing strategy

The testing strategy consists of multiple layers to ensure the correctness of the application:

- **Unit Testing**: Focuses on testing individual functions and components.
- **Automation Testing**: Setup an CI/CD for unit testing and report for test coverage results.

## 3. Testing tools

- **Jest**: Used for unit testing (modules, services and controllers).
- **Swagger**: Manual API testing.
- **ESLint**: Static code analysis for detecting potential issues.
- **Mocking/Stub**: Used to isolate tests that rely on database or persistent storage.

## 4. Test coverage

- **User Service**
    - Authentication & Authorization
    - User profile management
    - Role-based access control
- **Student Management**
    - Adding, editing, and deleting students
    - Validations for email suffix and phone number
    - CRUD operations on faculties and programs
    - Configuration of email suffix and phone settings
- **Logger**
    - Expect to write the logs to logging file.

However, the test coverage results are auto-deployed at [here](https://ntkwan.github.io/csc13010-student-information-system/).

## 5. Known testing challenges & Areas for improvement

### 5.1 Use of mocks/stubs

Mocking and stubbing have been used for my project in database-dependent test cases. This ensures isolation of business logic but may require additional effort to maintain test reliability.

### 5.2 Large user service complexity

The **User Service** is currently too large, leading to difficulties in testing. The unit test coverage is not comprehensive, and refactoring is needed to improve testability. Splitting the service into smaller, well-defined modules will enhance maintainability and testing effectiveness.

### 5.3 Potential missing test coverage

To improve test coverage and system reliability, we should evaluate if any critical business logic is missing in the current test suite. The following areas require further analysis:

- **Validation logic**: Ensure all necessary input validations are tested thoroughly.
- **Edge cases**: Test unexpected user inputs, concurrency scenarios, and extreme cases.
- **Security concerns**: Ensure role-based access control is strictly enforced and tested.
- **Error handling**: Verify that system handles exceptions gracefully and logs errors appropriately.

## 6. Suggested improvements

1. **Refactor User Service**: Break it down into smaller, more manageable services to facilitate unit testing.
2. **Increase test coverage**: Identify missing test cases and ensure they are included in the test suite.
3. **Improve mocking strategy**: Ensure mocks/stubs remain aligned with real database behaviors.
4. **Automate more tests**: Increase automated test coverage, especially for integration and security testing.

## 7. Conclusion

This testing documentation highlights the strategies and areas for improvement in the current testing setup. By addressing the challenges and implementing the suggested improvements, we can enhance the system's reliability, maintainability, and overall quality.
