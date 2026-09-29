-- LearnSQL practice database: a small university
-- Upload via: Database -> Upload SQL / CSV
-- Tables: teachers, courses, students, enrollments
-- Relationships are inferred from *_id columns:
--   courses.teacher_id     -> teachers.id
--   enrollments.student_id -> students.id
--   enrollments.course_id  -> courses.id

CREATE TABLE teachers (
  id INT PRIMARY KEY,
  name VARCHAR(50),
  department VARCHAR(30),
  salary INT,
  hire_date VARCHAR(10)
);

CREATE TABLE courses (
  id INT PRIMARY KEY,
  title VARCHAR(60),
  credits INT,
  teacher_id INT
);

CREATE TABLE students (
  id INT PRIMARY KEY,
  name VARCHAR(50),
  email VARCHAR(60),
  city VARCHAR(30),
  birth_year INT
);

CREATE TABLE enrollments (
  id INT PRIMARY KEY,
  student_id INT,
  course_id INT,
  grade INT,
  enrolled_on VARCHAR(10)
);

INSERT INTO teachers VALUES (1, 'Dr. Rahman', 'Computer Science', 92000, '2015-08-01');
INSERT INTO teachers VALUES (2, 'Dr. Akter', 'Mathematics', 85000, '2012-01-15');
INSERT INTO teachers VALUES (3, 'Prof. Hossain', 'Physics', 98000, '2008-09-01');
INSERT INTO teachers VALUES (4, 'Ms. Chowdhury', 'English', 64000, '2019-02-10');
INSERT INTO teachers VALUES (5, 'Dr. Islam', 'Computer Science', 88000, '2017-06-20');

INSERT INTO courses VALUES (1, 'Intro to Programming', 3, 1);
INSERT INTO courses VALUES (2, 'Databases', 3, 5);
INSERT INTO courses VALUES (3, 'Calculus I', 4, 2);
INSERT INTO courses VALUES (4, 'Linear Algebra', 3, 2);
INSERT INTO courses VALUES (5, 'Classical Mechanics', 4, 3);
INSERT INTO courses VALUES (6, 'Academic Writing', 2, 4);
INSERT INTO courses VALUES (7, 'Algorithms', 3, 1);
INSERT INTO courses VALUES (8, 'Machine Learning', 3, 5);

INSERT INTO students VALUES (1, 'Shuvo Ahmed', 'shuvo@example.com', 'Dhaka', 2002);
INSERT INTO students VALUES (2, 'Nusrat Jahan', 'nusrat@example.com', 'Chittagong', 2003);
INSERT INTO students VALUES (3, 'Rafi Karim', 'rafi@example.com', 'Dhaka', 2001);
INSERT INTO students VALUES (4, 'Tania Sultana', 'tania@example.com', 'Sylhet', 2002);
INSERT INTO students VALUES (5, 'Imran Hasan', 'imran@example.com', 'Khulna', 2004);
INSERT INTO students VALUES (6, 'Mim Akter', 'mim@example.com', 'Dhaka', 2003);
INSERT INTO students VALUES (7, 'Sajid Mahmud', 'sajid@example.com', 'Rajshahi', 2001);
INSERT INTO students VALUES (8, 'Farhana Yasmin', 'farhana@example.com', 'Chittagong', 2002);
INSERT INTO students VALUES (9, 'Tanvir Alam', 'tanvir@example.com', 'Dhaka', 2004);
INSERT INTO students VALUES (10, 'Lubna Khan', 'lubna@example.com', 'Sylhet', 2003);

INSERT INTO enrollments VALUES (1, 1, 1, 88, '2025-01-10');
INSERT INTO enrollments VALUES (2, 1, 2, 92, '2025-01-10');
INSERT INTO enrollments VALUES (3, 1, 7, 79, '2025-06-12');
INSERT INTO enrollments VALUES (4, 2, 1, 95, '2025-01-11');
INSERT INTO enrollments VALUES (5, 2, 3, 84, '2025-01-11');
INSERT INTO enrollments VALUES (6, 3, 2, 67, '2025-01-12');
INSERT INTO enrollments VALUES (7, 3, 8, 73, '2025-06-14');
INSERT INTO enrollments VALUES (8, 4, 5, 90, '2025-01-12');
INSERT INTO enrollments VALUES (9, 4, 4, 86, '2025-01-13');
INSERT INTO enrollments VALUES (10, 5, 6, 71, '2025-01-14');
INSERT INTO enrollments VALUES (11, 5, 1, 58, '2025-01-14');
INSERT INTO enrollments VALUES (12, 6, 2, 81, '2025-01-15');
INSERT INTO enrollments VALUES (13, 6, 7, 89, '2025-06-15');
INSERT INTO enrollments VALUES (14, 7, 3, 62, '2025-01-16');
INSERT INTO enrollments VALUES (15, 7, 5, 77, '2025-01-16');
INSERT INTO enrollments VALUES (16, 8, 8, 94, '2025-06-16');
INSERT INTO enrollments VALUES (17, 8, 6, 85, '2025-01-17');
INSERT INTO enrollments VALUES (18, 9, 1, 66, '2025-01-18');
INSERT INTO enrollments VALUES (19, 9, 4, 74, '2025-01-18');
INSERT INTO enrollments VALUES (20, 10, 2, 91, '2025-01-19');
INSERT INTO enrollments VALUES (21, 10, 8, 87, '2025-06-19');

-- Practice ideas:
-- 1. List all students from Dhaka.
-- 2. Average grade per course (join enrollments and courses).
-- 3. Which teacher teaches the most courses?
-- 4. Top 3 students by average grade.
-- 5. Students not enrolled in any course (LEFT JOIN + IS NULL).
-- 6. Courses with an average grade below 75.
