# Detailed BCNF Proof Analysis

## Overview

This document provides a comprehensive and detailed proof that all tables in the EIMS and banking database schemas conform to Boyce-Codd Normal Form (BCNF). The analysis systematically examines each table, identifies all functional dependencies, identifies candidate keys, and proves that BCNF conditions are satisfied.

## Understanding BCNF

### Definition

A relation R is in Boyce-Codd Normal Form (BCNF) if and only if, for every non-trivial functional dependency $X \to Y$ in R, the determinant $X$ is a superkey of R.

### Key Concepts

- **Functional Dependency**: A functional dependency $X \to Y$ holds in a relation R if, whenever two tuples have the same values for all attributes in X, they must also have the same values for all attributes in Y.

- **Trivial Functional Dependency**: A functional dependency $X \to Y$ is trivial if $Y \subseteq X$. Trivial dependencies are always satisfied and do not need to be verified for BCNF.

- **Non-Trivial Functional Dependency**: A functional dependency $X \to Y$ is non-trivial if $Y \not\subseteq X$. These dependencies must be examined for BCNF compliance.

- **Candidate Key**: A minimal set of attributes that uniquely identifies each tuple. A relation can have multiple candidate keys.

- **Superkey**: Any set of attributes that contains a candidate key. A superkey uniquely identifies tuples but may contain extra attributes.

- **Primary Key**: The chosen candidate key designated as the primary key for operational purposes.

### BCNF Verification Process

For each table, the verification process involves:

1. Identify all candidate keys
2. List all non-trivial functional dependencies
3. For each non-trivial dependency $X \to Y$, verify that X is a superkey
4. Conclude BCNF compliance

---

## EIMS Schema Tables

### Table 1: Users

**Definition**: Stores login credentials and system role for each user.

**Attributes**: user_id, password, role

**Candidate Keys**: 
- {user_id} ✓ (Primary Key, unique identifier assigned to each user)

**Constraints**:
- Primary Key: user_id
- Check Constraint: role IN ('Admin', 'Faculty', 'Student')

**Functional Dependencies**:

1. $\text{user\_id} \to \text{password}$
   - **Type**: Non-trivial (password ∉ {user_id})
   - **Determinant**: user_id is a candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

2. $\text{user\_id} \to \text{role}$
   - **Type**: Non-trivial (role ∉ {user_id})
   - **Determinant**: user_id is a candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

**Conclusion**: All non-trivial functional dependencies have superkeys as determinants. **Users table is in BCNF**.

---

### Table 2: Departments

**Definition**: Stores department details such as name and head of department.

**Attributes**: dept_id, dept_name, head_dept_id

**Candidate Keys**:
- {dept_id} ✓ (Primary Key, unique identifier for each department)

**Constraints**:
- Primary Key: dept_id
- Foreign Key: head_dept_id REFERENCES Faculty(faculty_id)

**Functional Dependencies**:

1. $\text{dept\_id} \to \text{dept\_name}$
   - **Type**: Non-trivial (dept_name ∉ {dept_id})
   - **Determinant**: dept_id is a candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

2. $\text{dept\_id} \to \text{head\_dept\_id}$
   - **Type**: Non-trivial (head_dept_id ∉ {dept_id})
   - **Determinant**: dept_id is a candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

**Conclusion**: All non-trivial functional dependencies have superkeys as determinants. **Departments table is in BCNF**.

---

### Table 3: Discipline

**Definition**: Stores academic program categories with fee and semester information.

**Attributes**: discipline_id, max_semester, fees

**Candidate Keys**:
- {discipline_id} ✓ (Primary Key, unique identifier for each discipline)

**Constraints**:
- Primary Key: discipline_id

**Functional Dependencies**:

1. $\text{discipline\_id} \to \text{max\_semester}$
   - **Type**: Non-trivial (max_semester ∉ {discipline_id})
   - **Determinant**: discipline_id is a candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

2. $\text{discipline\_id} \to \text{fees}$
   - **Type**: Non-trivial (fees ∉ {discipline_id})
   - **Determinant**: discipline_id is a candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

**Conclusion**: All non-trivial functional dependencies have superkeys as determinants. **Discipline table is in BCNF**.

---

### Table 4: Students

**Definition**: Stores student profile data including contact details, semester, department, and discipline.

**Attributes**: student_id, student_name, contact_no, college_email, personal_email, residence_address, join_date, semester, department_id, discipline_id

**Candidate Keys**:
- {student_id} ✓ (Primary Key; also references Users(user_id) via foreign key)
- {college_email} ✓ (Unique constraint; college email is institution-specific and unique per student)

**Constraints**:
- Primary Key: student_id
- Foreign Keys: student_id REFERENCES Users(user_id), department_id REFERENCES Departments(dept_id), discipline_id REFERENCES Discipline(discipline_id)
- Unique Constraint: college_email

**Functional Dependencies**:

1. $\text{student\_id} \to \text{student\_name}$
   - **Type**: Non-trivial
   - **Determinant**: student_id is a candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

2. $\text{student\_id} \to \text{contact\_no}$
   - **Type**: Non-trivial
   - **Determinant**: student_id is a candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

3. $\text{student\_id} \to \text{college\_email}$
   - **Type**: Non-trivial
   - **Determinant**: student_id is a candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

4. $\text{college\_email} \to \text{student\_id}$
   - **Type**: Non-trivial
   - **Determinant**: college_email is a candidate key due to unique constraint, hence a superkey
   - **BCNF Satisfied**: ✓

5. $\text{college\_email} \to \{student\_name, contact\_no, personal\_email, residence\_address, join\_date, semester, department\_id, discipline\_id\}$
   - **Type**: Non-trivial
   - **Determinant**: college_email is a candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

All other dependencies derived from these two candidate keys follow the same principle.

**Conclusion**: All non-trivial functional dependencies have candidate keys (which are superkeys) as determinants. **Students table is in BCNF**.

---

### Table 5: Faculty

**Definition**: Stores faculty profile information including name, email, phone, and department.

**Attributes**: faculty_id, faculty_name, contact_no, email, department_id

**Candidate Keys**:
- {faculty_id} ✓ (Primary Key; also references Users(user_id) via foreign key)
- {email} ✓ (Unique constraint; faculty email is unique)

