# csc13010 - Student Information System Application

## Overview

This repository contains the source code for a very basic student information system (SIS) as web application. The application separates the user interface (client) from the data management and business logic (server). This repository is weekly updated following lecturer's requirements of the course CSC13010 - Software and Desin Analysis.

The system manages student data, including information such as:

- Student ID
- Full Name
- Date of Birth
- Gender
- Faculty/Department
- Class
- Program
- Address
- Email
- Contact Phone Number
- Student Status

## Features

### v1.0

- **Authentication/Authorization:** Allow user to login and recover password through email. The system includes 3 roles for authorization: `ADMIN`, `STUDENT`, `TEACHER`. However, only `ADMIN` role is allowed to login and access system dashboards.
- **Student Management:** Provide CRUD operations for student records. This includes adding new students, deleting students, updating student information, and viewing student details.
- **Search Functionality:** Allow searching for students by full name or Student ID (MSSV).
- **Data Validation:** Implement input validation for key fields such as email, phone number, faculty, and student status.

### v2.0

- **Data storage:** Using Mongoose for constructing data schema and storing directly to MongoDB.
- **Advanced Search:** Allow search by Faculty filter
- **Import/export records:** Allow user to import records as CSV/JSON and vice versa.
- **Logging mechanism:** System automatically logs any meaningful operations or errors for troubleshooting issues.
- **Development build information:** Display build version and build date at the website footer.
- **Dynamic attributes:** Such attributes like Faculty, Program, Status is allowed to be added or audited by administrator. The system will provide 5 Faculty entities, 4 Status entities and 3 Program entities by default.

### v3.0

- **Configurable status rules:** Refer to **Validation rules**
- **Configurable phone number prefix:** Refer to **Validation rules**.
- **Configurable email suffix:** Refer to **Validation rules**.
- **Unique student ID:** Refer to **Validation rules**.
- **Unit testing:** Refer to **Unit testing** and [Testing documentation](./docs/guidelines/testing/).

### v4.0

- **University branding:** Display university logo/headlines at the website header.
- **Configurable time policy for deleting after account creation:** Add a new field in University settings to specify the time policy for deleting after account creation.
- **Enable/Disable university settings:** Add a button in University settings to specify whether the university settings are enabled or disabled by `ADMIN` role.
- **Allow to delete attributes (Faculty, Program, Status) in case of no accounts are associated with that attribute:** Allow `ADMIN` role to delete attributes in case of no accounts are associated with that attribute.
- **Student certificate generation:** Add a new button in Student Dashboard to generate a certificate for the student for the purpose of job, postgraduate with full information of the student and the university.
- **Unit testing:** Refer to **Unit testing** and [Testing documentation](./docs/guidelines/testing/).
- **Refactor code:** Refer to **Refactoring guidelines** and [Refactoring documentation](./docs/guidelines/refactoring/).

## Validation rules (Backend)

The backend API enforces the following validation rules:

- **Student ID:** Ensure to be unique (each Student ID is assigned to one person).
- **Email:** Check for a valid email format (using regular expression). All students must have the same email suffix and `ADMIN` is allowed to config this in University settings.
- **Phone Number:** Validate that the phone number matches a specific format (using a regular expression & length check). All students must have the same phone number prefix and `ADMIN` is allowed to config this in University settings.
- **Faculty:** Ensure that the entered faculty matches one of the allowed values:
    - Faculty of Law (FL)
    - Faculty of Business English (FBE)
    - Faculty of Japanese (FJPN)
    - Faculty of French (FFR)
- **Student Status:** Validate that the entered status matches one of the allowed values:
    - Active
    - Graduated
    - Leave (Left the program)
    - Absent (On Leave)
      `ADMIN` must follow status rules to change a student's status. For example: `Active` can be switched to `Graduated`, `Leave`, `Absent` but `Graduated` can't be that in the reverse way.
- **Program:** Ensure that the entered program matches one of the allowed values:
    - High Quality Program (HQP)
    - Formal Program (FP)
    - Advanced Program (AP)

## Technologies

- **Frontend:**
    - Next.js (TypeScript)
- **Backend:**
    - NestJS (TypeScript)
    - Mongoose
    - Docker/Docker Compose
- **Database:** MongoDB
- **Node.js:** Node 22 (specified in `.nvmrc`)
- **Package Manager:** PNPM
- **Operations:** Husky (commitlint, ESLint), Prettier, Github Actions (CI), Vercel/Render (CD)

## Prerequisites

Before you can run this application, you'll need to have the following installed:

- **Node.js:** Make sure you have Node.js version 22 or higher installed. It's recommended to use `nvm` (Node Version Manager) for managing Node.js versions.
- **PNPM:** You'll need a package manager to install dependencies. `pnpm` comes with Node.js.
- **MongoDB:** Install and configure database server in `.env` following `.env.example`.

## Setup and Installation

Follow these steps to get the application up and running:

1.  **Clone the repository:**

    ```
    git clone https://github.com/ntkwan/csc13010-student-information-system.git
    cd csc13010-student-information-system
    ```

2.  **Install Dependencies:**

    - **Client:**
        ```
        cd client
        pnpm install
        ```
    - **Server:**
        ```
        cd ../server
        pnpm install
        ```

