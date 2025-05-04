<!-- README.md -->

# NestJS CSV Importer Assignment

This NestJS application reads a CSV of users, imports them into a Postgres database, and exposes REST endpoints to fetch users and age‐group statistics.

---

## Features

- **POST** `/users/upload`  
  Parse `CSV_FILE_PATH` and insert rows into a `users` table.
- **GET** `/users`  
  Return all imported users as JSON.
- **GET** `/users/stats`  
  Return percentage distribution across age brackets:  
  - under 20  
  - 20–40  
  - 40–60  
  - over 60  

---

## Setup

1. **Clone & install**  
   ```bash
   git clone <your-repo-url>
   cd <project-folder>
   npm install