**Constraints**:
- Primary Key: faculty_id
- Foreign Keys: faculty_id REFERENCES Users(user_id), department_id REFERENCES Departments(dept_id)
- Unique Constraint: email

**Functional Dependencies**:

1. $\text{faculty\_id} \to \text{faculty\_name}$
   - **Type**: Non-trivial
   - **Determinant**: faculty_id is a candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

2. $\text{faculty\_id} \to \text{contact\_no}$
   - **Type**: Non-trivial
   - **Determinant**: faculty_id is a candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

3. $\text{faculty\_id} \to \text{email}$
   - **Type**: Non-trivial
   - **Determinant**: faculty_id is a candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

4. $\text{email} \to \text{faculty\_id}$
   - **Type**: Non-trivial
   - **Determinant**: email is a candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

5. $\text{email} \to \{faculty\_name, contact\_no, department\_id\}$
   - **Type**: Non-trivial
   - **Determinant**: email is a candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

**Conclusion**: All non-trivial functional dependencies have candidate keys as determinants. **Faculty table is in BCNF**.

---

### Table 6: Faculty_Advisor

**Definition**: Maps each student to a faculty advisor (one-to-one relationship).

**Attributes**: student_id, faculty_id

**Candidate Keys**:
- {student_id} ✓ (Primary Key; each student has exactly one advisor)

**Constraints**:
- Primary Key: student_id
- Foreign Keys: student_id REFERENCES Students(student_id), faculty_id REFERENCES Faculty(faculty_id)
- Schema Semantics: One advisor per student

**Functional Dependencies**:

1. $\text{student\_id} \to \text{faculty\_id}$
   - **Type**: Non-trivial (faculty_id ∉ {student_id})
   - **Determinant**: student_id is a candidate key, hence a superkey
   - **Reasoning**: The schema semantics enforce one advisor per student, making student_id the determinant of faculty_id
   - **BCNF Satisfied**: ✓

**Analysis**: This table models a one-to-one relationship where each student has exactly one advisor. The primary key {student_id} is sufficient to uniquely identify a record and determine the assigned faculty_id.

**Conclusion**: The only non-trivial functional dependency has student_id (a superkey) as its determinant. **Faculty_Advisor table is in BCNF**.

---

### Table 7: Courses

**Definition**: Stores course master data such as name, department, and credit hours.

**Attributes**: course_id, course_name, department_id, credits

**Candidate Keys**:
- {course_id} ✓ (Primary Key, unique identifier for each course)

**Constraints**:
- Primary Key: course_id
- Foreign Key: department_id REFERENCES Departments(dept_id)
- Check Constraint: credits > 0

**Functional Dependencies**:

1. $\text{course\_id} \to \text{course\_name}$
   - **Type**: Non-trivial
   - **Determinant**: course_id is a candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

2. $\text{course\_id} \to \text{department\_id}$
   - **Type**: Non-trivial
   - **Determinant**: course_id is a candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

3. $\text{course\_id} \to \text{credits}$
   - **Type**: Non-trivial
   - **Determinant**: course_id is a candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

**Conclusion**: All non-trivial functional dependencies have superkeys as determinants. **Courses table is in BCNF**.

---

### Table 8: Prerequisites

**Definition**: Stores prerequisite relationships between courses (junction/relationship table).

**Attributes**: main_course_id, prereq_course_id

**Candidate Keys**:
- {main_course_id, prereq_course_id} ✓ (Primary Key, composite identifier for each prerequisite relationship)

**Constraints**:
- Primary Key: (main_course_id, prereq_course_id)
- Foreign Keys: main_course_id REFERENCES Courses(course_id), prereq_course_id REFERENCES Courses(course_id)

**Functional Dependencies**:

No non-trivial functional dependencies exist in this table.

**Reasoning**: This is a pure relationship/junction table containing only foreign key attributes that form the composite primary key. There are no additional descriptive attributes beyond the key. Since all attributes are part of the key, any functional dependency would be of the form: (non-empty subset of key) → (attributes that are subsets of the key), which are all trivial dependencies.

**Conclusion**: The table contains no non-trivial functional dependencies. Trivially, **Prerequisites table is in BCNF**.

---

### Table 9: Course_Offerings

**Definition**: Represents a course offered in a specific semester and year under a faculty member.

**Attributes**: course_offering_id, faculty_id, course_id, year_offering, semester, discipline_id, capacity

**Candidate Keys**:
- {course_offering_id} ✓ (Primary Key, unique identifier for each offering)

**Constraints**:
- Primary Key: course_offering_id
- Foreign Keys: faculty_id REFERENCES Faculty(faculty_id), course_id REFERENCES Courses(course_id), discipline_id REFERENCES Discipline(discipline_id)
- Check Constraint: capacity > 0

**Functional Dependencies**:

1. $\text{course\_offering\_id} \to \text{faculty\_id}$
   - **Type**: Non-trivial
   - **Determinant**: course_offering_id is a candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

2. $\text{course\_offering\_id} \to \text{course\_id}$
   - **Type**: Non-trivial
   - **Determinant**: course_offering_id is a candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

3. $\text{course\_offering\_id} \to \text{year\_offering}$
   - **Type**: Non-trivial
   - **Determinant**: course_offering_id is a candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

4. $\text{course\_offering\_id} \to \text{semester}$
   - **Type**: Non-trivial
   - **Determinant**: course_offering_id is a candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

5. $\text{course\_offering\_id} \to \text{discipline\_id}$
   - **Type**: Non-trivial
   - **Determinant**: course_offering_id is a candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

6. $\text{course\_offering\_id} \to \text{capacity}$
   - **Type**: Non-trivial
   - **Determinant**: course_offering_id is a candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

**Conclusion**: All non-trivial functional dependencies have superkeys as determinants. **Course_Offerings table is in BCNF**.

---

### Table 10: Course_Allotted

**Definition**: Stores student enrollment in particular course offerings along with marks.

**Attributes**: student_id, course_offering_id, mid_sem_marks, end_sem_marks

**Candidate Keys**:
- {student_id, course_offering_id} ✓ (Primary Key, composite identifier for each enrollment)

**Constraints**:
- Primary Key: (student_id, course_offering_id)
- Foreign Keys: student_id REFERENCES Students(student_id), course_offering_id REFERENCES Course_Offerings(course_offering_id)

