This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

This application is just for testing excel management, creating a dashboard using excels, parsing data, creating tables and from that
creating pie charts and cards with information.

Technology Stack used for this testing application
* SheetJs
* Tanstack Table
* Shadcn
* Postgress
* Prisma
* Docker

## Configuration
Because this project is just for testing purposes i will put all the dependencies installations on this configuration section, obviously
if you are just cloning this repo just need to do npm install, but this is just a template for a future project.

First need to install the multiple dependencies that i will need

# Tanstack Table

Tanstack Table dependencie and devtools
``` bash
npm i @tanstack/react-table
npm install @tanstack/react-devtools @tanstack/react-table-devtools
```

Create table provider and use it on the main layout.tsx

``` typescript
'use client'

import { TanStackDevtools } from '@tanstack/react-devtools'
import { useCreateAtom } from '@tanstack/react-store'
import { tableDevtoolsPlugin } from '@tanstack/react-table-devtools'

export default function TableProvider({ children }: { children: React.ReactNode }) {

  return (
    <>
      {children}

      <TanStackDevtools
        plugins={[tableDevtoolsPlugin()]}
      />
    </>
  )
}
```

# SheetJs

just install the two dependencies
``` bash
npm rm --save xlsx
npm i --save https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz
```

# Prisma
Dependencies and initialization for creating the prisma schema, prisma config and .env

Command to install prisma and create the contract, env, db and prisma.config files
``` bash
npx prisma@latest orm init --yes --target postgres --authoring psl --write-env
```

Modify the .env file with the postgress url
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/postgres"
```

Create your tables on contract.prisma because we are using primsa v8 and from there just run the following commands

[!IMPORTANT] 
Make sure to have your db running on the corresponding port when running the second command, first command just set the table on the contract.json

``` bash
npx prisma contract emit
npx prisma db init          
```

When making changes inside the contact
``` bash
npx prisma contract emit
npx prisma migration plan --name nombre_del_cambio
npx prisma db migrate --advance-ref db
```

## Executing the app

1. Turn on your database server
```
docker compose up -d
```