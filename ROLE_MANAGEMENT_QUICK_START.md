# 👥 Role Management - Quick Start

## 🎯 5-Minute Setup

### Access Role Management

```
1. Click "Roles" tab in navigation
2. See all users and their roles
3. Click "Edit" to change roles
4. Select new role and save
```

---

## 👤 4 User Roles

| Role           | Permissions      | Best For                 |
| -------------- | ---------------- | ------------------------ |
| **Admin**      | All (16)         | System administrators    |
| **Researcher** | Data editing (8) | Scientists & researchers |
| **Viewer**     | View only (5)    | Stakeholders & viewers   |
| **Guest**      | Minimal (2)      | Public access            |

---

## 🔐 Quick Permission Reference

### Admin Can

✅ View, edit, delete data
✅ Manage users and roles
✅ Access all features
✅ View system logs
✅ Manage alerts

### Researcher Can

✅ View and edit data
✅ Export data
✅ Use AI tuning
✅ View analytics
✅ Access advanced map

### Viewer Can

✅ View data only
✅ Export data
✅ View analytics
✅ Access basic map

### Guest Can

✅ View data
✅ Access basic map

---

## 💻 Code Examples

### Protect a Feature

```typescript
<ProtectedFeature featureId="ai-tuning">
  <AIModelTuningDashboard />
</ProtectedFeature>
```

### Check Permission

```typescript
const { hasPermission } = useRoleAccess();

if (hasPermission("edit_data")) {
  // Show edit button
}
```

### Check Role

```typescript
const { isAdmin, isResearcher } = useRoleAccess();

if (isAdmin()) {
  // Show admin panel
}
```

---

## 🎮 Common Tasks

### Change User Role

1. Go to "Roles" tab
2. Find user
3. Click "Edit"
4. Select new role
5. Click "Save"

### View Role Permissions

1. Go to "Roles" tab
2. Click role button in sidebar
3. See all permissions

### Protect a Component

1. Import ProtectedFeature
2. Wrap component
3. Set featureId
4. Done!

---

## 🚀 Features

✅ 4 roles
✅ 16 permissions
✅ Easy UI
✅ Code hooks
✅ Component protection
✅ Professional interface

---

## 📊 Role Matrix

```
Feature              Admin  Researcher  Viewer  Guest
─────────────────────────────────────────────────────
View Data             ✅      ✅         ✅      ✅
Edit Data             ✅      ✅         ❌      ❌
Delete Data           ✅      ❌         ❌      ❌
Export Data           ✅      ✅         ✅      ❌
Manage Users          ✅      ❌         ❌      ❌
AI Tuning             ✅      ✅         ❌      ❌
Advanced Map          ✅      ✅         ✅      ✅
Error Monitor         ✅      ❌         ❌      ❌
Ecosystem Health      ✅      ✅         ✅      ❌
View Analytics        ✅      ✅         ✅      ❌
```

---

## ✨ Status

**Ready to use!** 🎉

All role management features are implemented and integrated.
