# Vouch

Our vouch system makes it easy for you to access medical cannabis treatments from registered clinics and trusted partners in New Zealand. With a simple and secure process, you can receive the care you need and support the growth of the medical cannabis industry.

## Focus

- The program will provide a unique code to patients that can be redeemed with registered clinics and trusted partners for medical cannabis treatments.
- The unique code will have a fixed value that will be determined when the code is requested.
- The program will provide a web portal for patients to check the balance and details of their unique code.
- The program will provide a plugin for WordPress and other e-commerce sites to accept the unique code and make it easy for companies to participate.
- The program will ensure that patient data is secure and compliant with relevant regulations.
- The program will be launched in New Zealand and will only be valid for use within New Zealand.
- The program will be tested and refined to ensure that it is user-friendly and effective for both patients and companies.
- The program will be marketed to patients, clinics, and trusted partners to promote its use and growth.
- The program will retain code information until it has been fully redeemed and indicated as expirible. 
- The program will only provide code data when the specific code is provided. 
- The program will rate limit requests and take bad actors into account.
- The program will only provide information about more than one code, or processing information about a code to redeeming registred clinics and redeeming trusted partners. 
- The program will make use of techniques to detect on a best effort basis patient information within user provided content and prevent this data from being processed.
- The program is not intended to be used to store patient information.
- The program is not intended to be used to process patient information.

## Technical Goal 

The program is designed to provide a unique code to patients that can be redeemed with registered clinics and trusted partners for medical cannabis treatments. The system will consist of a user-friendly frontend and a secure backend developed with Node.js and AWS Lambda. The program will also provide a plugin for WordPress and other e-commerce sites to accept the unique code and make it easy for companies to participate.

## API Surface

The program requires at a minimum:

- An API endpoint for generating unique codes with a fixed value for patients to use.
- An API endpoint for verifying the validity of unique codes when redeemed by clinics and trusted partners.
- An API endpoint for retrieving the details and balance of a unique code for patients to check.
- An API endpoint for adding and removing registered clinics and trusted partners.
- An API endpoint for adding and removing unique codes associated with specific clinics and trusted partners.
- An API endpoint for retrieving data related to unique codes and their associated clinics and trusted partners.
- An API endpoint for securely communicating with Xero for payment processing.
- An API endpoint for securely communicating with the WordPress plugin and other e-commerce sites to accept the unique codes.
- An API endpoint for logging and monitoring system activity and errors.

### API Surface Examples

#### Generate Unique Code

- Request: `POST /generate-unique-code`
- Response: `{ "uniqueCode": "ABC123", "value": 50.00 }`

#### Verify Code Validity

- Request: `POST /verify-unique-code`
- Request Body: `{ "uniqueCode": "ABC123", "partnerId": "1234" }`
- Response: `{ "valid": true }`

#### Retrieve Code Public Details

- Request: `GET /unique-code-details`
- Request Parameters: `uniqueCode=ABC123`
- Response: `{ "uniqueCode": "ABC123", "value": 50.00, "partnerId": "1234" }`

#### Add Partner

- Request: `POST /add-partner`
- Request Body: `{ "partnerId": "1234", "partnerName": "ABC Clinic", "location": "Auckland" }`
- Response: `{ "success": true }`

#### Assign Unique Code / Redeem Unique Code

- Request: `POST /assign-unique-code`
- Request Body: `{ "uniqueCode": "ABC123", "partnerId": "1234" }`
- Response: `{ "success": true }`

#### Retrieve Code Data / Processing information

- Request: `GET /unique-code-data`
- Request Parameters: `uniqueCode=ABC123`
- Response: `{ "uniqueCode": "ABC123", "value": 50.00, "partnerId": "1234", "partnerName": "ABC Clinic", "location": "Auckland" }`

#### Process Payment Transfer related to a unique code

- Request: `POST /process-payment`
- Request Body: `{ "uniqueCode": "ABC123", "amount": 50.00 }`
- Response: `{ "success": true }`

#### Accept Unique Code / Record code usage

- Request: `POST /accept-unique-code`
- Request Body: `{ "uniqueCode": "ABC123" }`
- Response: `{ "success": true }`