**Functional Dependencies**:

1. $(student\_id, course\_offering\_id) \to mid\_sem\_marks$
   - **Type**: Non-trivial
   - **Determinant**: (student_id, course_offering_id) is the composite candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

2. $(student\_id, course\_offering\_id) \to end\_sem\_marks$
   - **Type**: Non-trivial
   - **Determinant**: (student_id, course_offering_id) is the composite candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

**Analysis**: Each student can be enrolled in each course offering at most once. The composite key ensures that the pair of attributes uniquely identifies an enrollment record, and thus determines all non-key attributes.

**Conclusion**: All non-trivial functional dependencies have the composite superkey as determinant. **Course_Allotted table is in BCNF**.

---

### Table 11: Attendance

**Definition**: Stores attendance records for each student in each course offering on a given date.

**Attributes**: student_id, course_offering_id, class_date, status

**Candidate Keys**:
- {student_id, course_offering_id, class_date} ✓ (Primary Key, composite identifier)

**Constraints**:
- Primary Key: (student_id, course_offering_id, class_date)
- Foreign Keys: student_id REFERENCES Students(student_id), course_offering_id REFERENCES Course_Offerings(course_offering_id)
- Check Constraint: status IN ('Present', 'Absent', 'On_Leave')

**Functional Dependencies**:

1. $(student\_id, course\_offering\_id, class\_date) \to status$
   - **Type**: Non-trivial
   - **Determinant**: (student_id, course_offering_id, class_date) is the composite candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

**Analysis**: For each combination of student, course offering, and date, there is exactly one attendance record with a single status value. The composite key uniquely identifies this record.

**Conclusion**: The only non-trivial functional dependency has the composite superkey as determinant. **Attendance table is in BCNF**.

---

### Table 12: Grades

**Definition**: Stores final grades obtained by students in course offerings.

**Attributes**: student_id, course_offering_id, grade

**Candidate Keys**:
- {student_id, course_offering_id} ✓ (Primary Key, composite identifier)

**Constraints**:
- Primary Key: (student_id, course_offering_id)
- Foreign Keys: student_id REFERENCES Students(student_id), course_offering_id REFERENCES Course_Offerings(course_offering_id)
- Check Constraint: grade IN ('Ex', 'A', 'B', 'C', 'D', 'E', 'P', 'F')

**Functional Dependencies**:

1. $(student\_id, course\_offering\_id) \to grade$
   - **Type**: Non-trivial
   - **Determinant**: (student_id, course_offering_id) is the composite candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

**Analysis**: Each student receives exactly one final grade for each course offering. The composite key uniquely determines the grade.

**Conclusion**: The only non-trivial functional dependency has the composite superkey as determinant. **Grades table is in BCNF**.

---

### Table 13: Feedback

**Definition**: Stores course feedback submitted by students.

**Attributes**: student_id, course_offering_id, feedback

**Candidate Keys**:
- {student_id, course_offering_id} ✓ (Primary Key, composite identifier)

**Constraints**:
- Primary Key: (student_id, course_offering_id)
- Foreign Keys: student_id REFERENCES Students(student_id), course_offering_id REFERENCES Course_Offerings(course_offering_id)

**Functional Dependencies**:

1. $(student\_id, course\_offering\_id) \to feedback$
   - **Type**: Non-trivial
   - **Determinant**: (student_id, course_offering_id) is the composite candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

**Analysis**: Each student submits feedback for each course offering at most once. The composite key identifies the feedback record uniquely.

**Conclusion**: The only non-trivial functional dependency has the composite superkey as determinant. **Feedback table is in BCNF**.

---

### Table 14: Rooms

**Definition**: Stores classroom information including building name, room number, and capacity.

**Attributes**: building_name, room_number, capacity

**Candidate Keys**:
- {building_name, room_number} ✓ (Primary Key, composite identifier)

**Constraints**:
- Primary Key: (building_name, room_number)
- Check Constraint: capacity > 0

**Functional Dependencies**:

1. $(building\_name, room\_number) \to capacity$
   - **Type**: Non-trivial
   - **Determinant**: (building_name, room_number) is the composite candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

**Analysis**: Each room is uniquely identified by the combination of building name and room number. The capacity is a property of this specific room.

**Conclusion**: The only non-trivial functional dependency has the composite superkey as determinant. **Rooms table is in BCNF**.

---

### Table 15: Scheduled_Class

**Definition**: Stores the regular class schedule for course offerings.

**Attributes**: course_offering_id, scheduled_day, start_time, end_time, building_name, room_number

**Candidate Keys**:
- {course_offering_id, scheduled_day, start_time} ✓ (Primary Key, composite identifier)

**Constraints**:
- Primary Key: (course_offering_id, scheduled_day, start_time)
- Foreign Keys: course_offering_id REFERENCES Course_Offerings(course_offering_id), (building_name, room_number) REFERENCES Rooms(building_name, room_number)
- Check Constraint: scheduled_day IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'), start_time < end_time

**Functional Dependencies**:

1. $(course\_offering\_id, scheduled\_day, start\_time) \to end\_time$
   - **Type**: Non-trivial
   - **Determinant**: (course_offering_id, scheduled_day, start_time) is the composite candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

2. $(course\_offering\_id, scheduled\_day, start\_time) \to building\_name$
   - **Type**: Non-trivial
   - **Determinant**: (course_offering_id, scheduled_day, start_time) is the composite candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

3. $(course\_offering\_id, scheduled\_day, start\_time) \to room\_number$
   - **Type**: Non-trivial
   - **Determinant**: (course_offering_id, scheduled_day, start_time) is the composite candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

**Analysis**: Each scheduled class is uniquely identified by the course offering, day, and start time. The end time, building, and room are properties of this specific scheduled class.

**Conclusion**: All non-trivial functional dependencies have the composite superkey as determinant. **Scheduled_Class table is in BCNF**.

---

### Table 16: Leave_Requests

**Definition**: Stores student leave applications with period, reason, status, and timestamp.

**Attributes**: request_id, student_id, start_date, end_date, reason, applied_on, status

**Candidate Keys**:
- {request_id} ✓ (Primary Key, unique identifier for each leave request)

**Constraints**:
- Primary Key: request_id
- Foreign Key: student_id REFERENCES Students(student_id)
- Check Constraint: status IN ('Pending', 'Approved', 'Rejected')

