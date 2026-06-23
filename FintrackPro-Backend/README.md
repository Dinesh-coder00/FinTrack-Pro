# FinTrack Pro – Spring Boot Backend

## Tech Stack
| Layer       | Technology                          |
|-------------|-------------------------------------|
| Runtime     | Java 17                             |
| Framework   | Spring Boot 3.2                     |
| Security    | Spring Security + JWT (jjwt 0.12)   |
| Persistence | Spring Data JPA + Hibernate         |
| Database    | MySQL 8.x                           |
| Validation  | Jakarta Bean Validation             |
| PDF         | iTextPDF 5.5                        |
| Build       | Maven                               |
| Utilities   | Lombok                              |

---

## Project Structure

```
src/main/java/com/fintrack/
│
├── FinTrackProApplication.java        ← Main entry point
│
├── config/
│   └── SecurityConfig.java           ← Spring Security + CORS setup
│
├── security/
│   ├── JwtUtils.java                 ← Token generation & validation
│   ├── JwtAuthFilter.java            ← Per-request JWT filter
│   └── UserDetailsServiceImpl.java   ← Loads user from DB
│
├── entity/
│   ├── User.java                     ← users table
│   ├── Income.java                   ← income table
│   ├── Expense.java                  ← expenses table
│   ├── Budget.java                   ← budget table
│   ├── SavingsGoal.java              ← savings_goal table
│   └── Transaction.java             ← transactions table (ledger)
│
├── dto/
│   ├── ApiResponse.java              ← Generic envelope {success,message,data}
│   ├── AuthResponse.java
│   ├── RegisterRequest.java
│   ├── LoginRequest.java
│   ├── UserDto.java
│   ├── UpdateProfileRequest.java
│   ├── IncomeRequest.java / IncomeDto.java
│   ├── ExpenseRequest.java / ExpenseDto.java
│   ├── BudgetRequest.java / BudgetDto.java
│   ├── SavingsGoalRequest.java / SavingsGoalDto.java
│   ├── DashboardDto.java
│   ├── TransactionDto.java
│   ├── AnalyticsDto.java
│   ├── CategorySumDto.java
│   └── MonthlyTrendDto.java
│
├── repository/
│   ├── UserRepository.java
│   ├── IncomeRepository.java
│   ├── ExpenseRepository.java
│   ├── BudgetRepository.java
│   ├── SavingsGoalRepository.java
│   └── TransactionRepository.java
│
├── service/
│   ├── AuthService.java
│   ├── UserService.java
│   ├── IncomeService.java
│   ├── ExpenseService.java
│   ├── BudgetService.java
│   ├── SavingsGoalService.java
│   ├── DashboardService.java
│   └── AnalyticsService.java
│
├── controller/
│   ├── BaseController.java           ← Shared userId resolver
│   ├── AuthController.java           ← POST /register  POST /login
│   ├── DashboardController.java      ← GET  /dashboard
│   ├── IncomeController.java         ← GET/POST/PUT/DELETE /income
│   ├── ExpenseController.java        ← GET/POST/PUT/DELETE /expense
│   ├── BudgetController.java         ← GET/POST /budget
│   ├── SavingsGoalController.java    ← GET/POST/PATCH/DELETE /savings
│   ├── AnalyticsController.java      ← GET /analytics
│   └── ProfileController.java        ← GET/PATCH /profile
│
└── exception/
    ├── ResourceNotFoundException.java
    ├── BusinessException.java
    ├── ForbiddenException.java
    └── GlobalExceptionHandler.java
```

---

## Quick Start

### 1. Prerequisites
- Java 17+
- Maven 3.8+
- MySQL 8.x running locally

### 2. Create database
```sql
CREATE DATABASE fintrack_pro;
-- Then run database/schema.sql (provided separately)
```

### 3. Configure application.properties
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/fintrack_pro?useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD

app.jwt.secret=FinTrackProSuperSecretKeyForJWT2024MustBe256BitsLong!!
```

### 4. Build & Run
```bash
mvn clean install
mvn spring-boot:run
# Server starts at http://localhost:8080/api
```

---

## REST API Reference

All protected endpoints require header:
```
Authorization: Bearer <JWT_TOKEN>
```

### Auth (Public)
| Method | Endpoint      | Body                              |
|--------|---------------|-----------------------------------|
| POST   | `/register`   | `{name, email, password}`         |
| POST   | `/login`      | `{email, password}`               |

### Dashboard
| Method | Endpoint      |
|--------|---------------|
| GET    | `/dashboard`  |

### Income
| Method | Endpoint       | Notes         |
|--------|----------------|---------------|
| GET    | `/income`      | `?page=0&size=10` |
| POST   | `/income`      | `{title,amount,category,date,description}` |
| PUT    | `/income/{id}` | Same body     |
| DELETE | `/income/{id}` |               |

### Expenses
| Method | Endpoint        | Notes                             |
|--------|-----------------|-----------------------------------|
| GET    | `/expense`      | `?page&size&category&from&to&search` |
| POST   | `/expense`      | `{title,amount,category,date,description}` |
| PUT    | `/expense/{id}` | Same body                         |
| DELETE | `/expense/{id}` |                                   |

### Budget
| Method | Endpoint   | Notes                                    |
|--------|------------|------------------------------------------|
| GET    | `/budget`  | All budgets for user                     |
| POST   | `/budget`  | `{month,year,totalLimit,warnPct}` – upserts |

### Savings Goals
| Method | Endpoint                      | Notes               |
|--------|-------------------------------|---------------------|
| GET    | `/savings`                    |                     |
| POST   | `/savings`                    | `{title,targetAmount,savedAmount,deadline}` |
| PATCH  | `/savings/{id}/contribute`    | `?amount=100`       |
| DELETE | `/savings/{id}`               |                     |

### Analytics
| Method | Endpoint      |
|--------|---------------|
| GET    | `/analytics`  |

### Profile
| Method | Endpoint   |
|--------|------------|
| GET    | `/profile` |
| PATCH  | `/profile` |

---

## Response Envelope
Every response is wrapped:
```json
{
  "success": true,
  "message": "Success",
  "data": { ... }
}
```

---

## Security Notes
- Passwords hashed with BCrypt (strength 12)
- JWT expiry: 24 hours (configurable via `app.jwt.expiration-ms`)
- **Change** `app.jwt.secret` before deploying to production
- CORS origin defaults to `http://localhost:3000`
