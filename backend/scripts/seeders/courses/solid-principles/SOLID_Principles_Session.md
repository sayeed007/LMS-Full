---
marp: true
---
# SOLID Principles & Design Patterns
## Technical Training Session for Development Team

---

## Agenda

1. What are Design Patterns and Why Do We Need Them?
2. SOLID Principles Overview
3. Real Violations from Our Codebase
4. How to Improve Our Code

---

# Part 1: What and Why Design Patterns

---

## What are Design Patterns?

**Design Patterns** are proven, reusable solutions to common problems in software design.

- **Not** code you can copy-paste
- **Not** specific to any programming language
- **ARE** templates for solving recurring design problems
- **ARE** best practices evolved from years of software development

---

## Why Do We Need Design Patterns?

### 1. **Maintainability**
- Code is read 10x more than it's written
- Easy to understand = Easy to maintain
- Patterns provide a common vocabulary

### 2. **Scalability**
- Systems grow over time
- Poorly designed code becomes harder to change
- Good patterns allow for growth without complete rewrites

### 3. **Team Collaboration**
- Common language among developers
- "We need a Factory here" - everyone understands
- Reduces onboarding time for new developers

### 4. **Reduced Bugs**
- Proven solutions = fewer edge cases
- Better separation of concerns = easier testing
- Less coupling = changes don't break unrelated code

---

## The Cost of Poor Design

### In Our HRM Project:

```
- 1,405 line components that no one wants to touch
- Duplicated error handling across 50+ API functions
- 3-hour bug fixes that should take 30 minutes
- Fear of refactoring: "If it works, don't touch it"
- New features taking weeks instead of days
```

**Result:** Technical debt that slows down development velocity

---

# Part 2: SOLID Principles

---

## What is SOLID?

SOLID is an acronym for 5 fundamental principles of object-oriented design:

| Letter | Principle |
|--------|-----------|
| **S** | **S**ingle Responsibility Principle |
| **O** | **O**pen/Closed Principle |
| **L** | **L**iskov Substitution Principle |
| **I** | **I**nterface Segregation Principle |
| **D** | **D**ependency Inversion Principle |

---

## Why SOLID Matters

These principles help us write code that is:

- **Maintainable** - Easy to understand and modify
- **Testable** - Easy to write unit tests
- **Flexible** - Easy to extend with new features
- **Reusable** - Components can be used in different contexts
- **Scalable** - Grows without becoming a mess

---

# Part 3: SOLID Violations in Our Codebase

---

# S - Single Responsibility Principle

> "A class/module/function should have only ONE reason to change"

---

## SRP: The Problem

**One responsibility = One reason to change**

When a component has multiple responsibilities:
- Changes in one area can break another
- Hard to test in isolation
- Hard to reuse
- Hard to understand

---

## SRP Violation #1: AdminPanel.js

**File:** [src/views/dashboard/AdminGraph/AdminPanel.js](src/views/dashboard/AdminGraph/AdminPanel.js)
**Size:** 631 lines

### Multiple Responsibilities:

1. Fetching data for 8 different graph types
2. Managing company selection state
3. Handling date filtering logic
4. Rendering multiple chart types
5. Navigation/routing logic

---

## SRP Violation #1: The Code

```javascript
useEffect(() => {
    setLoading(true);
    if (selectedCompany?.length > 0) {
        if (moment(companyEstablishDate)?.format('YYYY') <= new Date().getFullYear()) {
            fetchYearWiseCompany();        // Graph 1
            fetchEmployeeTurnOver();       // Graph 2
            fetchMaleFemale();             // Graph 3
            fetchJobLength();              // Graph 4
            fetchUniversityWise();         // Graph 5
            fetchDegreeWise();             // Graph 6
            fetchEmploymentSummary();      // Graph 7
            fetchTotalEmployeeCount();     // Graph 8
        }
    }
}, [companyId, selectedCompany]);
```

**Problem:** One component doing too many things!

---

## SRP Violation #2: AllPayRoll.js

**File:** [src/tfhrm/payroll/AllPayRoll.js](src/tfhrm/payroll/AllPayRoll.js)
**Size:** 1,405 lines (Our biggest component!)

### Multiple Responsibilities:

1. Payroll generation
2. Payroll approval workflow
3. CSV/PDF export logic
4. Data sorting and filtering
5. Notification handling
6. Bulk adjustment uploads
7. Data transformation for reports

---

## SRP Violation #2: State Explosion

```javascript
const AllPayRoll = () => {
  // 50+ state variables!
  const [allEmployee, setAllEmployee] = useState([]);
  const [payrollApproveModal, setPayrollApproveModal] = useState(false);
  const [generatePayloadDateModalVisible, setGeneratePayloadDateModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState({...});
  const [companyOptions, setCompanyOptions] = useState(companyList);
  const [csvData, setCsvData] = useState([]);
  const [selectedPaySlip, setSelectedPaySlip] = useState([]);
  const [payrollGenerateModal, setPayrollGenerateModal] = useState(false);
  // ... 42 MORE state variables ...
}
```

**Red Flag:** When a component has 50+ state variables, it's doing too much!

---

## SRP Violation #3: AddEmployee.js

**File:** [src/tfhrm/employeeInfo/employee/AddEmployee.js](src/tfhrm/employeeInfo/employee/AddEmployee.js)
**Size:** 1,270 lines

### Multiple Responsibilities:

1. 6-step wizard management
2. File uploads (multiple document types)
3. Fetching company/department/leave policy data
4. New employee vs. rehire logic
5. Draft employee restoration
6. Form validation for each step

---

## How to Fix SRP Violations