**Functional Dependencies**:

1. $request\_id \to student\_id$
   - **Type**: Non-trivial
   - **Determinant**: request_id is a candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

2. $request\_id \to start\_date$
   - **Type**: Non-trivial
   - **Determinant**: request_id is a candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

3. $request\_id \to end\_date$
   - **Type**: Non-trivial
   - **Determinant**: request_id is a candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

4. $request\_id \to reason$
   - **Type**: Non-trivial
   - **Determinant**: request_id is a candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

5. $request\_id \to applied\_on$
   - **Type**: Non-trivial
   - **Determinant**: request_id is a candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

6. $request\_id \to status$
   - **Type**: Non-trivial
   - **Determinant**: request_id is a candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

**Conclusion**: All non-trivial functional dependencies have superkeys as determinants. **Leave_Requests table is in BCNF**.

---

### Table 17: On_Leave

**Definition**: Stores approved leave records for students.

**Attributes**: request_id, student_id, start_date, end_date

**Candidate Keys**:
- {request_id} ✓ (Primary Key, unique identifier)

**Constraints**:
- Primary Key: request_id
- Foreign Keys: student_id REFERENCES Students(student_id), request_id REFERENCES Leave_Requests(request_id)

**Functional Dependencies**:

1. $request\_id \to student\_id$
   - **Type**: Non-trivial
   - **Determinant**: request_id is a candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

2. $request\_id \to start\_date$
   - **Type**: Non-trivial
   - **Determinant**: request_id is a candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

3. $request\_id \to end\_date$
   - **Type**: Non-trivial
   - **Determinant**: request_id is a candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

**Analysis**: This table references Leave_Requests, storing only approved leave records. Each request_id uniquely identifies an approved leave entry.

**Conclusion**: All non-trivial functional dependencies have superkeys as determinants. **On_Leave table is in BCNF**.

---

### Table 18: Fee_Payment

**Definition**: Stores each student fee payment transaction.

**Attributes**: payment_id, student_id, semester, amount_paid, payment_date

**Candidate Keys**:
- {payment_id} ✓ (Primary Key, unique identifier for each payment)

**Constraints**:
- Primary Key: payment_id
- Foreign Key: student_id REFERENCES Students(student_id)
- Check Constraint: amount_paid >= 0

**Functional Dependencies**:

1. $payment\_id \to student\_id$
   - **Type**: Non-trivial
   - **Determinant**: payment_id is a candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

2. $payment\_id \to semester$
   - **Type**: Non-trivial
   - **Determinant**: payment_id is a candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

3. $payment\_id \to amount\_paid$
   - **Type**: Non-trivial
   - **Determinant**: payment_id is a candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

4. $payment\_id \to payment\_date$
   - **Type**: Non-trivial
   - **Determinant**: payment_id is a candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

**Conclusion**: All non-trivial functional dependencies have superkeys as determinants. **Fee_Payment table is in BCNF**.

---

### Table 19: Fee_Remission_Application

**Definition**: Stores student applications for fee remission.

**Attributes**: application_id, student_id, status

**Candidate Keys**:
- {application_id} ✓ (Primary Key, unique identifier for each application)

**Constraints**:
- Primary Key: application_id
- Foreign Key: student_id REFERENCES Students(student_id)
- Check Constraint: status IN ('Pending', 'Approved', 'Rejected')

**Functional Dependencies**:

1. $application\_id \to student\_id$
   - **Type**: Non-trivial
   - **Determinant**: application_id is a candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

2. $application\_id \to status$
   - **Type**: Non-trivial
   - **Determinant**: application_id is a candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

**Conclusion**: All non-trivial functional dependencies have superkeys as determinants. **Fee_Remission_Application table is in BCNF**.

---

### Table 20: Supplementary_Exams

**Definition**: Stores supplementary exam registrations.

**Attributes**: student_id, course_offering_id, price

**Candidate Keys**:
- {student_id, course_offering_id} ✓ (Primary Key, composite identifier)

**Constraints**:
- Primary Key: (student_id, course_offering_id)
- Foreign Keys: student_id REFERENCES Students(student_id), course_offering_id REFERENCES Course_Offerings(course_offering_id)
- Check Constraint: price >= 0

**Functional Dependencies**:

1. $(student\_id, course\_offering\_id) \to price$
   - **Type**: Non-trivial
   - **Determinant**: (student_id, course_offering_id) is the composite candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

**Analysis**: Each student registers for supplementary exams in at most one course offering instance. The composite key uniquely identifies the registration.

**Conclusion**: The only non-trivial functional dependency has the composite superkey as determinant. **Supplementary_Exams table is in BCNF**.

---

### Table 21: Backlogs

**Definition**: Stores details of courses that a student must clear later.

**Attributes**: student_id, course_id

**Candidate Keys**:
- {student_id, course_id} ✓ (Primary Key, composite identifier)

**Constraints**:
- Primary Key: (student_id, course_id)
- Foreign Keys: student_id REFERENCES Students(student_id), course_id REFERENCES Courses(course_id)

**Functional Dependencies**:

No non-trivial functional dependencies exist in this table.

**Reasoning**: This is a pure relationship/junction table. The composite primary key consists of all attributes in the table. There are no additional descriptive attributes beyond the key. All possible functional dependencies are trivial since any dependency must map either a subset or the full set of key attributes.

**Conclusion**: The table contains no non-trivial functional dependencies. Trivially, **Backlogs table is in BCNF**.

---

### Table 22: Exams

**Definition**: Stores examination records for course offerings.

**Attributes**: exam_id, course_offering_id, room_number, building_name, date_of_exam

**Candidate Keys**:
- {exam_id} ✓ (Primary Key, unique identifier for each exam)

**Constraints**:
- Primary Key: exam_id
- Foreign Key: course_offering_id REFERENCES Course_Offerings(course_offering_id)

**Functional Dependencies**:

1. $exam\_id \to course\_offering\_id$
   - **Type**: Non-trivial
   - **Determinant**: exam_id is a candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

2. $exam\_id \to room\_number$
   - **Type**: Non-trivial
   - **Determinant**: exam_id is a candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

