-- SQL Script to create test data for jag@gmail.com user
-- This script creates 3 dyeing jobs with 5 process stages each

-- First, get the user ID and company ID for jag@gmail.com
-- Run this query first to get the IDs you'll need:
SELECT u.id as user_id, c.id as company_id, c.name as company_name
FROM "user" u
JOIN "company" c ON u."companyId" = c.id
WHERE u.email = 'jag@gmail.com';

-- ============================================================
-- CREATE DYEING JOBS
-- ============================================================

-- Replace <COMPANY_ID> with the actual company_id from above
-- Run these three INSERT statements:

INSERT INTO "dyeing_job" (
  id, "jobNo", "customerName", "customerContact", "fabricType", 
  colour, "shadeNo", unit, "quantityReceived", "quantityDelivered", 
  "partyDcNo", "receivedDate", "expectedDeliveryDate", status, 
  "trackingStatus", "processNotes", "createdAt", "updatedAt", "companyId"
) VALUES (
  gen_random_uuid(), 'DJ-TEST-001', 'ABC Garments Pvt Ltd', '9876543210', 
  'Cotton Jersey', 'Navy Blue', 'NB-2024-001', 'METER', 500.5, 0, 
  'DC-2024-001', '2026-09-01', '2026-09-25', 'IN_PROCESS', 'IN_DYEING',
  'Test job for ABC Garments. All stages in progress.',
  NOW(), NOW(), '<COMPANY_ID>'
);

INSERT INTO "dyeing_job" (
  id, "jobNo", "customerName", "customerContact", "fabricType", 
  colour, "shadeNo", unit, "quantityReceived", "quantityDelivered", 
  "partyDcNo", "receivedDate", "expectedDeliveryDate", status, 
  "trackingStatus", "processNotes", "createdAt", "updatedAt", "companyId"
) VALUES (
  gen_random_uuid(), 'DJ-TEST-002', 'XYZ Fashion House', '9876543211', 
  'Cotton Twill', 'Wine Red', 'WR-2024-045', 'METER', 750.25, 0, 
  'DC-2024-002', '2026-09-05', '2026-09-25', 'IN_PROCESS', 'IN_DYEING',
  'Test job for XYZ Fashion House. All stages in progress.',
  NOW(), NOW(), '<COMPANY_ID>'
);

INSERT INTO "dyeing_job" (
  id, "jobNo", "customerName", "customerContact", "fabricType", 
  colour, "shadeNo", unit, "quantityReceived", "quantityDelivered", 
  "partyDcNo", "receivedDate", "expectedDeliveryDate", status, 
  "trackingStatus", "processNotes", "createdAt", "updatedAt", "companyId"
) VALUES (
  gen_random_uuid(), 'DJ-TEST-003', 'Premium Textiles Ltd', '9876543212', 
  'Cotton Poplin', 'Forest Green', 'FG-2024-089', 'METER', 1000.0, 0, 
  'DC-2024-003', '2026-09-08', '2026-09-25', 'IN_PROCESS', 'IN_DYEING',
  'Test job for Premium Textiles. All stages in progress.',
  NOW(), NOW(), '<COMPANY_ID>'
);

-- ============================================================
-- CREATE PROCESS STAGES FOR EACH JOB
-- ============================================================

-- Get the job IDs you just created:
SELECT id, "jobNo" FROM "dyeing_job" WHERE "jobNo" LIKE 'DJ-TEST-%' ORDER BY "jobNo";

-- Then run these INSERT statements for Stage 1 (repeat for all 3 jobs):
-- Replace <JOB_ID> with actual job IDs

-- Stage 1: Fabric Inspection (COMPLETED)
INSERT INTO "process_stage" (
  id, "sequenceNumber", name, description, status, "estimatedDuration", 
  "actualDuration", "startedAt", "completedAt", remarks, 
  "createdAt", "updatedAt", "dyeingJobId"
) VALUES (
  gen_random_uuid(), 1, 'Fabric Inspection', 
  'Initial fabric quality inspection', 'COMPLETED', 1, 1,
  '2026-09-02', '2026-09-02',
  'Fabric Inspection - Processing for ABC Garments Pvt Ltd',
  NOW(), NOW(), '<JOB_ID_1>'
);