### Strategy: Decompose into Smaller Components

**Before (AdminPanel.js):**
```
AdminPanel (631 lines)
  ├─ 8 different graph data fetching
  ├─ Company selection logic
  ├─ Date filtering
  ├─ Chart rendering
  └─ Navigation
```

**After:**
```
AdminPanelContainer
  ├─ useGraphData (custom hook)
  ├─ CompanyFilter (component)
  ├─ DateRangeFilter (component)
  └─ GraphGrid (component)
      ├─ EmployeeTurnoverChart
      ├─ GenderDistributionChart
      └─ ... (one component per graph)
```

---

## How to Fix SRP: Practical Steps

### 1. Extract Custom Hooks for Data Fetching

```javascript
// Before: Everything in component
const AdminPanel = () => {
  const [data, setData] = useState({});

  useEffect(() => {
    fetchYearWiseCompany();
    fetchEmployeeTurnOver();
    // ... 6 more
  }, [companyId]);

  return <div>...</div>;
};

// After: Separate data fetching
const useAdminGraphData = (companyId, dateRange) => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // All fetching logic here
  }, [companyId, dateRange]);

  return { data, loading };
};

const AdminPanel = () => {
  const { data, loading } = useAdminGraphData(companyId, dateRange);
  return <GraphGrid data={data} loading={loading} />;
};
```

---

## How to Fix SRP: AllPayRoll.js

### 2. Split into Feature-Focused Components

```javascript
// Before: One massive component
<AllPayRoll /> // 1,405 lines

// After: Composition of focused components
<PayrollContainer>
  <PayrollFilters />
  <PayrollDataTable />
  <PayrollActions>
    <PayrollGenerateButton />
    <PayrollApproveButton />
    <PayrollExportButton />
  </PayrollActions>
  <BulkAdjustmentUploader />
</PayrollContainer>
```

Each component has **one clear responsibility**.

---

## How to Fix SRP: AddEmployee.js

### 3. Use Wizard Pattern with Step Components

```javascript
// Before: All steps in one component
<AddEmployee /> // 1,270 lines with 6 steps mixed together

// After: Wizard with step components
<EmployeeWizard>
  <WizardStep step={1}>
    <BasicInfoForm />
  </WizardStep>
  <WizardStep step={2}>
    <ContactInfoForm />
  </WizardStep>
  <WizardStep step={3}>
    <DocumentUpload />
  </WizardStep>
  {/* ... more steps */}
</EmployeeWizard>
```

**Shared state managed by Context or reducer.**

---

# O - Open/Closed Principle

> "Software entities should be OPEN for extension, but CLOSED for modification"

---

## OCP: The Problem

**You should be able to add new features WITHOUT changing existing code**

Why?
- Changing existing code can introduce bugs
- Every change requires retesting
- Violates "if it works, don't touch it"

Solution?
- Write code that can be extended through abstraction
- Use composition, inheritance, or configuration

---

## OCP Violation #1: Duplicated Error Handling

**File:** [src/API/Employee/Employee.js](src/API/Employee/Employee.js)

### The Problem: Same error handling in EVERY API function

```javascript
export const getEmployeeInfoById = (employeeId) => {
    return Axios.get(`${Config.baseApi}/employee/${employeeId}`)
        .then(response => [response.data])
        .catch(error => {
            if (error.response) {
                return ([false, "An unexpected error occurred!"])
            } else if (error.request) {
                return ([false, "Network Error! Check your internet connection."])
            } else {
                return ([false, error.message])
            }
        })
}

export const getEmployeeBasicInfoByCompanyId = (companyId) => {
    return Axios.get(`${Config.baseApi}/employee/basic-info/${companyId}`)
        .then(response => [response.data])
        .catch(error => {
            // SAME error handling REPEATED!
            if (error.response) {
                return ([false, "An unexpected error occurred!"])
            } else if (error.request) {
                return ([false, "Network Error! Check your internet connection."])
            } else {
                return ([false, error.message])
            }
        })
}
```

**This pattern is repeated in 50+ API functions!**

---

## OCP Violation #1: Why is this bad?

### What happens when we need to:
- Add logging to all API errors?
- Add retry logic?
- Change error messages?
- Add Sentry error tracking?

**Answer:** We have to modify 50+ functions! (Violates "Closed for modification")

---

## OCP Violation #2: AttendanceAdmin.js

**File:** [src/API/Attendance/AttendanceAdmin.js](src/API/Attendance/AttendanceAdmin.js)

### Hard-coded feature flag pattern

```javascript
export const getAllAttendanceOfCompanyBySpecificDateAndLocations = (
    companyId, selectedLocations, specificDate, attendanceAccess
) => {
    let url = `${config.baseApi}/attendance/admin?companyIds=${companyId?.join(',')}&locationIds=${selectedLocations?.join(',')}&date=${specificDate}`;

    if (attendanceAccess) {
        url = `${config.baseApi}/attendance/admin?companyIds=${companyId?.join(',')}&locationIds=${selectedLocations?.join(',')}&date=${specificDate}&feature=Attendance`;
    }

    return Axios.get(url)
        .then(response => [response.data])
        .catch(error => { /* ... same duplicated error handling ... */ });
};
```

**Problem:** Adding new feature flags requires modifying every API function.

---

## OCP Violation #3: CareerAPIs/GetAPIs.js

**File:** [src/API/CareerAPIs/GetAPIs.js](src/API/CareerAPIs/GetAPIs.js)

### Every function repeats the same pattern

