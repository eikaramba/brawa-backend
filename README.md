This Repo is the Backend Source Code for the BRAWA App. To run it you will need to add the following environment variables to a .env.production file in the root directory of the project:

```
# see .env for basic variables
ADMIN_JWT_SECRET
JWT_SECRET=
```

Also you will need to generate the FCM private key from Firebase and put it as a firebase.json file into the /backend folder. See https://firebase.google.com/docs/admin/setup?hl=de#initialize_the_sdk_in_non-google_environments

It uses Strapi as a Backend

The Android App is available here: https://play.google.com/store/apps/details?id=com.brawa.android&hl=de&pli=1

Source Code for the Android App is here: https://github.com/eikaramba/brawa-app