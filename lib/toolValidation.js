// Lightweight validations per project.txt (no AJV yet)

const ALLOWED_TYPES = new Set(["string", "number", "boolean", "object", "array"]);
const ALLOWED_METHODS = new Set(["GET", "POST", "PUT", "DELETE"]);

export function isValidUrl(url) {
  try {
    const u = new URL(url);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

function validateSchemaObject(schema, which = 'input') {
  const errors = [];
  if (!schema || typeof schema !== 'object') {
    errors.push(`${which} schema must be an object`);
    return errors;
  }
  if (schema.type !== 'object') {
    errors.push(`${which} schema root type must be 'object'`);
  }
  if (!schema.properties || typeof schema.properties !== 'object') {
    errors.push(`${which} schema 'properties' must be an object`);
  } else {
    for (const [key, def] of Object.entries(schema.properties)) {
      if (!def || typeof def !== 'object') {
        errors.push(`${which} schema property '${key}' must be an object`);
        continue;
      }
      if (!ALLOWED_TYPES.has(def.type)) {
        errors.push(`${which} schema property '${key}' has invalid type '${def.type}'`);
      }
    }
  }
  if (Array.isArray(schema.required)) {
    for (const req of schema.required) {
      if (!(schema.properties && Object.prototype.hasOwnProperty.call(schema.properties, req))) {
        errors.push(`${which} schema required field '${req}' missing in properties`);
      }
    }
  }
  return errors;
}

export function validateToolConfig(tool, existingNames = []) {
  const errors = [];
  if (!tool.name || typeof tool.name !== 'string') {
    errors.push('name is required');
  } else {
    if (!/^[a-z0-9_]+$/.test(tool.name)) errors.push('name must be snake_case (lowercase, digits, underscore)');
    if (existingNames.includes(tool.name)) errors.push('name must be unique within assistant');
  }
  if (!ALLOWED_METHODS.has(tool.method)) errors.push('method must be one of GET, POST, PUT, DELETE');
  if (!tool.endpoint_url || !isValidUrl(tool.endpoint_url)) errors.push('endpoint_url must be a valid http(s) URL');

  // headers uniqueness
  const headers = Array.isArray(tool.headers) ? tool.headers : Object.keys(tool.headers || {}).map(k => ({ key: k }));
  const keys = headers.map(h => (h.key || '').toLowerCase()).filter(Boolean);
  const dup = keys.find((k, i) => keys.indexOf(k) !== i);
  if (dup) errors.push(`duplicate header key '${dup}'`);

  // Schemas (basic structure only)
  if (tool.input_schema) errors.push(...validateSchemaObject(tool.input_schema, 'input'));
  if (tool.output_schema) errors.push(...validateSchemaObject(tool.output_schema, 'output'));

  return { ok: errors.length === 0, errors };
} 