```javascript
export const getCareerAccessibilityByEmployeeId = (employeeId) => {
  return Axios.get(`${config.baseApi}/requisition/approval-accessibility/user/${employeeId}`)
    .then(response => [response.data])
    .catch(error => { /* ... identical error handling ... */ })
};

export const getJobsByRequisitionStatus = (requisitionStatus, userId) => {
  return Axios.get(`${config.baseApi}/requisition/jobs/${requisitionStatus}/user/${userId}`)
    .then(response => [response.data])
    .catch(error => { /* ... identical error handling AGAIN ... */ })
};

export const getJobRequisitionForAdmin = (requisitionStatus) => {
  return Axios.get(`${config.baseApi}/requisition/job-requisition/${requisitionStatus}/user`)
    .then(response => [response.data])
    .catch(error => { /* ... identical error handling AGAIN ... */ })
};
```

**Pattern repeats across 15+ functions in this file alone!**

---

## How to Fix OCP Violations

### Strategy 1: Axios Interceptor for Error Handling

```javascript
// Create once, use everywhere
// File: src/utils/axiosInstance.js

import axios from 'axios';

const apiClient = axios.create({
  baseURL: Config.baseApi,
  timeout: 10000,
});

// Response interceptor (runs for ALL requests)
apiClient.interceptors.response.use(
  (response) => [response.data],  // Success: return data
  (error) => {
    // Error handling logic in ONE place
    if (error.response) {
      return [false, "An unexpected error occurred!"];
    } else if (error.request) {
      return [false, "Network Error! Check your internet connection."];
    } else {
      return [false, error.message];
    }
  }
);

export default apiClient;
```

---

## How to Fix OCP: Using the Abstraction

```javascript
// Before: Repeated error handling in every function
export const getEmployeeInfoById = (employeeId) => {
    return Axios.get(`${Config.baseApi}/employee/${employeeId}`)
        .then(response => [response.data])
        .catch(error => {
            if (error.response) { /* ... */ }
            else if (error.request) { /* ... */ }
            else { /* ... */ }
        })
}

// After: Error handling centralized in interceptor
export const getEmployeeInfoById = (employeeId) => {
    return apiClient.get(`/employee/${employeeId}`);
    // That's it! Error handling happens automatically
}
```

