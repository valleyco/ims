# Swagger/OpenAPI Specification Usage Guide

## Overview

The `swagger.yaml` file is a professional OpenAPI 3.0 specification for the Israel Meteorological Service API. It provides a complete, machine-readable description of the API that can be used with various tools.

## What's Included

### Complete API Documentation
- ✅ All 20+ endpoints from the IMS API
- ✅ Request/response schemas
- ✅ Authentication specifications
- ✅ Parameter validation rules
- ✅ Error response definitions
- ✅ Real-world examples
- ✅ Detailed descriptions

### Additional Features
- Comprehensive component schemas for reusability
- Proper security definitions (API Token)
- Tags for logical grouping
- Response examples with actual data
- Validation constraints (min/max, patterns, enums)
- Error handling specifications

## How to Use the Swagger File

### 1. Swagger UI (Interactive Documentation)

#### Online Swagger Editor
1. Go to https://editor.swagger.io/
2. Click **File > Import File**
3. Upload `swagger.yaml`
4. View interactive documentation with "Try it out" functionality

#### Local Swagger UI with Docker
```bash
docker run -p 8080:8080 \
  -e SWAGGER_JSON=/swagger.yaml \
  -v $(pwd)/swagger.yaml:/swagger.yaml \
  swaggerapi/swagger-ui
```
Then open: http://localhost:8080

#### Local Swagger UI with NPM
```bash
npm install -g swagger-ui-express express
```

Create `serve-swagger.js`:
```javascript
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');

const app = express();
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(3001, () => {
  console.log('Swagger UI available at http://localhost:3001/api-docs');
});
```

Run:
```bash
npm install express swagger-ui-express yamljs
node serve-swagger.js
```

### 2. Generate Client SDKs

#### Using OpenAPI Generator

**Install OpenAPI Generator**:
```bash
npm install @openapitools/openapi-generator-cli -g
```

**Generate JavaScript/TypeScript Client**:
```bash
openapi-generator-cli generate \
  -i swagger.yaml \
  -g javascript \
  -o ./client-sdk/javascript
```

**Generate Python Client**:
```bash
openapi-generator-cli generate \
  -i swagger.yaml \
  -g python \
  -o ./client-sdk/python
```

**Generate Java Client**:
```bash
openapi-generator-cli generate \
  -i swagger.yaml \
  -g java \
  -o ./client-sdk/java
```

**Other supported languages**:
- PHP: `-g php`
- Ruby: `-g ruby`
- Go: `-g go`
- C#: `-g csharp`
- Swift: `-g swift`
- Kotlin: `-g kotlin`
- And 50+ more languages!

### 3. API Testing with Postman

1. Open Postman
2. Click **Import**
3. Select **File** and choose `swagger.yaml`
4. Postman will create a collection with all endpoints
5. Set your API token in the collection variables

### 4. API Mocking

#### Prism (OpenAPI Mock Server)
```bash
npm install -g @stoplight/prism-cli

# Start mock server
prism mock swagger.yaml
```

This creates a mock API server that returns example responses based on the spec.

### 5. Validation

#### Validate the Swagger file
```bash
npm install -g @apidevtools/swagger-cli

swagger-cli validate swagger.yaml
```

### 6. Convert to Other Formats

#### Convert to JSON
```bash
npm install -g yamljs

yaml2json swagger.yaml > swagger.json
```

#### Generate Markdown Documentation
```bash
npm install -g widdershins

widdershins swagger.yaml -o API_REFERENCE.md
```

## Integration Examples

### Node.js Express with Swagger UI

```javascript
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

const app = express();
const swaggerDocument = YAML.load('./swagger.yaml');

// Serve Swagger UI at /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(3000, () => {
  console.log('API docs: http://localhost:3000/api-docs');
});
```

### Use with API Gateway (AWS, Azure, Google Cloud)

Most API gateways support OpenAPI specification import:

**AWS API Gateway**:
1. Open AWS API Gateway Console
2. Create API > REST API > Import from OpenAPI
3. Upload `swagger.yaml`

**Azure API Management**:
1. Open Azure Portal > API Management
2. APIs > Add API > OpenAPI
3. Upload `swagger.yaml`

**Google Cloud Endpoints**:
```bash
gcloud endpoints services deploy swagger.yaml
```

## Customization

The swagger.yaml file can be customized:

1. **Add examples**: Add more request/response examples
2. **Add security**: Modify security schemes if needed
3. **Add headers**: Add custom headers in components/parameters
4. **Add servers**: Add staging/dev server URLs
5. **Extend schemas**: Add more detailed schema validations

## Useful Tools

| Tool | Purpose | URL |
|------|---------|-----|
| Swagger Editor | Edit and validate OpenAPI files | https://editor.swagger.io/ |
| Swagger UI | Interactive API documentation | https://swagger.io/tools/swagger-ui/ |
| OpenAPI Generator | Generate client SDKs | https://openapi-generator.tech/ |
| Postman | API testing | https://www.postman.com/ |
| Prism | Mock API server | https://stoplight.io/open-source/prism |
| ReDoc | Beautiful API documentation | https://redocly.github.io/redoc/ |
| Spectacle | Generate static docs | https://github.com/sourcey/spectacle |

## Online Documentation Hosting

### ReDoc (Recommended)

Create `redoc.html`:
```html
<!DOCTYPE html>
<html>
  <head>
    <title>IMS API Documentation</title>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700" rel="stylesheet">
    <style>
      body {
        margin: 0;
        padding: 0;
      }
    </style>
  </head>
  <body>
    <redoc spec-url='./swagger.yaml'></redoc>
    <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"></script>
  </body>
</html>
```

Serve with any static file server.

### GitHub Pages

1. Push `swagger.yaml` to your GitHub repo
2. Enable GitHub Pages
3. Create `index.html` with Swagger UI or ReDoc
4. Your API docs will be available at: `https://username.github.io/repo-name/`

## CI/CD Integration

### Validate in GitHub Actions

```yaml
name: Validate OpenAPI Spec

on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Validate OpenAPI
        uses: char0n/swagger-editor-validate@v1
        with:
          definition-file: swagger.yaml
```

## Tips

1. **Keep it updated**: Update swagger.yaml when API changes
2. **Version control**: Track changes in git
3. **Use examples**: Rich examples make the API easier to understand
4. **Document errors**: Include all possible error responses
5. **Validate regularly**: Use validation tools to catch issues early

## Support

For questions about the OpenAPI specification:
- OpenAPI Specification: https://spec.openapis.org/oas/v3.0.3
- OpenAPI Community: https://www.openapis.org/community

For questions about the IMS API:
- Email: ims@ims.gov.il
- Website: https://ims.gov.il
