# Product Catalog

## Overview

This document defines the external product references and requirements for the product catalog and product-list features.

## External Source

- Organization: SGQ Smart Glass Quality
- Page: https://smartglassquality.com/distributor-of-aluminum/
- Purpose: Reference for product categories, brands, and product-list content
- Last verified: YYYY-MM-DD

### Source Usage

- Use this source to initialize and verify product categories and brands.
- Do not use the website as a runtime API.
- Product data displayed by the application must come from the backend and database.
- Do not invent missing product details.
- Obtain missing information from an approved catalog, API, spreadsheet, administrator, or individual product page.

### Data Limitations

The external source does not provide complete:

- Product SKUs
- Prices and costs
- Dimensions
- Colors
- Units
- Stock quantities
- Product-level specifications

## Product Categories

| Code | Thai name | English name |
|---|---|---|
| `aluminium-profiles` | อลูมิเนียมเส้น | Aluminium Profiles |
| `architectural-glass` | กระจกแปรรูป | Architectural Glass |
| `hardware-accessories` | อุปกรณ์/อะไหล่ | Hardware & Accessories |
| `digital-door-locks` | กลอนประตูดิจิทัล | Digital Door Locks |
| `custom-aluminium` | งานอลูมิเนียมสั่งพิเศษ | Custom Aluminium |
| `additional-products` | สินค้าเสริม | Additional Products |

## Brands by Category

### Aluminium Profiles

- ORM
- Fuji Eurotech
- SMS Schimmer
- Thai Metal Aluminium

### Hardware & Accessories

- CMECH
- PBM
- HYDA
- KINLONG
- CIFIAL

### Digital Door Locks

- ELH

## Product Types

### Architectural Glass

- กระจกนิรภัยเทมเปอร์
- กระจกลามิเนต
- กระจกอินซูเลต
- กระจก Low-E
- กระจกฝ้า
- กระจกพ่นทราย
- กระจกสี
- กระจกเคลือบสาร

### Custom Aluminium

- โรงจอดรถ
- กันสาดอลูมิเนียม

### Additional Products

- บันไดอลูมิเนียม

## Product List Requirements

### Purpose

Allow users to browse and manage products stored in the application database.

### Displayed Information

- Product image
- Product name
- Product code or SKU
- Category
- Brand
- Color
- Unit
- Selling price
- Stock status
- Active status

### Filters

- Search by product name or code
- Category
- Brand
- Stock status
- Active status

### Behavior

- Support server-side pagination, sorting, and filtering.
- Preserve applicable filters, sorting, and pagination in the URL.
- Display loading, empty, error, stale-data, and background-refresh states.
- Do not display values that are unavailable from the backend.
- Format prices and quantities with appropriate number separators.
- Treat the backend and database as the source of truth.