3. $exam\_id \to building\_name$
   - **Type**: Non-trivial
   - **Determinant**: exam_id is a candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

4. $exam\_id \to date\_of\_exam$
   - **Type**: Non-trivial
   - **Determinant**: exam_id is a candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

**Conclusion**: All non-trivial functional dependencies have superkeys as determinants. **Exams table is in BCNF**.

---

### Table 23: Exam_Seating

**Definition**: Stores seating assignments of students for examinations.

**Attributes**: exam_id, student_id

**Candidate Keys**:
- {exam_id, student_id} ✓ (Primary Key, composite identifier)

**Constraints**:
- Primary Key: (exam_id, student_id)
- Foreign Keys: exam_id REFERENCES Exams(exam_id), student_id REFERENCES Students(student_id)

**Functional Dependencies**:

No non-trivial functional dependencies exist in this table.

**Reasoning**: This is a pure relationship/junction table containing only foreign key attributes that form the composite primary key. There are no additional descriptive attributes. All attributes are part of the key, making all possible functional dependencies trivial.

**Conclusion**: The table contains no non-trivial functional dependencies. Trivially, **Exam_Seating table is in BCNF**.

---

### Table 24: Balance

**Definition**: Stores the remaining fee balance for a student.

**Attributes**: student_id, remaining_balance

**Candidate Keys**:
- {student_id} ✓ (Primary Key, unique identifier)

**Constraints**:
- Primary Key: student_id
- Foreign Key: student_id REFERENCES Students(student_id)
- Check Constraint: remaining_balance >= 0

**Functional Dependencies**:

1. $student\_id \to remaining\_balance$
   - **Type**: Non-trivial
   - **Determinant**: student_id is a candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

**Analysis**: Each student has exactly one balance record with a remaining balance amount. The student_id uniquely determines this value.

**Conclusion**: The only non-trivial functional dependency has a superkey as determinant. **Balance table is in BCNF**.

---

### Table 25: Course_Registration

**Definition**: Stores temporary and approved course registration entries.

**Attributes**: student_id, course_offering_id, semester, selected, approved

**Candidate Keys**:
- {student_id, course_offering_id, semester} ✓ (Primary Key, composite identifier)

**Constraints**:
- Primary Key: (student_id, course_offering_id, semester)
- Foreign Keys: student_id REFERENCES Students(student_id) ON DELETE CASCADE, course_offering_id REFERENCES Course_Offerings(course_offering_id) ON DELETE CASCADE
- Check Constraint: approved = FALSE OR selected = TRUE (logical constraint ensuring approval cannot exist without selection)

**Functional Dependencies**:

1. $(student\_id, course\_offering\_id, semester) \to selected$
   - **Type**: Non-trivial
   - **Determinant**: (student_id, course_offering_id, semester) is the composite candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

2. $(student\_id, course\_offering\_id, semester) \to approved$
   - **Type**: Non-trivial
   - **Determinant**: (student_id, course_offering_id, semester) is the composite candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

**Analysis**: Each student's registration for a course offering in a particular semester is recorded once. The composite key ensures uniqueness and determines both the selection status and approval status.

**Conclusion**: All non-trivial functional dependencies have the composite superkey as determinant. **Course_Registration table is in BCNF**.

---

### Table 26: System_Config

**Definition**: Stores system-wide configuration values.

**Attributes**: config_id, registration_open_date, registration_close_date, results_declaration_date, is_fees_open

**Candidate Keys**:
- {config_id} ✓ (Primary Key, restricted to 1 by check constraint)

**Constraints**:
- Primary Key: config_id
- Check Constraint: config_id = 1 (ensures only one configuration row)

**Functional Dependencies**:

1. $config\_id \to registration\_open\_date$
   - **Type**: Non-trivial
   - **Determinant**: config_id is a candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

2. $config\_id \to registration\_close\_date$
   - **Type**: Non-trivial
   - **Determinant**: config_id is a candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

3. $config\_id \to results\_declaration\_date$
   - **Type**: Non-trivial
   - **Determinant**: config_id is a candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

4. $config\_id \to is\_fees\_open$
   - **Type**: Non-trivial
   - **Determinant**: config_id is a candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

**Analysis**: The system enforces single-row configuration design through a check constraint. The config_id is a candidate key, and all configuration parameters depend on this single identifier.

**Conclusion**: All non-trivial functional dependencies have superkeys as determinants. **System_Config table is in BCNF**.

---

### Table 27: Results

**Definition**: Stores summary academic results for each student.

**Attributes**: student_id, cgpa, total_credits

**Candidate Keys**:
- {student_id} ✓ (Primary Key, unique identifier)

**Constraints**:
- Primary Key: student_id
- Foreign Key: student_id REFERENCES Students(student_id)
- Check Constraints: cgpa BETWEEN 0 AND 10, total_credits >= 0

**Functional Dependencies**:

1. $student\_id \to cgpa$
   - **Type**: Non-trivial
   - **Determinant**: student_id is a candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

2. $student\_id \to total\_credits$
   - **Type**: Non-trivial
   - **Determinant**: student_id is a candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

**Analysis**: Each student has exactly one results record containing CGPA and total credits earned. The student_id uniquely determines these values.

**Conclusion**: All non-trivial functional dependencies have superkeys as determinants. **Results table is in BCNF**.

---

### Table 28: CDC

**Definition**: Stores career development and placement opportunities.

**Attributes**: cdc_id, company_name, apply_link, job_type, cgpa_cutoff, ot_link, interview_link

**Candidate Keys**:
- {cdc_id} ✓ (Primary Key, unique identifier for each opportunity)

**Constraints**:
- Primary Key: cdc_id
- Check Constraint: job_type IN ('Intern', 'Placement')

**Functional Dependencies**:

1. $cdc\_id \to company\_name$
   - **Type**: Non-trivial
   - **Determinant**: cdc_id is a candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

2. $cdc\_id \to apply\_link$
   - **Type**: Non-trivial
   - **Determinant**: cdc_id is a candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

3. $cdc\_id \to job\_type$
   - **Type**: Non-trivial
   - **Determinant**: cdc_id is a candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

4. $cdc\_id \to cgpa\_cutoff$
   - **Type**: Non-trivial
   - **Determinant**: cdc_id is a candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

