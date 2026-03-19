# Professional DocType - Role Setup Guide

## Overview

The Professional DocType requires proper role and permission configuration for multi-tenant operation. This document outlines the roles and User Permissions needed for deployment.

## Required Roles

The Professional DocType uses three pre-defined roles with different permission levels:

### 1. Regulator Admin
- **Permissions**: Full access (create, read, write, delete, export, import, share)
- **Use Case**: System administrators who manage professionals across all companies
- **Special Abilities**:
  - Can reassign professionals between companies
  - Can delete professionals
  - Can modify any professional regardless of ownership

### 2. Inspector
- **Permissions**: Create, read, write (limited)
- **Use Case**: Field inspectors who create and manage professional records
- **Limitations**:
  - Can only edit professionals they own (if_owner=1)
  - Cannot delete professionals
  - Cannot change company assignment
  - Scoped to their assigned company via User Permissions

### 3. Regulator User
- **Permissions**: Read-only
- **Use Case**: Staff who need to view professional data
- **Limitations**:
  - Cannot create, edit, or delete professionals
  - Scoped to their assigned company via User Permissions

## Company-Based Multi-Tenancy

### User Permission Requirements

For multi-tenant isolation to work, each user MUST have exactly ONE User Permission that grants access to a specific Company:

**User Permission Configuration:**
```
- User: [user email]
- Allow: Company
- For Value: [company name]
- Apply To All Doctypes: Yes
```

### Setup Steps

1. **Assign User to Role**
   - Navigate to User doctype
   - Add appropriate role (Regulator Admin, Inspector, or Regulator User)

2. **Create User Permission**
   - Navigate to User Permission doctype
   - Click New
   - Select User
   - Set Allow = "Company"
   - Set For Value = specific company name
   - Enable "Apply To All Doctypes"
   - Save

3. **Verify Access**
   - User should have access to exactly one company
   - System will auto-assign company to new professionals
   - User can only see professionals from their assigned company

### Important Notes

- **One Company Per User**: Each user must have exactly ONE Company User Permission. Multiple or zero permissions will block portal access.
- **Automatic Isolation**: The permission query function automatically filters professionals by company at the database level.
- **Company Auto-Assignment**: When creating professionals, the company field is automatically populated from the user's User Permission.

## Testing Role Setup

### Test User Configuration

After setting up roles and permissions, test with this scenario:

```python
# Create test inspector user
user_email = "inspector1@example.com"
company_name = "Test Company"

# 1. Create user with Inspector role
# 2. Create User Permission for the company
# 3. Test creating a professional as this user
# 4. Verify company is auto-assigned
# 5. Verify user can only see their company's professionals
```

### Validation Checklist

- [ ] User has exactly one Company User Permission
- [ ] User can create professionals without manually setting company
- [ ] Company field is automatically populated
- [ ] User cannot see professionals from other companies
- [ ] Regulator Admin can reassign professionals between companies
- [ ] Inspectors can only edit their own professionals

## Deployment Checklist

Before deploying to production:

1. **Roles Exist**: Verify Regulator Admin, Inspector, and Regulator User roles are created
2. **Users Assigned**: All users have appropriate roles assigned
3. **User Permissions Set**: Each user has exactly ONE Company User Permission
4. **Permission Query Registered**: Verify hooks.py contains the permission_query_conditions entry
5. **Migration Applied**: Run `bench --site [site] migrate` to apply schema
6. **API Access Tested**: Test REST endpoints with authenticated requests

## Troubleshooting

### "Active company context is required"
- Check user has exactly ONE Company User Permission
- Verify User Permission is not disabled

### "Company mismatch in request payload"
- User is trying to create professional with wrong company
- Check User Permission matches the company in request

### "Insufficient Permission for Professional"
- User lacks required role (Regulator Admin, Inspector, or Regulator User)
- Check role assignment in User doctype

### User can see other companies' professionals
- Permission query function not registered in hooks.py
- Run `bench --site [site] migrate` to reload hooks
- Restart bench: `bench restart`

## Technical Reference

- **DocType Path**: `apps/careverse_regulator/careverse_regulator/careverse_regulator/doctype/professional/`
- **Permission Query**: `professional.get_permission_query_conditions()`
- **Hook Registration**: `apps/careverse_regulator/careverse_regulator/hooks.py`
- **Guardrails Module**: `apps/careverse_regulator/careverse_regulator/api/guardrails.py`
- **Tenant Module**: `apps/careverse_regulator/careverse_regulator/api/tenant.py`
