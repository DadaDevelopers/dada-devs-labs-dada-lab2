# Contributing to Lightning Chama

Thank you for your interest in contributing to Lightning Chama!
This guide outlines the workflow, branch structure, and standards to follow when contributing to the project.

## 🚀 Project Overview

Lightning Chama is built using:

- Next.js (frontend)

- pnpm as the package manager

A separated backend (Node.js, python or other depending on the repo)

Git branching structure to keep development organized and stable

## Branch Structure

The project follows a structured branching model:

```
Branch	Purpose
development	Main branch for all frontend work.
backend	Main branch for all backend work.
Feature branches	Created by contributors for specific issues/tasks.

```
## Before You Start

- Ensure you have Node.js and pnpm installed.

- Fork the repository (if you don’t have direct access).

- Choose an issue you want to work on from the issue tracker.

- Ask for clarification if needed.

## Cloning the Repository

Clone the project and navigate into it:
```
git clone https://github.com/<org-or-username>/lightning-chama.git
cd lightning-chama

```


Install dependencies using:
```
pnpm install

```

## Creating a Feature Branch

All contributors must create a dedicated branch for each task they work on.

For Frontend Tasks

1. Pull from the development branch:
2. git checkout development
3. git pull origin development
4. git checkout -b feature/<issue-name>

For Backend Tasks

1. Pull from the backend branch:
2. git checkout backend
3. git pull origin backend
4. git checkout -b backend/<issue-name>


Branch naming examples:

- feature/signup-ui

- feature/update-profile

- backend/create-loan-api

- backend/add-auth-middleware

## Working on Your Task

- Ensure your code meets the project standards.

- Make clear, descriptive commits.

- Keep your branch updated with the latest changes:

```
git pull origin development    # if frontend
git pull origin backend        # if backend

```

Resolve conflicts if any appear.

## Testing Your Changes

Before submitting a PR:

1. Confirm your feature works as expected.

2. Run tests (if test suite exists).

3. Ensure there are no build errors.

## Submitting a Pull Request

When your task is complete:

Push your branch:
```
git push origin feature/<issue-name>

```

(or)
```
git push origin backend/<issue-name>

```

Go to GitHub → Submit a Pull Request (PR).

Your PR Should:

Target:

- development for frontend work

- backend for backend work

## Include a clear description of:

- The issue it solves

- What was implemented

- Screenshots for UI work (optional but recommended)

- Pass all checks

A maintainer will review your PR and request changes or approve it.

## Code of Conduct

- Be respectful.

- Ask questions when unsure.

- Write clean, readable, maintainable code.

- Collaborate openly and kindly.

🎉 Thank You!

Your contribution helps make Lightning Chama better for everyone. We appreciate your time and effort!