5. $cdc\_id \to ot\_link$
   - **Type**: Non-trivial
   - **Determinant**: cdc_id is a candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

6. $cdc\_id \to interview\_link$
   - **Type**: Non-trivial
   - **Determinant**: cdc_id is a candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

**Conclusion**: All non-trivial functional dependencies have superkeys as determinants. **CDC table is in BCNF**.

---

### Table 29: CDC_Eligible_Departments

**Definition**: Stores department-wise eligibility for each CDC opportunity.

**Attributes**: cdc_id, department_id

**Candidate Keys**:
- {cdc_id, department_id} ✓ (Primary Key, composite identifier)

**Constraints**:
- Primary Key: (cdc_id, department_id)
- Foreign Keys: cdc_id REFERENCES CDC(cdc_id), department_id REFERENCES Departments(dept_id)

**Functional Dependencies**:

No non-trivial functional dependencies exist in this table.

**Reasoning**: This is a pure relationship/junction table storing the many-to-many relationship between CDC opportunities and eligible departments. All attributes form the composite primary key. There are no additional descriptive attributes, making all possible functional dependencies trivial.

**Conclusion**: The table contains no non-trivial functional dependencies. Trivially, **CDC_Eligible_Departments table is in BCNF**.

---

### Table 30: CDC_Applications

**Definition**: Stores student applications for CDC opportunities.

**Attributes**: student_id, cdc_id, resume_link, ot_status, interview_status, final_status, offer_details

**Candidate Keys**:
- {student_id, cdc_id} ✓ (Primary Key, composite identifier)

**Constraints**:
- Primary Key: (student_id, cdc_id)
- Foreign Keys: student_id REFERENCES Students(student_id), cdc_id REFERENCES CDC(cdc_id)
- Check Constraints:
  - ot_status IN ('Pending', 'Qualified', 'Rejected')
  - interview_status IN ('Pending', 'Qualified', 'Rejected')
  - final_status IN ('Selected', 'Rejected', 'Pending')

**Functional Dependencies**:

1. $(student\_id, cdc\_id) \to resume\_link$
   - **Type**: Non-trivial
   - **Determinant**: (student_id, cdc_id) is the composite candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

2. $(student\_id, cdc\_id) \to ot\_status$
   - **Type**: Non-trivial
   - **Determinant**: (student_id, cdc_id) is the composite candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

3. $(student\_id, cdc\_id) \to interview\_status$
   - **Type**: Non-trivial
   - **Determinant**: (student_id, cdc_id) is the composite candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

4. $(student\_id, cdc\_id) \to final\_status$
   - **Type**: Non-trivial
   - **Determinant**: (student_id, cdc_id) is the composite candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

5. $(student\_id, cdc\_id) \to offer\_details$
   - **Type**: Non-trivial
   - **Determinant**: (student_id, cdc_id) is the composite candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

**Analysis**: Each student applies to each CDC opportunity at most once. The composite key uniquely identifies the application and determines all application-related attributes including resume, test status, interview status, and final outcome.

**Conclusion**: All non-trivial functional dependencies have the composite superkey as determinant. **CDC_Applications table is in BCNF**.

---

### Table 31: Booked_Class

**Definition**: Stores alternative or booked classroom schedules for course offerings.

**Attributes**: booking_id, course_offering_id, building_name, room_number, scheduled_day, start_time, end_time, faculty_id

**Candidate Keys**:
- {booking_id} ✓ (Primary Key, unique identifier for each booking)

**Constraints**:
- Primary Key: booking_id
- Foreign Keys: course_offering_id REFERENCES Course_Offerings(course_offering_id), faculty_id REFERENCES Faculty(faculty_id)
- Check Constraint: start_time < end_time

**Functional Dependencies**:

1. $booking\_id \to course\_offering\_id$
   - **Type**: Non-trivial
   - **Determinant**: booking_id is a candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

2. $booking\_id \to building\_name$
   - **Type**: Non-trivial
   - **Determinant**: booking_id is a candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

3. $booking\_id \to room\_number$
   - **Type**: Non-trivial
   - **Determinant**: booking_id is a candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

4. $booking\_id \to scheduled\_day$
   - **Type**: Non-trivial
   - **Determinant**: booking_id is a candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

5. $booking\_id \to start\_time$
   - **Type**: Non-trivial
   - **Determinant**: booking_id is a candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

6. $booking\_id \to end\_time$
   - **Type**: Non-trivial
   - **Determinant**: booking_id is a candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

7. $booking\_id \to faculty\_id$
   - **Type**: Non-trivial
   - **Determinant**: booking_id is a candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

**Conclusion**: All non-trivial functional dependencies have superkeys as determinants. **Booked_Class table is in BCNF**.

---

## Banking Schema Tables

### Table B1: Customers

**Definition**: Stores customer profile and login details.

**Attributes**: customer_id, name, email, phone, password, created_at

**Candidate Keys**:
- {customer_id} ✓ (Primary Key, unique identifier for each customer)
- {email} ✓ (Unique constraint; each customer must have a unique email)

**Constraints**:
- Primary Key: customer_id
- Unique Constraint: email
- Domain Constraints: email format validation (implicit in application layer)

**Functional Dependencies**:

1. $customer\_id \to name$
   - **Type**: Non-trivial
   - **Determinant**: customer_id is a candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

2. $customer\_id \to email$
   - **Type**: Non-trivial
   - **Determinant**: customer_id is a candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

3. $customer\_id \to phone$
   - **Type**: Non-trivial
   - **Determinant**: customer_id is a candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

4. $customer\_id \to password$
   - **Type**: Non-trivial
   - **Determinant**: customer_id is a candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

5. $customer\_id \to created\_at$
   - **Type**: Non-trivial
   - **Determinant**: customer_id is a candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

6. $email \to customer\_id$
   - **Type**: Non-trivial
   - **Determinant**: email is a candidate key (via unique constraint), hence a superkey
   - **BCNF Satisfied**: ✓

7. $email \to name$
   - **Type**: Non-trivial
   - **Determinant**: email is a candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

8. $email \to phone$
   - **Type**: Non-trivial
   - **Determinant**: email is a candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

9. $email \to password$
   - **Type**: Non-trivial
   - **Determinant**: email is a candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

