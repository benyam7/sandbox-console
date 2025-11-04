import type { CodeExampleConfig, DocsConfig } from './schemas';

export function getDocsConfig(): DocsConfig {
    const baseUrl = 'https://api.example.com/v1';
    const apiEndpoint = `${baseUrl}/api-keys`;

    return {
        baseUrl,
        apiEndpoint,
    };
}

export function generateCodeExamples(
    apiKey: string,
    endpoint: string
): CodeExampleConfig[] {
    const curlExample = `curl -X POST ${endpoint} \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${apiKey}" \\
  -d '{
    "name": "My API Key"
  }'`;

    const nodeExample = `const axios = require('axios');

const response = await axios.post(
  '${endpoint}',
  {
    name: 'My API Key'
  },
  {
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': '${apiKey}'
    }
  }
);

console.log(response.data);`;

    const pythonExample = `import requests

url = "${endpoint}"
headers = {
    "Content-Type": "application/json",
    "x-api-key": "${apiKey}"
}
data = {
    "name": "My API Key"
}

response = requests.post(url, json=data, headers=headers)
print(response.json())`;

    return [
        {
            title: 'cURL',
            code: curlExample,
        },
        {
            title: 'Node.js',
            code: nodeExample,
        },
        {
            title: 'Python',
            code: pythonExample,
        },
    ];
}
