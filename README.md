# Zealthy "mini" EMR

## By Sagun Karki

A mini EMR and patient portal built with Next.js, Prisma, PostgreSQL, and NextAuth.

## Deployment

Live app: [https://zealthy-emr-sagun.vercel.app](https://zealthy-emr-sagun.vercel.app)

The app uses PostgreSQL with Prisma for persistence.

## Demo Login

Sample patient credentials are prefilled on the login page for convenience. Authentication is enabled.

## Features

### Admin EMR

Available at `/admin`. Per the exercise requirements, the admin area does not require authentication.

- View all patients
- Create, view, and update patients
- Set patient password during creation
- Create, view, update, and delete prescriptions
- Create, view, update, and delete appointments
- Support weekly/monthly recurring appointments
- Add recurrence end dates
- End recurring appointments

### Patient Portal

Available at `/`.

- Login with sample seeded credentials or newly created patient credentials
- View basic patient information
- View appointments in the next 7 days
- View medication refills in the next 7 days
- Drill down into appointment schedule for the next 3 months
- Drill down into prescription refill schedule for the next 3 months