# Firebase Setup

1. Open [JS/firebase-config.js](/abs/path/d:/Family/Shehap/My%20Project/Front%20End/My-Protfolio/JS/firebase-config.js).
2. Set `enabled: true`.
3. Paste your Firebase web app config values.
4. Keep `collectionName` as `portfolioComments` unless you want another collection name.
5. In Firebase Authentication, enable `Email/Password`.
6. Create one admin user from the Firebase console.
7. Open `admin.html` and sign in with that admin account.

Use these Firestore rules as a starting point:

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /portfolioComments/{commentId} {
      allow read: if true;
      allow create: if request.resource.data.status == "pending";
      allow update, delete: if request.auth != null;
    }

    match /portfolioProjects/{projectId} {
      allow read: if true;
      allow create, update, delete: if request.auth != null;
    }

    match /portfolioContent/{docId} {
      allow read: if true;
      allow create, update, delete: if request.auth != null;
    }

    match /portfolioSkills/{skillId} {
      allow read: if true;
      allow create, update, delete: if request.auth != null;
    }
  }
}
```

Suggested document shape:

```json
{
  "name": "Visitor name",
  "role": "Client or title",
  "message": "Comment text",
  "status": "pending",
  "createdAt": "server timestamp"
}
```
