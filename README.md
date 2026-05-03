# SendSlot
> Special thanks to [ni3rav](https://github.com/ni3rav) for the original project inspiration. His [blog](https://ni3rav.me/blogs/how-i-implemented-image-upload-pipeline) was a valuable reference during the implementation of this project.
---

SendSlot is a professional, high-performance file sharing platform designed for secure and ephemeral data transfer. It leverages a modern distributed architecture to handle large file uploads, background processing, and real-time notifications.

## System Architecture

The application follows a distributed architecture designed for scalability and reliability. By decoupling file uploads from the main application logic, the system remains responsive even under heavy load.

```mermaid
graph TD
    User((User))
    Client[React Frontend]
    API[Express API]
    Worker[Background Worker]
    DB[(PostgreSQL)]
    Redis[(Redis Queue)]
    S3[(MinIO/S3 Storage)]

    User -->|Interacts| Client
    Client -->|Metadata & Auth| API
    Client -->|Direct Upload/Download| S3
    API -->|Manage State| DB
    API -->|Queue Jobs| Redis
    Redis -->|Process Jobs| Worker
    Worker -->|Scan & Verify| S3
    Worker -->|Update Status| DB
```

## Design Concepts

### 1. Valet Key Pattern
SendSlot implements the Valet Key pattern using S3 presigned URLs. Instead of routing large binary data through the Node.js server, the API generates a time-limited, secure URL that allows the client to communicate directly with the storage provider. This offloads significant I/O and memory pressure from the application server.

### 2. Asynchronous Task Processing
Time-consuming operations, such as malware scanning and email dispatch, are handled asynchronously via Redis-backed queues (BullMQ). This ensures that the user receives an immediate response after uploading, while the system handles verification in the background.

### 3. Eventual Consistency
The system transitions through multiple states (pending, processing, scanning, ready). The UI polls the API to reflect the current state of the transfer, ensuring the user is informed while background processes achieve consistency across the database and storage.

### 4. Horizontal Scalability
Since the API and Workers are stateless and communicate via a shared database and message queue, multiple instances can be deployed independently to handle increased traffic or processing demands.

## Technical Implementation

### Secure Upload Workflow

1. The client requests a transfer by providing file metadata.
2. The API generates a unique UUID and a set of presigned URLs.
3. The client uploads files directly to MinIO/S3 using these URLs.
4. Once finished, the client notifies the API to trigger background processing.

```mermaid
sequenceDiagram
    participant C as Client
    participant A as API
    participant S as S3 Storage
    participant W as Worker

    C->>A: POST /api/transfers (metadata)
    A->>C: 201 Created + Presigned URLs
    C->>S: PUT /file (Direct Binary Upload)
    C->>A: POST /api/transfers/:slug/complete
    A->>W: Enqueue job: file-processing
    W->>S: Verify existence & generate checksum
    W->>A: Update status: ready
```

### Core Code Snippets

#### Presigned URL Generation
The following logic enables direct-to-cloud uploads, bypassing the application server bottleneck:

```javascript
async function getPresignedPutUrl(key, expiresSeconds = 900) {
  const { PutObjectCommand } = await import('@aws-sdk/client-s3');
  const put = new PutObjectCommand({ Bucket: BUCKET, Key: key });
  return getSignedUrl(client, put, { expiresIn: expiresSeconds });
}
```

#### Background Job Processing
Workers use SHA-256 checksums to verify data integrity before making the transfer available for download:

```javascript
const hash = crypto.createHash('sha256');
const stream = await getObjectStream(f.storage_key);
stream.on('data', d => hash.update(d));
stream.on('end', () => {
    const checksum = hash.digest('hex');
    // Update database with verified checksum
});
```

## Getting Started

### Prerequisites
* Node.js (v18 or higher)
* Docker and Docker Compose
* NPM or Yarn

### Local Infrastructure Setup
The project includes a Docker Compose configuration to spin up the necessary infrastructure services.

```bash
docker-compose up -d
```

### Environment Configuration
Create a .env file in the server directory with the following variables:

```env
DATABASE_URL=postgres://postgres:evora@localhost:5432/evora
REDIS_URL=redis://localhost:6379
S3_ENDPOINT=http://localhost:9000
S3_BUCKET=sendslot-files
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin
```

### Installation
```bash
npm install
cd client && npm install
cd ../server && npm install
npm run dev
```

## Security Considerations
* **Password Hashing**: All sensitive data is protected using bcrypt.
* **Malware Scanning**: Integrated ClamAV scanning for all uploads.
* **Storage Isolation**: Short-lived, secure access tokens for all data retrieval.
