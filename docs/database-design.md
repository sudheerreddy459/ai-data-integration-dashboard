# Database Design

## Overview

The database is designed using a normalized relational model. Integration details are stored separately from execution data to avoid duplication and improve scalability.

---

## Tables

### 1. User

Stores application user information.

### 2. Integration

Stores integration details such as source system, target system, and integration name.

### 3. Execution

Stores every execution of an integration, including execution status, start time, end time, and records processed.

### 4. ExecutionLog

Stores logs and error messages generated during an execution.

### 5. Alert

Stores alerts generated for critical failures or important events.

### 6. AIInsight

Stores AI-generated summaries and recommendations for execution failures.