10. $email \to created\_at$
    - **Type**: Non-trivial
    - **Determinant**: email is a candidate key, hence a superkey
    - **BCNF Satisfied**: ✓

**Analysis**: Two candidate keys exist: customer_id and email. Both are determinants of all other attributes. For every non-trivial functional dependency, the determinant is always one of these two candidate keys, making each determinant a superkey.

**Conclusion**: All non-trivial functional dependencies have candidate keys (which are superkeys) as determinants. **Customers table is in BCNF**.

---

### Table B2: Accounts

**Definition**: Stores account information for each customer.

**Attributes**: customer_id, account_id, balance, account_type, status, created_at

**Candidate Keys**:
- {customer_id} ✓ (Primary Key, one account per customer in current design)
- {account_id} ✓ (Unique constraint, alternative identifier)

**Constraints**:
- Primary Key: customer_id
- Unique Constraint: account_id
- Foreign Key: customer_id REFERENCES Customers(customer_id) ON DELETE CASCADE
- Check Constraints:
  - balance >= 0
  - account_type IN ('savings', 'current')
  - status IN ('active', 'inactive', 'closed')

**Functional Dependencies**:

1. $customer\_id \to account\_id$
   - **Type**: Non-trivial
   - **Determinant**: customer_id is a candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

2. $customer\_id \to balance$
   - **Type**: Non-trivial
   - **Determinant**: customer_id is a candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

3. $customer\_id \to account\_type$
   - **Type**: Non-trivial
   - **Determinant**: customer_id is a candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

4. $customer\_id \to status$
   - **Type**: Non-trivial
   - **Determinant**: customer_id is a candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

5. $customer\_id \to created\_at$
   - **Type**: Non-trivial
   - **Determinant**: customer_id is a candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

6. $account\_id \to customer\_id$
   - **Type**: Non-trivial
   - **Determinant**: account_id is a candidate key (via unique constraint), hence a superkey
   - **BCNF Satisfied**: ✓

7. $account\_id \to balance$
   - **Type**: Non-trivial
   - **Determinant**: account_id is a candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

8. $account\_id \to account\_type$
   - **Type**: Non-trivial
   - **Determinant**: account_id is a candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

9. $account\_id \to status$
   - **Type**: Non-trivial
   - **Determinant**: account_id is a candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

10. $account\_id \to created\_at$
    - **Type**: Non-trivial
    - **Determinant**: account_id is a candidate key, hence a superkey
    - **BCNF Satisfied**: ✓

**Analysis**: Two candidate keys exist: customer_id and account_id. The unique constraint on account_id establishes it as an alternative candidate key. Both keys serve as superkeys for all non-trivial dependencies.

**Conclusion**: All non-trivial functional dependencies have candidate keys as determinants. **Accounts table is in BCNF**.

---

### Table B3: Transactions

**Definition**: Stores individual account-level debit and credit entries.

**Attributes**: transaction_id, account_id, transaction_type, amount, created_at, status

**Candidate Keys**:
- {transaction_id} ✓ (Primary Key, unique identifier for each transaction)

**Constraints**:
- Primary Key: transaction_id
- Foreign Key: account_id REFERENCES Accounts(account_id) ON DELETE CASCADE
- Check Constraints:
  - transaction_type IN ('credit', 'debit')
  - amount > 0

**Functional Dependencies**:

1. $transaction\_id \to account\_id$
   - **Type**: Non-trivial
   - **Determinant**: transaction_id is a candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

2. $transaction\_id \to transaction\_type$
   - **Type**: Non-trivial
   - **Determinant**: transaction_id is a candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

3. $transaction\_id \to amount$
   - **Type**: Non-trivial
   - **Determinant**: transaction_id is a candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

4. $transaction\_id \to created\_at$
   - **Type**: Non-trivial
   - **Determinant**: transaction_id is a candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

5. $transaction\_id \to status$
   - **Type**: Non-trivial
   - **Determinant**: transaction_id is a candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

**Analysis**: transaction_id uniquely identifies each transaction record independently. All transaction details (account, type, amount, time, status) depend solely on this identifier.

**Conclusion**: All non-trivial functional dependencies have superkeys as determinants. **Transactions table is in BCNF**.

---

### Table B4: Transfers

**Definition**: Stores fund transfer records between accounts.

**Attributes**: transfer_id, from_account, to_account, amount, status, created_at

**Candidate Keys**:
- {transfer_id} ✓ (Primary Key, unique identifier for each transfer)

**Constraints**:
- Primary Key: transfer_id
- Foreign Keys: from_account REFERENCES Accounts(account_id) ON DELETE CASCADE, to_account REFERENCES Accounts(account_id) ON DELETE CASCADE
- Check Constraints:
  - amount > 0
  - from_account ≠ to_account (prevents self-transfer)
  - status IN ('pending', 'completed', 'failed')

**Functional Dependencies**:

1. $transfer\_id \to from\_account$
   - **Type**: Non-trivial
   - **Determinant**: transfer_id is a candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

2. $transfer\_id \to to\_account$
   - **Type**: Non-trivial
   - **Determinant**: transfer_id is a candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

3. $transfer\_id \to amount$
   - **Type**: Non-trivial
   - **Determinant**: transfer_id is a candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

4. $transfer\_id \to status$
   - **Type**: Non-trivial
   - **Determinant**: transfer_id is a candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

5. $transfer\_id \to created\_at$
   - **Type**: Non-trivial
   - **Determinant**: transfer_id is a candidate key, hence a superkey
   - **BCNF Satisfied**: ✓

**Analysis**: transfer_id uniquely identifies each transfer record. All transfer details (source account, destination account, amount, status, timestamp) depend exclusively on this identifier.

**Conclusion**: All non-trivial functional dependencies have superkeys as determinants. **Transfers table is in BCNF**.

---

## Comprehensive BCNF Verification Summary

### EIMS Schema (31 Tables)