**Now OPEN for extension (add logging, retry, etc. in ONE place)**
**And CLOSED for modification (don't touch 50+ API functions)**

---

## How to Fix OCP: URL Builder Pattern

### Strategy 2: URL Builder for Feature Flags

```javascript
// File: src/utils/urlBuilder.js

class ApiUrlBuilder {
  constructor(basePath) {
    this.basePath = basePath;
    this.params = new URLSearchParams();
  }

  addCompanies(companyIds) {
    if (companyIds?.length) {
      this.params.set('companyIds', companyIds.join(','));
    }
    return this;
  }

  addLocations(locationIds) {
    if (locationIds?.length) {
      this.params.set('locationIds', locationIds.join(','));
    }
    return this;
  }

  addDate(date) {
    if (date) this.params.set('date', date);
    return this;
  }

  withFeature(featureName) {
    if (featureName) this.params.set('feature', featureName);
    return this;
  }

  build() {
    return `${this.basePath}?${this.params.toString()}`;
  }
}
```

---

## How to Fix OCP: Using URL Builder

```javascript
// Before: Manual URL construction with conditionals
let url = `${config.baseApi}/attendance/admin?companyIds=${companyId?.join(',')}&locationIds=${selectedLocations?.join(',')}&date=${specificDate}`;

if (attendanceAccess) {
    url = `${config.baseApi}/attendance/admin?companyIds=${companyId?.join(',')}&locationIds=${selectedLocations?.join(',')}&date=${specificDate}&feature=Attendance`;
}

// After: Declarative URL building
const url = new ApiUrlBuilder('/attendance/admin')
  .addCompanies(companyId)
  .addLocations(selectedLocations)
  .addDate(specificDate)
  .withFeature(attendanceAccess ? 'Attendance' : null)
  .build();
```

**OPEN for extension:** Add new query parameters in builder class
**CLOSED for modification:** API functions don't change

---

## How to Fix OCP: Higher-Order Function

### Strategy 3: HOF for API Calls

```javascript
// File: src/utils/apiWrapper.js

export const withErrorHandling = (apiCall) => {
  return async (...args) => {
    try {
      const response = await apiCall(...args);
      return [response.data];
    } catch (error) {
      if (error.response) {
        return [false, "An unexpected error occurred!"];
      } else if (error.request) {
        return [false, "Network Error!"];
      } else {
        return [false, error.message];
      }
    }
  };
};

// Usage:
export const getEmployeeInfoById = withErrorHandling(
  (employeeId) => Axios.get(`${Config.baseApi}/employee/${employeeId}`)
);

export const getEmployeeBasicInfo = withErrorHandling(
  (companyId) => Axios.get(`${Config.baseApi}/employee/basic-info/${companyId}`)
);
```

---

# L - Liskov Substitution Principle

> "Objects of a superclass should be replaceable with objects of a subclass without breaking the application"

---

## LSP: The Problem

**Subtypes must be substitutable for their base types**

In simpler terms:
- If you have a function that accepts type A
- And type B extends/implements type A
- You should be able to pass type B without breaking anything

---

## LSP Violation #1: Survey Question Types

**File:** [src/views/dashboard/UserGraph/SurveyFormModal.js](src/views/dashboard/UserGraph/SurveyFormModal.js:59-88)

### Different question types produce incompatible structures

```javascript
let questionResponsesStructure = props?.surveyFormData?.surveyQuestions?.map(surveyQuestion => {
    if (surveyQuestion?.question?.questionType === 'DATE') {
        return {
            comment: '',
            surveyQuestionId: surveyQuestion?.id,
            selectedChoices: [],
            explanation: surveyQuestion?.question?.optionSet?.[0]?.label === "SINGLEDATE"
                ? `${moment().format("YYYY-MM-DD")}`
                : `${moment().format("YYYY-MM-DD")} ${moment().format("YYYY-MM-DD")}`
        }
    }
    if (surveyQuestion?.question?.questionType === 'TEXT') {
        return {
            comment: '',
            surveyQuestionId: surveyQuestion?.id,
            selectedChoices: [],
            explanation: ''
        }
    }
    else if (!props?.surveyFormData?.surveyConfig?.commentDisabled) {
        return {
            surveyQuestionId: surveyQuestion?.id,
            selectedChoices: [],
            comment: ''
        }
    } else {
        return {
            surveyQuestionId: surveyQuestion?.id,
            selectedChoices: [],
        }
    }
})
```

---

## LSP Violation #1: Why is this bad?

### Problems:
1. Each question type returns a different structure
2. Some have `explanation`, some don't
3. Some have `comment`, some don't
4. Consumer code must know the specific question type
5. Can't treat all questions uniformly

### Result:
**You can't substitute one question type for another without breaking the code**

---

## LSP Violation #2: Token Types

**File:** [src/utils/formula-expression.js](src/utils/formula-expression.js:235-273)

### Type-checking instead of polymorphism

```javascript
export const validateExpression = (tokens, formulaReferenceMap) => {
    let expression = "";

    for (const token of tokens) {
        if (token.type === "number") {
            expression += Number(token.value);
        } else if (token.type === "operator" || token.type === "parenthesis" || token.type === "comma") {
            expression += token.value;
        } else if (token.type === "function") {
            expression += formulaReferenceMap[token.value];
        } else {
            expression += getRandomValue();
        }
    }
    // ...
}
```

**Problem:** Type-checking violates LSP because tokens aren't truly substitutable

---

## LSP Violation #3: File Upload Handling

**File:** [src/tfhrm/employeeInfo/employee/AddEmployee.js](src/tfhrm/employeeInfo/employee/AddEmployee.js:260-287)

### Switch statement on file type

```javascript
switch (fileType) {
    case 'nid':
        setNIDPassPath(uploadedFile);
        break;
    case 'cv':
        setCVPath(uploadedFile);
        break;
    case 'appointmentLetter':
        setAppointmentLetter(uploadedFile);
        break;
    case 'profilePic':
        setProfilePicPath(uploadedFile);
        break;
    case 'others':
        let copyOtherDocumentPath = {...};
        setOtherDocumentPathSingle(() => ({ ...copyOtherDocumentPath }));
        break;
    case 'educationCertificate':
        let copyEducationPath = {...};
        setEducationCertificatePath(copyEducationPath);
        break
    // ...
}
```

**Problem:** Each file type handled differently, can't substitute one for another

---

## How to Fix LSP Violations

### Strategy: Use Polymorphism with Common Interfaces

**Before: Type-checking**
```javascript
if (question.type === 'DATE') {
  return { explanation: date };
} else if (question.type === 'TEXT') {
  return { explanation: text };
}
```

**After: Polymorphic objects**
```javascript
// Base interface
class QuestionType {
  getInitialResponse(surveyQuestionId) {
    return {
      surveyQuestionId,
      selectedChoices: [],
      comment: '',
    };
  }
}

// Specific implementations
class DateQuestion extends QuestionType {
  constructor(isSingleDate) {
    super();
    this.isSingleDate = isSingleDate;
  }

  getInitialResponse(surveyQuestionId) {
    const base = super.getInitialResponse(surveyQuestionId);
    return {
      ...base,
      explanation: this.isSingleDate
        ? moment().format("YYYY-MM-DD")
        : `${moment().format("YYYY-MM-DD")} ${moment().format("YYYY-MM-DD")}`
    };
  }
}

class TextQuestion extends QuestionType {
  getInitialResponse(surveyQuestionId) {
    const base = super.getInitialResponse(surveyQuestionId);
    return { ...base, explanation: '' };
  }
}
```

---

## How to Fix LSP: Using Polymorphism

```javascript
// Question factory
const createQuestion = (surveyQuestion) => {
  switch (surveyQuestion.question.questionType) {
    case 'DATE':
      const isSingleDate = surveyQuestion.question.optionSet?.[0]?.label === "SINGLEDATE";
      return new DateQuestion(isSingleDate);
    case 'TEXT':
      return new TextQuestion();
    default:
      return new QuestionType();
  }
};

// Now ALL questions are substitutable
const questionResponsesStructure = props.surveyFormData.surveyQuestions.map(sq => {
  const question = createQuestion(sq);
  return question.getInitialResponse(sq.id);
});
```

**All question types now conform to the same interface!**

---

## How to Fix LSP: Token Polymorphism

```javascript
// Base token class
class Token {
  constructor(value) {
    this.value = value;
  }

  toExpression(formulaReferenceMap) {
    return this.value;
  }
}

// Specific token types
class NumberToken extends Token {
  toExpression() {
    return Number(this.value);
  }
}

class FunctionToken extends Token {
  toExpression(formulaReferenceMap) {
    return formulaReferenceMap[this.value];
  }
}

// Usage: All tokens substitutable!
export const validateExpression = (tokens, formulaReferenceMap) => {
  let expression = tokens
    .map(token => token.toExpression(formulaReferenceMap))
    .join('');
  // ...
}
```

---

## How to Fix LSP: File Upload Strategy

```javascript
// File upload strategy pattern
class FileUploadHandler {
  handleUpload(file) {
    throw new Error("Must implement handleUpload");
  }
}

class NIDUploadHandler extends FileUploadHandler {
  constructor(setNIDPath) {
    super();
    this.setNIDPath = setNIDPath;
  }

  handleUpload(file) {
    this.setNIDPath(file);
  }
}

class CVUploadHandler extends FileUploadHandler {
  constructor(setCVPath) {
    super();
    this.setCVPath = setCVPath;
  }

  handleUpload(file) {
    this.setCVPath(file);
  }
}

// Factory
const uploadHandlers = {
  nid: new NIDUploadHandler(setNIDPath),
  cv: new CVUploadHandler(setCVPath),
  // ... more
};

// Usage: All handlers substitutable!
const handler = uploadHandlers[fileType];
handler.handleUpload(uploadedFile);
```

---

# I - Interface Segregation Principle

> "No client should be forced to depend on interfaces it does not use"

---

## ISP: The Problem

**Don't force clients to implement methods they don't need**

In React/JavaScript context:
- Don't create "fat" hooks that return too many things
- Don't create giant prop interfaces
- Split large interfaces into smaller, focused ones

---

## ISP Violation #1: Fat Hook

**File:** [src/hooks/useOrganizationTree.js](src/hooks/useOrganizationTree.js:104-119)

### Hook returns 17 different values!

```javascript
return {
    data,                      // 1
    departments,               // 2
    selectedDepartment,        // 3
    setSelectedDepartment,     // 4
    viewMode,                  // 5
    loading,                   // 6
    expandedNodes,             // 7
    setExpandedNodes,          // 8
    loadingNodes,              // 9
    fetchDepartments,          // 10
    fetchDepartmentOrgChart,   // 11
    fetchEmployeeOrgChart,     // 12
    loadMoreChildren,          // 13
};
```

**Problem:** Components using this hook for just fetching departments still get all the employee org chart methods!

---

## ISP Violation #1: Why is this bad?

### Scenario: Component only needs department list

```javascript
const DepartmentSelector = () => {
  const {
    departments,           // ✅ Need this
    loading,              // ✅ Need this
    fetchDepartments,     // ✅ Need this

    // ❌ Don't need any of these, but forced to import them
    data,
    selectedDepartment,
    setSelectedDepartment,
    viewMode,
    expandedNodes,
    setExpandedNodes,
    loadingNodes,
    fetchDepartmentOrgChart,
    fetchEmployeeOrgChart,
    loadMoreChildren,
  } = useOrganizationTree();

  // Only uses 3 out of 13 returned values!
};
```

**Violation:** Component depends on an interface larger than it needs

---

## ISP Violation #2: Barrel Export Hell

**File:** [src/utils/index.js](src/utils/index.js:1-35)

### Unrelated utilities bundled together

```javascript
export {
    // Constants
    operators,
    functions,

    // Formula expression utils
    buildFormulaReferenceMap,
    checkEmptyParenthesis,
    checkOpenParenthesesBalance,
    formulaCreation,
    getInvalidCharacters,
    isValidTokenSequence,
    tokenizeFormula,
    checkValidToken,
    validateExpression,
    validateFunctionArguments,

    // Time utils
    calculateTotalWorkingHour,

    // User input utils
    containLowercaseLetter,
    containNumber,
    containSpecialCharacter,
    containUppercaseLetter,
    addCommaSeparator,
    capitalizeFirstLetter
};
```

---

## ISP Violation #2: Why is this bad?

### What happens when you import

```javascript
import { containUppercaseLetter } from '@/utils';
```

**You get:**
- Formula validation utilities (don't need)
- Time calculation utilities (don't need)
- All other user input utilities (might not need)

**Bundle includes ALL exported functions, even unused ones!**

---

## ISP Violation #3: Component with Too Many Props

**File:** [src/tfhrm/promotion/AddPromotionModal.js](src/tfhrm/promotion/AddPromotionModal.js:192-239)

### 48+ state variables in one component

```javascript
const [companyId, setCompanyId] = useState(currentCompany);
const [companyId2, setCompanyId2] = useState('');
const [companyId3, setCompanyId3] = useState(currentCompany);
const [errorModal, setErrorModal] = useState(false);
const [errorModalMessage, setErrorModalMessage] = useState('');
const [allDepartmentOptions, setAllDepartmentOptions] = useState([...]);
const [allDepartmentForTransferCompany, setAllDepartmentForTransferCompany] = useState([...]);
const [departmentId, setDepartmentId] = useState('');
const [departmentId2, setDepartmentId2] = useState();
const [departmentId3, setDepartmentId3] = useState();
// ... 38 MORE state variables ...
```

**Problem:** Component interface is too broad, needs to be split

---

## How to Fix ISP Violations

### Strategy 1: Split Fat Hooks into Focused Hooks

**Before: One fat hook**
```javascript
const useOrganizationTree = () => {
  // Returns 13 different things
};
```

**After: Multiple focused hooks**
```javascript
// Hook 1: Just for fetching departments
const useDepartments = (companyId) => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchDepartments = async () => {
    setLoading(true);
    const data = await api.getDepartments(companyId);
    setDepartments(data);
    setLoading(false);
  };

  return { departments, loading, fetchDepartments };
};

// Hook 2: Just for org chart tree
const useOrgChartTree = (departmentId) => {
  const [data, setData] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState([]);
  const [loadingNodes, setLoadingNodes] = useState([]);

  const fetchOrgChart = async () => { /* ... */ };
  const loadMoreChildren = async (nodeId) => { /* ... */ };

  return { data, expandedNodes, setExpandedNodes, loadingNodes, fetchOrgChart, loadMoreChildren };
};
```

---

## How to Fix ISP: Using Focused Hooks

```javascript
// Component only needs departments
const DepartmentSelector = () => {
  const { departments, loading, fetchDepartments } = useDepartments(companyId);
  // ✅ Only gets what it needs!
};

// Component needs full org chart
const OrgChartViewer = ({ departmentId }) => {
  const { data, expandedNodes, setExpandedNodes, loadingNodes, fetchOrgChart, loadMoreChildren } = useOrgChartTree(departmentId);
  // ✅ Only gets what it needs!
};

// Component needs both
const FullOrgView = () => {
  const { departments } = useDepartments(companyId);
  const orgChart = useOrgChartTree(selectedDepartmentId);
  // ✅ Composes both hooks, still focused!
};
```

---

## How to Fix ISP: Split Barrel Exports

### Strategy 2: Split utility exports by domain

**Before:**
```javascript
// src/utils/index.js
export { formula utils, time utils, string utils };  // All mixed!
```

**After:**
```javascript
// src/utils/formula/index.js
export {
  buildFormulaReferenceMap,
  validateExpression,
  tokenizeFormula,
  // ... only formula-related
};

// src/utils/time/index.js
export {
  calculateTotalWorkingHour,
  // ... only time-related
};

// src/utils/string/index.js
export {
  containUppercaseLetter,
  capitalizeFirstLetter,
  // ... only string-related
};
```

**Now imports are focused:**
```javascript
import { containUppercaseLetter } from '@/utils/string';  // ✅ Only string utils
```

---

## How to Fix ISP: Split Component Responsibilities

### Strategy 3: Decompose large component

**Before:**
```javascript
<AddPromotionModal>
  {/* Promotion form */}
  {/* Transfer form */}
  {/* Roster assignment */}
  {/* Salary adjustment */}
</AddPromotionModal>
```

**After:**
```javascript
<EmployeeActionModal>
  <Tab label="Promotion">
    <PromotionForm />  {/* Only promotion-related state */}
  </Tab>
  <Tab label="Transfer">
    <TransferForm />   {/* Only transfer-related state */}
  </Tab>
  <Tab label="Roster">
    <RosterForm />     {/* Only roster-related state */}
  </Tab>
</EmployeeActionModal>
```

Each form component has a **focused interface** with only the state it needs.

---

# D - Dependency Inversion Principle

> "High-level modules should not depend on low-level modules. Both should depend on abstractions."

---

## DIP: The Problem

**Depend on abstractions, not concrete implementations**

Why?
- Makes code testable (can mock dependencies)
- Makes code flexible (can swap implementations)
- Reduces coupling between modules

In React/JavaScript:
- Don't hard-code axios, localStorage, etc.
- Use dependency injection via props/context
- Create abstraction layers (services)

---

## DIP Violation #1: Global Logout Function

**File:** [src/utils/axiosInstance.js](src/utils/axiosInstance.js:5-9)

### Global variable for logout

```javascript
let globalLogoutFunction = null; // ❌ Global mutable variable

export const setGlobalLogoutFunction = (logoutFn) => {
    globalLogoutFunction = logoutFn;
};

// Later in interceptor:
Axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            console.warn('Unauthorized - Clearing storage');
            if (globalLogoutFunction) {
                globalLogoutFunction(); // ❌ Depends on global variable
            }
        }
        return Promise.reject(error);
    }
);
```

**Problem:** High-level interceptor depends on low-level global variable

---

## DIP Violation #2: Direct localStorage Dependency

**File:** [src/utils/getCompanyInfo.js](src/utils/getCompanyInfo.js:8-49)

### Hard-coded localStorage calls

```javascript
export function getCompanyInfo(companyId, storageKey = "company") {
    try {
        const raw = localStorage.getItem(storageKey);  // ❌ Direct coupling
        if (!raw) return { label: "", locations: [] };

        const companies = JSON.parse(raw);  // ❌ Assumes structure
        const idNum = Number(companyId);

        const company =
            companies.find(c => Number(c?.value) === idNum) ||
            companies.find(c => Number(c?.details?.id) === idNum);

        if (!company) return { label: "", locations: [] };

        return {
            label: company?.label || "",
            locations: company?.details?.locations || []
        };
    } catch {
        return { label: "", locations: [] };
    }
}
```

**Problem:** Function directly depends on browser localStorage API

---

## DIP Violation #2: Why is this bad?

### Problems with direct localStorage dependency:

1. **Can't test** - No way to mock localStorage in unit tests
2. **Can't swap storage** - Tied to browser localStorage forever
3. **Can't add features** - Can't add encryption, compression, etc. without modifying function
4. **Server-side rendering breaks** - localStorage doesn't exist on server

### What if you want to:
- Switch to sessionStorage?
- Add encryption to stored data?
- Use AsyncStorage in React Native?
- Add caching layer?

**Answer:** Modify every function that uses localStorage!

---

## DIP Violation #3: Login Component Dependencies

**File:** [src/views/pages/login/Login.js](src/views/pages/login/Login.js:114-156)

### Direct dependencies everywhere

```javascript
const handleSubmitIntoFormik = (values) => {
    setActiveAPICalling(() => ({ ...activeAPICalling, login: true }));

    axios.post(`${Config.baseApi}/account/signin`, {  // ❌ Direct axios
        username: values.userName,
        password: values.password
    }, { timeout: 3000 })
    .then(response => {
        // ...
        localStorage.setItem("w_auth", JSON.stringify(response.data));  // ❌ Direct localStorage

        if (response.data.role === "ROLE_ADMIN") {  // ❌ Hard-coded role string
            // ...
        }
    })
    .catch(err => {
        // ❌ Direct error message construction
        if (err.message.includes('404')) userFeedbackMessage = "User does not exist."
        else if (err.message.includes('422')) userFeedbackMessage = "Login restricted..."
    })
};
```

**Problem:** Component tightly coupled to axios, localStorage, Config

---

## DIP Violation #4: API Layer Coupling

**File:** [src/API/Organization/OrganizationHierarchy/OrganizationHierarchyAPI.js](src/API/Organization/OrganizationHierarchy/OrganizationHierarchyAPI.js:10-28)

### Every API function coupled to Axios

```javascript
export const createOrganizationElement = async (organizationData) => {
    try {
        const response = await Axios.post(
            `${config.baseApi}/organization-elements`,  // ❌ Direct config
            organizationData,
            { headers: { "Content-Type": "application/json" } }
        );
        return [response.data];
    } catch (error) {
        return [false, error?.response?.data?.message || error?.message];
    }
};

export const getAllOrganizationType = (companyId) => {
    return Axios.get(`${config.baseApi}/organization-element-types/company/${companyId}/by-position-in-hierarchy?current=company&positionDifference=1&except=department,location`)
        .then(response => [response.data])
        .catch(error => {
            console.error(error);
            return ([false, error?.response?.data?.message || error?.message])
        })
};
```

**Problem:** Can't swap HTTP client or test without real HTTP calls

---

## How to Fix DIP Violations

### Strategy 1: Create Storage Abstraction

**Before: Direct localStorage**
```javascript
const raw = localStorage.getItem(storageKey);
localStorage.setItem("w_auth", JSON.stringify(data));
```

**After: Storage service interface**
```javascript
// src/services/StorageService.js
class StorageService {
  get(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }

  remove(key) {
    localStorage.removeItem(key);
  }
}

export const storageService = new StorageService();
```

---

## How to Fix DIP: Using Storage Abstraction

```javascript
// Before: Direct localStorage dependency
export function getCompanyInfo(companyId, storageKey = "company") {
    const raw = localStorage.getItem(storageKey);  // ❌
    const companies = JSON.parse(raw);
    // ...
}

// After: Depends on abstraction
import { storageService } from '@/services/StorageService';

export function getCompanyInfo(companyId, storageKey = "company") {
    const companies = storageService.get(storageKey);  // ✅
    // ...
}
```

**Now you can:**
- Swap to sessionStorage by changing ONE place
- Add encryption layer
- Mock for testing
- Use different storage in React Native

---

## How to Fix DIP: Auth Service Abstraction

### Strategy 2: Create Auth Service

```javascript
// src/services/AuthService.js
class AuthService {
  constructor(httpClient, storage) {
    this.httpClient = httpClient;
    this.storage = storage;
  }

  async login(username, password) {
    try {
      const response = await this.httpClient.post('/account/signin', {
        username,
        password
      });

      this.storage.set('w_auth', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: this.parseError(error) };
    }
  }

  logout() {
    this.storage.remove('w_auth');
    // Clear other auth data
  }

  isAuthenticated() {
    return !!this.storage.get('w_auth');
  }

  getUserRole() {
    const auth = this.storage.get('w_auth');
    return auth?.role;
  }

  parseError(error) {
    if (error.response?.status === 404) return "User does not exist.";
    if (error.response?.status === 422) return "Login restricted.";
    return "An unexpected error occurred.";
  }
}

export const authService = new AuthService(apiClient, storageService);
```

---

## How to Fix DIP: Using Auth Service

```javascript
// Before: Direct dependencies in component
const handleSubmitIntoFormik = (values) => {
    axios.post(`${Config.baseApi}/account/signin`, { /* ... */ })
        .then(response => {
            localStorage.setItem("w_auth", JSON.stringify(response.data));
            if (response.data.role === "ROLE_ADMIN") { /* ... */ }
        })
        .catch(err => { /* manual error parsing */ });
};

// After: Depends on AuthService abstraction
import { authService } from '@/services/AuthService';

const handleSubmitIntoFormik = async (values) => {
    const result = await authService.login(values.userName, values.password);

    if (result.success) {
        const role = authService.getUserRole();
        if (role === "ROLE_ADMIN") {
            // Navigate to admin dashboard
        }
    } else {
        setErrorMessage(result.error);
    }
};
```

**Benefits:**
- ✅ Easy to test (mock authService)
- ✅ Easy to swap implementations
- ✅ Centralized auth logic
- ✅ Component doesn't know about axios or localStorage

---

## How to Fix DIP: API Client Abstraction

### Strategy 3: HTTP Client Interface

```javascript
// src/services/HttpClient.js
class HttpClient {
  constructor(baseURL) {
    this.client = axios.create({ baseURL });
    this.setupInterceptors();
  }

  setupInterceptors() {
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        // Centralized error handling
        if (error.response?.status === 401) {
          // Dispatch logout event
          window.dispatchEvent(new Event('unauthorized'));
        }
        return Promise.reject(error);
      }
    );
  }

  async get(url, config) {
    const response = await this.client.get(url, config);
    return response.data;
  }

  async post(url, data, config) {
    const response = await this.client.post(url, data, config);
    return response.data;
  }

  // ... put, delete, patch
}

export const apiClient = new HttpClient(Config.baseApi);
```

---

## How to Fix DIP: Using HTTP Client

```javascript
// Before: Direct Axios dependency
export const createOrganizationElement = async (organizationData) => {
    const response = await Axios.post(
        `${config.baseApi}/organization-elements`,
        organizationData
    );
    return [response.data];
};

// After: Depends on HttpClient abstraction
import { apiClient } from '@/services/HttpClient';

export const createOrganizationElement = async (organizationData) => {
    try {
        const data = await apiClient.post('/organization-elements', organizationData);
        return [data];
    } catch (error) {
        return [false, error.message];
    }
};
```

**Benefits:**
- ✅ Can swap to fetch() or other HTTP library
- ✅ Easy to mock for testing
- ✅ Centralized request/response handling
- ✅ No hard-coded base URLs

---

## How to Fix DIP: Dependency Injection with Context

### Strategy 4: React Context for Services

```javascript
// src/contexts/ServicesContext.jsx
import React, { createContext, useContext } from 'react';
import { authService } from '@/services/AuthService';
import { storageService } from '@/services/StorageService';
import { apiClient } from '@/services/HttpClient';

const ServicesContext = createContext(null);

export const ServicesProvider = ({ children }) => {
  const services = {
    auth: authService,
    storage: storageService,
    api: apiClient,
  };

  return (
    <ServicesContext.Provider value={services}>
      {children}
    </ServicesContext.Provider>
  );
};

export const useServices = () => {
  const context = useContext(ServicesContext);
  if (!context) {
    throw new Error('useServices must be used within ServicesProvider');
  }
  return context;
};
```

---

## How to Fix DIP: Using Service Context

```javascript
// src/App.js
import { ServicesProvider } from '@/contexts/ServicesContext';

function App() {
  return (
    <ServicesProvider>
      <Router>
        {/* Your app */}
      </Router>
    </ServicesProvider>
  );
}

// In any component:
import { useServices } from '@/contexts/ServicesContext';

const LoginPage = () => {
  const { auth } = useServices();

  const handleLogin = async (credentials) => {
    const result = await auth.login(credentials.username, credentials.password);
    // ...
  };

  return <LoginForm onSubmit={handleLogin} />;
};
```

**Benefits:**
- ✅ Easy to swap implementations (just change provider)
- ✅ Perfect for testing (provide mock services)
- ✅ Centralized service management
- ✅ Components depend on abstractions, not concrete implementations

---

# Summary: SOLID Benefits in Our Codebase

---

## Current State vs. SOLID State

| Aspect | Current State | After SOLID |
|--------|--------------|-------------|
| **Component Size** | 1,405 lines | < 300 lines |
| **Code Duplication** | 50+ duplicated error handlers | 1 centralized handler |
| **Testing** | Hard (tightly coupled) | Easy (dependency injection) |
| **New Features** | Modify existing code | Extend with new code |
| **Onboarding** | Overwhelming | Manageable |
| **Bug Fixes** | 3 hours (fear of breaking) | 30 minutes (isolated) |

---

## Action Plan for Our Team

### Phase 1: Stop Making it Worse (Week 1-2)
1. **No new files > 300 lines** - Break up large components
2. **Use our new abstractions** - StorageService, AuthService, HttpClient
3. **Create custom hooks** - Extract data fetching logic
4. **Code reviews focus on SOLID** - Team members check for violations

### Phase 2: Incremental Refactoring (Week 3-8)
1. **Refactor 1 large component per sprint**
   - AllPayRoll.js → PayrollContainer + smaller components
   - AddEmployee.js → Wizard pattern
   - AdminPanel.js → Split graphs into components
2. **Centralize API error handling**
3. **Create service layer** for all API calls

### Phase 3: Establish Patterns (Ongoing)
1. **Document our patterns** - Component structure guide
2. **Create reusable abstractions** - Shared utilities
3. **Automated checks** - ESLint rules for component size
4. **Regular refactoring sessions** - 1 hour per week

---

## Measuring Success

### Metrics to Track:

1. **Average Component Size**
   - Current: 400 lines
   - Target: < 200 lines

2. **Code Duplication**
   - Current: High (error handling, API calls)
   - Target: < 5% duplication

3. **Test Coverage**
   - Current: Low (hard to test)
   - Target: > 70% coverage

4. **Development Velocity**
   - Time to add new feature
   - Time to fix bugs
   - Time for code reviews

---

## Key Takeaways

### Remember:

1. **SOLID is not about perfection** - It's about continuous improvement
2. **Start small** - Refactor incrementally, not all at once
3. **Enforce in code reviews** - Make SOLID part of our culture
4. **Create abstractions when you see patterns** - Don't repeat yourself 3+ times
5. **Keep learning** - These principles take time to internalize

---

## Resources for Further Learning

### Books:
- "Clean Code" by Robert C. Martin
- "Refactoring" by Martin Fowler
- "Design Patterns" by Gang of Four

### Online:
- refactoring.guru - Great visual explanations
- sourcemaking.com/design_patterns
- React patterns: patterns.dev

### Practice:
- Code reviews focusing on SOLID
- Pair programming sessions
- Refactoring katas

---

## Questions?

**Let's discuss:**
- Which violations surprised you most?
- Which principle do you find hardest to apply?
- What should we prioritize refactoring first?

---

## Next Steps

### Action Items:
1. **Today:** Review your current work for SOLID violations
2. **This Week:** Implement at least one service abstraction (StorageService or AuthService)
3. **Next Sprint:** Choose 1 large component to refactor together
4. **Ongoing:** Code reviews with SOLID checklist

### Let's make our codebase better, one commit at a time!

---

# Thank You!

**Remember:** Legacy code is just code without tests and good design.
**We can change that, starting today.**