3.  **Configure the Database:**

    - The `docker-compose.yml` file inside `server` is allowed to run docker container of MongoDB in case of local development. However, [MongoDB Compass](https://www.mongodb.com/products/tools/compass) is suitable for production.
    - Update the database connection settings in the server `.env` file (`server/.env.example` for a template). Specify the database host, port, username, and password.

4.  **Environment Variables:**
    - Create `.env` files in both the `client` and `server` directories.
    - Define the necessary environment variables (e.g., API endpoint, database connection string, API keys). See `.env.example` for a template.

## Running the Application

1.  **Start the Server:**

    ```
    cd server
    pnpm run start:dev
    ```

    or

    ```
    cd server & docker build -t sis-backend .
    docker run [IMAGE_ID]
    ```

    To find `IMAGE_ID`, use `docker images` and looking for image named `sis-backend`
    After starting the server, it is now accessible in your browser at `http://localhost:[port]` (e.g., `http://localhost:8080`)

2.  **Start the Client:**

    ```
    cd client
    pnpm run dev  # or yarn start
    ```

    The client application should now be accessible in your browser at `http://localhost:[port]` (e.g., `http://localhost:3000`).

## Deployment

The demo client and server are currently deployed at [Vercel](csc13010-student-information-system.vercel.app) and [Render](https://csc13010-student-information-system.onrender.com), respectively.

## Documentation

Find more API endpoints description at [Render](https://csc13010-student-information-system.onrender.com/docs).

## Usage

Once the application is running, you can interact with it through the dashboard menu. The menu will provide options for:

- Adding a new student
- Deleting a student
- Updating student information
- Searching for students

## Unit testing

This application is built with NestJS and is rigorously tested using Jest to ensure code reliability and maintainability. You can view the latest test coverage results [here](https://ntkwan.github.io/csc13010-student-information-system/).

![screenshot](docs/screenshots/screen28.png)

The project follows a structured testing approach:

- **Unit Tests:** Validate individual functions and services.
- **Controller Tests:** Ensure API endpoints behave as expected.
- **Module Tests:** Verify module configurations and dependencies.

![screenshot](docs/screenshots/screen27.png)

The CI/CD besides auto-deployed the test coverage results. It is also fully automated Jest tests in the CI/CD pipeline and required at least 70\% of test coverage to pass the check.

## Screenshots

### v1.0

#### Landing page

![screenshot](docs/screenshots/screen1.png)

#### Login page

![screenshot](docs/screenshots/screen2.png)

#### Menu

![screenshot](docs/screenshots/screen3.png)

#### Search a record

![screenshot](docs/screenshots/screen4.png)

#### Edit a record

![screenshot](docs/screenshots/screen5.png)

#### View a record

![screenshot](docs/screenshots/screen6.png)

#### Add a record

<div align="center">
  <img src="docs/screenshots/screen7.png" width="45%">
  <img src="docs/screenshots/screen8.png" width="45%">
  <img src="docs/screenshots/screen9.png" width="45%">
</div>

### v2.0

#### Dynamic attributes

<div align="center">
  <img src="docs/screenshots/screen10.png" width="45%">
  <img src="docs/screenshots/screen11.png" width="45%">
  <img src="docs/screenshots/screen12.png" width="45%">
  <img src="docs/screenshots/screen13.png" width="45%">
</div>

#### Development build information

![screenshot](docs/screenshots/screen20.png)

#### Logging mechanism

![screenshot](docs/screenshots/screen14.png)

#### Advanced search

<div align="center">
  <img src="docs/screenshots/screen15.png" width="45%">
  <img src="docs/screenshots/screen16.png" width="45%">
</div>

#### Import/export records

<div align="center">
  <img src="docs/screenshots/screen17.png" width="45%">
  <img src="docs/screenshots/screen18.png" width="45%">
  <img src="docs/screenshots/screen19.png" width="45%">
</div>

### v3.0

#### Configurable status rules

<div align="center">
  <img src="docs/screenshots/screen21.png" width="45%">
  <img src="docs/screenshots/screen22.png" width="45%">
</div>

#### Configurable phone number prefix

<div align="center">
  <img src="docs/screenshots/screen23.png" width="40%">
  <img src="docs/screenshots/screen24.png" width="60%">
</div>

#### Configurable email suffix

<div align="center">
    <img src="docs/screenshots/screen25.png" width="40%">
    <img src="docs/screenshots/screen24.png" width="60%">
</div>

#### Unique student ID

![screenshot](docs/screenshots/screen26.png)

### v4.0

#### University branding

![screenshot](docs/screenshots/screen30.png)

#### Configurable time policy for deleting after account creation

<div align="center">
    <img src="docs/screenshots/screen29.png" width="40%">
    <img src="docs/screenshots/screen31.png" width="60%">
</div>

#### Enable/Disable university settings

![screenshot](docs/screenshots/screen32.png)

#### Allow to delete attributes (Faculty, Program, Status) in case of no accounts are associated with that attribute

![screenshot](docs/screenshots/screen33.png)

#### Student certificate generation

<div align="center">
    <img src="docs/screenshots/screen34.png" width="45%">
    <img src="docs/screenshots/screen35.png" width="45%">
</div>

## Code convention

This project uses [ESLint](https://eslint.org/) and [Prettier](https://prettier.io/) for code formatting and linting. Please ensure your code adheres to the project's style guidelines. The Git hooks (using Husky) will automatically run these tools before each commit.

This project uses a conventional commit message format.

## Contributing

Contributions are welcome! To contribute to this project, please follow these steps:

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix.
3.  Make your changes and commit them with clear, descriptive commit messages.
4.  Submit a pull request.
