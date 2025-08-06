# Estrutura de Pastas do Projeto

```plaintext
project/
├─ client/
│  ├─ auth.js
│  ├─ index.html
│  ├─ CSS/
│  │  ├─ styles.css
│  │  ├─ main.css
│  │  ├─ client_dashboard.css
│  │  ├─ hub.css
│  │  ├─ login_client.css
│  │  ├─ login_restaurant.css
│  │  ├─ register.css
│  │  ├─ rate.css
│  │  └─ review.css
│  ├─ Cliente/
│  │  ├─ login_client.html
│  │  ├─ register_client.html
│  │  ├─ Client_dashboard.html
│  │  ├─ client_dashboard.js
│  │  ├─ main.js
│  │  ├─ rate.html
│  │  ├─ rate.js
│  │  ├─ register_client.js
│  │  ├─ review.html
│  │  └─ review.js
│  ├─ Restaurante/
│  │  ├─ history.html
│  │  ├─ history.js
│  │  ├─ login_restaurant.html
│  │  ├─ restaurant_dashboard.html
│  │  ├─ restaurant_dashboard.js
│  │  ├─ restaurant_register.html
│  │  └─ restaurant_register.js
│  └─ images/
│     ...
│
├─ server/
│  ├─ middlewares/
│  │  ├─ clientMiddlewares.js
│  │  ├─ restaurantMiddlewares.js
│  │  ├─ validateLogin.js
│  │  └─ validateReportId.js
│  ├─ routes/
│  │  ├─ analysisRoutes.js
│  │  ├─ authRoutes.js
│  │  ├─ clientRoutes.js
│  │  ├─ favoriteRoutes.js
│  │  ├─ recommendationRoutes.js
│  │  ├─ reportRoutes.js
│  │  ├─ restaurantRoutes.js
│  │  ├─ reviewRoutes.js
│  │  ├─ reportRoutes.js
│  │  └─ discoveryRoutes.js
│  ├─ controllers/
│  │  ├─ analysisController.js
│  │  ├─ authController.js
│  │  ├─ clientController.js
│  │  ├─ favoriteController.js
│  │  ├─ recommendationController.js
│  │  ├─ reportController.js
│  │  ├─ restaurantController.js
│  │  ├─ reviewController.js
│  │  ├─ reportController.js
│  │  └─ discoveryController.js
│  ├─ models/
│  │  └─ db.js
│  └─ server.js
│
├─ CONTRIBUTING.md
├─ database.db
├─ package-lock.json
├─ package.json
└─ README.md
