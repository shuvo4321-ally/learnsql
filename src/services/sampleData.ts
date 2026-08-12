import { SampleDatabase } from '../types';

export const SAMPLE_DATABASES: SampleDatabase[] = [
  {
    id: 'ecommerce',
    name: 'E-Commerce Store (Global Sales)',
    category: 'Retail & Sales',
    description: 'Real-world store database with customers, orders, products, order items, and reviews.',
    type: 'MySQL',
    suggestedQuestions: [
      'Which customer spent the most overall?',
      'What are the top 5 highest selling product categories by total revenue?',
      'Show monthly order totals and total sales volume for 2024',
      'List all products with stock below 20 and average customer rating above 4.5',
      'Which countries have generated the highest average order value?'
    ],
    sqlDump: `
CREATE TABLE customers (
  id INT PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255),
  city VARCHAR(100),
  country VARCHAR(100),
  joined_date DATE
);

CREATE TABLE products (
  id INT PRIMARY KEY,
  name VARCHAR(255),
  category VARCHAR(100),
  price DECIMAL(10,2),
  stock INT,
  rating DECIMAL(3,2)
);

CREATE TABLE orders (
  id INT PRIMARY KEY,
  customer_id INT,
  order_date DATE,
  status VARCHAR(50),
  total_amount DECIMAL(10,2),
  shipping_country VARCHAR(100),
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE TABLE order_items (
  id INT PRIMARY KEY,
  order_id INT,
  product_id INT,
  quantity INT,
  unit_price DECIMAL(10,2),
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE reviews (
  id INT PRIMARY KEY,
  product_id INT,
  customer_id INT,
  rating INT,
  comment VARCHAR(500),
  created_at DATE,
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- Customers Data
INSERT INTO customers VALUES (101, 'Rahim Ahmed', 'rahim.ahmed@example.com', 'Dhaka', 'Bangladesh', '2023-01-15');
INSERT INTO customers VALUES (102, 'Sarah Jenkins', 'sarah.j@example.com', 'London', 'United Kingdom', '2023-02-10');
INSERT INTO customers VALUES (103, 'Liam Chen', 'liam.chen@example.com', 'Vancouver', 'Canada', '2023-03-22');
INSERT INTO customers VALUES (104, 'Maria Garcia', 'm.garcia@example.com', 'Madrid', 'Spain', '2023-04-05');
INSERT INTO customers VALUES (105, 'Alex Rivera', 'arivera@example.com', 'New York', 'United States', '2023-05-18');
INSERT INTO customers VALUES (106, 'Yuki Tanaka', 'yuki.t@example.com', 'Tokyo', 'Japan', '2023-06-30');
INSERT INTO customers VALUES (107, 'Elena Rostova', 'elena.r@example.com', 'Berlin', 'Germany', '2023-07-12');
INSERT INTO customers VALUES (108, 'David Miller', 'dmiller@example.com', 'Sydney', 'Australia', '2023-08-25');

-- Products Data
INSERT INTO products VALUES (1, 'Pro Studio Wireless Headphones', 'Electronics', 249.99, 45, 4.8);
INSERT INTO products VALUES (2, 'Ergonomic Mesh Office Chair', 'Furniture', 320.00, 12, 4.6);
INSERT INTO products VALUES (3, 'UltraSlim 4K OLED Monitor 27"', 'Electronics', 599.50, 8, 4.9);
INSERT INTO products VALUES (4, 'Mechanical Gaming Keyboard RGB', 'Electronics', 119.00, 60, 4.7);
INSERT INTO products VALUES (5, 'Organic Espresso Coffee Beans 1kg', 'Groceries', 28.50, 150, 4.5);
INSERT INTO products VALUES (6, 'Smart Fitness Watch Series 5', 'Wearables', 199.99, 25, 4.4);
INSERT INTO products VALUES (7, 'Minimalist Leather Backpack', 'Fashion', 85.00, 30, 4.3);
INSERT INTO products VALUES (8, 'Noise Canceling Earbuds Pro', 'Electronics', 149.00, 18, 4.6);

-- Orders Data
INSERT INTO orders VALUES (1001, 101, '2024-01-10', 'Completed', 1249.50, 'Bangladesh');
INSERT INTO orders VALUES (1002, 102, '2024-01-14', 'Completed', 320.00, 'United Kingdom');
INSERT INTO orders VALUES (1003, 101, '2024-02-01', 'Completed', 245800.00, 'Bangladesh');
INSERT INTO orders VALUES (1004, 103, '2024-02-15', 'Completed', 718.50, 'Canada');
INSERT INTO orders VALUES (1005, 104, '2024-03-02', 'Shipped', 119.00, 'Spain');
INSERT INTO orders VALUES (1006, 105, '2024-03-10', 'Completed', 884.50, 'United States');
INSERT INTO orders VALUES (1007, 101, '2024-03-20', 'Completed', 399.98, 'Bangladesh');
INSERT INTO orders VALUES (1008, 106, '2024-04-05', 'Completed', 599.50, 'Japan');
INSERT INTO orders VALUES (1009, 107, '2024-04-12', 'Pending', 285.00, 'Germany');
INSERT INTO orders VALUES (1010, 108, '2024-04-22', 'Completed', 434.00, 'Australia');

-- Order Items Data
INSERT INTO order_items VALUES (1, 1001, 3, 2, 599.50);
INSERT INTO order_items VALUES (2, 1001, 5, 2, 25.25);
INSERT INTO order_items VALUES (3, 1002, 2, 1, 320.00);
INSERT INTO order_items VALUES (4, 1003, 1, 100, 2450.00);
INSERT INTO order_items VALUES (5, 1003, 3, 10, 599.50);
INSERT INTO order_items VALUES (6, 1004, 3, 1, 599.50);
INSERT INTO order_items VALUES (7, 1004, 4, 1, 119.00);
INSERT INTO order_items VALUES (8, 1005, 4, 1, 119.00);
INSERT INTO order_items VALUES (9, 1006, 1, 2, 249.99);
INSERT INTO order_items VALUES (10, 1006, 6, 1, 199.99);

-- Reviews Data
INSERT INTO reviews VALUES (1, 1, 101, 5, 'Phenomenal audio fidelity and noise isolation!', '2024-01-20');
INSERT INTO reviews VALUES (2, 3, 106, 5, 'Colors are vivid, crisp black levels for modern color grading.', '2024-04-10');
INSERT INTO reviews VALUES (3, 2, 102, 4, 'Solid back support for 8+ hour workdays.', '2024-01-25');
INSERT INTO reviews VALUES (4, 5, 101, 5, 'Best espresso beans I have brewed at home.', '2024-02-10');
`
  },
  {
    id: 'saas_analytics',
    name: 'SaaS User Metrics & Subscriptions',
    category: 'Product & Tech',
    description: 'SaaS analytics platform tracking active users, subscription tiers, churn, and feature adoption.',
    type: 'MySQL',
    suggestedQuestions: [
      'What is the total monthly recurring revenue (MRR) grouped by plan tier?',
      'Which features are most frequently used by Enterprise plan customers?',
      'List all active subscriptions renewing in the current month',
      'Compare average monthly spend between active and cancelled users'
    ],
    sqlDump: `
CREATE TABLE users (
  id INT PRIMARY KEY,
  full_name VARCHAR(255),
  email VARCHAR(255),
  plan_tier VARCHAR(50),
  signup_date DATE,
  is_active INT
);

CREATE TABLE subscriptions (
  id INT PRIMARY KEY,
  user_id INT,
  plan_name VARCHAR(50),
  monthly_price DECIMAL(10,2),
  status VARCHAR(50),
  start_date DATE,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE feature_usage (
  id INT PRIMARY KEY,
  user_id INT,
  feature_name VARCHAR(100),
  usage_count INT,
  last_used_date DATE,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

INSERT INTO users VALUES (1, 'Alice Vance', 'alice@techcorp.io', 'Enterprise', '2023-01-10', 1);
INSERT INTO users VALUES (2, 'Bob Smith', 'bob@startup.co', 'Pro', '2023-03-15', 1);
INSERT INTO users VALUES (3, 'Charlie Brown', 'charlie@freelance.dev', 'Free', '2023-05-20', 1);
INSERT INTO users VALUES (4, 'Diana Prince', 'diana@heroagency.com', 'Enterprise', '2023-02-01', 1);
INSERT INTO users VALUES (5, 'Evan Wright', 'evan@agency.net', 'Pro', '2023-06-11', 0);
INSERT INTO users VALUES (6, 'Fiona Gallagher', 'fiona@designstudio.org', 'Pro', '2023-08-04', 1);

INSERT INTO subscriptions VALUES (101, 1, 'Enterprise Yearly', 499.00, 'Active', '2023-01-10');
INSERT INTO subscriptions VALUES (102, 2, 'Pro Monthly', 49.00, 'Active', '2023-03-15');
INSERT INTO subscriptions VALUES (103, 4, 'Enterprise Yearly', 499.00, 'Active', '2023-02-01');
INSERT INTO subscriptions VALUES (104, 5, 'Pro Monthly', 49.00, 'Cancelled', '2023-06-11');
INSERT INTO subscriptions VALUES (105, 6, 'Pro Monthly', 49.00, 'Active', '2023-08-04');

INSERT INTO feature_usage VALUES (1, 1, 'AI Query Builder', 1420, '2024-05-10');
INSERT INTO feature_usage VALUES (2, 1, 'Automated Export', 380, '2024-05-11');
INSERT INTO feature_usage VALUES (3, 2, 'AI Query Builder', 210, '2024-05-09');
INSERT INTO feature_usage VALUES (4, 4, 'Custom Visualizations', 950, '2024-05-12');
INSERT INTO feature_usage VALUES (5, 4, 'AI Query Builder', 1890, '2024-05-12');
INSERT INTO feature_usage VALUES (6, 3, 'AI Query Builder', 15, '2024-04-01');
`
  },
  {
    id: 'hr_payroll',
    name: 'Corporate HR & Payroll Management',
    category: 'Corporate & HR',
    description: 'Human resource records containing employee salaries, department budgets, and project allocations.',
    type: 'MySQL',
    suggestedQuestions: [
      'Calculate the average employee salary per department',
      'Which department has exceeded its allocated annual budget?',
      'List top 3 highest earning employees hired after 2022',
      'Show total salary spend per job title across the company'
    ],
    sqlDump: `
CREATE TABLE departments (
  id INT PRIMARY KEY,
  name VARCHAR(100),
  budget DECIMAL(12,2),
  location VARCHAR(100)
);

CREATE TABLE employees (
  id INT PRIMARY KEY,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  department_id INT,
  job_title VARCHAR(100),
  salary DECIMAL(10,2),
  hire_date DATE,
  FOREIGN KEY (department_id) REFERENCES departments(id)
);

CREATE TABLE projects (
  id INT PRIMARY KEY,
  name VARCHAR(100),
  department_id INT,
  budget DECIMAL(10,2),
  status VARCHAR(50),
  FOREIGN KEY (department_id) REFERENCES departments(id)
);

INSERT INTO departments VALUES (1, 'Engineering', 500000.00, 'San Francisco');
INSERT INTO departments VALUES (2, 'Data Science', 350000.00, 'New York');
INSERT INTO departments VALUES (3, 'Marketing', 200000.00, 'London');
INSERT INTO departments VALUES (4, 'Human Resources', 120000.00, 'San Francisco');

INSERT INTO employees VALUES (1, 'Michael', 'Scott', 4, 'HR Director', 95000.00, '2021-03-15');
INSERT INTO employees VALUES (2, 'Pam', 'Beesly', 3, 'Senior Marketer', 78000.00, '2022-01-10');
INSERT INTO employees VALUES (3, 'Jim', 'Halpert', 1, 'Principal Architect', 165000.00, '2020-06-01');
INSERT INTO employees VALUES (4, 'Dwight', 'Schrute', 1, 'Senior Backend Engineer', 140000.00, '2021-09-15');
INSERT INTO employees VALUES (5, 'Angela', 'Martin', 2, 'Lead Data Scientist', 155000.00, '2022-04-18');
INSERT INTO employees VALUES (6, 'Oscar', 'Martinez', 2, 'Data Engineer', 125000.00, '2023-02-11');
INSERT INTO employees VALUES (7, 'Kevin', 'Malone', 3, 'Growth Specialist', 72000.00, '2023-07-01');

INSERT INTO projects VALUES (101, 'Cloud Migration v2', 1, 150000.00, 'In Progress');
INSERT INTO projects VALUES (102, 'LLM Customer Bot', 2, 120000.00, 'Completed');
INSERT INTO projects VALUES (103, 'Q3 Global Campaign', 3, 80000.00, 'In Progress');
`
  },
  {
    id: 'university_records',
    name: 'University Academic Records',
    category: 'Education & Academia',
    description: 'Student enrollments, courses, and professors to practice JOINS, group aggregations, and subqueries.',
    type: 'MySQL',
    suggestedQuestions: [
      'Calculate the average score for each course',
      'Which student has the highest overall average score across all their courses?',
      'List all students who scored an \'A\' in courses taught by Dr. Alan Turing',
      'Find the total number of credits each student is enrolled in for Fall 2023'
    ],
    sqlDump: `
CREATE TABLE professors (
  id INT PRIMARY KEY,
  name VARCHAR(255),
  department VARCHAR(100),
  hire_date DATE
);

CREATE TABLE courses (
  id INT PRIMARY KEY,
  course_code VARCHAR(20),
  title VARCHAR(255),
  credits INT,
  professor_id INT,
  FOREIGN KEY (professor_id) REFERENCES professors(id)
);

CREATE TABLE students (
  id INT PRIMARY KEY,
  name VARCHAR(255),
  enrollment_year INT,
  major VARCHAR(100)
);

CREATE TABLE enrollments (
  id INT PRIMARY KEY,
  student_id INT,
  course_id INT,
  semester VARCHAR(50),
  grade VARCHAR(2),
  score DECIMAL(5,2),
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (course_id) REFERENCES courses(id)
);

INSERT INTO professors VALUES (1, 'Dr. Alan Turing', 'Computer Science', '2015-08-15');
INSERT INTO professors VALUES (2, 'Dr. Marie Curie', 'Physics', '2012-01-10');
INSERT INTO professors VALUES (3, 'Dr. John Nash', 'Mathematics', '2018-09-01');

INSERT INTO courses VALUES (101, 'CS101', 'Intro to Programming', 3, 1);
INSERT INTO courses VALUES (102, 'CS201', 'Data Structures', 4, 1);
INSERT INTO courses VALUES (103, 'PHY101', 'Quantum Mechanics', 4, 2);
INSERT INTO courses VALUES (104, 'MAT101', 'Calculus I', 3, 3);
INSERT INTO courses VALUES (105, 'MAT201', 'Linear Algebra', 3, 3);

INSERT INTO students VALUES (1001, 'Alice Smith', 2022, 'Computer Science');
INSERT INTO students VALUES (1002, 'Bob Johnson', 2022, 'Physics');
INSERT INTO students VALUES (1003, 'Charlie Lee', 2023, 'Mathematics');
INSERT INTO students VALUES (1004, 'Diana King', 2021, 'Computer Science');

INSERT INTO enrollments VALUES (1, 1001, 101, 'Fall 2023', 'A', 95.5);
INSERT INTO enrollments VALUES (2, 1001, 104, 'Fall 2023', 'B', 85.0);
INSERT INTO enrollments VALUES (3, 1002, 103, 'Fall 2023', 'A', 92.0);
INSERT INTO enrollments VALUES (4, 1002, 104, 'Fall 2023', 'C', 75.5);
INSERT INTO enrollments VALUES (5, 1003, 104, 'Spring 2024', 'A', 98.0);
INSERT INTO enrollments VALUES (6, 1003, 105, 'Spring 2024', 'B', 88.0);
INSERT INTO enrollments VALUES (7, 1004, 101, 'Fall 2021', 'A', 94.0);
INSERT INTO enrollments VALUES (8, 1004, 102, 'Spring 2022', 'A', 96.5);
`
  },
  {
    id: 'logistics_fleet',
    name: 'Logistics & Fleet Management',
    category: 'Supply Chain',
    description: 'Warehouse shipments, delivery vehicles, and driver logs for complex date differences and conditional logic.',
    type: 'MySQL',
    suggestedQuestions: [
      'What is the total weight of shipments currently in transit?',
      'Which drivers have driven the Heavy Truck vehicle type?',
      'Calculate the average delivery time (in days) for completed shipments',
      'List all warehouses and the total weight of shipments dispatched from them'
    ],
    sqlDump: `
CREATE TABLE warehouses (
  id INT PRIMARY KEY,
  location VARCHAR(100),
  capacity INT,
  manager_name VARCHAR(100)
);

CREATE TABLE fleet_vehicles (
  id INT PRIMARY KEY,
  vehicle_type VARCHAR(50),
  license_plate VARCHAR(20),
  capacity_kg DECIMAL(10,2),
  status VARCHAR(50)
);

CREATE TABLE drivers (
  id INT PRIMARY KEY,
  name VARCHAR(100),
  license_level VARCHAR(20),
  hire_date DATE
);

CREATE TABLE shipments (
  id INT PRIMARY KEY,
  warehouse_id INT,
  vehicle_id INT,
  driver_id INT,
  destination VARCHAR(255),
  weight_kg DECIMAL(10,2),
  dispatch_date DATE,
  delivery_date DATE,
  status VARCHAR(50),
  FOREIGN KEY (warehouse_id) REFERENCES warehouses(id),
  FOREIGN KEY (vehicle_id) REFERENCES fleet_vehicles(id),
  FOREIGN KEY (driver_id) REFERENCES drivers(id)
);

INSERT INTO warehouses VALUES (1, 'Chicago Central', 50000, 'Tom Hardy');
INSERT INTO warehouses VALUES (2, 'Dallas South', 75000, 'Emma Stone');
INSERT INTO warehouses VALUES (3, 'Seattle West', 40000, 'Chris Evans');

INSERT INTO fleet_vehicles VALUES (101, 'Heavy Truck', 'TEX-1234', 15000.00, 'Active');
INSERT INTO fleet_vehicles VALUES (102, 'Heavy Truck', 'TEX-5678', 15000.00, 'Maintenance');
INSERT INTO fleet_vehicles VALUES (103, 'Light Van', 'CHI-9012', 3500.00, 'Active');
INSERT INTO fleet_vehicles VALUES (104, 'Medium Truck', 'SEA-3456', 8000.00, 'Active');

INSERT INTO drivers VALUES (1, 'Jack Reacher', 'Class A', '2019-05-12');
INSERT INTO drivers VALUES (2, 'Sarah Connor', 'Class A', '2020-08-22');
INSERT INTO drivers VALUES (3, 'Frank Martin', 'Class B', '2021-11-05');
INSERT INTO drivers VALUES (4, 'Furiosa', 'Class A', '2018-03-15');

INSERT INTO shipments VALUES (1001, 1, 103, 3, 'Detroit', 2500.50, '2024-05-01', '2024-05-02', 'Delivered');
INSERT INTO shipments VALUES (1002, 2, 101, 1, 'Houston', 14200.00, '2024-05-03', '2024-05-04', 'Delivered');
INSERT INTO shipments VALUES (1003, 2, 101, 2, 'Austin', 12500.00, '2024-05-06', NULL, 'In Transit');
INSERT INTO shipments VALUES (1004, 3, 104, 4, 'Portland', 7800.00, '2024-05-05', '2024-05-06', 'Delivered');
INSERT INTO shipments VALUES (1005, 1, 103, 3, 'Milwaukee', 3100.00, '2024-05-07', NULL, 'In Transit');
`
  },
  {
    id: 'healthcare_records',
    name: 'Hospital Patient Records',
    category: 'Healthcare & Medicine',
    description: 'Patient demographics, doctor specialties, and appointment schedules. Great for filtering by datetime and strings.',
    type: 'MySQL',
    suggestedQuestions: [
      'Find all upcoming scheduled appointments and the respective doctors specialty',
      'Calculate the current age of all patients and group them by gender',
      'Which department has the most cancelled appointments?',
      'List all patients who have seen doctors from more than one department'
    ],
    sqlDump: `
CREATE TABLE departments (
  id INT PRIMARY KEY,
  name VARCHAR(100),
  floor INT
);

CREATE TABLE doctors (
  id INT PRIMARY KEY,
  name VARCHAR(100),
  specialty VARCHAR(100),
  department_id INT,
  FOREIGN KEY (department_id) REFERENCES departments(id)
);

CREATE TABLE patients (
  id INT PRIMARY KEY,
  name VARCHAR(100),
  dob DATE,
  gender VARCHAR(20),
  blood_type VARCHAR(5)
);

CREATE TABLE appointments (
  id INT PRIMARY KEY,
  patient_id INT,
  doctor_id INT,
  appointment_date DATETIME,
  status VARCHAR(50),
  notes VARCHAR(255),
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (doctor_id) REFERENCES doctors(id)
);

INSERT INTO departments VALUES (1, 'Cardiology', 3);
INSERT INTO departments VALUES (2, 'Neurology', 4);
INSERT INTO departments VALUES (3, 'Pediatrics', 2);
INSERT INTO departments VALUES (4, 'Emergency', 1);

INSERT INTO doctors VALUES (1, 'Dr. Gregory House', 'Diagnostic Medicine', 4);
INSERT INTO doctors VALUES (2, 'Dr. Derek Shepherd', 'Neurosurgery', 2);
INSERT INTO doctors VALUES (3, 'Dr. Cristina Yang', 'Cardiothoracic Surgery', 1);
INSERT INTO doctors VALUES (4, 'Dr. Alex Karev', 'Pediatric Surgery', 3);

INSERT INTO patients VALUES (101, 'John Doe', '1985-06-15', 'Male', 'O+');
INSERT INTO patients VALUES (102, 'Jane Smith', '1992-09-22', 'Female', 'A-');
INSERT INTO patients VALUES (103, 'Robert Johnson', '1975-03-10', 'Male', 'B+');
INSERT INTO patients VALUES (104, 'Emily Davis', '2015-11-05', 'Female', 'O-');

INSERT INTO appointments VALUES (1, 101, 3, '2024-06-01 10:00:00', 'Completed', 'Routine checkup. Blood pressure normal.');
INSERT INTO appointments VALUES (2, 102, 2, '2024-06-02 14:30:00', 'Completed', 'Migraine consultation.');
INSERT INTO appointments VALUES (3, 103, 1, '2024-06-03 09:15:00', 'Cancelled', 'Patient felt better.');
INSERT INTO appointments VALUES (4, 104, 4, '2024-06-04 11:00:00', 'Completed', 'Vaccination.');
INSERT INTO appointments VALUES (5, 101, 3, '2024-06-15 10:00:00', 'Scheduled', 'Follow-up appointment.');
INSERT INTO appointments VALUES (6, 102, 1, '2024-06-16 15:00:00', 'Scheduled', 'Second opinion for persistent headaches.');
`
  }
];