#### Retrieve System Logs

- Request: `GET /system-logs`
- Response: `[ {"timestamp": "2022-05-01T10:30:00Z", "message": "Unique code generated", "code": "ABC123" }, {"timestamp": "2022-05-01T11:00:00Z", "message": "Unique code redeemed", "code": "ABC123", "partnerId": "1234" }]`

### API SDK Example

```typescript
interface UniqueCode {
    uniqueCode: string;
    value: number;
}

interface Partner {
    partnerId: string;
    partnerName: string;
    location: string;
}

interface UniqueCodeDetails extends UniqueCode {
    partnerId: string;
}

interface CodeValidity {
    valid: boolean;
}

interface SystemLog {
    timestamp: string;
    message: string;
    code?: string;
    partnerId?: string;
}

interface PaymentTransfer {
    uniqueCode: string;
    amount: number;
}

interface VouchSDK {
    generateUniqueCode(): Promise<UniqueCode>;
    verifyUniqueCode(uniqueCode: string, partnerId: string): Promise<CodeValidity>;
    getUniqueCodeDetails(uniqueCode: string): Promise<UniqueCodeDetails>;
    addPartner(partner: Partner): Promise<{ success: boolean }>;
    assignUniqueCode(uniqueCode: string, partnerId: string): Promise<{ success: boolean }>;
    getUniqueCodeData(uniqueCode: string): Promise<UniqueCodeDetails>;
    processPayment(paymentTransfer: PaymentTransfer): Promise<{ success: boolean }>;
    acceptUniqueCode(uniqueCode: string): Promise<{ success: boolean }>;
    getSystemLogs(): Promise<SystemLog[]>;
}
```

## Vouch System Architecture

The Vouch system will use a serverless architecture based on AWS Lambda and Node.js. This approach allows for flexibility and scalability while minimizing operational costs. The system will interact with other services such as Xero and WordPress through their respective APIs.

### Frontend

The frontend will be built using React, a popular and efficient JavaScript library for building user interfaces. It will provide a responsive and user-friendly interface for patients, clinics, and trusted partners. The frontend will communicate with the backend through the provided API endpoints.

### Backend

The backend will be implemented using Node.js and AWS Lambda. Each API endpoint will have its own Lambda function to ensure optimal performance and scalability. The backend will interact with a database, such as AWS DynamoDB, to store and manage data related to unique codes, clinics, and trusted partners.

### Database

AWS DynamoDB will be used as the primary database for the Vouch system. This NoSQL database service provides fast and predictable performance, as well as scalability and security. The database will store data related to unique codes, clinics, and trusted partners.

### API Gateway

AWS API Gateway will be used to expose the API endpoints and manage access to the backend services. API Gateway will provide features such as rate limiting, authentication, and monitoring to ensure the security and reliability of the Vouch system.

### WordPress Plugin

The WordPress plugin will be developed using PHP, the primary language for WordPress plugin development. The plugin will provide an interface for WordPress-based e-commerce sites to easily integrate the Vouch unique code system. The plugin will communicate with the backend API to accept and verify unique codes for medical cannabis treatments.

### Third-party Integrations

The Vouch system will integrate with the Xero API for payment processing. This integration will enable the automatic transfer of funds between clinics and trusted partners when unique codes are redeemed. The Vouch system will also interact with the WordPress plugin and other e-commerce platforms to accept unique codes and track their usage.

### Monitoring and Logging

AWS CloudWatch will be used to monitor the performance and health of the Vouch system. CloudWatch provides insights into the usage, errors, and performance of the Lambda functions and other AWS resources. Additionally, logs from the API and other components will be stored and analyzed using CloudWatch Logs.

### Security

To ensure data security and regulatory compliance, the Vouch system will use a combination of AWS security features and best practices. AWS Identity and Access Management (IAM) will be used to manage access to AWS resources, and data stored in DynamoDB will be encrypted at rest. API Gateway will be configured with appropriate authentication and rate limiting to protect the system from abuse. Patient data privacy will be ensured by using techniques to detect and prevent the processing of personal information.