-- Stage 2: Pre-treatment & Washing (COMPLETED)
INSERT INTO "process_stage" (
  id, "sequenceNumber", name, description, status, "estimatedDuration", 
  "actualDuration", "startedAt", "completedAt", remarks, 
  "createdAt", "updatedAt", "dyeingJobId"
) VALUES (
  gen_random_uuid(), 2, 'Pre-treatment & Washing', 
  'Pre-treatment and initial wash process', 'COMPLETED', 2, 2,
  '2026-09-03', '2026-09-04',
  'Pre-treatment & Washing - Processing for ABC Garments Pvt Ltd',
  NOW(), NOW(), '<JOB_ID_1>'
);

-- Stage 3: Dyeing Process (IN_PROGRESS)
INSERT INTO "process_stage" (
  id, "sequenceNumber", name, description, status, "estimatedDuration", 
  "actualDuration", "startedAt", "completedAt", remarks, 
  "createdAt", "updatedAt", "dyeingJobId"
) VALUES (
  gen_random_uuid(), 3, 'Dyeing Process', 
  'Main dyeing in the vat', 'IN_PROGRESS', 3, NULL,
  '2026-09-05', NULL,
  'Dyeing Process - Processing for ABC Garments Pvt Ltd',
  NOW(), NOW(), '<JOB_ID_1>'
);

-- Stage 4: Post-dyeing Washing (PENDING)
INSERT INTO "process_stage" (
  id, "sequenceNumber", name, description, status, "estimatedDuration", 
  "actualDuration", "startedAt", "completedAt", remarks, 
  "createdAt", "updatedAt", "dyeingJobId"
) VALUES (
  gen_random_uuid(), 4, 'Post-dyeing Washing', 
  'Washing after dyeing', 'PENDING', 1, NULL,
  NULL, NULL,
  'Post-dyeing Washing - Processing for ABC Garments Pvt Ltd',
  NOW(), NOW(), '<JOB_ID_1>'
);

-- Stage 5: Final Quality Check (PENDING)
INSERT INTO "process_stage" (
  id, "sequenceNumber", name, description, status, "estimatedDuration", 
  "actualDuration", "startedAt", "completedAt", remarks, 
  "createdAt", "updatedAt", "dyeingJobId"
) VALUES (
  gen_random_uuid(), 5, 'Final Quality Check', 
  'Final QC inspection', 'PENDING', 1, NULL,
  NULL, NULL,
  'Final Quality Check - Processing for ABC Garments Pvt Ltd',
  NOW(), NOW(), '<JOB_ID_1>'
);

-- Repeat stages for JOB_ID_2 and JOB_ID_3 (change the customer names and job IDs)

-- ============================================================
-- CREATE GOODS RECEIPT NOTES (GRN)
-- ============================================================

-- For each job, create one GRN:
INSERT INTO "goods_receipt_note" (
  id, "vehicleNo", "lotNumber", "rollCount", weight, "inspectionNotes", 
  "inspectedBy", "inspectionDate", "createdAt", "updatedAt", "dyeingJobId"
) VALUES (
  gen_random_uuid(), 'VEH-001', 'LOT-001', 5, 500,
  'Good quality fabrics received. All rolls checked.',
  'User Name',
  NOW(), NOW(), NOW(), '<JOB_ID_1>'
);

-- Repeat for JOB_ID_2 and JOB_ID_3

-- ============================================================
-- CREATE TEST PRODUCTS
-- ============================================================

INSERT INTO "product" (
  id, name, description, "hsnCode", unit, rate, active, 
  "createdAt", "companyId"
) VALUES (
  gen_random_uuid(), 'Test Cotton Fabric 1', 
  'High quality cotton fabric for testing - Type 1',
  NULL, 'METER', 200, true, NOW(), '<COMPANY_ID>'
);

INSERT INTO "product" (
  id, name, description, "hsnCode", unit, rate, active, 
  "createdAt", "companyId"
) VALUES (
  gen_random_uuid(), 'Test Cotton Fabric 2', 
  'High quality cotton fabric for testing - Type 2',
  NULL, 'METER', 250, true, NOW(), '<COMPANY_ID>'
);

INSERT INTO "product" (
  id, name, description, "hsnCode", unit, rate, active, 
  "createdAt", "companyId"
) VALUES (
  gen_random_uuid(), 'Test Cotton Fabric 3', 
  'High quality cotton fabric for testing - Type 3',
  NULL, 'METER', 300, true, NOW(), '<COMPANY_ID>'
);