| Table Name | Key Type | BCNF Status | Notes |
|---|---|---|---|
| Users | Single Primary Key | ✓ BCNF | user_id determines all attributes |
| Departments | Single Primary Key | ✓ BCNF | dept_id determines all attributes |
| Discipline | Single Primary Key | ✓ BCNF | discipline_id determines all attributes |
| Students | Dual Candidate Keys | ✓ BCNF | student_id and college_email both determine all attributes |
| Faculty | Dual Candidate Keys | ✓ BCNF | faculty_id and email both determine all attributes |
| Faculty_Advisor | Single Primary Key + Semantics | ✓ BCNF | student_id determines faculty_id (one-to-one mapping) |
| Courses | Single Primary Key | ✓ BCNF | course_id determines all attributes |
| Prerequisites | Composite Key Only | ✓ BCNF | Pure relationship table with no non-trivial dependencies |
| Course_Offerings | Single Primary Key | ✓ BCNF | course_offering_id determines all attributes |
| Course_Allotted | Composite Primary Key | ✓ BCNF | (student_id, course_offering_id) determines marks |
| Attendance | Composite Primary Key | ✓ BCNF | (student_id, course_offering_id, class_date) determines status |
| Grades | Composite Primary Key | ✓ BCNF | (student_id, course_offering_id) determines grade |
| Feedback | Composite Primary Key | ✓ BCNF | (student_id, course_offering_id) determines feedback |
| Rooms | Composite Primary Key | ✓ BCNF | (building_name, room_number) determines capacity |
| Scheduled_Class | Composite Primary Key | ✓ BCNF | (course_offering_id, scheduled_day, start_time) determines schedule details |
| Leave_Requests | Single Primary Key | ✓ BCNF | request_id determines all attributes |
| On_Leave | Single Primary Key | ✓ BCNF | request_id determines all attributes |
| Fee_Payment | Single Primary Key | ✓ BCNF | payment_id determines all attributes |
| Fee_Remission_Application | Single Primary Key | ✓ BCNF | application_id determines all attributes |
| Supplementary_Exams | Composite Primary Key | ✓ BCNF | (student_id, course_offering_id) determines price |
| Backlogs | Composite Key Only | ✓ BCNF | Pure relationship table with no non-trivial dependencies |
| Exams | Single Primary Key | ✓ BCNF | exam_id determines all attributes |
| Exam_Seating | Composite Key Only | ✓ BCNF | Pure relationship table with no non-trivial dependencies |
| Balance | Single Primary Key | ✓ BCNF | student_id determines remaining_balance |
| Course_Registration | Composite Primary Key | ✓ BCNF | (student_id, course_offering_id, semester) determines selection and approval |
| System_Config | Single Primary Key | ✓ BCNF | config_id restricted to 1, determines all config parameters |
| Results | Single Primary Key | ✓ BCNF | student_id determines CGPA and total_credits |
| CDC | Single Primary Key | ✓ BCNF | cdc_id determines all opportunity attributes |
| CDC_Eligible_Departments | Composite Key Only | ✓ BCNF | Pure relationship table with no non-trivial dependencies |
| CDC_Applications | Composite Primary Key | ✓ BCNF | (student_id, cdc_id) determines application details |
| Booked_Class | Single Primary Key | ✓ BCNF | booking_id determines all booking attributes |

### Banking Schema (4 Tables)

| Table Name | Key Type | BCNF Status | Notes |
|---|---|---|---|
| Customers | Dual Candidate Keys | ✓ BCNF | customer_id and email both determine all attributes |
| Accounts | Dual Candidate Keys | ✓ BCNF | customer_id and account_id both determine all attributes |
| Transactions | Single Primary Key | ✓ BCNF | transaction_id determines all transaction attributes |
| Transfers | Single Primary Key | ✓ BCNF | transfer_id determines all transfer attributes |

---

## Key Findings

### 1. Single Primary Key Tables (Category A)
Tables with a single primary key and no other candidate key are inherently in BCNF because:
- The primary key is the only determinant of all other attributes
- All non-trivial functional dependencies have the primary key (a superkey) as their determinant

Examples: Users, Departments, Discipline, Courses, Leave_Requests, Fee_Payment, Exams, Balance, System_Config, Results, CDC, Transactions, Transfers

### 2. Multiple Candidate Key Tables (Category B)
Tables with alternate candidate keys maintain BCNF because:
- Each candidate key independently determines all other attributes
- Every candidate key is a superkey
- All non-trivial functional dependencies have a candidate key as determinant

Examples: Students, Faculty, Customers, Accounts

### 3. Composite Primary Key Tables (Category C)
Tables with composite primary keys satisfy BCNF because:
- The full composite key uniquely identifies each record
- The composite key determines all non-key attributes
- No partial dependencies exist (partial dependencies would violate the second normal form, let alone BCNF)

Examples: Course_Allotted, Attendance, Grades, Feedback, Rooms, Scheduled_Class, Supplementary_Exams, Course_Registration, CDC_Applications

### 4. Pure Relationship Tables (Category D)
Relationship/junction tables containing only key attributes trivially satisfy BCNF because:
- All attributes are part of the composite primary key
- No non-trivial functional dependencies can exist (no non-key attributes)
- The definition of BCNF is vacuously true

Examples: Prerequisites, Backlogs, Exam_Seating, CDC_Eligible_Departments

### 5. Schema Design Features Supporting BCNF

- **Atomic Attributes**: No repeating groups or multi-valued attributes exist
- **Proper Decomposition**: Related entities are stored in separate tables
- **Key Constraints**: Primary keys and unique constraints are correctly defined
- **Foreign Keys**: Relationships between tables are properly maintained
- **No Transitive Dependencies**: Attributes are directly dependent only on keys
- **Check Constraints**: Domain values are restricted at the database level

---

## Conclusion

All 35 tables in the combined EIMS and banking database schemas (31 EIMS tables + 4 banking tables) satisfy Boyce-Codd Normal Form. The design achieves this through:

1. **Proper Entity Modeling**: Each table represents a single entity or relationship
2. **Candidate Key Identification**: All tables have correctly identified candidate keys
3. **Functional Dependency Analysis**: No non-trivial functional dependencies exist with non-superkey determinants
4. **Eliminating Update/Insertion/Deletion Anomalies**: The schema structure prevents data inconsistencies

The BCNF compliance ensures:
- **Data Integrity**: No partial or transitive dependencies create inconsistencies
- **Query Efficiency**: Proper schema design supports efficient index and query optimization
- **Maintenance Simplicity**: Updates, insertions, and deletions are unambiguous
- **Scalability**: The normalized structure scales well to large data volumes

This comprehensive database design represents best practices in relational database normalization and is well-suited for an enterprise-level ERP application.

